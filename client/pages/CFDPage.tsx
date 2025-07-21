import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MarketAsset } from "@/types/crypto";
import { SearchIcon, TrendingUpIcon, UserIcon, SettingsIcon, RefreshCwIcon, EyeIcon, EyeOffIcon } from "lucide-react";
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
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    // Initialize portfolio manager
    const userId = user?.id?.toString() || "demo_user";
    const portfolio = new PortfolioManager(userId);
    setPortfolioManager(portfolio);
  }, [user]);

  const cfdBalance = portfolioManager?.getCfdBalance() || 0;
  const totalPortfolioValue = portfolioManager?.getTotalPortfolioValue() || 0;

  const handleTabSwitch = (tab: string) => {
    hapticFeedback("light");
    if (tab === "wallet") {
      navigate("/");
    }
  };

  const handleAvatarClick = () => {
    hapticFeedback("light");
    navigate("/settings");
  };

  const toggleBalanceVisibility = () => {
    hapticFeedback("light");
    setShowBalance(!showBalance);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Demo Mode Banner */}
      {user?.is_demo && (
        <div className="bg-orange-100 border-b border-orange-200 p-2 text-center">
          <span className="text-orange-800 text-sm font-medium">
            🎭 Demo режим - для повних функцій запустіть через Telegram бота
          </span>
        </div>
      )}

      {/* Shared Header with Portfolio/CFD toggle */}
      <div className="flex items-center justify-between p-4">
        {/* Avatar - перехід до налаштувань */}
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-full p-0 hover:ring-2 hover:ring-primary/20 transition-all"
          onClick={handleAvatarClick}
          title={t('wallet.settings.open')}
        >
          {user?.photo_url ? (
            <img
              src={user.photo_url}
              alt={`${user.first_name || "User"} ${t('wallet.user.avatar')}`}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : user?.first_name ? (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user.first_name[0].toUpperCase()}
              </span>
            </div>
          ) : (
            // Fallback for cases when Telegram data is unavailable
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {tg ? "TG" : "U"}
              </span>
            </div>
          )}
        </Button>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-muted rounded-full p-1">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full px-4"
            onClick={() => handleTabSwitch("wallet")}
          >
            {t('wallet.tabs.wallet')}
          </Button>
          <Button
            variant="default"
            size="sm"
            className="rounded-full px-4"
          >
            {t('wallet.tabs.cfd')}
          </Button>
        </div>

        {/* Refresh Button */}
        <Button variant="ghost" size="icon">
          <RefreshCwIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* CFD Balance Section */}
      <div className="px-4 pb-6 pt-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl font-bold">
              {showBalance
                ? `${cfdBalance.toFixed(2)} $`
                : "•".repeat(`${cfdBalance.toFixed(2)} $`.length)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleBalanceVisibility}
              className="h-8 w-8"
            >
              {showBalance ? (
                <EyeIcon className="w-4 h-4" />
              ) : (
                <EyeOffIcon className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-sm text-muted-foreground">
              {t('cfd.balance.title')}
            </span>
          </div>
          <div className="text-center">
            <span className="text-xs text-muted-foreground">
              {t('cfd.balance.description')}
            </span>
          </div>
        </div>
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
