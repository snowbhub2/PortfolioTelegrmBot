import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowUpDownIcon, ChevronLeftIcon } from "lucide-react";
import { PortfolioManager, UserAsset } from "@/lib/portfolio";
import { useTelegram } from "@/hooks/useTelegram";
import { usePriceUpdates } from "@/lib/priceService";
import { useNavigate } from "react-router-dom";

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
          symbol: "USD",
          name: "Доллары (готівка)",
          quantity: cashBalance,
          avgPrice: 1,
          currentPrice: 1,
          icon: "$",
          category: "currency",
        };
        allAssets.unshift(usdAsset); // Додаємо на початок
      }

      setUserAssets(allAssets);
      
      // Автоматично обираємо перші два активи для обміну
      if (allAssets.length >= 2) {
        setFromAsset(allAssets[0]);
        setToAsset(allAssets[1]);
      } else if (allAssets.length === 1) {
        setFromAsset(allAssets[0]);
      }
      
      setFromAmount("");
      setError("");
    }
  }, [portfolioManager]);

  // Налаштування Telegram кнопки назад
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

  const handleSwapAssets = () => {
    hapticFeedback("light");
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
            toAmount,
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
            symbol: "USD",
            name: "Доллары (готівка)",
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
        setError("");
        
        // Показуємо повідомлення про успіх
        if (tg) {
          tg.showAlert("Обмін успішно виконано!");
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold">Обміняти активи</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-4 space-y-6">
        {/* From Asset Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block text-muted-foreground">Віддаєте</label>
          <Card
            className={`p-4 cursor-pointer border-2 transition-colors ${
              fromAsset ? "border-primary bg-primary/5" : "border-dashed border-muted hover:border-muted-foreground/50"
            }`}
            onClick={() => setShowFromSelect(!showFromSelect)}
          >
            {fromAsset ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 ${fromAsset.id === "usd" ? "bg-green-500" : "bg-primary"} rounded-full flex items-center justify-center`}
                  >
                    <span className="text-white text-lg font-bold">
                      {fromAsset.icon}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-lg">{fromAsset.symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      Доступно: {fromAsset.quantity.toFixed(4)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-lg">
                    ${fromAsset.currentPrice.toFixed(2)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                Оберіть актив для обміну
              </div>
            )}
          </Card>

          {showFromSelect && (
            <Card className="mt-2 max-h-60 overflow-y-auto">
              {userAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-4 hover:bg-muted/50 cursor-pointer border-b border-border last:border-b-0 transition-colors"
                  onClick={() => {
                    setFromAsset(asset);
                    setShowFromSelect(false);
                    hapticFeedback("light");
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${asset.id === "usd" ? "bg-green-500" : "bg-primary"} rounded-full flex items-center justify-center`}>
                        <span className="text-white text-sm font-bold">
                          {asset.icon}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">
                          {asset.symbol}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {asset.quantity.toFixed(4)}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      ${asset.currentPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>

        {/* Amount Input */}
        {fromAsset && (
          <div>
            <label className="text-sm font-medium mb-2 block text-muted-foreground">
              Кількість
            </label>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => {
                  setFromAmount(e.target.value);
                  setError("");
                }}
                className="text-xl py-6 pr-20"
                min="0"
                max={fromAsset.quantity}
                step="0.01"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-medium text-muted-foreground">
                {fromAsset.symbol}
              </div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-muted-foreground">
                ≈ ${fromValue.toFixed(2)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMaxAmount}
                className="text-primary p-0 h-auto hover:underline"
              >
                Максимум
              </Button>
            </div>
          </div>
        )}

        {/* Swap Button */}
        {fromAsset && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapAssets}
              className="rounded-full w-12 h-12 border-2 hover:bg-primary hover:text-primary-foreground transition-colors"
              disabled={!toAsset}
            >
              <ArrowUpDownIcon className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* To Asset Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block text-muted-foreground">Отримуєте</label>
          <Card
            className={`p-4 cursor-pointer border-2 transition-colors ${
              toAsset ? "border-primary bg-primary/5" : "border-dashed border-muted hover:border-muted-foreground/50"
            }`}
            onClick={() => setShowToSelect(!showToSelect)}
          >
            {toAsset ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 ${toAsset.id === "usd" ? "bg-green-500" : "bg-primary"} rounded-full flex items-center justify-center`}
                  >
                    <span className="text-white text-lg font-bold">{toAsset.icon}</span>
                  </div>
                  <div>
                    <div className="font-medium text-lg">{toAsset.symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      Доступно: {toAsset.quantity.toFixed(4)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-lg">
                    ${toAsset.currentPrice.toFixed(2)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                Оберіть актив для отримання
              </div>
            )}
          </Card>

          {showToSelect && (
            <Card className="mt-2 max-h-60 overflow-y-auto">
              {userAssets
                .filter((asset) => asset.id !== fromAsset?.id)
                .map((asset) => (
                  <div
                    key={asset.id}
                    className="p-4 hover:bg-muted/50 cursor-pointer border-b border-border last:border-b-0 transition-colors"
                    onClick={() => {
                      setToAsset(asset);
                      setShowToSelect(false);
                      hapticFeedback("light");
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${asset.id === "usd" ? "bg-green-500" : "bg-primary"} rounded-full flex items-center justify-center`}>
                          <span className="text-white text-sm font-bold">
                            {asset.icon}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {asset.symbol}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {asset.quantity.toFixed(4)}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        ${asset.currentPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
            </Card>
          )}
        </div>

        {/* Result Amount */}
        {toAsset && fromAmount && parseFloat(fromAmount) > 0 && (
          <Card className="p-4 bg-muted/30">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-medium">
                Ви отримаєте:
              </span>
              <span className="font-bold text-lg">
                {toAmount.toFixed(6)} {toAsset.symbol}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              ≈ ${(toAmount * toAsset.currentPrice).toFixed(2)}
            </div>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-destructive text-sm text-center p-3 bg-destructive/10 rounded-lg">
            {error}
          </div>
        )}

        {/* Exchange Button */}
        <Button
          className="w-full py-6 text-lg font-medium"
          onClick={handleExchange}
          disabled={
            !isValidAmount || !toAsset || isLoading || userAssets.length < 2
          }
        >
          {isLoading
            ? "Обмінюємо..."
            : `Обміняти ${fromAsset?.symbol || ""} на ${toAsset?.symbol || ""}`}
        </Button>

        {/* Help Text */}
        {userAssets.length < 2 && (
          <div className="text-center text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
            {userAssets.length === 0
              ? "У вас немає активів для обміну. Купіть ак��иви на сторінці Ринок."
              : "Необхідно мати принаймні 2 активи для обміну"}
          </div>
        )}
      </div>
    </div>
  );
}
