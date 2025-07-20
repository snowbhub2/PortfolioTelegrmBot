// Система управління портфелем користувача
import { CryptoAsset } from "@/types/crypto";

// Типи для портфеля
export interface UserAsset {
  id: string;
  symbol: string;
  name: string;
  quantity: number; // Кількість акцій/інструментів
  avgPrice: number; // Середня ціна покупки
  currentPrice: number; // Поточна ціна
  icon: string;
  category: "stocks" | "crypto" | "gold" | "currency";
}

export interface Transaction {
  id: string;
  type:
    | "buy"
    | "sell"
    | "deposit"
    | "withdraw"
    | "transfer_to_cfd"
    | "transfer_from_cfd";
  assetId?: string;
  quantity?: number;
  price?: number;
  amount: number; // Сума в доларах
  timestamp: Date;
  description: string;
}

export interface UserPortfolio {
  userId: string;
  cashBalance: number; // Баланс в доларах для торгівлі
  cfdBalance: number; // Баланс CFD
  assets: UserAsset[]; // Куплені активи
  transactions: Transaction[]; // Історія транзакцій
}

// Локальне збереження портфеля (пізніше замінимо на API)
const PORTFOLIO_KEY = "user_portfolio";

export class PortfolioManager {
  private portfolio: UserPortfolio;

  constructor(userId: string) {
    this.portfolio = this.loadPortfolio(userId);
  }

