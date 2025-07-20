import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CryptoAsset } from "@/types/crypto";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  RefreshCwIcon,
  CreditCardIcon,
  EyeIcon,
  EyeOffIcon,
  UserIcon,
  XIcon,
  SendIcon,
} from "lucide-react";
import CFD from "./CFD";
import { useNavigate } from "react-router-dom";
import { TRENDING_ASSETS } from "@/data/trendingAssets";
import { PortfolioManager, UserAsset } from "@/lib/portfolio";
import {
  getTopPerformingAssets,
  generateMiniChartData,
} from "@/lib/trendingAssets";
import { MiniChart } from "@/components/MiniChart";
import { BuyAssetModal } from "@/components/BuyAssetModal";
import { ExchangeModal } from "@/components/ExchangeModal";
import { usePriceUpdates } from "@/lib/priceService";

// Інші доступні активи (не куплені користувачем)
const availableAssets = [
  {
    id: "ton",
    symbol: "TON",
    name: "Toncoin",
    price: 2.92,
    change24h: -0.47,
    icon: "🔷",
    category: "crypto" as const,
  },
  {
    id: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    price: 117456.06,
    change24h: 1.15,
    icon: "₿",
    category: "crypto" as const,
  },
  {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    price: 2945.61,
    change24h: -0.81,
    icon: "Ξ",
    category: "crypto" as const,
  },
  {
    id: "aapl",
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 189.84,
    change24h: 1.25,
    icon: "🍎",
    category: "stocks" as const,
  },
  {
    id: "tsla",
    symbol: "TSLA",
    name: "Tesla",
    price: 248.98,
    change24h: -2.15,
    icon: "🚗",
    category: "stocks" as const,
  },
  {
    id: "gold",
    symbol: "GOLD",
    name: "Золото",
    price: 2650.5,
    change24h: 0.75,
    icon: "🥇",
    category: "gold" as const,
  },
];

