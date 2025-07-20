import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDownIcon, ChevronLeftIcon, SearchIcon } from "lucide-react";
import { PortfolioManager, UserAsset } from "@/lib/portfolio";
import { useTelegram } from "@/hooks/useTelegram";
import { usePriceUpdates } from "@/lib/priceService";
import { useNavigate } from "react-router-dom";

// Доступні активи для купівлі
const availableAssets = [
  {
    id: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    price: 118147.87,
    change24h: 0.13,
    icon: "₿",
    category: "crypto" as const,
  },
  {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    price: 3740.46,
    change24h: 4.55,
    icon: "Ξ",
    category: "crypto" as const,
  },
  {
    id: "xrp",
    symbol: "XRP",
    name: "XRP",
    price: 3.50,
    change24h: 2.12,
    icon: "◆",
    category: "crypto" as const,
  },
  {
    id: "sol",
    symbol: "SOL",
    name: "Solana",
    price: 181.08,
    change24h: 1.94,
    icon: "◎",
    category: "crypto" as const,
  },
  {
    id: "doge",
    symbol: "DOGE",
    name: "Dogecoin",
    price: 0.271,
    change24h: 11.94,
    icon: "Ð",
    category: "crypto" as const,
  },
  {
    id: "ton",
    symbol: "TON",
    name: "Toncoin",
    price: 3.27,
    change24h: 2.11,
    icon: "🔷",
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
    id: "gold",
    symbol: "GOLD",
    name: "Золото",
    price: 2650.5,
    change24h: 0.75,
    icon: "🥇",
    category: "gold" as const,
  },
];

