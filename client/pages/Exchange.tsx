import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDownIcon, SearchIcon } from "lucide-react";
import { PortfolioManager, UserAsset } from "@/lib/portfolio";
import { useTelegram } from "@/hooks/useTelegram";
import { useLanguage } from "@/hooks/useLanguage";
import { usePriceUpdates } from "@/lib/priceService";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MarketAsset } from "@/types/crypto";

// Активи з Market сторінки - криптовалюти
const cryptoAssets: MarketAsset[] = [
  {
    id: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    price: 109008.18,
    change24h: 1.09,
    marketCap: 2150000000000,
    icon: "₿",
    sparkline: [108000, 108500, 109000, 109008],
  },
  {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    price: 2620.19,
    change24h: 3.52,
    marketCap: 315000000000,
    icon: "Ξ",
    sparkline: [2530, 2580, 2610, 2620],
  },
  {
    id: "ton",
    symbol: "TON",
    name: "Toncoin",
    price: 2.92,
    change24h: -0.47,
    marketCap: 10000000000,
    icon: "🔷",
    sparkline: [2.95, 2.93, 2.92, 2.92],
  },
  {
    id: "sol",
    symbol: "SOL",
    name: "Solana",
    price: 152.47,
    change24h: 1.67,
    marketCap: 72000000000,
    icon: "🌅",
    sparkline: [150, 151, 152, 152.47],
  },
  {
    id: "xrp",
    symbol: "XRP",
    name: "XRP",
    price: 2.45,
    change24h: -1.85,
    marketCap: 140000000000,
    icon: "💎",
    sparkline: [2.55, 2.50, 2.47, 2.45],
  },
];

// Акції
const stockAssets: MarketAsset[] = [
  {
    id: "aapl",
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 189.84,
    change24h: 1.25,
    marketCap: 2880000000000,
    icon: "🍎",
    sparkline: [188, 189, 189.5, 189.84],
  },
  {
    id: "tsla",
    symbol: "TSLA",
    name: "Tesla",
    price: 248.98,
    change24h: -2.15,
    marketCap: 793000000000,
    icon: "🚗",
    sparkline: [255, 252, 250, 248.98],
  },
  {
    id: "msft",
    symbol: "MSFT",
    name: "Microsoft",
    price: 415.75,
    change24h: 0.85,
    marketCap: 3100000000000,
    icon: "🖥️",
    sparkline: [412, 414, 415, 415.75],
  },
  {
    id: "googl",
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 172.48,
    change24h: 1.15,
    marketCap: 2150000000000,
    icon: "🔍",
    sparkline: [170, 171, 172, 172.48],
  },
];

// Золото та метали
const goldAssets: MarketAsset[] = [
  {
    id: "gold",
    symbol: "GOLD",
    name: "Золото",
    price: 2650.5,
    change24h: 0.75,
    marketCap: 0,
    icon: "🥇",
    sparkline: [2640, 2645, 2648, 2650.5],
  },
  {
    id: "silver",
    symbol: "SILVER",
    name: "Срібло",
    price: 30.85,
    change24h: 1.22,
    marketCap: 0,
    icon: "🥈",
    sparkline: [30.5, 30.7, 30.8, 30.85],
  },
  {
    id: "platinum",
    symbol: "PLATINUM",
    name: "Платина",
    price: 945.2,
    change24h: -0.45,
    marketCap: 0,
    icon: "⚪",
    sparkline: [950, 948, 946, 945.2],
  },
];

// TrendingAssets з Market (включаючи всі з TRENDING_ASSETS)
const trendingAssets: MarketAsset[] = [
  {
    id: "cati",
    symbol: "CATI",
    name: "CATI",
    price: 0.0813,
    change24h: 3.16,
    marketCap: 81300000,
    icon: "🐱",
    sparkline: [0.078, 0.079, 0.081, 0.0813],
  },
  {
    id: "xtz",
    symbol: "XTZ",
    name: "XTZ",
    price: 0.536,
    change24h: 3.2,
    marketCap: 536000000,
    icon: "🔷",
    sparkline: [0.52, 0.525, 0.53, 0.536],
  },
  {
    id: "pi",
    symbol: "PI",
    name: "Pi Network",
    price: 0.5,
    change24h: 5.09,
    marketCap: 50000000,
    icon: "π",
    sparkline: [0.47, 0.48, 0.49, 0.5],
  },
  {
    id: "wld",
    symbol: "WLD",
    name: "Worldcoin",
    price: 1.097,
    change24h: 17.7,
    marketCap: 1000000000,
    icon: "W",
    sparkline: [0.9, 0.95, 1.0, 1.097],
  },
  {
    id: "algo",
    symbol: "ALGO",
    name: "Algorand",
    price: 0.2207,
    change24h: 12.51,
    marketCap: 1700000000,
    icon: "A",
    sparkline: [0.19, 0.20, 0.21, 0.2207],
  },
];