export default function Wallet() {
  const { user, hapticFeedback, tg } = useTelegram();
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("wallet");
  const [showTradingModal, setShowTradingModal] = useState(false);
  const [selectedTradingAsset, setSelectedTradingAsset] = useState<any>(null);
  const [showAllAssets, setShowAllAssets] = useState(true);
  const [showNotification, setShowNotification] = useState(true);

  // Портфель користувача
  const [portfolioManager, setPortfolioManager] =
    useState<PortfolioManager | null>(null);
  const [userAssets, setUserAssets] = useState<UserAsset[]>([]);
  const [cashBalance, setCashBalance] = useState(0);
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);
  const [portfolioPnL, setPortfolioPnL] = useState({
    amount: 0,
    percentage: 0,
  });

  // Модал покупки активів
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedBuyAsset, setSelectedBuyAsset] = useState<any>(null);

  // Модал обміну активів
  const [showExchangeModal, setShowExchangeModal] = useState(false);

  // Реальні ціни активів
  const priceUpdates = usePriceUpdates();

  // Топ-4 активи за зростанням
  const [topAssets, setTopAssets] = useState(TRENDING_ASSETS.slice(0, 4));

  useEffect(() => {
    console.log("💰 Wallet компоне��т завантажено");
    console.log("📱 tg object:", tg);
    console.log("👤 user object:", user);

    if (tg) {
      tg.BackButton.hide();
      console.log("🔙 Back button приховано");
    } else {
      console.warn("❌ tg object відсутній у Wallet");
    }

    // Ініціалізація портфеля
    const userId = user?.id?.toString() || "demo_user";
    const portfolio = new PortfolioManager(userId);
    setPortfolioManager(portfolio);

    // Завантаження даних портфеля
    updatePortfolioData(portfolio);
  }, [tg, user]);

  // Функція оновлення даних портфеля
  const updatePortfolioData = (portfolio: PortfolioManager) => {
    setUserAssets(portfolio.getAssets());
    setCashBalance(portfolio.getCashBalance());
    setTotalPortfolioValue(portfolio.getTotalPortfolioValue());
    setPortfolioPnL(portfolio.getTotalPortfolioPnL());
  };

  // Оновлення цін в портфелі при зміні цін на ринку
  useEffect(() => {
    if (portfolioManager && Object.keys(priceUpdates).length > 0) {
      // Конвертуємо ціни з API до формату портфеля
      const priceMap: Record<string, number> = {};
      Object.entries(priceUpdates).forEach(([id, priceData]) => {
        priceMap[id] = priceData.price;
      });

      portfolioManager.updateAssetPrices(priceMap);
      updatePortfolioData(portfolioManager);

      // Оновлюємо availableAssets з новими цінами
      availableAssets.forEach((asset) => {
        if (priceUpdates[asset.id]) {
          asset.price = priceUpdates[asset.id].price;
          asset.change24h = priceUpdates[asset.id].change24h;
        }
      });

      // Оновлюємо топ-4 активи за зростанням
      const topPerformers = getTopPerformingAssets(priceUpdates);
      setTopAssets(topPerformers);
    }
  }, [priceUpdates, portfolioManager]);

  // Обробник покупки активу
  const handleBuyAsset = (asset: any) => {
    setSelectedBuyAsset(asset);
    setShowBuyModal(true);
  };

  // Обробник успішної покупки
  const handleBuySuccess = () => {
    if (portfolioManager) {
      updatePortfolioData(portfolioManager);
    }
  };

  const toggleBalanceVisibility = () => {
    hapticFeedback("light");
    setShowBalance(!showBalance);
  };

  const handleAction = (action: string) => {
    hapticFeedback("medium");
    if (action === "withdraw") {
      navigate("/withdraw/method");
    } else if (action === "deposit") {
      navigate("/deposit/method");
    } else if (action === "exchange") {
      setShowExchangeModal(true);
    } else if (action === "transfer") {
      // Логіка переведення між Портфель та CFD
      navigate("/transfer");
    } else {
      console.log(`${action} action`);
    }
  };

  const handleTabSwitch = (tab: string) => {
    hapticFeedback("light");
    setActiveTab(tab);
  };

  const handleAvatarClick = () => {
    hapticFeedback("light");
    navigate("/settings");
  };

  const handleViewAllTrending = () => {
    hapticFeedback("light");
    navigate("/market");
  };

  const handleTradingAssetClick = (asset: any) => {
    hapticFeedback("medium");
    navigate(`/coin/${asset.id}`);
  };

  const handleTrade = (type: "buy" | "sell") => {
    hapticFeedback("medium");
    console.log(`${type} ${selectedTradingAsset?.symbol}`);
    setShowTradingModal(false);
  };

  const toggleAssetsVisibility = () => {
    hapticFeedback("light");
    setShowAllAssets(!showAllAssets);
  };

  const handleNotificationClick = () => {
    hapticFeedback("medium");
    navigate("/bonuses");
  };

  const closeNotification = () => {
    hapticFeedback("light");
    setShowNotification(false);
  };

  // Content to display based on active tab
  const renderContent = () => {
    if (activeTab === "cfd") {
      return <CFD />;
    }

    // Default wallet content
    return (
      <>
        {/* Balance Section */}
        <div className="px-4 pb-6 pt-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl font-bold">
                {showBalance
                  ? `${totalPortfolioValue.toFixed(2)} $`
                  : "•".repeat(`${totalPortfolioValue.toFixed(2)} $`.length)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleBalanceVisibility}
                className="h-8 w-8"
              >
                {showBalance ? (
                  <EyeIcon className="w-4 h-4" />
                ) : (
                  <EyeOffIcon className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-sm text-muted-foreground">
                Баланс Портфеля
              </span>
              {portfolioPnL.amount !== 0 && showBalance && (
                <span
                  className={`text-sm font-medium ${
                    portfolioPnL.amount >= 0
                      ? "text-success"
                      : "text-destructive"
                  }`}
                >
                  {portfolioPnL.amount >= 0 ? "+" : ""}$
                  {portfolioPnL.amount.toFixed(2)}
                </span>
              )}
            </div>
            {portfolioPnL.percentage !== 0 && showBalance && (
              <div className="text-center">
                <span
                  className={`text-xs ${
                    portfolioPnL.percentage >= 0
                      ? "text-success"
                      : "text-destructive"
                  }`}
                >
                  {portfolioPnL.percentage >= 0 ? "↑" : "↓"}
                  {Math.abs(portfolioPnL.percentage).toFixed(2)}% за весь час
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            <div className="flex flex-col items-center">
              <div
                className="w-full h-20 bg-muted rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => handleAction("withdraw")}
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <ArrowUpIcon className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-xs text-primary font-medium text-center">
                  Вывести
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div
                className="w-full h-20 bg-muted rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => handleAction("deposit")}
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <ArrowDownIcon className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-xs text-primary font-medium text-center">
                  Пополнить
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div
                className="w-full h-20 bg-muted rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => handleAction("exchange")}
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <RefreshCwIcon className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-xs text-primary font-medium text-center">
                  Обменять
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div
                className="w-full h-20 bg-muted rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => handleAction("transfer")}
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <SendIcon className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-xs text-primary font-medium text-center">
                  Перевести
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Banner */}
        {showNotification && (
          <div className="mx-4 mb-4">
            <Card
              className="p-4 bg-gradient-to-r from-emerald-400 to-cyan-400 text-white cursor-pointer relative overflow-hidden"
              onClick={handleNotificationClick}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-white hover:bg-white/20 h-8 w-8"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  closeNotification();
                }}
              >
                <XIcon className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="text-3xl">💰</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">
                    Заробляйте до 15% APY
                  </h3>
                  <h4 className="font-semibold mb-1">з доларами</h4>
                  <p className="text-sm opacity-90">Почати заробляти →</p>
                </div>
              </div>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-30">
                <div className="text-6xl">���</div>
              </div>
            </Card>
          </div>
        )}

        {/* Assets List */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-muted-foreground">
              АКТИВИ
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAssetsVisibility}
              className="text-muted-foreground"
            >
              {showAllAssets ? "Сховати" : "Показати"}
            </Button>
          </div>

          <div className="space-y-2">
            {/* Доллары - готівка для торгівлі */}
            <Card
              className="p-4 hover:bg-muted/50 transition-colors cursor-pointer border-l-4 border-l-green-500"
              onClick={() => {
                hapticFeedback("medium");
                // navigate(`/cash-detail`);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">$</span>
                  </div>
                  <div>
                    <div className="font-medium">Доллары (готівка)</div>
                    <div className="text-sm text-muted-foreground">
                      Для торгівлі
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${cashBalance.toFixed(2)}</div>
                </div>
              </div>
            </Card>

            {/* Куплені активи користувача */}
            {showAllAssets &&
              userAssets.map((asset) => {
                const pnl = portfolioManager?.getAssetPnL(asset.id) || {
                  amount: 0,
                  percentage: 0,
                };
                const currentValue = asset.quantity * asset.currentPrice;

                return (
                  <Card
                    key={asset.id}
                    className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => {
                      hapticFeedback("medium");
                      navigate(`/coin/${asset.id}`);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white text-lg font-bold">
                            {asset.icon}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{asset.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>${asset.currentPrice.toFixed(2)}</span>
                            <span
                              className={`text-xs ${
                                pnl.percentage >= 0
                                  ? "text-success"
                                  : "text-destructive"
                              }`}
                            >
                              {pnl.percentage >= 0 ? "↑" : "↓"}
                              {Math.abs(pnl.percentage).toFixed(2)}%
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Купили за: ${asset.avgPrice.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          ${currentValue.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {asset.quantity.toFixed(2)} {asset.symbol}
                        </div>
                        <div
                          className={`text-xs ${pnl.amount >= 0 ? "text-success" : "text-destructive"}`}
                        >
                          {pnl.amount >= 0 ? "+" : ""}${pnl.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}

            {/* Повідомлення якщо немає активів */}
            {userAssets.length === 0 && showAllAssets && (
              <Card className="p-4 text-center border-dashed">
                <div className="text-muted-foreground">
                  <div className="text-2xl mb-2">📈</div>
                  <div className="font-medium">Поки немає активів</div>
                  <div className="text-sm">Купіть активи на сторінці Ринок</div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Trending Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground text-sm">В ТРЕНДЕ</h3>
            <button
              className="text-primary text-sm"
              onClick={handleViewAllTrending}
            >
              Все
            </button>
          </div>

          {/* Trending Assets */}
          <div className="space-y-3">
            {topAssets.slice(0, 3).map((asset) => {
              const chartData = generateMiniChartData(asset);
              const isPositive = asset.change24h >= 0;

              return (
                <Card
                  key={asset.id}
                  className="p-4 bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/coin/${asset.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 ${asset.iconBgColor} rounded-full flex items-center justify-center`}
                      >
                        <span className="text-white text-lg font-bold">
                          {asset.icon}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{asset.symbol}</div>
                        <div
                          className={`text-sm ${isPositive ? "text-success" : "text-destructive"}`}
                        >
                          {isPositive ? "↑" : "↓"}{" "}
                          {Math.abs(asset.change24h).toFixed(2)}% за день
                        </div>
                        <div className="text-muted-foreground text-sm">
                          ${asset.price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-8">
                        <MiniChart
                          data={chartData}
                          isPositive={isPositive}
                          width={64}
                          height={32}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Demo Mode Banner */}
      {user?.is_demo && (
        <div className="bg-orange-100 border-b border-orange-200 p-2 text-center">
          <span className="text-orange-800 text-sm font-medium">
            🎭 Demo режим - для повних функцій запустіть через Telegram бота
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {/* Avatar - перехід до налаштувань */}
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-full p-0 hover:ring-2 hover:ring-primary/20 transition-all"
          onClick={handleAvatarClick}
          title="Відкрити налаштування"
        >
          {user?.photo_url ? (
            <img
              src={user.photo_url}
              alt={`${user.first_name || "User"} avatar`}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : user?.first_name ? (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user.first_name[0].toUpperCase()}
              </span>
            </div>
          ) : (
            // Fallback для випадків, коли Telegram дані недоступні
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {tg ? "TG" : "U"}
              </span>
            </div>
          )}
        </Button>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-muted rounded-full p-1">
          <Button
            variant={activeTab === "wallet" ? "default" : "ghost"}
            size="sm"
            className="rounded-full px-4"
            onClick={() => handleTabSwitch("wallet")}
          >
            Кошелёк
          </Button>
          <Button
            variant={activeTab === "cfd" ? "default" : "ghost"}
            size="sm"
            className="rounded-full px-4"
            onClick={() => handleTabSwitch("cfd")}
          >
            CFD
          </Button>
        </div>

        {/* Refresh Button */}
        <Button variant="ghost" size="icon">
          <RefreshCwIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* Dynamic Content */}
      {renderContent()}

      <div className="pb-20" />

      {/* Trading Modal */}
      {showTradingModal && selectedTradingAsset && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-card rounded-t-lg w-full max-w-md border border-border animate-in slide-in-from-bottom-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold">
                Т��рговля {selectedTradingAsset.symbol}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowTradingModal(false)}
              >
                <XIcon className="w-5 h-5" />
              </Button>
            </div>

            {/* Asset Info */}
            <div className="p-4 text-center border-b border-border">
              <div className="text-xl font-bold mb-1">
                {selectedTradingAsset.name}
              </div>
              <div className="text-2xl font-bold mb-2">
                ${selectedTradingAsset.price.toLocaleString()}
              </div>
              <div className="text-success text-sm">Текущая цена</div>
            </div>

            {/* Trading Buttons */}
            <div className="p-4 space-y-3">
              <Button
                className="w-full bg-success text-success-foreground text-lg py-3"
                onClick={() => handleTrade("buy")}
              >
                КУПИТЬ {selectedTradingAsset.symbol}
              </Button>
              <Button
                variant="outline"
                className="w-full text-destructive border-destructive text-lg py-3"
                onClick={() => handleTrade("sell")}
              >
                ПРОДАТЬ {selectedTradingAsset.symbol}
              </Button>
            </div>

            {/* Warning */}
            <div className="p-4 pt-0">
              <div className="text-xs text-muted-foreground text-center">
                Торговля криптовалютами связана с высокими рисками
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buy Asset Modal */}
      <BuyAssetModal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        asset={selectedBuyAsset}
        portfolioManager={portfolioManager}
        onSuccess={handleBuySuccess}
      />

      {/* Exchange Modal */}
      <ExchangeModal
        isOpen={showExchangeModal}
        onClose={() => setShowExchangeModal(false)}
        portfolioManager={portfolioManager}
        onSuccess={handleBuySuccess}
      />
    </div>
  );
}
