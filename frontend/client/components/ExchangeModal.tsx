import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { XIcon, ArrowUpDownIcon } from "lucide-react";
import { PortfolioManager, UserAsset } from "@/lib/portfolio";
import { useTelegram } from "@/hooks/useTelegram";
import { usePriceUpdates } from "@/lib/priceService";

interface ExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioManager: PortfolioManager | null;
  onSuccess: () => void;
}

export function ExchangeModal({
  isOpen,
  onClose,
  portfolioManager,
  onSuccess,
}: ExchangeModalProps) {
  const { hapticFeedback } = useTelegram();
  const [fromAsset, setFromAsset] = useState<UserAsset | null>(null);
  const [toAsset, setToAsset] = useState<UserAsset | null>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [userAssets, setUserAssets] = useState<UserAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFromSelect, setShowFromSelect] = useState(false);
  const [showToSelect, setShowToSelect] = useState(false);

  // Реальні ціни активів
  const priceUpdates = usePriceUpdates();

  useEffect(() => {
    if (isOpen && portfolioManager) {
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
      setFromAsset(null);
      setToAsset(null);
      setFromAmount("");
      setError("");
    }
  }, [isOpen, portfolioManager]);

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
        onSuccess();
        onClose();
      } else {
        setError("Помилка при обміні активів");
        hapticFeedback("medium");
      }
    } catch (err) {
      setError("Помилка при обміні а��тивів");
      hapticFeedback("medium");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className="bg-card rounded-t-lg w-full max-w-md border border-border animate-in slide-in-from-bottom-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold">Обміняти активи</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XIcon className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* From Asset Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Віддаєте</label>
            <Card
              className={`p-3 cursor-pointer border-2 ${
                fromAsset ? "border-primary" : "border-dashed border-muted"
              }`}
              onClick={() => setShowFromSelect(!showFromSelect)}
            >
              {fromAsset ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 ${fromAsset.id === "usd" ? "bg-green-500" : "bg-primary"} rounded-full flex items-center justify-center`}
                    >
                      <span className="text-white text-sm">
                        {fromAsset.icon}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{fromAsset.symbol}</div>
                      <div className="text-xs text-muted-foreground">
                        Доступно: {fromAsset.quantity.toFixed(4)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      ${fromAsset.currentPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  Оберіть актив для обміну
                </div>
              )}
            </Card>

            {showFromSelect && (
              <Card className="mt-2 max-h-40 overflow-y-auto">
                {userAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-3 hover:bg-muted/50 cursor-pointer border-b border-border last:border-b-0"
                    onClick={() => {
                      setFromAsset(asset);
                      setShowFromSelect(false);
                      hapticFeedback("light");
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">
                            {asset.icon}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {asset.symbol}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {asset.quantity.toFixed(4)}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm">
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
              <label className="text-sm font-medium mb-2 block">
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
                  className="pr-16"
                  min="0"
                  max={fromAsset.quantity}
                  step="0.01"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
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
                  className="text-primary p-0 h-auto"
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
                className="rounded-full"
              >
                <ArrowUpDownIcon className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* To Asset Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Отримуєте</label>
            <Card
              className={`p-3 cursor-pointer border-2 ${
                toAsset ? "border-primary" : "border-dashed border-muted"
              }`}
              onClick={() => setShowToSelect(!showToSelect)}
            >
              {toAsset ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 ${toAsset.id === "usd" ? "bg-green-500" : "bg-primary"} rounded-full flex items-center justify-center`}
                    >
                      <span className="text-white text-sm">{toAsset.icon}</span>
                    </div>
                    <div>
                      <div className="font-medium">{toAsset.symbol}</div>
                      <div className="text-xs text-muted-foreground">
                        Доступно: {toAsset.quantity.toFixed(4)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      ${toAsset.currentPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  Оберіть актив для отримання
                </div>
              )}
            </Card>

            {showToSelect && (
              <Card className="mt-2 max-h-40 overflow-y-auto">
                {userAssets
                  .filter((asset) => asset.id !== fromAsset?.id)
                  .map((asset) => (
                    <div
                      key={asset.id}
                      className="p-3 hover:bg-muted/50 cursor-pointer border-b border-border last:border-b-0"
                      onClick={() => {
                        setToAsset(asset);
                        setShowToSelect(false);
                        hapticFeedback("light");
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">
                              {asset.icon}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {asset.symbol}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {asset.quantity.toFixed(4)}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm">
                          ${asset.currentPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
              </Card>
            )}
          </div>

          {/* Result Amount */}
          {toAsset && fromAmount && (
            <Card className="p-3 bg-muted/50">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Ви отримаєте:
                </span>
                <span className="font-semibold">
                  {toAmount.toFixed(6)} {toAsset.symbol}
                </span>
              </div>
            </Card>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-destructive text-sm text-center">{error}</div>
          )}

          {/* Exchange Button */}
          <Button
            className="w-full"
            onClick={handleExchange}
            disabled={
              !isValidAmount || !toAsset || isLoading || userAssets.length < 2
            }
          >
            {isLoading
              ? "Обмінюємо..."
              : `Обміняти ${fromAsset?.symbol || ""} на ${toAsset?.symbol || ""}`}
          </Button>

          {userAssets.length < 2 && (
            <div className="text-center text-sm text-muted-foreground">
              {userAssets.length === 0
                ? "У вас немає активів для обміну. Купіть активи на сторінці Ринок."
                : "Необхідно мати принаймні 2 активи для обміну"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
