import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
// ArrowLeftIcon removed - using Telegram mini app navigation
import { useNavigate, useParams } from "react-router-dom";
import { TRENDING_ASSETS } from "@/data/trendingAssets";
import { PortfolioManager } from "@/lib/portfolio";
import { usePriceUpdates } from "@/lib/priceService";
import { BuyAssetModal } from "@/components/BuyAssetModal";
import { SellAssetModal } from "@/components/SellAssetModal";
import { InteractiveChart } from "@/components/InteractiveChart";

// Interactive chart with real data is now used instead of mock data

// Розширений список активів для деталей
const allAssets = [
  ...TRENDING_ASSETS,
  // Акції
  {
    id: "aapl",
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 189.84,
    change24h: 1.25,
    icon: "🍎",
    iconBgColor: "bg-gray-500",
    category: "stocks",
  },
  {
    id: "tsla",
    symbol: "TSLA",
    name: "Tesla",
    price: 248.98,
    change24h: -2.15,
    icon: "🚗",
    iconBgColor: "bg-red-500",
    category: "stocks",
  },
  {
    id: "msft",
    symbol: "MSFT",
    name: "Microsoft",
    price: 415.75,
    change24h: 0.85,
    icon: "🖥️",
    iconBgColor: "bg-blue-500",
    category: "stocks",
  },
  {
    id: "googl",
    symbol: "GOOGL",
    name: "Alphabet",
    price: 172.48,
    change24h: 1.15,
    icon: "🔍",
    iconBgColor: "bg-green-500",
    category: "stocks",
  },
  // Золото
  {
    id: "gold",
    symbol: "GOLD",
    name: "Золото",
    price: 2650.5,
    change24h: 0.75,
    icon: "🥇",
    iconBgColor: "bg-yellow-500",
    category: "gold",
  },
  {
    id: "silver",
    symbol: "SILVER",
    name: "Срібло",
    price: 30.85,
    change24h: 1.22,
    icon: "🥈",
    iconBgColor: "bg-gray-400",
    category: "gold",
  },
  // Крипто
  {
    id: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    price: 109008.18,
    change24h: 1.09,
    icon: "₿",
    iconBgColor: "bg-orange-500",
    category: "crypto",
  },
  {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    price: 2620.19,
    change24h: 3.52,
    icon: "Ξ",
    iconBgColor: "bg-blue-600",
    category: "crypto",
  },
  {
    id: "ton",
    symbol: "TON",
    name: "Toncoin",
    price: 2.92,
    change24h: -0.47,
    icon: "🔷",
    iconBgColor: "bg-blue-500",
    category: "crypto",
  },
  {
    id: "sol",
    symbol: "SOL",
    name: "Solana",
    price: 152.47,
    change24h: 1.67,
    icon: "🌅",
    iconBgColor: "bg-purple-500",
    category: "crypto",
  },
  {
    id: "xrp",
    symbol: "XRP",
    name: "XRP",
    price: 2.45,
    change24h: -1.85,
    icon: "💎",
    iconBgColor: "bg-blue-400",
    category: "crypto",
  },
  // Платина
  {
    id: "platinum",
    symbol: "PLATINUM",
    name: "Платина",
    price: 985.50,
    change24h: 0.45,
    icon: "🪙",
    iconBgColor: "bg-gray-300",
    category: "gold",
  },
  // Долари
  {
    id: "usd",
    symbol: "USD",
    name: "Долар США",
    price: 1.0,
    change24h: 0.0,
    icon: "💵",
    iconBgColor: "bg-green-600",
    category: "currency",
  },
];

