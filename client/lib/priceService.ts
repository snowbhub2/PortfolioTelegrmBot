// Сервіс для реального оновлення цін активів
export interface AssetPrice {
  id: string;
  price: number;
  change24h: number;
  lastUpdated: Date;
}

export interface PriceUpdateCallback {
  (updates: Record<string, AssetPrice>): void;
}

class PriceService {
  private subscribers: Set<PriceUpdateCallback> = new Set();
  private updateInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  // Базові ціни для активів
  private basePrices: Record<string, number> = {
    // Криптовалюти
    btc: 109008.18,
    eth: 2620.19,
    ton: 2.92,
    sol: 152.47,

    // Акції
    aapl: 189.84,
    tsla: 248.98,
    msft: 415.75,
    googl: 172.48,

    // Золото та метали
    gold: 2650.5,
    silver: 30.85,
    platinum: 945.2,
  };

  private currentPrices: Record<string, AssetPrice> = {};

  constructor() {
    // Ініціалізуємо поточні ціни
    Object.entries(this.basePrices).forEach(([id, price]) => {
      this.currentPrices[id] = {
        id,
        price,
        change24h: 0,
        lastUpdated: new Date(),
      };
    });
  }

  // Підписатися на оновлення цін
  subscribe(callback: PriceUpdateCallback): () => void {
    this.subscribers.add(callback);

    // Відразу надіслати поточні ціни
    callback(this.currentPrices);

    // Запустити оновлення якщо ще не запущено
    if (!this.isRunning) {
      this.startPriceUpdates();
    }

    // Повернути функцію для відписки
    return () => {
      this.subscribers.delete(callback);
      if (this.subscribers.size === 0) {
        this.stopPriceUpdates();
      }
    };
  }

  // Розпочати оновлення цін
  private startPriceUpdates(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.updateInterval = setInterval(() => {
      this.generatePriceUpdates();
      this.notifySubscribers();
    }, 5000); // Оновлення кожні 5 секунд
  }

  // Зупинити оновлення цін
  private stopPriceUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRunning = false;
  }

  // Генерувати реалістичні зміни цін
  private generatePriceUpdates(): void {
    Object.keys(this.currentPrices).forEach((id) => {
      const current = this.currentPrices[id];
      const basePrice = this.basePrices[id];

      // Генеруємо невелику зміну ціни (-0.5% до +0.5%)
      const changePercent = (Math.random() - 0.5) * 0.01; // -0.5% до +0.5%
      const priceChange = current.price * changePercent;
      const newPrice = Math.max(0.01, current.price + priceChange);

      // Розраховуємо зміну за 24 години відносно базової ціни
      const change24h = ((newPrice - basePrice) / basePrice) * 100;

      this.currentPrices[id] = {
        id,
        price: newPrice,
        change24h,
        lastUpdated: new Date(),
      };
    });
  }

  // Повідомити всіх підписників про оновлення
  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => {
      try {
        callback({ ...this.currentPrices });
      } catch (error) {
        console.error("Error in price update callback:", error);
      }
    });
  }

  // Отримати поточну ціну активу
  getCurrentPrice(assetId: string): AssetPrice | null {
    return this.currentPrices[assetId] || null;
  }

  // Отримати всі поточні ціни
  getAllPrices(): Record<string, AssetPrice> {
    return { ...this.currentPrices };
  }

  // Додати новий актив для відстеження
  addAsset(id: string, basePrice: number): void {
    this.basePrices[id] = basePrice;
    this.currentPrices[id] = {
      id,
      price: basePrice,
      change24h: 0,
      lastUpdated: new Date(),
    };
  }

  // Очистити всі підписки (для cleanup)
  cleanup(): void {
    this.stopPriceUpdates();
    this.subscribers.clear();
  }
}

// Створюємо глобальний екземпляр сервісу
export const priceService = new PriceService();

// Хук для використання в React компонентах
export function usePriceUpdates(
  assetIds?: string[],
): Record<string, AssetPrice> {
  const [prices, setPrices] = useState<Record<string, AssetPrice>>({});

  useEffect(() => {
    const unsubscribe = priceService.subscribe((updates) => {
      if (assetIds) {
        // Фільтруємо тільки потрібні активи
        const filteredUpdates: Record<string, AssetPrice> = {};
        assetIds.forEach((id) => {
          if (updates[id]) {
            filteredUpdates[id] = updates[id];
          }
        });
        setPrices(filteredUpdates);
      } else {
        // Всі активи
        setPrices(updates);
      }
    });

    return unsubscribe;
  }, [assetIds?.join(",")]);

  return prices;
}

// Імпорт React для хука
import { useState, useEffect } from "react";
