import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTelegram } from "@/hooks/useTelegram";

export const TelegramSetupInstructions = () => {
  const { user, tg } = useTelegram();

  // Показувати тільки якщо є проблеми з даними користувача
  if (user && !user.is_demo) {
    return null;
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const telegramVersion = tg ? parseFloat(tg.version || "0") : 0;
  const isOldVersion = telegramVersion > 0 && telegramVersion < 6.1;
  const appUrl =
    "https://a1c16b064f7149d9a9291176d41387b1-pulse-field.projects.builder.my/";

  return (
    <Card
      className={`m-4 p-4 ${isOldVersion ? "border-orange-300 bg-orange-50" : "border-red-200 bg-red-50"}`}
    >
      <div className="space-y-4">
        <div className="text-center">
          <h3
            className={`text-lg font-semibold mb-2 ${isOldVersion ? "text-orange-800" : "text-red-800"}`}
          >
            {isOldVersion
              ? "⚠️ Застаріла версія Telegram"
              : "⚙️ Налаштування Telegram бота"}
          </h3>
          <p
            className={`text-sm ${isOldVersion ? "text-orange-700" : "text-red-700"}`}
          >
            {isOldVersion
              ? `Поточна версія: ${telegramVersion}. Потрібна: 6.1+`
              : "Для повної функціональності потрібно налаштувати бота"}
          </p>
        </div>

        {/* Попередження про застарілу версію */}
        {isOldVersion && (
          <Card className="p-3 border-red-300 bg-red-100">
            <div className="space-y-2">
              <h4 className="font-semibold text-red-800 text-sm">
                🚨 ОСНОВНА ПРОБЛЕМА: Застаріла версія Telegram
              </h4>
              <ul className="text-xs text-red-700 space-y-1 pl-4">
                <li>• Дані користувача не передаються</li>
                <li>• BackButton недоступний</li>
                <li>• Обмежений HapticFeedback</li>
              </ul>
              <p className="text-xs text-red-600 font-medium">
                РІШЕННЯ: Оновіть Telegram до версії 6.1+
              </p>
            </div>
          </Card>
        )}

        <div className="space-y-3">
          {isOldVersion && (
            <Card className="p-3 border-blue-300 bg-blue-100">
              <h4 className="font-semibold text-blue-800 text-sm mb-2">
                💡 АЛЬТЕРНАТИВНЕ РІШЕННЯ для старих версій:
              </h4>
              <p className="text-xs text-blue-700 mb-2">
                Якщо оновлення неможливе, використайте inline кнопку:
              </p>
              <div className="space-y-2">
                <div className="bg-white p-2 rounded text-xs">
                  <strong>1.</strong> Надішліть боту команду з inline кнопкою
                </div>
                <div className="bg-white p-2 rounded text-xs">
                  <strong>2.</strong> Натисніть inline кнопку (працює у всіх
                  версіях)
                </div>
              </div>
            </Card>
          )}

          <div className="bg-white p-3 rounded border">
            <h4 className="font-semibold text-sm text-gray-800 mb-2">
              1️⃣ Відкрийте @BotFather у Telegram
            </h4>
          </div>

          <div className="bg-white p-3 rounded border">
            <h4 className="font-semibold text-sm text-gray-800 mb-2">
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
          </div>

          <div className="bg-white p-3 rounded border">
            <h4 className="font-semibold text-sm text-gray-800 mb-2">
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
          </div>

          <div className="bg-white p-3 rounded border">
            <h4 className="font-semibold text-sm text-gray-800 mb-2">
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
          </div>

          <div className="bg-white p-3 rounded border">
            <h4 className="font-semibold text-sm text-gray-800 mb-2">
              5️⃣ Перезапустіть Telegram та відкрийте через кнопку меню
            </h4>
          </div>
        </div>

        {/* Код для бота */}
        {isOldVersion && (
          <Card className="p-3 border-green-300 bg-green-50">
            <h4 className="font-semibold text-green-800 text-sm mb-2">
              🤖 Готовий код для бота (працює у всіх версіях):
            </h4>
            <div className="space-y-2">
              <Button
                size="sm"
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() =>
                  copyToClipboard(`import telebot
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
        "Натисніть кнопку нижче для відкриття вашого кошелька:",
        reply_markup=markup
    )

bot.polling(none_stop=True)`)
                }
              >
                📋 Копіювати Python код
              </Button>
              <p className="text-xs text-green-700">
                Цей код створить inline кнопку, яка працює у всіх версіях
                Telegram
              </p>
            </div>
          </Card>
        )}

        <div className="text-center pt-2 border-t">
          <p
            className={`text-xs ${isOldVersion ? "text-orange-600" : "text-red-600"}`}
          >
            {isOldVersion
              ? "Рекомендуємо оновити Telegram або використати inline кнопку"
              : "Після налаштування дані користувача будуть передаватися автоматично"}
          </p>
        </div>
      </div>
    </Card>
  );
};
