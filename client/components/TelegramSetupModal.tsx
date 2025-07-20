import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useTelegram } from "@/hooks/useTelegram";
import { XIcon } from "lucide-react";

interface TelegramSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelegramSetupModal = ({
  isOpen,
  onClose,
}: TelegramSetupModalProps) => {
  const { user, tg } = useTelegram();
  const [activeTab, setActiveTab] = useState<
    "instructions" | "mobile" | "code"
  >("instructions");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const telegramVersion = tg ? parseFloat(tg.version || "0") : 0;
  const isOldVersion = telegramVersion > 0 && telegramVersion < 6.1;
  const appUrl =
    "https://a1c16b064f7149d9a9291176d41387b1-pulse-field.projects.builder.my/";

  const pythonCode = `import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

BOT_TOKEN = "ВАШ_ТОКЕН_БОТА"
bot = telebot.TeleBot(BOT_TOKEN)

@bot.message_handler(commands=['start', 'wallet'])
def send_wallet(message):
    markup = InlineKeyboardMarkup()
    webapp_button = InlineKeyboardButton(
        text="💰 Відкрити Кошелёк",
        web_app=WebAppInfo(url="${appUrl}")
    )
    markup.add(webapp_button)
    
    bot.reply_to(
        message,
        "🚀 Ласкаво просимо до Crypto Wallet!\\n\\n"
        "Натисніть кнопку нижче для від��риття вашого кошелька:",
        reply_markup=markup
    )

bot.polling(none_stop=True)`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🔧 Налаштування Telegram інтеграції
          </DialogTitle>
          <DialogDescription>
            Інструкції для підключення додатку до Telegram бота
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          <Button
            variant={activeTab === "instructions" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("instructions")}
          >
            📋 Загальні
          </Button>
          <Button
            variant={activeTab === "mobile" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("mobile")}
          >
            📱 iPhone/Android
          </Button>
          <Button
            variant={activeTab === "code" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("code")}
          >
            🤖 Код
          </Button>
        </div>

        {activeTab === "instructions" && (
          <div className="space-y-4">
            {/* Діагностика поточного стану */}
            <Card className="p-4 border-blue-200 bg-blue-50">
              <h3 className="font-semibold text-blue-800 mb-2">
                🔍 Поточний стан:
              </h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Telegram API: {tg ? "✅ Доступний" : "❌ Недоступний"}</p>
                {tg && (
                  <>
                    <p>
                      • Версія: {tg.version}{" "}
                      {isOldVersion ? "⚠️ (застаріла)" : "✅ (сучасна)"}
                    </p>
                    <p>
                      • Дані користувача: {user ? "✅ Доступні" : "❌ Відсутні"}
                    </p>
                  </>
                )}
              </div>
            </Card>

            {/* Попередження про застарілу версію */}
            {isOldVersion && (
              <Card className="p-4 border-orange-300 bg-orange-50">
                <h3 className="font-semibold text-orange-800 mb-2">
                  ⚠️ Застаріла версія Telegram
                </h3>
                <p className="text-sm text-orange-700 mb-3">
                  Поточна версія: {telegramVersion}. Потрібна: 6.1+
                </p>
                <ul className="text-sm text-orange-700 space-y-1 pl-4">
                  <li>• Дані користувача не передаються</li>
                  <li>• BackButton недоступний</li>
                  <li>• Обмежений HapticFeedback</li>
                </ul>
                <p className="text-sm text-orange-800 font-medium mt-2">
                  РІШЕННЯ: Оновіть Telegram або використайте inline кнопку
                </p>
              </Card>
            )}

            {/* Основні інструкції */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Крок за кроком:</h3>

              <Card className="p-3 border">
                <h4 className="font-semibold text-sm mb-2">
                  1️⃣ Відкрийте @BotFather у Telegram
                </h4>
              </Card>

              <Card className="p-3 border">
                <h4 className="font-semibold text-sm mb-2">
                  2️⃣ Напишіть команду:
                </h4>
                <div className="bg-gray-100 p-2 rounded font-mono text-sm flex justify-between items-center">
                  <span>/setmenubutton</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard("/setmenubutton")}
                  >
                    📋
                  </Button>
                </div>
              </Card>

              <Card className="p-3 border">
                <h4 className="font-semibold text-sm mb-2">
                  3️⃣ Встановіть назву кнопки:
                </h4>
                <div className="bg-gray-100 p-2 rounded font-mono text-sm flex justify-between items-center">
                  <span>Кошелёк</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard("Кошелёк")}
                  >
                    📋
                  </Button>
                </div>
              </Card>

              <Card className="p-3 border">
                <h4 className="font-semibold text-sm mb-2">
                  4️⃣ Встановіть URL:
                </h4>
                <div className="bg-gray-100 p-2 rounded font-mono text-xs break-all flex justify-between items-center">
                  <span className="flex-1 mr-2">{appUrl}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(appUrl)}
                  >
                    📋
                  </Button>
                </div>
              </Card>

              <Card className="p-3 border">
                <h4 className="font-semibold text-sm mb-2">
                  5️⃣ Перезапустіть Telegram та відкрийте через кнопку меню
                </h4>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "mobile" && (
          <div className="space-y-4">
            {/* iPhone специфічні інструкції */}
            <Card className="p-4 border-blue-200 bg-blue-50">
              <h3 className="font-semibold text-blue-800 mb-2">
                📱 Спеціальні інструкції для iPhone/Android
              </h3>
              <p className="text-sm text-blue-700 mb-3">
                На мобільних пристроях Menu Button часто не передає дані
                користувача. Використайте Web App.
              </p>
            </Card>

            {/* Крок 1: Створення Web App */}
            <Card className="p-4 border">
              <h4 className="font-semibold text-sm mb-2">
                1️⃣ Створіть Web App у @BotFather:
              </h4>
              <div className="space-y-2">
                <div className="bg-gray-100 p-2 rounded font-mono text-sm flex justify-between items-center">
                  <span>/newapp</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard("/newapp")}
                  >
                    📋
                  </Button>
                </div>
                <div className="text-xs text-gray-600 space-y-1 pl-2">
                  <p>• Виберіть вашого бота</p>
                  <p>
                    • Назва: <strong>Crypto Wallet</strong>
                  </p>
                  <p>
                    • Опис: <strong>Персональний криптовалютний кошелёк</strong>
                  </p>
                  <p>• Завантажте іконку 512x512 пікселів</p>
                </div>
              </div>
            </Card>

            {/* Крок 2: URL для Web App */}
            <Card className="p-4 border">
              <h4 className="font-semibold text-sm mb-2">2️⃣ Web App URL:</h4>
              <div className="bg-gray-100 p-2 rounded font-mono text-xs break-all flex justify-between items-center">
                <span className="flex-1 mr-2">{appUrl}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(appUrl)}
                >
                  📋
                </Button>
              </div>
            </Card>

            {/* Крок 3: Menu Button з Web App */}
            <Card className="p-4 border">
              <h4 className="font-semibold text-sm mb-2">
                3️⃣ Налаштуйте Menu Button з Web App:
              </h4>
              <div className="space-y-2">
                <div className="bg-gray-100 p-2 rounded font-mono text-sm flex justify-between items-center">
                  <span>/setmenubutton</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard("/setmenubutton")}
                  >
                    📋
                  </Button>
                </div>
                <div className="text-xs text-gray-600 space-y-1 pl-2">
                  <p>• Виберіть вашого бота</p>
                  <p>
                    • Назва кнопки: <strong>Кошелёк</strong>
                  </p>
                  <p>
                    • <strong>ВАЖЛИВО:</strong> Виберіть створений Web App (не
                    вводьте URL вручну)
                  </p>
                </div>
              </div>
            </Card>

            {/* Альтернативний спосіб - inline кнопка */}
            <Card className="p-4 border-green-200 bg-green-50">
              <h4 className="font-semibold text-green-800 mb-2">
                🔄 Альтернатива: Inline кнопка (100% працює)
              </h4>
              <p className="text-sm text-green-700 mb-2">
                Якщо Menu Button не працює, використайте inline кнопку:
              </p>
              <div className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                <code>{`@bot.message_handler(commands=['start'])
def start(message):
    markup = InlineKeyboardMarkup()
    button = InlineKeyboardButton(
        "💰 Кошелёк",
        web_app=WebAppInfo("${appUrl}")
    )
    markup.add(button)
    bot.reply_to(message, "Натисніть кнопку:", reply_markup=markup)`}</code>
              </div>
            </Card>

            {/* Тестування на мобільному */}
            <Card className="p-4 border-orange-200 bg-orange-50">
              <h4 className="font-semibold text-orange-800 mb-2">
                📱 Тестування на мобільному:
              </h4>
              <ol className="text-sm text-orange-700 space-y-1 pl-4">
                <li>
                  1. <strong>Видаліть бота з чатів</strong> (важливо для очистки
                  кеша)
                </li>
                <li>2. Знайдіть бота знову через @username</li>
                <li>3. Натисніть /start</li>
                <li>4. Натисніть кнопку меню (☰) або inline кнопку</li>
                <li>5. Перевірте що з'явилися реальні дані користувача</li>
              </ol>
            </Card>

            {/* Діагностика для мобільного */}
            <Card className="p-4 border-purple-200 bg-purple-50">
              <h4 className="font-semibold text-purple-800 mb-2">
                🔍 Що перевірити в консолі:
              </h4>
              <div className="text-sm text-purple-700 space-y-1">
                <p>
                  ✅ <strong>Platform:</strong> "ios" або "android" (не
                  "unknown")
                </p>
                <p>
                  ✅ <strong>initData length:</strong> {">"} 0 (не 0)
                </p>
                <p>
                  ✅ <strong>User data:</strong> реальні дані (не undefined)
                </p>
                <p>
                  ✅ <strong>Метод запуску:</strong> "Web App" (не "Unknown")
                </p>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "code" && (
          <div className="space-y-4">
            <Card className="p-4 border-green-200 bg-green-50">
              <h3 className="font-semibold text-green-800 mb-2">
                🤖 Готовий код для Python бота (працює у всіх версіях)
              </h3>
              <p className="text-sm text-green-700 mb-3">
                Цей код створює inline кнопку, яка передає дані користувача у
                всіх версіях Telegram
              </p>

              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-xs">
                  <code>{pythonCode}</code>
                </pre>
                <Button
                  size="sm"
                  className="absolute top-2 right-2 bg-green-600 hover:bg-green-700"
                  onClick={() => copyToClipboard(pythonCode)}
                >
                  📋 Копіювати
                </Button>
              </div>
            </Card>

            <Card className="p-4 border-yellow-200 bg-yellow-50">
              <h3 className="font-semibold text-yellow-800 mb-2">
                🔑 Отримання токену бота:
              </h3>
              <ol className="text-sm text-yellow-700 space-y-1 pl-4">
                <li>1. Напишіть @BotFather у Telegram</li>
                <li>2. Відправте команду /newbot</li>
                <li>3. Вкажіть назву бота (наприклад: Crypto Wallet)</li>
                <li>4. Вкажіть username бота (має закінчуватися на "bot")</li>
                <li>5. Скопіюйте токен і замініть "ВАШ_ТОКЕН_БОТА" у коді</li>
              </ol>
            </Card>

            <Card className="p-4 border-blue-200 bg-blue-50">
              <h3 className="font-semibold text-blue-800 mb-2">
                📦 Встановлення та запуск:
              </h3>
              <div className="space-y-2">
                <div className="bg-gray-100 p-2 rounded font-mono text-sm flex justify-between items-center">
                  <span>pip install pyTelegramBotAPI</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      copyToClipboard("pip install pyTelegramBotAPI")
                    }
                  >
                    📋
                  </Button>
                </div>
                <div className="bg-gray-100 p-2 rounded font-mono text-sm flex justify-between items-center">
                  <span>python bot.py</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard("python bot.py")}
                  >
                    📋
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Закрити
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
