import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TelegramSetupModal } from "@/components/TelegramSetupModal";
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
const getLanguageName = (languageCode?: string) => {
  const languages: Record<string, string> = {
    uk: "Українська",
    ru: "Русский",
    en: "English",
    de: "Deutsch",
    fr: "Français",
    es: "Español",
    it: "Italiano",
    pt: "Português",
    pl: "Polski",
    tr: "Türkçe",
    ar: "العربية",
    zh: "中文",
    ja: "日本語",
    ko: "한국어",
  };

  return languages[languageCode || ""] || "Русский";
};

export default function Settings() {
  const { tg, hapticFeedback, user } = useTelegram();
  const navigate = useNavigate();
  const [showSetupModal, setShowSetupModal] = useState(false);

  // Back button is now handled automatically by useAutoBackButton hook

  const handleItemClick = (item: any) => {
    hapticFeedback("light");

    if (item.action === "telegram-setup") {
      setShowSetupModal(true);
    } else {
      console.log(`Clicked: ${item.title}`);
    }
  };

  const handleDiagnostic = () => {
    hapticFeedback("medium");
    console.log("🔍 Діагностика Telegram Web App:");
    console.log("window.Telegram:", window.Telegram);
    console.log("tg object:", tg);
    console.log("user object:", user);

    if (tg) {
      console.log("📱 Platform:", tg.platform);
      console.log("🔢 Version:", tg.version);
      console.log("🎨 Color scheme:", tg.colorScheme);
      console.log("📍 initData:", tg.initData);
      console.log("💾 initDataUnsafe:", tg.initDataUnsafe);

      // Аналіз проблеми
      console.log("\n🎯 АНАЛІЗ ПРОБЛЕМИ:");
      if (!tg.initDataUnsafe?.user) {
        console.log("❌ ПРОБЛЕМА: Дані користувача відсутні");

        // Спеціальні поради для мобільних
        const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
        if (isMobile || tg.platform === "unknown") {
          console.log("📱 РІШЕННЯ ДЛЯ МОБІЛЬНОГО:");
          console.log("   1. У @BotFather напишіть /newapp");
          console.log(
            "   2. Створіть Web App з URL: https://a1c16b064f7149d9a9291176d41387b1-pulse-field.projects.builder.my/",
          );
          console.log("   3. Потім /setmenubutton");
          console.log("   4. Виберіть створений Web App (НЕ вводьте URL)");
          console.log("   5. Видаліть бота з чатів та додайте знову");
          console.log("\n🔄 АБО ВИКОРИСТАЙТЕ INLINE КНОПКУ:");
          console.log("   - Створіть бота з inline кнопкою");
          console.log("   - Це працює у 100% випадків на мобільному");
        } else {
          console.log("💻 РІШЕННЯ ДЛЯ DESKTOP:");
          console.log("   1. У Telegram відкрийте @BotFather");
          console.log("   2. Напишіть /setmenubutton");
          console.log("   3. Виберіть вашого бота");
          console.log("   4. Встановіть назву: Кошелёк");
          console.log(
            "   5. URL: https://a1c16b064f7149d9a9291176d41387b1-pulse-field.projects.builder.my/",
          );
        }
      } else {
        console.log("✅ Дані користувача доступні");
      }

      if (tg.platform === "unknown") {
        console.log("⚠️ Platform невідомий - можливо відкрито не через бота");
      }

      console.log("\n🔄 Перезавантаження через 3 секунди...");
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } else {
      console.log("❌ Telegram Web App API недоступний");
    }
  };

  // Динамічно створюємо settingsItems з мовою користувача
  const settingsItems = [
    {
      icon: <BellIcon className="w-5 h-5 text-red-500" />,
      title: "Уведомления",
      value: "",
      hasChevron: true,
    },
    {
      icon: <FingerprintIcon className="w-5 h-5 text-green-500" />,
      title: "Код-пароль и Face ID",
      value: "Вкл",
      hasChevron: true,
    },
    {
      icon: <GlobeIcon className="w-5 h-5 text-purple-500" />,
      title: "Язык",
      value: getLanguageName(user?.language_code),
      hasChevron: true,
    },
    {
      icon: <DollarSignIcon className="w-5 h-5 text-gray-500" />,
      title: "Основная валюта",
      value: "USD",
      hasChevron: true,
    },
    {
      icon: (
        <span className="w-5 h-5 text-blue-500 flex items-center justify-center">
          📱
        </span>
      ),
      title: "Telegram інтеграція",
      value: "Налаштувати",
      hasChevron: true,
      action: "telegram-setup",
    },
  ];

  const walletTabs = [
    { id: "wallet", label: "Кошелёк", active: true },
    { id: "tonspace", label: "TON Space", error: true },
  ];

  const supportItems = [
    {
      icon: <CreditCardIcon className="w-5 h-5 text-blue-500" />,
      title: "Уровень верификации",
      value: "Макси",
      hasChevron: true,
    },
    {
      icon: <MessageSquareIcon className="w-5 h-5 text-orange-500" />,
      title: "Обратиться в поддержку",
      hasChevron: true,
    },
    {
      icon: <HelpCircleIcon className="w-5 h-5 text-blue-400" />,
      title: "FAQ Кошелька",
      hasChevron: true,
    },
    {
      icon: <LightbulbIcon className="w-5 h-5 text-yellow-500" />,
      title: "Новости Кошелька",
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

        {/* Telegram Integration Section */}
        {(!user || user?.is_demo || !tg) && (
          <Card className="mb-6 p-4 border-blue-200 bg-blue-50">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleDiagnostic}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  🔍 Діагностика
                </Button>
                <Button
                  onClick={() => setShowSetupModal(true)}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  📋 Інструкції
                </Button>
              </div>

              {user?.is_demo && (
                <div className="text-center">
                  <p className="text-sm text-blue-700 font-medium mb-2">
                    🎭 Зараз активний Demo режим
                  </p>
                  <p className="text-xs text-blue-600">
                    Натисніть "Інструкції" для налаштування реальної інтеграції
                    з Telegram
                  </p>
                </div>
              )}

              <p className="text-xs text-blue-600 text-center">
                Діагностика - перевірка підключення | Інструкції - повний гайд
              </p>
            </div>
          </Card>
        )}

        {/* Basic Settings */}
        <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
          ОСНОВНЫЕ НАСТРОЙКИ
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
                <span className="font-medium">Уровень верификации</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Макси</span>
                  <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Не распространяется на аккаунт TON Space.
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

      {/* Telegram Setup Modal */}
      <TelegramSetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
      />
    </div>
  );
}
