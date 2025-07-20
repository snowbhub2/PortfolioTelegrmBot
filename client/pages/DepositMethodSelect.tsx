import { useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { Card } from "@/components/ui/card";
import { ChevronRightIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DepositMethodSelect() {
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

  const handleBankCard = () => {
    hapticFeedback("medium");
    // In real app would redirect to payment provider
    console.log("Bank card deposit");
  };

  const handleTelegramStars = () => {
    hapticFeedback("medium");
    navigate("/deposit/stars");
  };

  const handleP2PExpress = () => {
    hapticFeedback("medium");
    // In real app would open P2P Express
    console.log("P2P Express");
  };

  const handleP2PMarket = () => {
    hapticFeedback("medium");
    // In real app would open P2P Market
    console.log("P2P Market");
  };

  const handleExternalWallet = () => {
    hapticFeedback("medium");
    navigate("/deposit/asset-select");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-4">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Как вы хотите купить</h1>
          <h2 className="text-2xl font-bold">криптовалюту</h2>
        </div>

        {/* Method Options */}
        <div className="space-y-4">
          {/* Bank Card */}
          <Card
            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={handleBankCard}
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
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-lg">Банковская карта</div>
                  <div className="text-sm text-muted-foreground">
                    Купить криптовалюту по карте
                  </div>
                </div>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>

          {/* P2P Express */}
          <Card
            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={handleP2PExpress}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="white"
                    className="text-white"
                  >
                    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.75 1.75 0 0 0 18.3 7.5H16c-.8 0-1.54.37-2.01.99l-2.28 3.03c-.33.44-.29 1.07.12 1.47l.01.01c.4.4 1.02.45 1.47.12L15 12.5v9.5h2zM12.5 11.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zM6 18c0 1.11.89 2 2 2s2-.89 2-2-.89-2-2-2-2 .89-2 2zm2-16C6.89 2 6 2.89 6 4s.89 2 2 2 2-.89 2-2-.89-2-2-2zM4 9c-1.11 0-2 .89-2 2s.89 2 2 2 2-.89 2-2-.89-2-2-2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-lg">P2P Экспресс</div>
                  <div className="text-sm text-muted-foreground">
                    Сделки с надёжными продавцами
                  </div>
                </div>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>

          {/* P2P Market PRO */}
          <Card
            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={handleP2PMarket}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="white"
                    className="text-white"
                  >
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">P2P Маркет</span>
                    <span className="bg-muted px-2 py-1 rounded text-xs font-medium">
                      PRO
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Купить без посредников
                  </div>
                </div>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>

          {/* Telegram Stars */}
          <Card
            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={handleTelegramStars}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">⭐</span>
                </div>
                <div>
                  <div className="font-semibold text-lg">Telegram Stars</div>
                  <div className="text-sm text-muted-foreground">
                    Пополнить через Telegram Stars
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
                <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="white"
                    className="text-white"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    <circle cx="9" cy="9" r="1.5" />
                    <circle cx="15" cy="9" r="1.5" />
                    <circle cx="12" cy="15" r="1.5" />
                    <circle cx="9" cy="15" r="1.5" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-lg">Внешний кошелёк</div>
                  <div className="text-sm text-muted-foreground">
                    Перевести с другого кошелька
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