export default function CoinDetail() {
  const { tg, hapticFeedback, user } = useTelegram();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { coinId } = useParams();
  // timeRange moved to InteractiveChart component
  const [portfolioManager, setPortfolioManager] =
    useState<PortfolioManager | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);

  // Реальні ціни активів
  const priceUpdates = usePriceUpdates();

  // Find the asset based on coinId
  let asset = allAssets.find((a) => a.id === coinId) || {
    id: "hedera",
    symbol: "HBAR",
    name: "Hedera",
    price: 0.172,
    change24h: 6.48,
    icon: "H",
    iconBgColor: "bg-foreground",
    category: "crypto",
  };

  // Оновлюємо ціну з реальних даних якщо доступно
  if (priceUpdates[asset.id]) {
    asset = {
      ...asset,
      price: priceUpdates[asset.id].price,
      change24h: priceUpdates[asset.id].change24h,
    };
  }

  // Генерація динамічного контенту для різн��х типів активів
  const getAssetInfo = () => {
    switch (asset.category) {
      case "crypto":
        if (asset.id === "btc") {
          return {
            title: t('coin.about_crypto'),
            description: t('coin.btc_description'),
            points: [
              t('coin.btc_point_1'),
              t('coin.btc_point_2')
            ]
          };
        } else if (asset.id === "eth") {
          return {
            title: t('coin.about_crypto'),
            description: t('coin.eth_description'),
            points: [
              t('coin.eth_point_1'),
              t('coin.eth_point_2')
            ]
          };
        } else if (asset.id === "ton") {
          return {
            title: "О КРИПТОВАЛЮТЕ",
            description: "Toncoin — це криптовалюта блокчейну TON (The Open Network), який спочатку розроблявся командою Telegram.",
            points: [
              "Ви можете купувати, продавати або зберігати TON в Гаманці.",
              "TON відомий своєю високою швидкістю транзакцій та низькими комісіями."
            ]
          };
        } else if (asset.id === "sol") {
          return {
            title: "О КРИПТОВАЛЮТЕ",
            description: "Solana — це високопродуктивний блокчейн, відомий своєю швидкістю та низькими комісіями за транзакції.",
            points: [
              "Ви можете купувати, продавати або зберігати SOL в Гаманці.",
              "Solana підтримує децентралізовані додатки та смарт-контракти."
            ]
          };
        } else if (asset.id === "xrp") {
          return {
            title: "О КРИПТОВАЛЮТЕ",
            description: "XRP — це цифрова валюта, створена компанією Ripple для миттєвих міжнародних переказів та платежів.",
            points: [
              "Ви можете купувати, продавати або зберігати XRP в Гаманці.",
              "XRP використовується банками та фінансовими установами для швидких переказів."
            ]
          };
        } else {
          return {
            title: t('coin.about_crypto'),
            description: t('coin.generic_crypto_description').replace('{{name}}', asset.name),
            points: [
              t('coin.generic_crypto_point_1').replace('{{symbol}}', asset.symbol),
              t('coin.generic_crypto_point_2')
            ]
          };
        }
      
      case "stocks":
        if (asset.id === "aapl") {
          return {
            title: "ПРО АКЦІЮ",
            description: "Apple Inc. — американська багатонаціональна технологічна корпорація, відома своїми продуктами iPhone, iPad, Mac та іншими пристроями.",
            points: [
              "Ви можете купувати або продавати акції AAPL через платформу.",
              "Apple є однією з найдорожчих компаній у світі за ринковою капіталізацією."
            ]
          };
        } else if (asset.id === "tsla") {
          return {
            title: "ПРО АКЦІЮ",
            description: "Tesla, Inc. — американська компанія, що спеціалізується на електромобілях, накопичувачах енергії та сонячних панелях.",
            points: [
              "Ви можете купувати або продавати акції TSLA через платформу.",
              "Tesla є лідером в галузі електромобілів та чистої енергії."
            ]
          };
        } else if (asset.id === "msft") {
          return {
            title: "ПРО АКЦІЮ",
            description: "Microsoft Corporation — американська багатонаціональна технологічна корпорація, розробник програмного забезпечення та хмарних сервісів.",
            points: [
              "Ви можете купувати або продавати акції MSFT через платформу.",
              "Microsoft є провідним постачальником хмарних сервісів Azure."
            ]
          };
        } else if (asset.id === "googl") {
          return {
            title: "ПРО АКЦІЮ",
            description: "Alphabet Inc. — материнська компанія Google, провідна інтернет-компанія та розробник пошукової системи Google.",
            points: [
              "Ви можете купувати або продавати акції GOOGL через платформу.",
              "Alphabet володіє Google, YouTube, Android та багатьма іншими сервісами."
            ]
          };
        } else {
          return {
            title: "ПРО АКЦІЮ",
            description: `${asset.name} — це публічна компанія, акції якої торгуються на фондовому ринку.`,
            points: [
              `Ви можете купувати або продавати акції ${asset.symbol} через платформу.`,
              "Ціни на акції можуть коливатися залежно від ринкових умов."
            ]
          };
        }
      
      case "gold":
        if (asset.id === "gold") {
          return {
            title: "ПРО ДОРОГОЦІННИЙ МЕТАЛ",
            description: "Золото — це дорогоц����нний метал, який протягом тисячоліть використовується як засіб збереження вартості та захисту від інфляції.",
            points: [
              "Ви можете купувати або продавати золото через платформу.",
              "Золото традиційно вважаєтьс�� 'безпечним притулком' для інвесторів."
            ]
          };
        } else if (asset.id === "silver") {
          return {
            title: "ПРО ДОРОГОЦІННИЙ МЕТАЛ",
            description: "Срібло — це дорогоцінний метал з широким промисловим застосуванням, популярний серед інвесторів як альтернатива золоту.",
            points: [
              "Ви можете купувати або продавати срібло через платформу.",
              "Срібло має як інвестиційну, так і промислову цінність."
            ]
          };
        } else if (asset.id === "platinum") {
          return {
            title: "ПРО ДОРОГОЦІННИЙ МЕ��А��",
            description: "Платина — це ��ідкісний дорогоцінний метал з унікальними властивостями, який широко використов��ється в ювелірній справі та промисловості.",
            points: [
              "Ви можете купувати або продавати платину через пла��форму.",
              "Платина рідше за золото та має високу стійкість до корозії."
            ]
          };
        } else {
          return {
            title: "ПРО ДОРОГОЦІННИЙ МЕТАЛ",
            description: `${asset.name} — це дорогоцінний метал, що використовується для інвестицій та промислових цілей.`,
            points: [
              `Ви можете купувати або продавати ${asset.symbol} через платформу.`,
              "Дорогоцінні метали можуть служити захистом від економічної нестабільності."
            ]
          };
        }
      
      case "currency":
        if (asset.id === "usd") {
          return {
            title: "ПРО ВАЛЮТУ",
            description: "Долар США — це основна резервна валюта світу та ��азова валюта для ��оргі��лі на нашій платформі.",
            points: [
              "Ви можете поповнювати баланс або виводити кошти.",
              "USD використовується для покупки інших активів на платформі."
            ]
          };
        } else {
          return {
            title: "ПРО ВАЛЮТУ",
            description: `${asset.name} — це валюта, доступна для операцій на нашій платформі.`,
            points: [
              `Ви можете здійснювати операції з ${asset.symbol} через платформу.`,
              "Валютні курси можуть коливатися залежно від ринкових умов."
            ]
          };
        }

      default:
        return {
          title: "ПРО АКТИВ",
          description: `${asset.name} — це фінансовий інструмент, доступний для торгівлі на нашій платформі.`,
          points: [
            `Ви можете купувати або продавати ${asset.symbol} через платформу.`,
            "Бу��ь ласка, врахуй��е ризики при інвестуванні."
          ]
        };
    }
  };

  const assetInfo = getAssetInfo();

  // Отримуємо кількість активу у портфелі користувача
  const userAsset = portfolioManager?.getAsset(asset.id);
  let assetQuantity = userAsset?.quantity || 0;
  let hasAsset = assetQuantity > 0;

  // Для USD показуємо баланс готівки
  if (asset.id === 'usd') {
    assetQuantity = portfolioManager?.getPortfolio().cashBalance || 0;
    hasAsset = assetQuantity > 0;
  }

  // Отримуємо історію транзакцій для цього активу
  const assetTransactions = portfolioManager?.getAssetTransactions(asset.id) || [];

  // Back button is now handled automatically by Telegram mini app

  useEffect(() => {
    // Ініціалізація портфеля
    const userId = user?.id?.toString() || "demo_user";
    const portfolio = new PortfolioManager(userId);
    setPortfolioManager(portfolio);
  }, [user]);

  const handleBuy = () => {
    hapticFeedback("medium");

    if (asset.id === "usd") {
      // Для USD відкриваємо сторінку методів поповнення
      navigate("/deposit/method");
    } else {
      // Для інших активів відкриваємо Exchange з зап��вненими полями
      navigate(`/exchange?from=usd&to=${asset.id}`);
    }
  };

  const handleSell = () => {
    hapticFeedback("medium");

    if (asset.id === "usd") {
      // Для USD відкриваємо сторінку методів виводу
      navigate("/withdraw/method");
    } else {
      // Для інших активів відкрив��ємо Exchange з протилежними полями
      navigate(`/exchange?from=${asset.id}&to=usd`);
    }
  };

  const handleBuySuccess = () => {
    hapticFeedback("light");
    // Портфель автоматично оновиться через реактивність
  };

  // Chart functionality moved to InteractiveChart component

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Simple padding for top spacing */}
      <div className="pt-4"></div>

      {/* Space for better layout */}

      {/* Coin Info */}
      <div className="p-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{asset.name}</h2>
              <div className="flex items-center gap-4 mt-2">
                <span className={`${asset.change24h >= 0 ? 'text-success' : 'text-destructive'} text-sm`}>
                  {asset.change24h >= 0 ? '↑' : '↓'} {Math.abs(asset.change24h).toFixed(2)}%
                </span>
                <span className={`${asset.change24h >= 0 ? 'text-success' : 'text-destructive'} text-sm`}>
                  {asset.change24h >= 0 ? '+' : ''}{((asset.price * asset.change24h) / 100).toFixed(4)} $
                </span>
                <span className="text-muted-foreground text-sm">Сегодня</span>
              </div>
            </div>
            <div
              className={`w-12 h-12 ${asset.iconBgColor} rounded-full flex items-center justify-center text-white font-bold text-xl`}
            >
              {asset.icon}
            </div>
          </div>

          <div className="text-3xl font-bold mb-4">
            {asset.price.toLocaleString()} $
          </div>

          {/* Interactive Chart */}
          <InteractiveChart
            assetId={asset.id}
            currentPrice={asset.price}
            change24h={asset.change24h}
            width={400}
            height={200}
          />
        </Card>
      </div>

      {/* About Section */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-3 text-muted-foreground">
          {assetInfo.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {assetInfo.description}{" "}
          <span className="text-primary">Докладніше</span>
        </p>

        <div className="space-y-3">
          {assetInfo.points.map((point, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                {point}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio Holdings Section */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-3 text-muted-foreground">
          У ПОРТФЕЛІ
        </h3>
        {hasAsset ? (
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  {asset.id === 'usd' ? 'Баланс' : 'Кількість'}
                </p>
                <p className="text-xl font-semibold">
                  {asset.id === 'usd'
                    ? `$${assetQuantity.toLocaleString()}`
                    : `${assetQuantity.toLocaleString()} ${asset.symbol}`
                  }
                </p>
              </div>
              {asset.id !== 'usd' && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Поточна вартість</p>
                  <p className="text-xl font-semibold">
                    ${(assetQuantity * asset.price).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
            {userAsset && asset.id !== 'usd' && (
              <div className="mt-3 pt-3 border-t flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Середня ціна: ${userAsset.avgPrice.toFixed(2)}
                </span>
                <span className={`${
                  asset.price >= userAsset.avgPrice ? 'text-success' : 'text-destructive'
                }`}>
                  {asset.price >= userAsset.avgPrice ? '+' : ''}
                  {((asset.price - userAsset.avgPrice) / userAsset.avgPrice * 100).toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-lg p-4 border text-center">
            <p className="text-muted-foreground">
              {asset.id === 'usd'
                ? 'Баланс доларів: $0.00'
                : `У вас немає ${asset.name} в портфелі`
              }
            </p>
          </div>
        )}
      </div>

      {/* Transaction History Section */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-3 text-muted-foreground">
          ІСТОРІЯ ОПЕРАЦІЙ
        </h3>
        {assetTransactions.length > 0 ? (
          <div className="space-y-2">
            {assetTransactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="bg-card rounded-lg p-3 border">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      {transaction.type === 'buy' && (asset.id === 'usd' ? '🔴 Покупка активу' : '🟢 Покупка')}
                      {transaction.type === 'sell' && (asset.id === 'usd' ? '🟢 Продаж активу' : '🔴 Продаж')}
                      {transaction.type === 'deposit' && '💵 Поповнення'}
                      {transaction.type === 'withdraw' && '💸 Виведення'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.timestamp).toLocaleDateString()} {new Date(transaction.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      // Для USD: поповнення і продажі - зелені, покупки і виведення - червоні
                      asset.id === 'usd'
                        ? (transaction.type === 'deposit' || transaction.type === 'sell' ? 'text-success' : 'text-destructive')
                        : (transaction.type === 'buy' || transaction.type === 'deposit' ? 'text-success' : 'text-destructive')
                    }`}>
                      {asset.id === 'usd'
                        ? (transaction.type === 'deposit' || transaction.type === 'sell' ? '+' : '-')
                        : (transaction.type === 'buy' || transaction.type === 'deposit' ? '+' : '-')
                      }
                      ${transaction.amount.toFixed(2)}
                    </p>
                    {transaction.quantity && asset.id !== 'usd' && (
                      <p className="text-sm text-muted-foreground">
                        {transaction.quantity} {asset.symbol}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {assetTransactions.length > 5 && (
              <div className="text-center pt-2">
                <button
                  className="text-primary text-sm"
                  onClick={() => navigate("/history")}
                >
                  Показати всі операції
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-lg p-4 border text-center">
            <p className="text-muted-foreground">
              Операцій з {asset.name} поки немає
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-3">
        <Button
          className="w-full bg-primary text-primary-foreground"
          onClick={handleBuy}
        >
          {asset.id === "usd" ? "Поповнити" : "Купити"}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleSell}
          disabled={asset.id !== "usd" && !hasAsset}
        >
          {asset.id === "usd" ? "Вивести" : "Продати"}
        </Button>
      </div>

      {/* Buy Asset Modal */}
      <BuyAssetModal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        asset={{
          ...asset,
          category: asset.category || "crypto",
        }}
        portfolioManager={portfolioManager}
        onSuccess={handleBuySuccess}
      />

      {/* Sell Asset Modal */}
      <SellAssetModal
        isOpen={showSellModal}
        onClose={() => setShowSellModal(false)}
        asset={{
          ...asset,
          category: asset.category || "crypto",
        }}
        portfolioManager={portfolioManager}
        onSuccess={handleBuySuccess}
      />
    </div>
  );
}
