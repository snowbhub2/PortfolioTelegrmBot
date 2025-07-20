import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  const [error, setError] = useState("");

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
        setToAsset(allAssets[1]); // First crypto
      } else if (allAssets.length === 1 && !fromAsset) {
        setFromAsset(allAssets[0]);
      }
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
    : "";

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

  const handleMaxAmount = () => {
    if (fromAsset) {
      hapticFeedback("light");
      setFromAmount(fromAsset.quantity.toString());
    }
  };

  const handleCheckDeal = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      hapticFeedback("medium");
      setError("Введіть коректну кількість");
      return;
    }

    if (!fromAsset || !toAsset) {
      hapticFeedback("medium");
      setError("Оберіть активи для обміну");
      return;
    }

    if (parseFloat(fromAmount) > fromAsset.quantity) {
      hapticFeedback("medium");
      setError("Недостатньо коштів");
      return;
    }

    if (!portfolioManager) {
      hapticFeedback("medium");
      setError("Помилка ініціалізації портфоліо");
      return;
    }

    setIsLoading(true);
    setError("");

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

  // Якщо немає активів, показуємо заглушку
  if (userAssets.length < 2) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">💱</div>
          <h2 className="text-xl font-semibold mb-2">Недостатньо активів</h2>
          <p className="text-muted-foreground mb-4">
            {userAssets.length === 0
              ? "У вас немає активів для обміну. Купіть активи на сторінці Ринок."
              : "Необхідно мати принаймні 2 активи для обміну"}
          </p>
          <Button onClick={() => navigate("/market")} className="mr-2">
            Перейти до ринку
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            Назад
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-4 space-y-6">
        {/* From Asset */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 ${fromAsset?.id === "usd" ? "bg-green-500" : "bg-blue-500"} rounded-full flex items-center justify-center`}
              >
                <span className="text-white text-sm font-bold">
                  {fromAsset?.id === "usd" ? "$" : fromAsset?.icon}
                </span>
              </div>
              <span className="text-sm">Вы платите</span>
            </div>
            <div className="text-sm text-primary">
              Внести • {fromAsset?.quantity.toFixed(6)} {fromAsset?.symbol}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <input
              type="number"
              placeholder="0"
              value={fromAmount}
              onChange={(e) => {
                setFromAmount(e.target.value);
                setError("");
              }}
              className="text-4xl font-bold bg-transparent border-0 focus:outline-none w-2/3"
            />
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setShowFromAssets(true)}
            >
              <span className="text-2xl font-bold text-muted-foreground">
                {fromAsset?.symbol}
              </span>
              <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          {fromAsset && fromAsset.quantity > 0 && (
            <div className="flex justify-end mt-2">
              <button
                onClick={handleMaxAmount}
                className="text-sm text-primary"
              >
                Макс.
              </button>
            </div>
          )}
        </Card>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full"
            onClick={handleSwapAssets}
            disabled={!fromAsset || !toAsset}
          >
            <ArrowUpDownIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* To Asset */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div
              className={`w-8 h-8 ${toAsset?.id === "usd" ? "bg-green-500" : "bg-purple-500"} rounded-full flex items-center justify-center`}
            >
              <span className="text-white text-sm font-bold">
                {toAsset?.id === "usd" ? "$" : toAsset?.icon}
              </span>
            </div>
            <span className="text-sm">Вы получите</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold w-2/3">{toAmount || "0"}</div>
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setShowToAssets(true)}
            >
              <span className="text-2xl font-bold text-muted-foreground">
                {toAsset?.symbol}
              </span>
              <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </Card>

        {/* Exchange Rate */}
        {fromAsset && toAsset && (
          <div className="text-center">
            <div className="text-sm text-muted-foreground">
              1 {toAsset.symbol} ≈ {exchangeRate} {fromAsset.symbol}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-destructive text-sm text-center p-3 bg-destructive/10 rounded-lg">
            {error}
          </div>
        )}

        {/* Check Deal Button */}
        <Button
          className="w-full py-4 text-lg font-medium"
          disabled={!isValidAmount || isLoading}
          onClick={handleCheckDeal}
        >
          {isLoading ? "Обміняємо..." : "Проверить сделку"}
        </Button>
      </div>

      {/* From Asset Selection Modal */}
      {showFromAssets && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-card rounded-t-lg w-full max-w-md border border-border animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold">Выберите актив</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFromAssets(false)}
              >
                ×
              </Button>
            </div>
            <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
              {availableFromAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
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
                    <div className="font-medium">{asset.name}</div>
                    <div className="text-sm text-muted-foreground">
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
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-card rounded-t-lg w-full max-w-md border border-border animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold">Выберите актив</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowToAssets(false)}
              >
                ×
              </Button>
            </div>
            <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
              {availableToAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
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
                    <div className="font-medium">{asset.name}</div>
                    <div className="text-sm text-muted-foreground">
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
