import { useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircleIcon, ClockIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function WithdrawProcessing() {
  const { hapticFeedback, tg } = useTelegram();
  const navigate = useNavigate();
  const location = useLocation();

  const { asset, address, network, amount, starsAmount, type } =
    location.state || {};

  useEffect(() => {
    if (tg) {
      tg.BackButton.hide();
    }
  }, [tg]);

  const handleReturnToPortfolio = () => {
    hapticFeedback("medium");
    navigate("/");
  };

  const isTelegramStars = type === "telegram-stars";
  const isExternalWallet = type === "external-wallet";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircleIcon className="w-10 h-10 text-white" />
        </div>

        {/* Success Message */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-4">
            {isTelegramStars ? "Обмен выполнен!" : "Ваш платёж в обработке"}
          </h1>
          <div className="text-muted-foreground max-w-sm">
            {isTelegramStars ? (
              <div>
                <div className="mb-2">
                  Вы успешно обменяли {amount} USD на {starsAmount} Telegram
                  Stars
                </div>
                <div className="text-sm">
                  Stars уже доступны в вашем аккаунте Telegram
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-2">Это займет от 5 до 20 минут</div>
                <div className="text-sm">
                  Мы уведомим вас, когда транзакция будет подтверждена
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Details */}
        <Card className="w-full max-w-sm p-4 mb-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Сумма</span>
              <span className="font-medium">
                {amount} {asset?.symbol || "USDT"}
              </span>
            </div>

            {isTelegramStars ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Получено</span>
                <span className="font-medium">{starsAmount} ⭐</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Получатель
                  </span>
                  <span className="font-medium">
                    {address?.slice(0, 6)}...{address?.slice(-6)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Сеть</span>
                  <span className="font-medium">{network?.toUpperCase()}</span>
                </div>
              </>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Статус</span>
              <div className="flex items-center gap-2">
                {isTelegramStars ? (
                  <>
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span className="text-green-500 text-sm">Завершено</span>
                  </>
                ) : (
                  <>
                    <ClockIcon className="w-4 h-4 text-yellow-500" />
                    <span className="text-yellow-500 text-sm">Обработка</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Return Button */}
        <Button
          className="w-full max-w-sm py-4 text-lg font-medium"
          onClick={handleReturnToPortfolio}
        >
          Вернуться к портфелю
        </Button>
      </div>
    </div>
  );
}