// Всі активи з Market (включаючи trending assets)
const allMarketAssets = [...cryptoAssets, ...stockAssets, ...goldAssets, ...trendingAssets];

export default function Exchange() {
  const { t } = useLanguage();
  const { hapticFeedback, user, tg } = useTelegram();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [fromAsset, setFromAsset] = useState<UserAsset | null>(null);
  const [toAsset, setToAsset] = useState<UserAsset | null>(null); // НЕ автоматично обираємо
  const [fromAmount, setFromAmount] = useState("");
  const [userAssets, setUserAssets] = useState<UserAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFromSelect, setShowFromSelect] = useState(false);
  const [showToSelect, setShowToSelect] = useState(false);
  const [portfolioManager, setPortfolioManager] = useState<PortfolioManager | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Реальні ціни активів
  const priceUpdates = usePriceUpdates();

  // Ініціалізація портфоліо
  useEffect(() => {
    const userId = user?.id?.toString() || "demo_user";
    const manager = new PortfolioManager(userId);
    setPortfolioManager(manager);
  }, [user]);

  useEffect(() => {
    if (portfolioManager) {
      const assets = portfolioManager.getAssets();
      const cashBalance = portfolioManager.getCashBalance();

      // З��вжди додаємо долари до списку (навіть з балансом 0)
      const usdAsset: UserAsset = {
        id: "usd",
        symbol: "USD",
        name: "Долари",
        quantity: cashBalance,
        avgPrice: 1,
        currentPrice: 1,
        icon: "$",
        category: "currency",
      };

      const allAssets = [usdAsset, ...assets]; // Долари завжди першими

      setUserAssets(allAssets);

      // Перевіряємо URL параметри для автоматичного вибору активів
      const fromParam = searchParams.get('from');
      const toParam = searchParams.get('to');

      if (fromParam && allAssets.length > 0) {
        const fromAssetFromUrl = allAssets.find(asset => asset.id === fromParam);
        if (fromAssetFromUrl && !fromAsset) {
          setFromAsset(fromAssetFromUrl);
        }
      } else if (allAssets.length > 0 && !fromAsset) {
        // Автоматично обираємо перший актив (долари) якщо не обрано
        setFromAsset(allAssets[0]);
      }

      // Автоматично обираємо toAsset з URL параметрів
      if (toParam) {
        // Шукаємо серед всіх доступних активі�� (користувацьких + ринкових)
        const allAvailable = [...allAssets, ...allMarketAssets];
        const toAssetFromUrl = allAvailable.find(asset => asset.id === toParam);
        if (toAssetFromUrl && !toAsset) {
          // Конвертуємо в UserAsset формат якщо це ринковий актив
          if (!allAssets.find(a => a.id === toAssetFromUrl.id)) {
            const marketAsset = toAssetFromUrl as any;
            setToAsset({
              id: marketAsset.id,
              symbol: marketAsset.symbol,
              name: marketAsset.name,
              quantity: 0,
              avgPrice: marketAsset.price,
              currentPrice: marketAsset.price,
              icon: marketAsset.icon,
              category: marketAsset.id === 'usd' ? 'currency' :
                       ['btc', 'eth', 'ton', 'sol', 'xrp'].includes(marketAsset.id) ? 'crypto' :
                       ['aapl', 'tsla', 'msft', 'googl'].includes(marketAsset.id) ? 'stocks' : 'gold'
            });
          } else {
            setToAsset(toAssetFromUrl);
          }
        }
      }

      setFromAmount("");
      setError("");
    }
  }, [portfolioManager, fromAsset]);

  // Налаштування Telegram
  useEffect(() => {
    if (tg) {
      tg.BackButton.hide(); // Прибираємо кнопку назад
    }
    return () => {
      if (tg) {
        tg.BackButton.hide();
      }
    };
  }, [tg, navigate]);

  // Оновлення цін активів
  useEffect(() => {
    if (userAssets.length > 0 && Object.keys(priceUpdates).length > 0) {
      const updatedAssets = userAssets.map((asset) => {
        const priceUpdate = priceUpdates[asset.id];
        return priceUpdate
          ? { ...asset, currentPrice: priceUpdate.price }
          : asset;
      });
      setUserAssets(updatedAssets);
    }
  }, [priceUpdates]);

  const fromValue = parseFloat(fromAmount) * (fromAsset?.currentPrice || 0);
  const toAmount = toAsset?.currentPrice && fromAmount ? fromValue / toAsset.currentPrice : 0;

  const isValidAmount =
    fromAsset &&
    parseFloat(fromAmount) > 0 &&
    parseFloat(fromAmount) <= fromAsset.quantity;

  const isInsufficientFunds = fromAsset && parseFloat(fromAmount) > fromAsset.quantity;

  const handleSwapAssets = () => {
    hapticFeedback("light");
    // Реально міняємо місцями активи
    const temp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(temp);
    setFromAmount("");
  };

  const handleMaxAmount = () => {
    if (fromAsset) {
      hapticFeedback("light");
      setFromAmount(fromAsset.quantity.toString());
    }
  };

  const handleBalanceClick = () => {
    if (fromAsset?.id === "usd") {
      // Тільки для доларів переходимо на поповнення
      navigate("/deposit/method");
    }
  };

  const handleExchange = async () => {
    if (!portfolioManager || !fromAsset || !toAsset || !isValidAmount) {
      hapticFeedback("medium");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let success = false;

      if (fromAsset.id === "usd" && toAsset.id !== "usd") {
        // Купуємо актив за долари
        success = portfolioManager.buyAsset(
          toAsset.id,
          toAsset.symbol,
          toAsset.name,
          toAmount,
          toAsset.currentPrice,
          toAsset.icon,
          toAsset.category,
        );
      } else if (fromAsset.id !== "usd" && toAsset.id === "usd") {
        // Продаємо актив за долари
        success = portfolioManager.sellAsset(
          fromAsset.id,
          parseFloat(fromAmount),
          fromAsset.currentPrice,
        );
      } else if (fromAsset.id !== "usd" && toAsset.id !== "usd") {
        // Обмін між активами
        const sellSuccess = portfolioManager.sellAsset(
          fromAsset.id,
          parseFloat(fromAmount),
          fromAsset.currentPrice,
        );

        if (sellSuccess) {
          success = portfolioManager.buyAsset(
            toAsset.id,
            toAsset.symbol,
            toAsset.name,
            toAmount,
            toAsset.currentPrice,
            toAsset.icon,
            toAsset.category,
          );
        }
      }

      if (success) {
        hapticFeedback("light");
        // Переходимо на сторінку деталей активу який отримали
        navigate(`/coin/${toAsset.id}`);
      } else {
        setError("Помилка при обміні активів");
        hapticFeedback("medium");
      }
    } catch (err) {
      setError("Помилка при обміні активів");
      hapticFeedback("medium");
    } finally {
      setIsLoading(false);
    }
  };

  const exchangeRate = toAsset && fromAsset ? (toAsset.currentPrice / fromAsset.currentPrice).toFixed(6) : "0";

  // Створюємо списки активів включаючи долари
  const filteredUserAssets = userAssets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Долари також можна отримати + всі ринкові активи
  const allAvailableAssets = [
    {
      id: "usd",
      symbol: "USD", 
      name: "Долари",
      price: 1,
      change24h: 0,
      marketCap: 0,
      icon: "$",
      sparkline: [1, 1, 1, 1],
    },
    ...allMarketAssets
  ];

  const filteredMarketAssets = allAvailableAssets
    .filter(asset => 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(asset => asset.id !== fromAsset?.id); // Забор��нити обирати той самий актив

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header - без кнопки назад */}
      <div className="flex items-center justify-center p-4 max-w-md mx-auto">
        <div className="text-center">
          <div className="font-medium text-lg">Обмен</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-20 max-w-md mx-auto">
        {/* Ви сплачуєте */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 ${getAssetColor(fromAsset?.symbol)} rounded-full flex items-center justify-center`}>
              <span className="text-white text-sm font-bold">{fromAsset?.icon || "$"}</span>
            </div>
            <span className="text-foreground">{t('exchange.you_pay')}</span>
            <span 
              className={`text-blue-400 text-sm ml-auto ${fromAsset?.id === "usd" ? "cursor-pointer" : ""}`} 
              onClick={fromAsset?.id === "usd" ? handleBalanceClick : undefined}
            >
              {fromAsset?.id === "usd" && fromAsset.quantity === 0 ? "Поповнити • " : ""}{fromAsset?.quantity.toFixed(2) || "0"} {fromAsset?.symbol || "USD"}
            </span>
          </div>

          <div className="mb-2">
            <div className="flex items-end justify-between">
              <input
                type="number"
                placeholder="0"
                value={fromAmount}
                onChange={(e) => {
                  setFromAmount(e.target.value);
                  setError("");
                }}
                className={`text-3xl sm:text-4xl md:text-6xl font-bold bg-transparent border-0 focus:outline-none flex-1 max-w-[60%] ${
                  isInsufficientFunds ? 'text-red-500' : 'text-foreground'
                }`}
              />
              <div
                className="flex items-center gap-2 cursor-pointer ml-2"
                onClick={() => setShowFromSelect(true)}
              >
                <span className="text-xl sm:text-2xl md:text-4xl font-light text-muted-foreground">
                  {fromAsset?.symbol || "USD"}
                </span>
                <span className="text-muted-foreground text-xl">›</span>
              </div>
            </div>
            {/* Кнопка Макс під сумою */}
            {fromAsset && fromAsset.quantity > 0 && (
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMaxAmount}
                  className="text-primary border-primary/30 hover:bg-primary/10 px-4 py-2"
                >
                  {t('exchange.max')}
                </Button>
              </div>
            )}
          </div>

          {/* Сума в доларах якщо не долар */}
          {fromAsset && fromAsset.id !== "usd" && fromAmount && parseFloat(fromAmount) > 0 && (
            <div className="text-sm text-muted-foreground mt-2">
              �� ${fromValue.toFixed(2)}
            </div>
          )}

          {isInsufficientFunds && (
            <div className="text-destructive text-sm mt-2">Недостатньо коштів.</div>
          )}
        </div>

        {/* Swap Button - синій колір */}
        <div className="flex justify-center mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwapAssets}
            className="w-12 h-12 rounded-full bg-primary border-primary hover:bg-primary/80"
            disabled={!fromAsset || !toAsset}
          >
            <ArrowUpDownIcon className="w-5 h-5 text-primary-foreground" />
          </Button>
        </div>

        {/* Ви отримаєте */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 ${toAsset ? getAssetColor(toAsset?.symbol) : "bg-muted"} rounded-full flex items-center justify-center`}>
              <span className="text-white text-sm font-bold">
                {toAsset?.icon || "?"}
              </span>
            </div>
            <span className="text-foreground">{t('exchange.you_receive')}</span>
          </div>

          {/* Завжди показуєм�� великі цифри */}
          <div className="flex items-end justify-between mb-2">
            <div className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground flex-1 max-w-[60%] break-all">
              {toAsset && fromAmount && parseFloat(fromAmount) > 0
                ? (toAsset.id === "usd" ? toAmount.toFixed(2) : toAmount.toFixed(6))
                : "0"
              }
            </div>
            <div
              className="flex items-center gap-2 cursor-pointer ml-2"
              onClick={() => setShowToSelect(true)}
            >
              <span className="text-xl sm:text-2xl md:text-4xl font-light text-muted-foreground">
                {toAsset?.symbol || "Вибрати"}
              </span>
              <span className="text-muted-foreground text-xl">›</span>
            </div>
          </div>

          {/* Сума в доларах якщо не долар */}
          {toAsset && toAsset.id !== "usd" && fromAmount && parseFloat(fromAmount) > 0 && (
            <div className="text-sm text-muted-foreground mt-2">
              ≈ ${(toAmount * toAsset.currentPrice).toFixed(2)}
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1 min-h-20"></div>

        {/* Exchange Rate */}
        {fromAsset && toAsset && (
          <div className="text-center mb-6">
            <div className="text-muted-foreground text-sm">
              1 {toAsset.symbol} = {exchangeRate} {fromAsset.symbol}
            </div>
            <div className="text-muted-foreground text-xs mt-1">
              ${toAsset.currentPrice.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Button - синій колір коли активна */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background">
        <Button
          className={`w-full py-4 text-lg font-medium rounded-xl ${
            isValidAmount && !isLoading && toAsset
              ? "bg-primary hover:bg-primary/80 text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          }`}
          disabled={!isValidAmount || isLoading || !toAsset}
          onClick={handleExchange}
        >
          {isLoading ? t('exchange.processing') : t('exchange.review_deal')}
        </Button>
      </div>

      {/* From Asset Selection Modal */}
      {showFromSelect && (
        <div className="fixed inset-0 bg-background z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowFromSelect(false);
                setSearchTerm("");
              }}
              className="text-primary"
            >
              Назад
            </Button>
            <div className="text-center">
              <div className="font-medium text-lg">Обмен</div>
            </div>
            <div className="w-16"></div>
          </div>

          {/* Search */}
          <div className="px-4 mb-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Пошук"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-muted rounded-lg text-foreground placeholder-muted-foreground border-0 focus:outline-none"
              />
            </div>
          </div>

          {/* Assets List с прокруткой */}
          <div className="px-4">
            <h3 className="text-muted-foreground text-sm font-medium mb-4 uppercase tracking-wider">
              Ви сплачуєте
            </h3>
            <div className="space-y-1 max-h-96 overflow-y-auto pb-20">
              {filteredUserAssets
                .filter(asset => asset.id !== toAsset?.id) // Заборона обирати той с��мий
                .map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center gap-3 p-4 hover:bg-muted/50 rounded-lg cursor-pointer"
                  onClick={() => {
                    setFromAsset(asset);
                    setShowFromSelect(false);
                    setSearchTerm("");
                    hapticFeedback("light");
                  }}
                >
                  <div className={`w-10 h-10 ${getAssetColor(asset.symbol)} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-lg font-bold">
                      {asset.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="text-foreground font-medium">{asset.name}</div>
                    <div className="text-muted-foreground text-sm">
                      {asset.currentPrice.toFixed(2)} $
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-foreground font-medium">
                      {(asset.quantity * asset.currentPrice).toFixed(2)} $
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {asset.quantity.toFixed(4)} {asset.symbol}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* To Asset Selection Modal */}
      {showToSelect && (
        <div className="fixed inset-0 bg-background z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowToSelect(false);
                setSearchTerm("");
              }}
              className="text-primary"
            >
              Назад
            </Button>
            <div className="text-center">
              <div className="font-medium text-lg">Обмен</div>
            </div>
            <div className="w-16"></div>
          </div>

          {/* Search */}
          <div className="px-4 mb-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Пошук"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-muted rounded-lg text-foreground placeholder-muted-foreground border-0 focus:outline-none"
              />
            </div>
          </div>

          {/* Assets List с прокруткой */}
          <div className="px-4">
            <h3 className="text-muted-foreground text-sm font-medium mb-4 uppercase tracking-wider">
              Ви отримаєте
            </h3>
            <div className="space-y-1 max-h-96 overflow-y-auto pb-20">
              {filteredMarketAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center gap-3 p-4 hover:bg-muted/50 rounded-lg cursor-pointer"
                  onClick={() => {
                    const marketAsset: UserAsset = {
                      id: asset.id,
                      symbol: asset.symbol,
                      name: asset.name,
                      quantity: 0,
                      avgPrice: asset.price,
                      currentPrice: asset.price,
                      icon: asset.icon,
                      category: asset.id === "usd" ? "currency" : "crypto",
                    };
                    setToAsset(marketAsset);
                    setShowToSelect(false);
                    setSearchTerm("");
                    hapticFeedback("light");
                  }}
                >
                  <div className={`w-10 h-10 ${getAssetColor(asset.symbol)} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-lg font-bold">
                      {asset.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="text-foreground font-medium">{asset.name}</div>
                    <div className="text-muted-foreground text-sm">{asset.symbol}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-foreground font-medium">
                      {asset.price.toLocaleString()} $
                    </div>
                    <div className={`text-sm ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {asset.change24h >= 0 ? '↑' : '↓'} {Math.abs(asset.change24h).toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function for asset colors
function getAssetColor(symbol?: string): string {
  if (!symbol) return "bg-green-500";
  
  const colors: Record<string, string> = {
    BTC: "bg-orange-500",
    ETH: "bg-blue-500", 
    XRP: "bg-gray-700",
    USD: "bg-green-500",
    SOL: "bg-purple-500",
    DOGE: "bg-yellow-500",
    TON: "bg-blue-500",
    AAPL: "bg-gray-600",
    GOLD: "bg-yellow-600",
    SILVER: "bg-gray-400",
    PLATINUM: "bg-gray-300",
    TSLA: "bg-red-500",
    MSFT: "bg-blue-600",
    GOOGL: "bg-red-600",
    CATI: "bg-pink-500",
    XTZ: "bg-blue-400",
    PI: "bg-purple-500",
    WLD: "bg-gray-800",
    ALGO: "bg-teal-500",
  };
  return colors[symbol] || "bg-primary";
}
