// Додаткова ініціалізація та діагностика Telegram Web App
declare global {
  interface Window {
    Telegram: {
      WebApp: any;
    };
  }
}

// Перевірка чи ми у Telegram середовищі
const isTelegramEnvironment = () => {
  if (typeof window === "undefined") return false;

  // Перевірки для виявлення Telegram середовища
  const hasTelegramData =
    window.location.search.includes("tgWebAppData") ||
    window.location.hash.includes("tgWebAppData") ||
    window.location.search.includes("tgWebAppVersion") ||
    window.location.hash.includes("tgWebAppVersion");

  const hasTelegramUA = window.navigator.userAgent.includes("Telegram");
  const isBuilderHost = window.location.hostname.includes("builder.my");
  const hasTelegramAPI = !!(window.Telegram && window.Telegram.WebApp);

  console.log("🔍 Детальна перевірка середовища:");
  console.log("  - Telegram дані в URL:", hasTelegramData);
  console.log("  - Telegram User Agent:", hasTelegramUA);
  console.log("  - Builder хост:", isBuilderHost);
  console.log("  - Telegram API:", hasTelegramAPI);

  return hasTelegramData || hasTelegramUA || (isBuilderHost && hasTelegramAPI);
};

export const initializeTelegram = () => {
  console.log("🔄 Почато ініціалізацію Telegram Web App...");
  console.log("🌍 URL:", window.location.href);
  console.log("🤖 User Agent:", window.navigator.userAgent);
  console.log("📍 Telegram середовище:", isTelegramEnvironment());

  // Перевірка доступності Telegram API
  if (typeof window !== "undefined") {
    console.log("🌐 window об'єкт доступний");

    if (window.Telegram) {
      console.log("📱 Telegram об'єкт знайдено:", window.Telegram);

      if (window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        console.log("✅ Telegram WebApp API доступний:", tg);
        console.log("📍 Platform:", tg.platform);
        console.log("🔢 Version:", tg.version);
        console.log("🎨 Color scheme:", tg.colorScheme);
        console.log("📱 Viewport:", {
          height: tg.viewportHeight,
          stableHeight: tg.viewportStableHeight,
        });
        console.log("👤 User data:", tg.initDataUnsafe?.user);
        console.log("💾 Full initDataUnsafe:", tg.initDataUnsafe);
        console.log("🔗 initData (raw):", tg.initData);

        // Спроба отримати дані користувача різними способами
        if (!tg.initDataUnsafe?.user) {
          console.log(
            "⚠️ Дані користувача відсутні, перевіряємо альтернативні джерела...",
          );

          // Перевірка URL параметрів
          const urlParams = new URLSearchParams(window.location.search);
          const tgWebAppData = urlParams.get("tgWebAppData");
          if (tgWebAppData) {
            console.log("🔍 Знайдено tgWebAppData у URL:", tgWebAppData);
          }

          // Перевірка hash
          if (window.location.hash) {
            console.log("🔍 URL hash:", window.location.hash);
          }

          console.log("💡 Рекомендації:");
          console.log("  1. Переконайтеся що бот налаштований у @BotFather");
          console.log("  2. Встановіть Menu Button через /setmenubutton");
          console.log("  3. Запустіть додаток через кнопку меню у боті");
        }

        // Спробуємо ініціалізувати
        try {
          tg.ready();
          tg.expand();
          console.log("🚀 Telegram Web App успішно ініціалізовано");

          // Показати кнопку назад якщо потрібно
          if (window.location.pathname !== "/") {
            tg.BackButton.show();
            console.log("🔙 Back button показано");
          }

          return tg;
        } catch (error) {
          console.error("❌ Помилка ініціалізації Telegram Web App:", error);
        }
      } else {
        console.warn("⚠️ Telegram.WebApp недоступний");
      }
    } else {
      console.warn("⚠️ Telegram об'єкт недоступний");
    }
  } else {
    console.warn("⚠️ window об'єкт недоступний");
  }

  return null;
};

// Автоматична ініціалізація при завантаженні
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    console.log("📄 DOM завантажено, ініціалізуємо Telegram...");
    initializeTelegram();
  });

  // Альтернативна ініціалізація через timeout
  setTimeout(() => {
    console.log("⏰ Додаткова спроба ініціалізації через 1 секунду...");
    initializeTelegram();
  }, 1000);
}