export default function Exchange() {
  const { hapticFeedback, user, tg } = useTelegram();
  const navigate = useNavigate();
  const [fromAsset, setFromAsset] = useState<UserAsset | null>(null);
  const [toAsset, setToAsset] = useState<UserAsset | null>(null);
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

      // Додаємо долари тільки якщо є готівка
      const allAssets = [...assets];
      if (cashBalance > 0) {
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
        allAssets.unshift(usdAsset);
      }

      setUserAssets(allAssets);

      // Автоматично обираємо перший актив (долари) якщо не обрано
      if (allAssets.length > 0 && !fromAsset) {
        setFromAsset(allAssets[0]);
      }

      // Автоматично обираємо перший ринковий актив якщо маємо долари
      if (allAssets.length > 0 && allAssets[0].id === "usd" && !toAsset) {
        const firstMarketAsset = availableAssets[0];
        const marketAssetForExchange: UserAsset = {
          id: firstMarketAsset.id,
          symbol: firstMarketAsset.symbol,
          name: firstMarketAsset.name,
          quantity: 0,
          avgPrice: firstMarketAsset.price,
          currentPrice: firstMarketAsset.price,
          icon: firstMarketAsset.icon,
          category: firstMarketAsset.category as UserAsset["category"],
        };
        setToAsset(marketAssetForExchange);
      }

      setFromAmount("");
      setError("");
    }
  }, [portfolioManager, fromAsset, toAsset]);

  // Налаштування Telegram
  useEffect(() => {
    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => navigate("/"));
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
  const toAmount = toAsset?.currentPrice ? fromValue / toAsset.currentPrice : 0;

  const isValidAmount =
    fromAsset &&
    parseFloat(fromAmount) > 0 &&
    parseFloat(fromAmount) <= fromAsset.quantity;

  const isInsufficientFunds = fromAsset && parseFloat(fromAmount) > fromAsset.quantity;

  const handleSwapAssets = () => {
    hapticFeedback("light");
    const temp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(temp);
    setFromAmount("");
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
        // Оновлюємо ��ктиви після успішного обміну
        const assets = portfolioManager.getAssets();
        const cashBalance = portfolioManager.getCashBalance();

        const allAssets = [...assets];
        if (cashBalance > 0) {
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
          allAssets.unshift(usdAsset);
        }

        setUserAssets(allAssets);
        setFromAsset(null);
        setToAsset(null);
        setFromAmount("");
        setError("");
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

  const exchangeRate = toAsset && fromAsset ? (toAsset.currentPrice / fromAsset.currentPrice).toFixed(2) : "0";

  const filteredUserAssets = userAssets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMarketAssets = availableAssets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/")}
          className="text-blue-400 text-base font-normal p-0 h-auto hover:bg-transparent"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-1" />
          Назад
        </Button>
        <div className="text-center">
          <div className="font-medium">Гаманець ✓</div>
          <div className="text-xs text-gray-400">міні застосунок</div>
        </div>
        <div className="w-12"></div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-20">
        {/* Ви сплачуєте */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">$</span>
            </div>
            <span className="text-white">Ви сплачуєте</span>
            <span className="text-blue-400 text-sm ml-auto cursor-pointer" onClick={() => setShowFromSelect(true)}>
              Поповнити • {fromAsset?.quantity.toFixed(2) || "0"} {fromAsset?.symbol || "USDT"}
            </span>
          </div>

          <div className="flex items-center justify-between mb-2">
            <input
              type="number"
              placeholder="0"
              value={fromAmount}
              onChange={(e) => {
                setFromAmount(e.target.value);
                setError("");
              }}
              className={`text-6xl font-bold bg-transparent border-0 focus:outline-none w-1/2 ${
                isInsufficientFunds ? 'text-red-500' : 'text-white'
              }`}
              style={{ fontSize: '4rem' }}
            />
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setShowFromSelect(true)}
            >
              <span className="text-4xl font-light text-gray-400">
                {fromAsset?.symbol || "USDT"}
              </span>
              <span className="text-gray-400">›</span>
            </div>
          </div>

          {isInsufficientFunds && (
            <div className="text-red-500 text-sm">Недостатньо коштів.</div>
          )}
        </div>

        {/* Swap Button */}
        <div className="flex justify-center mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwapAssets}
            className="w-12 h-12 rounded-full bg-blue-600 border-blue-600 hover:bg-blue-700"
            disabled={!fromAsset || !toAsset}
          >
            <ArrowUpDownIcon className="w-5 h-5 text-white" />
          </Button>
        </div>

        {/* Ви отримаєте */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {toAsset?.icon || "🔷"}
              </span>
            </div>
            <span className="text-white">Ви отримаєте</span>
          </div>

          <div className="flex items-center justify-between mb-2">
            <div className="text-6xl font-bold text-white w-1/2" style={{ fontSize: '4rem' }}>
              {toAmount.toFixed(8)}
            </div>
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setShowToSelect(true)}
            >
              <span className="text-4xl font-light text-gray-400">
                {toAsset?.symbol || "TON"}
              </span>
              <span className="text-gray-400">›</span>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1 min-h-20"></div>

        {/* Exchange Rate */}
        {fromAsset && toAsset && (
          <div className="text-center mb-6">
            <div className="text-gray-400">
              ≈ 1 {toAsset.symbol} ≈ {exchangeRate} {fromAsset.symbol}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black">
        <Button
          className="w-full py-4 text-lg font-medium bg-gray-800 hover:bg-gray-700 text-white rounded-xl"
          disabled={!isValidAmount || isLoading}
          onClick={handleExchange}
        >
          {isLoading ? "Обмінюємо..." : "Переглянути угоду"}
        </Button>
      </div>

      {/* From Asset Selection Modal */}
      {showFromSelect && (
        <div className="fixed inset-0 bg-black z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowFromSelect(false)}
              className="text-blue-400 text-base font-normal p-0 h-auto hover:bg-transparent"
            >
              <ChevronLeftIcon className="w-5 h-5 mr-1" />
              Назад
            </Button>
            <div className="text-center">
              <div className="font-medium">Гаманець ✓</div>
              <div className="text-xs text-gray-400">міні застосунок</div>
            </div>
            <div className="w-12"></div>
          </div>

          {/* Search */}
          <div className="px-4 mb-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Пошук"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded-lg text-white placeholder-gray-400 border-0 focus:outline-none"
              />
            </div>
          </div>

          {/* Assets List */}
          <div className="px-4">
            <h3 className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">
              Ви сплачуєте
            </h3>
            <div className="space-y-1">
              {filteredUserAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center gap-3 p-4 hover:bg-gray-800 rounded-lg cursor-pointer"
                  onClick={() => {
                    setFromAsset(asset);
                    setShowFromSelect(false);
                    setSearchTerm("");
                    hapticFeedback("light");
                  }}
                >
                  <div className={`w-10 h-10 ${asset.id === "usd" ? "bg-green-500" : "bg-blue-500"} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-lg font-bold">
                      {asset.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">{asset.name}</div>
                    <div className="text-gray-400 text-sm">
                      {asset.currentPrice.toFixed(2)} $
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">
                      {asset.quantity.toFixed(2)} $
                    </div>
                    <div className="text-gray-400 text-sm">
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
        <div className="fixed inset-0 bg-black z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowToSelect(false)}
              className="text-blue-400 text-base font-normal p-0 h-auto hover:bg-transparent"
            >
              <ChevronLeftIcon className="w-5 h-5 mr-1" />
              Назад
            </Button>
            <div className="text-center">
              <div className="font-medium">Гаманець ✓</div>
              <div className="text-xs text-gray-400">міні застосунок</div>
            </div>
            <div className="w-12"></div>
          </div>

          {/* Search */}
          <div className="px-4 mb-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Пошук"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded-lg text-white placeholder-gray-400 border-0 focus:outline-none"
              />
            </div>
          </div>

          {/* Assets List */}
          <div className="px-4">
            <h3 className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">
              Ви отримаєте
            </h3>
            <div className="space-y-1">
              {filteredMarketAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center gap-3 p-4 hover:bg-gray-800 rounded-lg cursor-pointer"
                  onClick={() => {
                    const marketAsset: UserAsset = {
                      id: asset.id,
                      symbol: asset.symbol,
                      name: asset.name,
                      quantity: 0,
                      avgPrice: asset.price,
                      currentPrice: asset.price,
                      icon: asset.icon,
                      category: asset.category as UserAsset["category"],
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
                    <div className="text-white font-medium">{asset.name}</div>
                    <div className="text-gray-400 text-sm">{asset.symbol}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">
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
function getAssetColor(symbol: string): string {
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
  };
  return colors[symbol] || "bg-gray-500";
}
