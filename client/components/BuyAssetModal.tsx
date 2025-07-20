import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PortfolioManager } from "@/lib/portfolio";
import { useTelegram } from "@/hooks/useTelegram";

interface BuyAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: {
    id: string;
    symbol: string;
    name: string;
    price: number;
    icon: string;
    category: "stocks" | "crypto" | "gold" | "currency";
  } | null;
  portfolioManager: PortfolioManager | null;
  onSuccess: () => void;
}

export const BuyAssetModal = ({
  isOpen,
  onClose,
  asset,
  portfolioManager,
  onSuccess,
}: BuyAssetModalProps) => {
  const { hapticFeedback } = useTelegram();
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!asset || !portfolioManager) return null;

  const cashBalance = portfolioManager.getCashBalance();
  const quantityNum = parseFloat(quantity) || 0;
  const totalCost = quantityNum * asset.price;
  const canAfford = totalCost <= cashBalance;

  const handleBuy = async () => {
    if (!quantityNum || quantityNum <= 0) {
      setError("Введіть коректну кількість");
      hapticFeedback("medium");
      return;
    }

    if (quantityNum < 0.01) {
      setError("Мінімальна кількість: 0.01");
      hapticFeedback("medium");
      return;
    }

    if (!canAfford) {
      setError("Недостатньо коштів");
      hapticFeedback("medium");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const success = portfolioManager.buyAsset(
        asset.id,
        asset.symbol,
        asset.name,
        quantityNum,
        asset.price,
        asset.icon,
        asset.category,
      );

      if (success) {
        hapticFeedback("light");
        onSuccess();
        onClose();
        setQuantity("");
      } else {
        setError("Помилка покупки");
        hapticFeedback("medium");
      }
    } catch (err) {
      setError("Помилка покупки");
      hapticFeedback("medium");
    } finally {
      setLoading(false);
    }
  };

  const handleMaxAmount = () => {
    const maxQuantity = cashBalance / asset.price;
    setQuantity(maxQuantity.toFixed(2));
    setError("");
  };

  const handleClose = () => {
    setQuantity("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{asset.icon}</span>
            Купити {asset.symbol}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Інформація про актив */}
          <Card className="p-4 bg-muted/50">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{asset.name}</div>
                <div className="text-sm text-muted-foreground">
                  {asset.symbol}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">${asset.price.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">за акцію</div>
              </div>
            </div>
          </Card>

          {/* Баланс */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Доступно:</span>
            <span className="font-medium">${cashBalance.toFixed(2)}</span>
          </div>

          {/* Ввід кількості */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Кількість</label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMaxAmount}
                disabled={loading}
              >
                Максимум
              </Button>
            </div>
            <Input
              type="number"
              placeholder="0.01"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setError("");
              }}
              step="0.01"
              min="0.01"
              disabled={loading}
            />
            <div className="text-xs text-muted-foreground">
              Мінімальна кількість: 0.01
            </div>
          </div>

          {/* Розрахунок */}
          {quantityNum > 0 && (
            <Card className="p-3 bg-blue-50 border-blue-200">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Кількість:</span>
                  <span>
                    {quantityNum.toFixed(2)} {asset.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Ціна за акцію:</span>
                  <span>${asset.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Загальна сума:</span>
                  <span
                    className={canAfford ? "text-primary" : "text-destructive"}
                  >
                    ${totalCost.toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Помилка */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}

          {/* Кнопки */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Скасувати
            </Button>
            <Button
              onClick={handleBuy}
              disabled={loading || !quantityNum || !canAfford}
              className="flex-1"
            >
              {loading ? "Покупка..." : `Купити за $${totalCost.toFixed(2)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
