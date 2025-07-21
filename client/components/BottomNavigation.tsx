import { useLocation, Link } from "react-router-dom";
import {
  WalletIcon,
  TrendingUpIcon,
  PercentIcon,
  ClockIcon,
} from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { useLanguage } from "@/hooks/useLanguage";

interface NavItem {
  path: string;
  labelKey: string;
  icon: React.ReactNode;
}

export default function BottomNavigation() {
  const location = useLocation();
  const { hapticFeedback } = useTelegram();
  const { t } = useLanguage();

  const navItems: NavItem[] = [
    {
      path: "/",
      labelKey: "nav.wallet",
      icon: <WalletIcon className="w-5 h-5" />,
    },
    {
      path: "/market",
      labelKey: "nav.market",
      icon: <TrendingUpIcon className="w-5 h-5" />,
    },
    {
      path: "/bonuses",
      labelKey: "nav.bonuses",
      icon: <PercentIcon className="w-5 h-5" />,
    },
    {
      path: "/history",
      labelKey: "nav.history",
      icon: <ClockIcon className="w-5 h-5" />,
    },
  ];

  const handleNavClick = () => {
    hapticFeedback("light");
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div
                className={`mb-1 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.icon}
              </div>
              <span className="text-xs font-medium">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-1 bg-background" />
    </nav>
  );
}
