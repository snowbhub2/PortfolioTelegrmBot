import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BonusReward } from "@/types/crypto";
import { ArrowLeftIcon, ChevronRightIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "@/components/BottomNavigation";

const mockBonuses: BonusReward[] = [
  {
    id: "usd",
    name: "Доллары",
    symbol: "USD",
    apy: 15,
    icon: "💵",
    status: "active",
  },
  {
    id: "dogs",
    name: "DOGS",
    symbol: "DOGS",
    apy: 5,
    icon: "🐕",
    status: "active",
  },
  {
    id: "major",
    name: "MAJOR",
    symbol: "MAJOR",
    apy: 5,
    icon: "⭐",
    status: "active",
  },
  {
    id: "ton",
    name: "TON",
    symbol: "TON",
    apy: 3.88,
    icon: "💎",
    status: "active",
  },
];

export default function Bonuses() {
  const { tg, hapticFeedback } = useTelegram();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  useEffect(() => {
    if (tg) {
      tg.BackButton.show();
      const handleBack = () => {
        hapticFeedback("light");
        navigate("/");
      };
      tg.BackButton.onClick(handleBack);

      return () => {
        tg.BackButton.offClick(handleBack);
      };
    }
  }, [tg, navigate, hapticFeedback]);

  const handleBonusClick = (bonus: BonusReward) => {
    hapticFeedback("medium");
    console.log(`Clicked bonus: ${bonus.name}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Empty Header */}
      <div className="h-16 p-4"></div>

      {/* Bonus Hero Section */}
      <div className="text-center py-8">
        <div className="text-6xl mb-4">💰</div>
        <h2 className="text-2xl font-bold mb-2">Бонусы в Кошельке</h2>
        <p className="text-muted-foreground mb-4">
          Получайте бонусы за хранение криптовалюты.
        </p>
        <Button
          variant="ghost"
          className="text-primary"
          onClick={() => hapticFeedback("light")}
        >
          Как это работает <ChevronRightIcon className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-6">
        <div className="flex space-x-8">
          <button
            onClick={() => {
              setActiveTab("active");
              hapticFeedback("light");
            }}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === "active"
                ? "border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground"
            }`}
          >
            Активные
          </button>
          <button
            onClick={() => {
              setActiveTab("completed");
              hapticFeedback("light");
            }}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === "completed"
                ? "border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground"
            }`}
          >
            Завершённые
          </button>
        </div>
      </div>

      {/* Bonus Cards */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-4">
          {mockBonuses
            .filter((bonus) => bonus.status === activeTab)
            .map((bonus) => (
              <Card
                key={bonus.id}
                className="p-4 hover:bg-muted/50 transition-colors cursor-pointer relative overflow-hidden"
                onClick={() => handleBonusClick(bonus)}
              >
                {bonus.id === "usd" && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    БОНУС
                  </div>
                )}
                <div className="text-center">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">{bonus.icon}</span>
                  </div>
                  <h3 className="font-medium mb-1">{bonus.name}</h3>
                  <div className="text-sm text-muted-foreground">
                    {bonus.apy}% годовых
                  </div>
                </div>
              </Card>
            ))}
        </div>

        {activeTab === "completed" && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">📦</div>
            <p>Нет завершённых бонусов</p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
