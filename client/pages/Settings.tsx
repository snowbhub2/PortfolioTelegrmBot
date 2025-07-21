import { useTelegram } from "@/hooks/useTelegram";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BellIcon,
  FingerprintIcon,
  GlobeIcon,
  DollarSignIcon,
  CreditCardIcon,
  HelpCircleIcon,
  MessageSquareIcon,
  LightbulbIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Функція для отримання назви мови
const getCurrentLanguageName = (langCode: string) => {
  const languages: Record<string, string> = {
    ru: "Русский",
    en: "English",
  };
  return languages[langCode] || "Русский";
};

export default function Settings() {
  const { hapticFeedback, user } = useTelegram();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Back button is now handled automatically by useAutoBackButton hook

  const handleItemClick = (item: any) => {
    hapticFeedback("light");

    if (item.action === "notifications") {
      navigate("/notifications");
    } else if (item.action === "language") {
      navigate("/language");
    } else {
      console.log(`Clicked: ${item.title}`);
    }
  };



  // Динам��чно створюємо settingsItems з мовою користувача
  const settingsItems = [
    {
      icon: <BellIcon className="w-5 h-5 text-red-500" />,
      title: t('settings.notifications'),
      value: "",
      hasChevron: true,
      action: "notifications",
    },
    {
      icon: <FingerprintIcon className="w-5 h-5 text-green-500" />,
      title: t('settings.passcode'),
      value: t('settings.enabled'),
      hasChevron: true,
    },
    {
      icon: <GlobeIcon className="w-5 h-5 text-purple-500" />,
      title: t('settings.language'),
      value: getCurrentLanguageName(language),
      hasChevron: true,
      action: "language",
    },
    {
      icon: <DollarSignIcon className="w-5 h-5 text-gray-500" />,
      title: t('settings.currency'),
      value: "USD",
      hasChevron: true,
    },

  ];

  const walletTabs = [
    { id: "wallet", label: t('settings.walletTab'), active: true },
    { id: "cfdspace", label: t('settings.cfdSpaceTab'), error: true },
  ];

  const supportItems = [
    {
      icon: <CreditCardIcon className="w-5 h-5 text-blue-500" />,
      title: t('settings.verificationLevel'),
      value: t('settings.maxiVerification'),
      hasChevron: true,
    },
    {
      icon: <MessageSquareIcon className="w-5 h-5 text-orange-500" />,
      title: t('settings.contactSupport'),
      hasChevron: true,
    },
    {
      icon: <HelpCircleIcon className="w-5 h-5 text-blue-400" />,
      title: t('settings.walletFAQ'),
      hasChevron: true,
    },
    {
      icon: <LightbulbIcon className="w-5 h-5 text-yellow-500" />,
      title: t('settings.walletNews'),
      hasChevron: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-4">
        {/* User Profile Section */}
        {user && (
          <Card className="mb-6 p-4">
            <div className="flex items-center gap-4">
              {user.photo_url ? (
                <img
                  src={user.photo_url}
                  alt={`${user.first_name || "User"} avatar`}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-xl font-medium text-white">
                    {user.first_name?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">
                  {user.first_name} {user.last_name || ""}
                </h3>
                {user.username && (
                  <p className="text-sm text-muted-foreground">
                    @{user.username}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Telegram ID: {user.id}
                </p>
              </div>
            </div>
          </Card>
        )}



        {/* Basic Settings */}
        <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
          {t('settings.basicSettingsTitle')}
        </h2>
        <Card className="mb-6">
          {settingsItems.map((item, index) => (
            <div
              key={index}
              className={`p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors ${
                index !== settingsItems.length - 1
                  ? "border-b border-border"
                  : ""
              }`}
              onClick={() => handleItemClick(item)}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="font-medium">{item.title}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.value && (
                  <span className="text-muted-foreground">{item.value}</span>
                )}
                {item.hasChevron && (
                  <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>
          ))}
        </Card>

        {/* Wallet Tabs */}
        <div className="flex gap-2 mb-4">
          {walletTabs.map((tab) => (
            <Button
              key={tab.id}
              variant={tab.active ? "default" : "outline"}
              className={`flex-1 relative ${tab.error ? "border-destructive" : ""}`}
              onClick={() => hapticFeedback("light")}
            >
              {tab.label}
              {tab.error && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full flex items-center justify-center">
                  <span className="text-destructive-foreground text-xs">!</span>
                </div>
              )}
            </Button>
          ))}
        </div>

        {/* Verification Notice */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-3">
            <CreditCardIcon className="w-5 h-5 text-blue-500" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{t('settings.verificationLevel')}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{t('settings.maxiVerification')}</span>
                  <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {t('settings.cfdNotApplicable')}
          </p>
        </Card>

        {/* Support Items */}
        <Card className="mb-6">
          {supportItems.slice(1).map((item, index) => (
            <div
              key={index}
              className={`p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors ${
                index !== supportItems.slice(1).length - 1
                  ? "border-b border-border"
                  : ""
              }`}
              onClick={() => handleItemClick(item)}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="font-medium">{item.title}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.value && (
                  <span className="text-muted-foreground">{item.value}</span>
                )}
                {item.hasChevron && (
                  <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>
          ))}
        </Card>

        {/* Legal Links */}
        <div className="space-y-3 mb-6">
          <Button
            variant="ghost"
            className="w-full justify-start text-primary p-0"
            onClick={() => hapticFeedback("light")}
          >
            Пользовательское соглашение
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-primary p-0"
            onClick={() => hapticFeedback("light")}
          >
            Политика конфиденциальности
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p className="mb-1">Мини-приложение управляется TG Wallet Inc.</p>
          <p className="mb-1">Сервис независим и не связан с Telegram.</p>
          <Button
            variant="ghost"
            className="text-primary p-0 h-auto"
            onClick={() => hapticFeedback("light")}
          >
            Узнать больше
          </Button>
        </div>
      </div>


    </div>
  );
}
