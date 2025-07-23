import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { XIcon } from "lucide-react";
import { PortfolioManager } from "@/lib/portfolio";
import { useTelegram } from "@/hooks/useTelegram";

interface SellAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: {
    id: string;
    symbol: string;
    name: string;
    price: number;
    icon: string;
    category: "stocks" | "crypto" | "gold" | "currency";
  };
  portfolioManager: PortfolioManager | null;
  onSuccess: () => void;
}

export function SellAssetModal({
  isOpen,
  onClose,
  asset,
  portfolioManager,
  onSuccess,
}: SellAssetModalProps) {
  const { hapticFeedback } = useTelegram();
  const [quantity, setQuantity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableQuantity, setAvailableQuantity] = useState(0);

  useEffect(() => {
    if (isOpen && portfolioManager && asset) {
      // Отримуємо доступну кількість активу
      const userAssets = portfolioManager.getAssets();
      const userAsset = userAssets.find((a) => a.id === asset.id);
      setAvailableQuantity(userAsset?.quantity || 0);
      setQuantity("");
      setError("");
    }
  }, [isOpen, portfolioManager, asset]);

  const totalValue = parseFloat(quantity) * asset.price || 0;
  const isValidQuantity =
    parseFloat(quantity) > 0 && parseFloat(quantity) <= availableQuantity;

  const handleMaxQuantity = () => {
    hapticFeedback("light");
    setQuantity(availableQuantity.toString());
  };

  const handleSell = async () => {
    if (!portfolioManager || !isValidQuantity) {
      hapticFeedback("medium");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const success = portfolioManager.sellAsset(
        asset.id,
        parseFloat(quantity),
        asset.price,
      );

      if (success) {
        hapticFeedback("light");
        onSuccess();
        onClose();
      } else {
        setError("Помилка при продажу активу");
        hapticFeedback("medium");
      }
    } catch (err) {
      setError("Помилка при продажу активу");
      hapticFeedback("medium");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className="bg-card rounded-t-lg w-full max-w-md border border-border animate-in slide-in-from-bottom-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold">Продати {asset.symbol}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Asset Info */}
        <div className="p-4 text-center border-b border-border">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">{asset.icon}</span>
            </div>
            <div>
              <div className="text-xl font-bold">{asset.name}</div>
              <div className="text-muted-foreground">{asset.symbol}</div>
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">
            ${asset.price.toFixed(2)}
          </div>
          <div className="text-muted-foreground text-sm">Поточна ціна</div>
        </div>

        {/* Available Quantity */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Доступно для продажу:</span>
            <span>
              {availableQuantity.toFixed(4)} {asset.symbol}
            </span>
          </div>
        </div>

        {/* Quantity Input */}
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Кількість для продажу
            </label>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.00"
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  setError("");
                }}
                className="pr-16"
                min="0"
                max={availableQuantity}
                step="0.01"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {asset.symbol}
              </div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-muted-foreground">
                Мін. 0.01 {asset.symbol}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMaxQuantity}
                className="text-primary p-0 h-auto"
              >
                Максимум
              </Button>
            </div>
          </div>

          {/* Total Value */}
          <Card className="p-3 bg-muted/50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Ви отримаєте:
              </span>
              <span className="font-semibold">${totalValue.toFixed(2)}</span>
            </div>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="text-destructive text-sm text-center">{error}</div>
          )}

          {/* Sell Button */}
          <Button
            className="w-full bg-destructive hover:bg-destructive/90 text-white"
            onClick={handleSell}
            disabled={!isValidQuantity || isLoading || availableQuantity === 0}
          >
            {isLoading ? "Продаємо..." : `Продати ${asset.symbol}`}
          </Button>

          {availableQuantity === 0 && (
            <div className="text-center text-sm text-muted-foreground">
              У вас немає цього активу для продажу
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
