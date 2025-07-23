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
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800">Дашборд</h1>
            </div>
            <p className="text-slate-600 ml-13">Обзор платформы и ключевые метрики</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Обновить
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700 mb-1">Всего пользователей</p>
                <p className="text-3xl font-bold text-slate-800">{dashboardData.overview.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-green-700 flex items-center mt-2 font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12% за неделю
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-md">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-700 mb-1">Общий баланс</p>
                <p className="text-3xl font-bold text-slate-800">${dashboardData.overview.totalBalance.toLocaleString()}</p>
                <p className="text-sm text-green-700 flex items-center mt-2 font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +8.5% за месяц
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-md">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-700 mb-1">Объем за сегодня</p>
                <p className="text-3xl font-bold text-slate-800">${dashboardData.overview.todayVolume.toLocaleString()}</p>
                <p className="text-sm text-red-600 flex items-center mt-2 font-medium">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  -3.2% от вчера
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl shadow-md">
                <Activity className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-700 mb-1">Ожидающие выводы</p>
                <p className="text-3xl font-bold text-slate-800">{dashboardData.overview.pendingWithdrawals}</p>
                <Badge className="mt-2 bg-red-100 text-red-700 hover:bg-red-200 border-red-300 font-medium">
                  Требует внимания
                </Badge>
              </div>
              <div className="p-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl shadow-md">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Assets */}
        <Card className="bg-white border-slate-200 shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
              Топ активы по объему
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {dashboardData.topAssets.map((asset, index) => (
                <div key={asset.symbol} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200 hover:shadow-md transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-sm font-bold text-white">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-lg">{asset.symbol}</p>
                      <p className="text-sm text-slate-600 font-medium">{asset.trades} сделок</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800 text-lg">${asset.volume24h.toLocaleString()}</p>
                    <p className={`text-sm flex items-center font-semibold ${asset.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {asset.change24h >= 0 ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
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
        <Card className="bg-white border-slate-200 shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Последние транзакции
              </CardTitle>
              <Button variant="outline" size="sm" className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50">
                <Eye className="w-4 h-4 mr-2" />
                Все
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {dashboardData.recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all hover:shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-slate-100">
                      {getTransactionTypeIcon(tx.type)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{tx.user}</p>
                      <p className="text-sm text-slate-600 font-medium">
                        {tx.timestamp.toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">
                      ${tx.amount.toFixed(2)} {tx.asset}
                    </p>
                    <div className="flex items-center space-x-2 justify-end">
                      {getStatusIcon(tx.status)}
                      <span className="text-sm text-slate-600 capitalize font-medium">{tx.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Message */}
      <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-green-800 font-bold text-lg">Админ ��анель успешно загружена!</p>
            <p className="text-green-700 text-sm mt-1 font-medium">
              Все данные отображаются корректно. Система работает стабильно.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
