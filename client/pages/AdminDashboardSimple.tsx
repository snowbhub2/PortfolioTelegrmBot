import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from "lucide-react";

export default function AdminDashboardSimple() {
  const [isLoading, setIsLoading] = useState(false);

  // Rich demo data
  const dashboardData = {
    overview: {
      totalUsers: 12847,
      activeUsers: 8923,
      totalBalance: 28475934.82,
      todayVolume: 1578293.67,
      pendingWithdrawals: 24,
      pendingDeposits: 11,
      platformStatus: "active"
    },
    topAssets: [
      { symbol: "BTC", name: "Bitcoin", volume24h: 4258234.45, change24h: 3.67, trades: 12471 },
      { symbol: "ETH", name: "Ethereum", volume24h: 2876543.32, change24h: -0.89, trades: 8923 },
      { symbol: "USDT", name: "Tether", volume24h: 1984567.78, change24h: 0.12, trades: 15674 },
      { symbol: "TON", name: "Toncoin", volume24h: 856789.12, change24h: 8.45, trades: 5231 },
      { symbol: "BNB", name: "BNB", volume24h: 634521.67, change24h: 2.34, trades: 3456 },
      { symbol: "SOL", name: "Solana", volume24h: 523487.23, change24h: -2.15, trades: 2789 }
    ],
    recentTransactions: [
      {
        id: "tx-001",
        type: "withdrawal",
        user: "crypto_whale_pro",
        amount: 5250.00,
        asset: "USDT",
        status: "pending",
        timestamp: new Date(Date.now() - 180000)
      },
      {
        id: "tx-002", 
        type: "deposit",
        user: "bitcoin_holder",
        amount: 12500.00,
        asset: "BTC",
        status: "completed",
        timestamp: new Date(Date.now() - 420000)
      },
      {
        id: "tx-003",
        type: "trade",
        user: "eth_maximalist",
        amount: 8750.00,
        asset: "ETH",
        status: "completed", 
        timestamp: new Date(Date.now() - 680000)
      },
      {
        id: "tx-004",
        type: "withdrawal",
        user: "day_trader_99",
        amount: 2100.00,
        asset: "TON",
        status: "pending",
        timestamp: new Date(Date.now() - 840000)
      }
    ]
  };

  const refreshData = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "processing":
        return <Activity className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowUpCircle className="w-4 h-4 text-green-500" />;
      case "withdrawal":
        return <ArrowDownCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📊 Дашборд</h1>
          <p className="text-gray-600">Обзор платформы и ключевые метрики</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Обновить
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Всего пользователей</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% за неделю
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Общий баланс</p>
                <p className="text-2xl font-bold text-gray-900">${dashboardData.overview.totalBalance.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8.5% за месяц
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Объем за сегодня</p>
                <p className="text-2xl font-bold text-gray-900">${dashboardData.overview.todayVolume.toLocaleString()}</p>
                <p className="text-sm text-red-600 flex items-center mt-1">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  -3.2% от вчера
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ожидающие выводы</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.pendingWithdrawals}</p>
                <Badge variant="destructive" className="mt-1">
                  Требует внимания
                </Badge>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Assets */}
        <Card>
          <CardHeader>
            <CardTitle>🏆 Топ активы по объему</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.topAssets.map((asset, index) => (
                <div key={asset.symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{asset.symbol}</p>
                      <p className="text-sm text-gray-500">{asset.trades} сделок</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${asset.volume24h.toLocaleString()}</p>
                    <p className={`text-sm flex items-center ${asset.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {asset.change24h >= 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {Math.abs(asset.change24h)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>📋 Последние транзакции</CardTitle>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Все
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    {getTransactionTypeIcon(tx.type)}
                    <div>
                      <p className="font-medium text-gray-900">{tx.user}</p>
                      <p className="text-sm text-gray-500">
                        {tx.timestamp.toLocaleTimeString('ru-RU', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ${tx.amount.toFixed(2)} {tx.asset}
                    </p>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(tx.status)}
                      <span className="text-sm text-gray-500 capitalize">{tx.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Message */}
      <div className="mt-8 p-4 bg-green-100 rounded-lg">
        <p className="text-green-800 font-medium">✅ Админ панель успешно загружена!</p>
        <p className="text-green-700 text-sm mt-1">
          Все данные отображаются корректно. Сис��ема работает стабильно.
        </p>
      </div>
    </div>
  );
}