  private loadPortfolio(userId: string): UserPortfolio {
    const saved = localStorage.getItem(`${PORTFOLIO_KEY}_${userId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Відновлюємо дати
      parsed.transactions = parsed.transactions.map((t: any) => ({
        ...t,
        timestamp: new Date(t.timestamp),
      }));
      return parsed;
    }

    // Початковий портфель з 1000$ для демо
    return {
      userId,
      cashBalance: 1000,
      cfdBalance: 0,
      assets: [],
      transactions: [
        {
          id: Date.now().toString(),
          type: "deposit",
          amount: 1000,
          timestamp: new Date(),
          description: "Початковий депозит",
        },
      ],
    };
  }

  private savePortfolio(): void {
    localStorage.setItem(
      `${PORTFOLIO_KEY}_${this.portfolio.userId}`,
      JSON.stringify(this.portfolio),
    );
  }

  // Отримати баланс готівки
  getCashBalance(): number {
    return this.portfolio.cashBalance;
  }

  // Отримати баланс CFD
  getCfdBalance(): number {
    return this.portfolio.cfdBalance;
  }

  // Отримати всі активи з балансом > 0
  getAssets(): UserAsset[] {
    return this.portfolio.assets.filter((asset) => asset.quantity > 0);
  }

  // Розрахувати загальну вартість портфеля
  getTotalPortfolioValue(): number {
    const assetsValue = this.portfolio.assets.reduce((total, asset) => {
      return total + asset.quantity * asset.currentPrice;
    }, 0);
    return this.portfolio.cashBalance + assetsValue;
  }

  // Розрахувати загальну інвестовану суму
  getTotalInvestedAmount(): number {
    const assetsInvested = this.portfolio.assets.reduce((total, asset) => {
      return total + asset.quantity * asset.avgPrice;
    }, 0);
    return assetsInvested;
  }

  // Розрахувати загальний P&L портфеля (тільки від торгівлі, без депозитів/виводів)
  getTotalPortfolioPnL(): { amount: number; percentage: number } {
    // P&L тільки від торгових операцій
    const totalInvested = this.getTotalInvestedAmount();
    const currentAssetsValue = this.portfolio.assets.reduce((total, asset) => {
      return total + asset.quantity * asset.currentPrice;
    }, 0);

    const totalPnL = currentAssetsValue - totalInvested;
    const percentagePnL =
      totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

    return {
      amount: totalPnL,
      percentage: percentagePnL,
    };
  }

  // Купити актив
  buyAsset(
    assetId: string,
    symbol: string,
    name: string,
    quantity: number,
    price: number,
    icon: string,
    category: UserAsset["category"],
  ): boolean {
    const totalCost = quantity * price;

    if (totalCost > this.portfolio.cashBalance) {
      return false; // Недостатньо коштів
    }

    // Списуємо гроші
    this.portfolio.cashBalance -= totalCost;

    // Знаходимо існуючий актив або створюємо новий
    let existingAsset = this.portfolio.assets.find((a) => a.id === assetId);

    if (existingAsset) {
      // Оновлюємо середню ціну
      const totalValue =
        existingAsset.quantity * existingAsset.avgPrice + totalCost;
      const totalQuantity = existingAsset.quantity + quantity;
      existingAsset.avgPrice = totalValue / totalQuantity;
      existingAsset.quantity = totalQuantity;
      existingAsset.currentPrice = price;
    } else {
      // Додаємо новий актив
      this.portfolio.assets.push({
        id: assetId,
        symbol,
        name,
        quantity,
        avgPrice: price,
        currentPrice: price,
        icon,
        category,
      });
    }

    // Додаємо т��анзакцію
    this.addTransaction({
      type: "buy",
      assetId,
      quantity,
      price,
      amount: totalCost,
      description: `Покупка ${quantity} ${symbol} за $${price.toFixed(2)}`,
    });

    this.savePortfolio();
    return true;
  }

  // Продати актив
  sellAsset(assetId: string, quantity: number, price: number): boolean {
    const asset = this.portfolio.assets.find((a) => a.id === assetId);

    if (!asset || asset.quantity < quantity) {
      return false; // Недостатньо активів
    }

    const totalValue = quantity * price;

    // Додаємо гроші
    this.portfolio.cashBalance += totalValue;

    // Зменшуємо кількість активів
    asset.quantity -= quantity;
    asset.currentPrice = price;

    // Додаємо транзакцію
    this.addTransaction({
      type: "sell",
      assetId,
      quantity,
      price,
      amount: totalValue,
      description: `Продаж ${quantity} ${asset.symbol} за $${price.toFixed(2)}`,
    });

    this.savePortfolio();
    return true;
  }

  // Поповнити через Telegram Stars
  depositFromStars(amountUSD: number): void {
    this.portfolio.cashBalance += amountUSD;

    this.addTransaction({
      type: "deposit",
      amount: amountUSD,
      description: `Поповнення через Telegram Stars: $${amountUSD}`,
    });

    this.savePortfolio();
  }

  // Вивести через Telegram Stars
  withdrawToStars(amountUSD: number): boolean {
    if (amountUSD > this.portfolio.cashBalance) {
      return false; // Недостатньо коштів
    }

    this.portfolio.cashBalance -= amountUSD;

    this.addTransaction({
      type: "withdraw",
      amount: amountUSD,
      description: `Виведення через Telegram Stars: $${amountUSD}`,
    });

    this.savePortfolio();
    return true;
  }

  // Перевести до CFD
  transferToCfd(amount: number): boolean {
    if (amount > this.portfolio.cashBalance) {
      return false;
    }

    this.portfolio.cashBalance -= amount;
    this.portfolio.cfdBalance += amount;

    this.addTransaction({
      type: "transfer_to_cfd",
      amount,
      description: `Переказ до CFD: $${amount}`,
    });

    this.savePortfolio();
    return true;
  }

  // Перевести з CFD
  transferFromCfd(amount: number): boolean {
    if (amount > this.portfolio.cfdBalance) {
      return false;
    }

    this.portfolio.cfdBalance -= amount;
    this.portfolio.cashBalance += amount;

    this.addTransaction({
      type: "transfer_from_cfd",
      amount,
      description: `Переказ з CFD: $${amount}`,
    });

    this.savePortfolio();
    return true;
  }

  // Додати транзакцію
  private addTransaction(
    transaction: Omit<Transaction, "id" | "timestamp">,
  ): void {
    this.portfolio.transactions.push({
      id: Date.now().toString(),
      timestamp: new Date(),
      ...transaction,
    });
  }

  // Отримати історію транзакцій
  getTransactions(): Transaction[] {
    return [...this.portfolio.transactions].reverse(); // Останні спочатку
  }

  // Оновити поточні ціни активів
  updateAssetPrices(priceUpdates: Record<string, number>): void {
    this.portfolio.assets.forEach((asset) => {
      if (priceUpdates[asset.id]) {
        asset.currentPrice = priceUpdates[asset.id];
      }
    });
    this.savePortfolio();
  }

  // Отримати прибуток/збиток по активу
  getAssetPnL(assetId: string): { amount: number; percentage: number } {
    const asset = this.portfolio.assets.find((a) => a.id === assetId);
    if (!asset) return { amount: 0, percentage: 0 };

    const currentValue = asset.quantity * asset.currentPrice;
    const investedValue = asset.quantity * asset.avgPrice;
    const amount = currentValue - investedValue;
    const percentage = (amount / investedValue) * 100;

    return { amount, percentage };
  }
}
