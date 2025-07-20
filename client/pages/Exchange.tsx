import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { Button } from "@/components/ui/button";
import { ArrowUpDownIcon, ChevronRightIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PortfolioManager, UserAsset } from "@/lib/portfolio";
import { usePriceUpdates } from "@/lib/priceService";

export default function Exchange() {
  const { hapticFeedback, user, tg } = useTelegram();
  const navigate = useNavigate();

  // Portfolio and assets state
  const [portfolioManager, setPortfolioManager] = useState<PortfolioManager | null>(null);
  const [userAssets, setUserAssets] = useState<UserAsset[]>([]);
  
  // Exchange state
  const [fromAsset, setFromAsset] = useState<UserAsset | null>(null);
  const [toAsset, setToAsset] = useState<UserAsset | null>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [showFromAssets, setShowFromAssets] = useState(false);
  const [showToAssets, setShowToAssets] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Реальні ціни активів
  const priceUpdates = usePriceUpdates();

  // Ініціалізація портфоліо
  useEffect(() => {
    if (user?.id) {
      const manager = new PortfolioManager(user.id.toString());
      setPortfolioManager(manager);
    }
  }, [user?.id]);

  // Завантаження активів користувача
  useEffect(() => {
    if (portfolioManager) {
      const assets = portfolioManager.getAssets();
      const cashBalance = portfolioManager.getCashBalance();

      // Додаємо долари тільки якщо є готівка
      const allAssets = [...assets];
      if (cashBalance > 0) {
        const usdAsset: UserAsset = {
          id: "usd",
          symbol: "USDT",
          name: "Доллары",
          quantity: cashBalance,
          avgPrice: 1,
          currentPrice: 1,
          icon: "$",
          category: "currency",
        };
        allAssets.unshift(usdAsset);
      }

      setUserAssets(allAssets);
      
      // Автоматично встановлюємо перші активи якщо є
      if (allAssets.length >= 2 && !fromAsset && !toAsset) {
        setFromAsset(allAssets[0]); // USDT
        setToAsset(allAssets[1]); // First other asset
      } else if (allAssets.length >= 1 && !fromAsset) {
        setFromAsset(allAssets[0]);
      }
      
      setFromAmount("");
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
      
      // Оновлюємо обрані активи теж
      if (fromAsset) {
        const updatedFromAsset = updatedAssets.find(a => a.id === fromAsset.id);
        if (updatedFromAsset) setFromAsset(updatedFromAsset);
      }
      if (toAsset) {
        const updatedToAsset = updatedAssets.find(a => a.id === toAsset.id);
        if (updatedToAsset) setToAsset(updatedToAsset);
      }
    }
  }, [priceUpdates]);

  // Calculate exchange rate and amounts
  const toAmount = fromAmount && fromAsset && toAsset 
    ? (parseFloat(fromAmount) * fromAsset.currentPrice / toAsset.currentPrice).toFixed(6)
    : "0";

  const handleSwapAssets = () => {
    hapticFeedback("light");
    const tempAsset = fromAsset;
    setFromAsset(toAsset);
    setToAsset(tempAsset);
    setFromAmount("");
  };

  const handleFromAssetSelect = (asset: UserAsset) => {
    hapticFeedback("light");
    if (asset.id !== toAsset?.id) {
      setFromAsset(asset);
      setFromAmount("");
    }
    setShowFromAssets(false);
  };

  const handleToAssetSelect = (asset: UserAsset) => {
    hapticFeedback("light");
    if (asset.id !== fromAsset?.id) {
      setToAsset(asset);
      setFromAmount("");
    }
    setShowToAssets(false);
  };

  const handleCheckDeal = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      hapticFeedback("medium");
      return;
    }

    if (!fromAsset || !toAsset) {
      hapticFeedback("medium");
      return;
    }

    if (parseFloat(fromAmount) > fromAsset.quantity) {
      hapticFeedback("medium");
      return;
    }

    if (!portfolioManager) {
      hapticFeedback("medium");
      return;
    }

    setIsLoading(true);

    try {
      let success = false;
      const toAmountNum = parseFloat(toAmount);

      if (fromAsset.id === "usd" && toAsset.id !== "usd") {
        // Купуємо актив за долари
        success = portfolioManager.buyAsset(
          toAsset.id,
          toAsset.symbol,
          toAsset.name,
          toAmountNum,
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
        // Обмін між активами: продаємо один, купуємо інший
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
            toAmountNum,
            toAsset.currentPrice,
            toAsset.icon,
            toAsset.category,
          );
        }
      }

      if (success) {
        hapticFeedback("light");
        
        // Оновлюємо активи після успішного обміну
        const updatedAssets = portfolioManager.getAssets();
        const cashBalance = portfolioManager.getCashBalance();
        
        const allAssets = [...updatedAssets];
        if (cashBalance > 0) {
          const usdAsset: UserAsset = {
            id: "usd",
            symbol: "USDT",
            name: "Доллары",
            quantity: cashBalance,
            avgPrice: 1,
            currentPrice: 1,
            icon: "$",
            category: "currency",
          };
          allAssets.unshift(usdAsset);
        }
        
        setUserAssets(allAssets);
        setFromAmount("");
        
        // Оновлюємо обрані активи
        const newFromAsset = allAssets.find(a => a.id === fromAsset.id);
        const newToAsset = allAssets.find(a => a.id === toAsset.id);
        if (newFromAsset) setFromAsset(newFromAsset);
        if (newToAsset) setToAsset(newToAsset);
        
        // Success haptic
        if (tg) {
          tg.HapticFeedback.impactOccurred("medium");
        }
      } else {
        hapticFeedback("medium");
      }
    } catch (err) {
      hapticFeedback("medium");
    } finally {
      setIsLoading(false);
    }
  };

  const exchangeRate = toAsset && fromAsset ? (fromAsset.currentPrice / toAsset.currentPrice).toFixed(2) : "0";
  const isValidAmount =
    fromAmount &&
    parseFloat(fromAmount) > 0 &&
    fromAsset &&
    parseFloat(fromAmount) <= fromAsset.quantity;

  const availableFromAssets = userAssets.filter(
    (asset) => asset.id !== toAsset?.id,
  );
  const availableToAssets = userAssets.filter(
    (asset) => asset.id !== fromAsset?.id,
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/")}
          className="text-blue-400 text-base font-normal p-0 h-auto hover:bg-transparent"
        >
          ← Назад
        </Button>
        <div className="text-center">
          <div className="font-medium">Гаманець ✓</div>
          <div className="text-xs text-gray-400">міні застосунок</div>
        </div>
        <div className="w-8"></div>
      </div>

      <div className="flex-1 px-4 pb-4">
        {/* From Asset - Вы платите */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">$</span>
            </div>
            <span className="text-white">Вы платите</span>
            <span className="text-blue-400 text-sm ml-auto">
              Внести • {fromAsset?.quantity.toFixed(6) || "0"} {fromAsset?.symbol || "USDT"}
            </span>
          </div>

          <div className="flex items-center justify-between mb-2">
            <input
              type="number"
              placeholder="0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="text-6xl font-light bg-transparent border-0 focus:outline-none text-white w-1/2"
              style={{ fontSize: '4rem' }}
            />
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setShowFromAssets(true)}
            >
              <span className="text-4xl font-light text-gray-400">
                {fromAsset?.symbol || "USDT"}
              </span>
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center mb-6">
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

        {/* To Asset - Вы получите */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {toAsset?.icon || "🔷"}
              </span>
            </div>
            <span className="text-white">Вы получите</span>
          </div>

          <div className="flex items-center justify-between mb-2">
            <div className="text-6xl font-light text-white w-1/2" style={{ fontSize: '4rem' }}>
              {toAmount}
            </div>
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setShowToAssets(true)}
            >
              <span className="text-4xl font-light text-gray-400">
                {toAsset?.symbol || "TON"}
              </span>
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Exchange Rate */}
        {fromAsset && toAsset && (
          <div className="text-center mb-6">
            <div className="text-gray-400">
              ≈ 1 {toAsset.symbol} ≈ {exchangeRate} {fromAsset.symbol}
            </div>
          </div>
        )}

        {/* Check Deal Button */}
        <Button
          className="w-full py-4 text-lg font-medium bg-gray-800 hover:bg-gray-700 text-white rounded-xl"
          disabled={!isValidAmount || isLoading}
          onClick={handleCheckDeal}
        >
          {isLoading ? "Обміняємо..." : "Проверить сделку"}
        </Button>
      </div>

      {/* From Asset Selection Modal */}
      {showFromAssets && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-gray-900 rounded-t-xl w-full max-w-md border-t border-gray-700 animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Выберите актив</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFromAssets(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </Button>
            </div>
            <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
              {availableFromAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
                  onClick={() => handleFromAssetSelect(asset)}
                >
                  <div
                    className={`w-10 h-10 ${asset.id === "usd" ? "bg-green-500" : "bg-blue-500"} rounded-full flex items-center justify-center`}
                  >
                    <span className="text-white text-lg font-bold">
                      {asset.id === "usd" ? "$" : asset.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{asset.name}</div>
                    <div className="text-sm text-gray-400">
                      {asset.quantity.toFixed(6)} {asset.symbol}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* To Asset Selection Modal */}
      {showToAssets && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-gray-900 rounded-t-xl w-full max-w-md border-t border-gray-700 animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Выберите актив</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowToAssets(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </Button>
            </div>
            <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
              {availableToAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
                  onClick={() => handleToAssetSelect(asset)}
                >
                  <div
                    className={`w-10 h-10 ${asset.id === "usd" ? "bg-green-500" : "bg-purple-500"} rounded-full flex items-center justify-center`}
                  >
                    <span className="text-white text-lg font-bold">
                      {asset.id === "usd" ? "$" : asset.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{asset.name}</div>
                    <div className="text-sm text-gray-400">
                      {asset.quantity.toFixed(6)} {asset.symbol}
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
