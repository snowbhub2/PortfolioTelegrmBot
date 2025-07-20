import { useEffect, useState } from "react";

// Функція для парсингу Telegram Web App даних з URL
const parseTelegramDataFromURL = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.substring(1));

  // Шукаємо tgWebAppData у різних місцях
  let tgData = urlParams.get("tgWebAppData") || hashParams.get("tgWebAppData");

  if (!tgData) {
    // Альтернативні назви параметрів
    tgData =
      urlParams.get("tgdata") ||
      hashParams.get("tgdata") ||
      urlParams.get("initData") ||
      hashParams.get("initData");
  }

  if (tgData) {
    try {
      console.log(
        "🔍 Знайдено Telegram дані в URL:",
        tgData.substring(0, 50) + "...",
      );

      // Спроба декодувати дані
      const decodedData = decodeURIComponent(tgData);
      const params = new URLSearchParams(decodedData);

      // Парсинг user даних
      const userParam = params.get("user");
      if (userParam) {
        const userData = JSON.parse(decodeURIComponent(userParam));
        console.log("✅ Успішно розпарсено дані користувача з URL:", userData);
        return userData;
      }
    } catch (error) {
      console.warn("❌ Помилка парсингу Telegram даних з URL:", error);
    }
  }

  return null;
};

export const useTelegram = () => {
  const [webApp, setWebApp] = useState<typeof window.Telegram.WebApp | null>(
    null,
  );
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    console.log("🔍 Перевірка Telegram Web App SDK...");
    console.log("window.Telegram:", window.Telegram);
    console.log("window.Telegram?.WebApp:", window?.Telegram?.WebApp);

    if (window?.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      console.log("✅ Telegram WebApp знайдено:", tg);
      console.log("📱 initData:", tg.initData);
      console.log("🔓 initDataUnsafe:", tg.initDataUnsafe);
      console.log("👤 User data:", tg.initDataUnsafe?.user);

      setWebApp(tg);
      setUser(tg.initDataUnsafe?.user);

      tg.ready();
      tg.expand();

      console.log("🚀 Telegram Web App ініціалізовано");
    } else {
      console.warn("❌ Telegram Web App SDK не знайдено");

      // Пробуємо почекати і перевірити ще раз
      const checkTelegram = () => {
        if (window?.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp;
          console.log("✅ Telegram WebApp знайдено після очікування:", tg);

          // Детальна ��іагностика версії
          const version = parseFloat(tg.version || "0");
          console.log("🔢 Версія Telegram:", version);

          if (version < 6.1) {
            console.warn("⚠️ ЗАСТАРІЛА ВЕРСІЯ TELEGRAM!");
            console.log("📱 Поточна версія:", version);
            console.log("✅ Рекомендована версія: 6.1+");
            console.log("🚫 Обмеження:");
            console.log("   - BackButton недоступний");
            console.log("   - HapticFeedback обмежений");
            console.log("   - Дані користувача можуть не передаватися");
            console.log("🔄 РІШЕННЯ: Оновіть Telegram");
          }

          // Розширена діагностика для мобільного
          console.log("📱 Platform:", tg.platform);
          console.log("🎨 Color scheme:", tg.colorScheme);
          console.log("📊 Viewport height:", tg.viewportHeight);
          console.log("💾 initData length:", tg.initData?.length || 0);
          console.log(
            "🔓 initDataUnsafe keys:",
            Object.keys(tg.initDataUnsafe || {}),
          );
          console.log("🌐 Window location:", window.location.href);
          console.log("🔗 Referrer:", document.referrer);
          console.log("📋 User agent:", navigator.userAgent);

          // Перевірка способу запуску
          const launchMethod = (() => {
            if (window.location.search.includes("tgWebAppData"))
              return "Web App (inline button)";
            if (window.location.hash.includes("tgWebAppData"))
              return "Web App (hash)";
            if (tg.platform && tg.platform !== "unknown") return "Menu Button";
            return "Unknown/Direct";
          })();
          console.log("🚀 Метод запуску:", launchMethod);

          // Специфічна діагностика для iOS
          if (
            navigator.userAgent.includes("iPhone") ||
            navigator.userAgent.includes("iPad")
          ) {
            console.log("📱 iOS ДІАГНОСТИКА:");
            console.log(
              "   - Версія iOS:",
              navigator.userAgent.match(/OS (\d+_\d+)/)?.[1],
            );
            console.log(
              "   - Telegram через Safari:",
              !window.TelegramWebviewProxy,
            );
            console.log("   - Telegram native:", !!window.TelegramWebviewProxy);
          }

          setWebApp(tg);
          setUser(tg.initDataUnsafe?.user);
          tg.ready();
          tg.expand();
        }
      };

      setTimeout(checkTelegram, 1000);
      setTimeout(checkTelegram, 3000);

      // Спроба отримати дані користувача повторно
      setTimeout(() => {
        if (window?.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp;
          console.log("🔄 Повторна перевірка даних користувача...");
          console.log("👤 User data (повторно):", tg.initDataUnsafe?.user);

          if (tg.initDataUnsafe?.user && !user) {
            console.log("✅ Знайдено дані користувача при повторній перевірці");
            setUser(tg.initDataUnsafe.user);
          } else {
            // Спроба отримати дані з URL якщо API не дає результат
            console.log("🔍 Спроба отримання даних користувача з URL...");
            const urlUserData = parseTelegramDataFromURL();
            if (urlUserData && !user) {
              console.log("✅ Використано дані користувача з URL");
              setUser(urlUserData);
            }
          }
        }
      }, 3000);

      // Альтернативна ініціалізація для demo режиму
      setTimeout(() => {
        if (
          window?.Telegram?.WebApp &&
          !window.Telegram.WebApp.initDataUnsafe?.user
        ) {
          console.log("🎭 Активація demo режиму (дані користувача недоступні)");
          console.log("💡 Для отримання реальних даних користувача:");
          console.log("   1. Налаштуйте бота через @BotFather");
          console.log("   2. Використайте /setmenubutton");
          console.log("   3. Запустіть через кнопку меню �� боті");

          // Demo користувач для показу інтерфейсу
          const demoUser = {
            id: 0,
            first_name: "Demo",
            last_name: "User",
            username: "demo_user",
            language_code: "uk",
            is_demo: true,
          };
          setUser(demoUser);
        }
      }, 5000);
    }
  }, []);

  const hapticFeedback = (type: "light" | "medium" | "heavy" = "medium") => {
    webApp?.HapticFeedback?.impactOccurred(type);
  };

  const showMainButton = (text: string, onClick: () => void) => {
    if (webApp?.MainButton) {
      webApp.MainButton.setText(text);
      webApp.MainButton.show();
      webApp.MainButton.onClick(onClick);
    }
  };

  const hideMainButton = () => {
    webApp?.MainButton?.hide();
  };

  return {
    webApp,
    user,
    hapticFeedback,
    showMainButton,
    hideMainButton,
    tg: webApp,
  };
};
