import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeftIcon, StarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PortfolioManager } from "@/lib/portfolio";

export default function TelegramStarsExchange() {
  const { hapticFeedback, tg, user } = useTelegram();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [starsAmount, setStarsAmount] = useState(0);
  const [portfolioManager, setPortfolioManager] =
    useState<PortfolioManager | null>(null);
  const [userBalance, setUserBalance] = useState(0);

  const DOLLAR_TO_STARS_RATE = 100; // 1 доллар = 100 звезд

  useEffect(() => {
    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => navigate("/withdraw/method"));
    }
    return () => {
      if (tg) {
        tg.BackButton.hide();
      }
    };
  }, [tg, navigate]);

  useEffect(() => {
    // Ініціалізація портфеля
    const userId = user?.id?.toString() || "demo_user";
    const portfolio = new PortfolioManager(userId);
    setPortfolioManager(portfolio);
    setUserBalance(portfolio.getCashBalance());
  }, [user]);

  useEffect(() => {
    const dollarAmount = parseFloat(amount) || 0;
    setStarsAmount(dollarAmount * DOLLAR_TO_STARS_RATE);
  }, [amount]);

  const handleMaxAmount = () => {
    hapticFeedback("light");
    setAmount(userBalance.toString());
  };

  const handleExchange = () => {
    if (!amount || parseFloat(amount) <= 0 || !portfolioManager) {
      hapticFeedback("medium");
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount > userBalance) {
      hapticFeedback("medium");
      // Show insufficient funds error
      return;
    }

    // Виконуємо виведення коштів
    const success = portfolioManager.withdrawToStars(withdrawAmount);
    if (success) {
      hapticFeedback("light");
      navigate("/withdraw/processing", {
        state: {
          amount: withdrawAmount,
          starsAmount,
          type: "telegram-stars",
        },
      });
    } else {
      hapticFeedback("medium");
      // Show error message
    }
  };

  const isValidAmount =
    amount && parseFloat(amount) > 0 && parseFloat(amount) <= userBalance;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-4 space-y-6">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Обмен долларов</h1>
          <h2 className="text-xl font-semibold mb-4">на Telegram Stars</h2>
          <div className="text-sm text-muted-foreground">
            1 USD = {DOLLAR_TO_STARS_RATE} ⭐
          </div>
        </div>

        {/* Exchange Card */}
        <Card className="p-6">
          <div className="space-y-4">
            {/* From */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Отдаете</span>
                <span className="text-sm text-muted-foreground">
                  Баланс: {userBalance.toLocaleString()} USD
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">$</span>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-2xl font-bold bg-transparent border-0 focus:outline-none"
                  />
                  <div className="text-sm text-muted-foreground">USD</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMaxAmount}
                  className="text-primary"
                >
                  Макс
                </Button>
              </div>
            </div>

            {/* Exchange Arrow */}
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <span className="text-lg">↓</span>
              </div>
            </div>

            {/* To */}
            <div>
              <div className="mb-2">
                <span className="text-sm text-muted-foreground">Получаете</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                  <StarIcon className="w-6 h-6 text-white" fill="white" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold">
                    {starsAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Telegram Stars
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-sm">ℹ</span>
            </div>
            <div className="text-sm">
              <div className="font-medium mb-1">О Telegram Stars</div>
              <div className="text-muted-foreground">
                Telegram Stars можно использовать для покупки премиум-функций,
                стикеров и других услуг в Telegram. Обмен происходит мгновенно и
                без комиссии.
              </div>
            </div>
          </div>
        </Card>

        {/* Exchange Button */}
        <Button
          className="w-full py-4 text-lg font-medium"
          disabled={!isValidAmount}
          onClick={handleExchange}
        >
          Обменять на {starsAmount.toLocaleString()} ⭐
        </Button>
      </div>
    </div>
  );
}
