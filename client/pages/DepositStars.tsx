import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeftIcon, StarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PortfolioManager } from "@/lib/portfolio";

const STARS_TO_USD_RATE = 0.02; // 1 Star = $0.02
const USD_TO_STARS_RATE = 50; // $1 = 50 Stars

export default function DepositStars() {
  const { user, hapticFeedback, tg } = useTelegram();
  const navigate = useNavigate();

  const [portfolioManager, setPortfolioManager] =
    useState<PortfolioManager | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => navigate("/"));
    }

    // Ініціалізація портфеля
    const userId = user?.id?.toString() || "demo_user";
    const portfolio = new PortfolioManager(userId);
    setPortfolioManager(portfolio);

    return () => {
      if (tg) {
        tg.BackButton.hide();
      }
    };
  }, [tg, user, navigate]);

  const amountNum = parseFloat(amount) || 0;
  const starsAmount = Math.ceil(amountNum * USD_TO_STARS_RATE);

  const handleDeposit = async () => {
    if (!portfolioManager || amountNum <= 0) {
      setError("Введіть коректну суму");
      hapticFeedback("medium");
      return;
    }

    if (amountNum < 1) {
      setError("Мінімальна сума: $1.00");
      hapticFeedback("medium");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Симуляція поповнення через Telegram Stars
      // В реальному застосунку тут буде виклик Telegram API
      portfolioManager.depositFromStars(amountNum);

      hapticFeedback("light");

      // Показати повідомлення про успіх
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setError("Помилка поповнення");
      hapticFeedback("medium");
    } finally {
      setLoading(false);
    }
  };

  const presetAmounts = [5, 10, 25, 50];

  const handlePresetAmount = (preset: number) => {
    setAmount(preset.toString());
    setError("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="text-primary"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-semibold">Поповнення звездами</h1>
          <p className="text-sm text-muted-foreground">Telegram Stars</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Інформація про курс */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500 rounded-full">
              <StarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-blue-800">
                Поповнення через Telegram Stars
              </div>
              <div className="text-sm text-blue-600">
                1 ⭐ = ${STARS_TO_USD_RATE.toFixed(2)} | $1 ={" "}
                {USD_TO_STARS_RATE} ⭐
              </div>
            </div>
          </div>
        </Card>

        {/* Швидкі суми */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Швидкий вибір:</label>
          <div className="grid grid-cols-4 gap-2">
            {presetAmounts.map((preset) => (
              <Button
                key={preset}
                variant="outline"
                onClick={() => handlePresetAmount(preset)}
                disabled={loading}
                className="text-sm"
              >
                ${preset}
              </Button>
            ))}
          </div>
        </div>

        {/* Ввід суми */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Сума в доларах</label>
            <Input
              type="number"
              placeholder="1.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              step="0.01"
              min="1"
              disabled={loading}
              className="text-lg"
            />
            <div className="text-xs text-muted-foreground">
              Мінімальна сума: $1.00
            </div>
          </div>

          {/* Розрахунок */}
          {amountNum > 0 && (
            <Card className="p-4 bg-muted/50">
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">{starsAmount} ⭐</div>
                  <div className="text-sm text-muted-foreground">
                    Telegram Stars
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Сума:</span>
                    <span>${amountNum.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Курс:</span>
                    <span>$1 = {USD_TO_STARS_RATE} ⭐</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>До сплати:</span>
                    <span className="text-primary">{starsAmount} ⭐</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Помилка */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
              {error}
            </div>
          )}

          {/* Успіх */}
          {loading && (
            <Card className="p-4 bg-success/10 border-success">
              <div className="text-center text-success">
                <div className="text-lg font-semibold mb-1">
                  Поповнення успішне!
                </div>
                <div className="text-sm">Кошти додано до вашого балансу</div>
              </div>
            </Card>
          )}

          {/* Кнопка поповнення */}
          <Button
            onClick={handleDeposit}
            disabled={loading || amountNum < 1}
            className="w-full"
            size="lg"
          >
            {loading
              ? "Поповнення..."
              : `Поповнити на ${starsAmount} ⭐ ($${amountNum.toFixed(2)})`}
          </Button>
        </div>

        {/* Інформація */}
        <Card className="p-4 bg-muted/50">
          <div className="text-sm text-muted-foreground space-y-2">
            <div className="font-medium">Про Telegram Stars:</div>
            <div>• Швидке та безпечне поповнення</div>
            <div>• Миттєве зарахування коштів</div>
            <div>• Підтримка всіх способів оплати Telegram</div>
            <div>• Автоматичне конвертування у долари</div>
          </div>
        </Card>

        {/* Поточний баланс */}
        {portfolioManager && (
          <Card className="p-4 border-green-200 bg-green-50">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">
                Поточний баланс
              </div>
              <div className="text-xl font-bold text-green-700">
                ${portfolioManager.getCashBalance().toFixed(2)}
              </div>
              <div className="text-xs text-green-600">Готівка для торгівлі</div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
