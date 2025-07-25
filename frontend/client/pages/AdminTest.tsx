import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export default function AdminTest() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">🚀 Тест Админ Панели</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Всего пользователей</p>
                <p className="text-2xl font-bold text-gray-900">12,847</p>
                <p className="text-sm text-green-600">+12% за неделю</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Общий баланс</p>
                <p className="text-2xl font-bold text-gray-900">$28,475,934</p>
                <p className="text-sm text-green-600">+8.5% за месяц</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ожидающие выводы</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
                <p className="text-sm text-red-600">Требует внимания</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>📊 Последние транзакции</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-green-500">↗️</span>
                <div>
                  <p className="font-medium">crypto_whale_pro</p>
                  <p className="text-sm text-gray-500">3 минуты назад</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">$15,000 USDT</p>
                <p className="text-sm text-green-600">Депозит завершен</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-blue-500">🔄</span>
                <div>
                  <p className="font-medium">bitcoin_trader</p>
                  <p className="text-sm text-gray-500">15 минут назад</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">$8,500 BTC</p>
                <p className="text-sm text-blue-600">Покупка завершена</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-yellow-500">⏳</span>
                <div>
                  <p className="font-medium">day_trader_99</p>
                  <p className="text-sm text-gray-500">1 час назад</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">$5,250 USDT</p>
                <p className="text-sm text-yellow-600">Вывод ожидает</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>🏆 Топ активы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span>₿</span>
                  <span className="font-medium">Bitcoin</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">$4,258,234</p>
                  <p className="text-sm text-green-600">+3.67%</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span>Ξ</span>
                  <span className="font-medium">Ethereum</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">$2,876,543</p>
                  <p className="text-sm text-red-600">-0.89%</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span>💎</span>
                  <span className="font-medium">Toncoin</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">$856,789</p>
                  <p className="text-sm text-green-600">+8.45%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🎯 Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Проверить выводы</span>
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">24</span>
                </div>
              </button>
              
              <button className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Управление клиентами</span>
                  <span className="text-gray-500">12,847</span>
                </div>
              </button>
              
              <button className="w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Настройки активов</span>
                  <span className="text-gray-500">22</span>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-4 bg-green-100 rounded-lg">
        <p className="text-green-800 font-medium">✅ Админ панель работает!</p>
        <p className="text-green-700 text-sm mt-1">
          Все компоненты загружены корректно. Данные отображаются правильно.
        </p>
      </div>
    </div>
  );
}
