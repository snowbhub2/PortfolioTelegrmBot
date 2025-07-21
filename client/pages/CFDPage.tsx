import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MarketAsset } from "@/types/crypto";
import { SearchIcon, TrendingUpIcon, UserIcon, SettingsIcon } from "lucide-react";
import { PortfolioManager } from "@/lib/portfolio";
import { useNavigate } from "react-router-dom";

// Import the existing CFD component content
import CFD from "./CFD";

const CFDBottomNavigation = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { hapticFeedback } = useTelegram();

  const navItems = [
    { 
      id: 'market', 
      label: t('cfd.nav.market'), 
      icon: '📈',
      active: true 
    },
    { 
      id: 'trades', 
      label: t('cfd.nav.trades'), 
      icon: '💼',
      active: false 
    },
    { 
      id: 'autotrading', 
      label: t('cfd.nav.autotrading'), 
      icon: '🤖',
      active: false 
    },
    { 
      id: 'history', 
      label: t('cfd.nav.history'), 
      icon: '📊',
      active: false 
    },
  ];

  const handleNavClick = (itemId: string) => {
    hapticFeedback("light");
    // For now, all navigation stays on same page
    // In future, can add separate routes
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`flex flex-col items-center p-2 min-w-0 ${
              item.active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="text-lg mb-1">{item.icon}</span>
            <span className="text-xs truncate">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default function CFDPage() {
  const { tg, hapticFeedback, user } = useTelegram();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [portfolioManager, setPortfolioManager] = useState<PortfolioManager | null>(null);

  useEffect(() => {
    // Initialize portfolio manager
    const userId = user?.id?.toString() || "demo_user";
    const portfolio = new PortfolioManager(userId);
    setPortfolioManager(portfolio);
  }, [user]);

  const cfdBalance = portfolioManager?.getCfdBalance() || 0;
  const totalPortfolioValue = portfolioManager?.getTotalPortfolioValue() || 0;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header like main wallet page */}
      <div className="flex items-center justify-between p-4">
        {/* Avatar - go to settings */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            hapticFeedback("light");
            navigate("/settings");
          }}
          className="rounded-full"
        >
          <UserIcon className="w-6 h-6" />
        </Button>

        {/* Title */}
        <h1 className="text-xl font-semibold">{t('cfd.title')}</h1>

        {/* Settings */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            hapticFeedback("light");
            navigate("/settings");
          }}
        >
          <SettingsIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* Balance Section similar to main wallet */}
      <div className="p-4">
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">
              {t('cfd.balance.title')}
            </div>
            <div className="text-3xl font-bold text-primary mb-2">
              ${cfdBalance.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              {t('cfd.balance.description')}
            </div>
          </div>
        </Card>
      </div>

      {/* CFD Trading Content */}
      <div className="px-4">
        <CFD />
      </div>

      {/* Custom CFD Bottom Navigation */}
      <CFDBottomNavigation />
    </div>
  );
}
