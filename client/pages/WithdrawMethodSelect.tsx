import { useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { Card } from "@/components/ui/card";
import { ArrowLeftIcon, ChevronRightIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function WithdrawMethodSelect() {
  const { hapticFeedback, tg } = useTelegram();
  const navigate = useNavigate();

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

  const handleTelegramStars = () => {
    hapticFeedback("medium");
    navigate("/withdraw/telegram-stars");
  };

  const handleExternalWallet = () => {
    hapticFeedback("medium");
    navigate("/withdraw/external");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-4">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Как отправить</h1>
          <h2 className="text-2xl font-bold">криптовалюту</h2>
        </div>

        {/* Method Options */}
        <div className="space-y-4">
          {/* Telegram Contact */}
          <Card
            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={handleTelegramStars}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="white"
                    className="text-white"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.13-.31-1.09-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06-.01.24-.02.24z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-lg">
                    Контакт в Telegram
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Мгновенно и без комиссий
                  </div>
                </div>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>

          {/* External Wallet */}
          <Card
            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={handleExternalWallet}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="white"
                    className="text-white"
                  >
                    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
                    <path
                      d="M9 12l2 2 4-4"
                      stroke="white"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-lg">
                    Внешний кошелёк или биржа
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Нужно указать криптоадрес
                  </div>
                </div>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
