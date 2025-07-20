import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeftIcon, ArrowRightIcon, ArrowDownIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PortfolioManager } from "@/lib/portfolio";

export default function Transfer() {
  const { user, hapticFeedback, tg } = useTelegram();
  const navigate = useNavigate();

  const [portfolioManager, setPortfolioManager] =
    useState<PortfolioManager | null>(null);
  const [cashBalance, setCashBalance] = useState(0);
  const [cfdBalance, setCfdBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<"to_cfd" | "from_cfd">("to_cfd");
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

    setCashBalance(portfolio.getCashBalance());
    setCfdBalance(portfolio.getCfdBalance());

    return () => {
      if (tg) {
        tg.BackButton.hide();
      }
    };
  }, [tg, user, navigate]);

  const amountNum = parseFloat(amount) || 0;
  const maxAmount = direction === "to_cfd" ? cashBalance : cfdBalance;
  const canTransfer = amountNum > 0 && amountNum <= maxAmount;

  const handleTransfer = async () => {
    if (!portfolioManager || !canTransfer) {
      setError("Некорректна сума");
      hapticFeedback("medium");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let success = false;

      if (direction === "to_cfd") {
        success = portfolioManager.transferToCfd(amountNum);
      } else {
        success = portfolioManager.transferFromCfd(amountNum);
      }

      if (success) {
        hapticFeedback("light");
        setCashBalance(portfolioManager.getCashBalance());
        setCfdBalance(portfolioManager.getCfdBalance());
        setAmount("");

        // Повернутися назад через 1 секунду
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        setError("Недостатньо коштів");
        hapticFeedback("medium");
      }
    } catch (err) {
      setError("Помилка переказу");
      hapticFeedback("medium");
    } finally {
      setLoading(false);
    }
  };

  const handleMaxAmount = () => {
    setAmount(maxAmount.toFixed(2));
    setError("");
  };

  const switchDirection = () => {
    setDirection(direction === "to_cfd" ? "from_cfd" : "to_cfd");
    setAmount("");
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
          <h1 className="font-semibold">Переказ коштів</h1>
          <p className="text-sm text-muted-foreground">Між Портфелем та CFD</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Баланси */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center">
            <div className="text-sm text-muted-foreground mb-1">Портфель</div>
            <div className="text-xl font-bold">${cashBalance.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Готівка</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-sm text-muted-foreground mb-1">CFD</div>
            <div className="text-xl font-bold">${cfdBalance.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Для торгівлі</div>
          </Card>
        </div>

        {/* Напрямок переказу */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <div
                className={`font-medium ${direction === "to_cfd" ? "text-primary" : "text-muted-foreground"}`}
              >
                Портфель
              </div>
              <div className="text-sm text-muted-foreground">
                ${cashBalance.toFixed(2)}
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={switchDirection}
              className="mx-4"
            >
              {direction === "to_cfd" ? (
                <ArrowRightIcon className="w-4 h-4" />
              ) : (
                <ArrowLeftIcon className="w-4 h-4" />
              )}
            </Button>

            <div className="text-center flex-1">
              <div
                className={`font-medium ${direction === "from_cfd" ? "text-primary" : "text-muted-foreground"}`}
              >
                CFD
              </div>
              <div className="text-sm text-muted-foreground">
                ${cfdBalance.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="text-center mt-3 text-sm text-muted-foreground">
            {direction === "to_cfd" ? "Переказ до CFD" : "Переказ з CFD"}
          </div>
        </Card>

        {/* Ввід суми */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Сума переказу</label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMaxAmount}
                disabled={loading}
              >
                Вся сума
              </Button>
            </div>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              step="0.01"
              min="0"
              disabled={loading}
              className="text-lg"
            />
            <div className="text-xs text-muted-foreground">
              Доступно: ${maxAmount.toFixed(2)}
            </div>
          </div>

          {/* Інформація про переказ */}
          {amountNum > 0 && (
            <Card className="p-3 bg-blue-50 border-blue-200">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Сума:</span>
                  <span>${amountNum.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>З:</span>
                  <span>{direction === "to_cfd" ? "Портфель" : "CFD"}</span>
                </div>
                <div className="flex justify-between">
                  <span>До:</span>
                  <span>{direction === "to_cfd" ? "CFD" : "Портфель"}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Комісія:</span>
                  <span className="text-success">$0.00</span>
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

          {/* Кнопка переказу */}
          <Button
            onClick={handleTransfer}
            disabled={loading || !canTransfer}
            className="w-full"
            size="lg"
          >
            {loading ? "Перек��з..." : `Перевести $${amountNum.toFixed(2)}`}
          </Button>
        </div>

        {/* Інформація */}
        <Card className="p-4 bg-muted/50">
          <div className="text-sm text-muted-foreground space-y-2">
            <div className="font-medium">Про переказ:</div>
            <div>• Портфель - готівка для купівлі активів</div>
            <div>• CFD - кошти для контрактів на різницю цін</div>
            <div>• Переказ миттєвий без комісії</div>
            <div>• Всі операції зберігаються в історії</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
