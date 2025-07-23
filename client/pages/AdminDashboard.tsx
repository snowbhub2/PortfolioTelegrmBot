import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  RefreshCw
} from "lucide-react";

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(false);

  // Rich demo data for admin panel
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalUsers: 12847,
      activeUsers: 8923,
      totalBalance: 28475934.82,
      todayVolume: 1578293.67,
      pendingWithdrawals: 24,
      pendingDeposits: 11,
      platformStatus: "active"
    },
    revenueData: [
      { date: "2024-12-01", revenue: 125000, trades: 892, users: 245 },
      { date: "2024-12-02", revenue: 158000, trades: 1256, users: 367 },
      { date: "2024-12-03", revenue: 189000, trades: 1567, users: 489 },
      { date: "2024-12-04", revenue: 224000, trades: 1894, users: 612 },
      { date: "2024-12-05", revenue: 267000, trades: 2123, users: 734 },
      { date: "2024-12-06", revenue: 298000, trades: 2456, users: 856 },
      { date: "2024-12-07", revenue: 334000, trades: 2789, users: 978 },
      { date: "2024-12-08", revenue: 312000, trades: 2634, users: 923 },
      { date: "2024-12-09", revenue: 367000, trades: 2912, users: 1045 },
      { date: "2024-12-10", revenue: 389000, trades: 3123, users: 1178 },
      { date: "2024-12-11", revenue: 423000, trades: 3456, users: 1289 },
      { date: "2024-12-12", revenue: 445000, trades: 3678, users: 1356 },
      { date: "2024-12-13", revenue: 467000, trades: 3834, users: 1423 },
      { date: "2024-12-14", revenue: 512000, trades: 4123, users: 1567 },
      { date: "2024-12-15", revenue: 534000, trades: 4289, users: 1634 },
      { date: "2024-12-16", revenue: 567000, trades: 4567, users: 1723 },
      { date: "2024-12-17", revenue: 589000, trades: 4734, users: 1812 },
      { date: "2024-12-18", revenue: 612000, trades: 4923, users: 1889 },
      { date: "2024-12-19", revenue: 634000, trades: 5123, users: 1967 },
      { date: "2024-12-20", revenue: 678000, trades: 5456, users: 2045 },
      { date: "2024-12-21", revenue: 689000, trades: 5567, users: 2123 },
      { date: "2024-12-22", revenue: 723000, trades: 5834, users: 2234 },
      { date: "2024-12-23", revenue: 756000, trades: 6123, users: 2345 },
      { date: "2024-12-24", revenue: 734000, trades: 5923, users: 2278 },
      { date: "2024-12-25", revenue: 645000, trades: 5234, users: 2123 },
      { date: "2024-12-26", revenue: 712000, trades: 5734, users: 2189 },
      { date: "2024-12-27", revenue: 789000, trades: 6234, users: 2345 },
      { date: "2024-12-28", revenue: 823000, trades: 6567, users: 2456 },
      { date: "2024-12-29", revenue: 867000, trades: 6834, users: 2567 },
      { date: "2024-12-30", revenue: 912000, trades: 7123, users: 2678 }
    ],
    assetDistribution: [
      { name: "BTC", value: 35, amount: 995663.20, color: "#f7931a" },
      { name: "ETH", value: 28, amount: 797126.16, color: "#627eea" },
      { name: "USD", value: 20, amount: 569518.68, color: "#22c55e" },
      { name: "USDT", value: 12, amount: 341711.21, color: "#26a69a" },
      { name: "Другие", value: 5, amount: 142573.17, color: "#94a3b8" }
    ],
    topAssets: [
      { symbol: "BTC", name: "Bitcoin", volume24h: 425823.45, change24h: 2.34, trades: 1247 },
      { symbol: "ETH", name: "Ethereum", volume24h: 287654.32, change24h: -1.23, trades: 892 },
      { symbol: "USDT", name: "Tether", volume24h: 198456.78, change24h: 0.02, trades: 567 },
      { symbol: "BNB", name: "Binance Coin", volume24h: 156789.12, change24h: 4.56, trades: 423 }
    ],
    recentTransactions: [
      {
        id: "tx-001",
        type: "withdrawal",
        user: "user_1247",
        amount: 1250.00,
        asset: "USDT",
        status: "pending",
        timestamp: new Date(Date.now() - 300000)
      },
      {
        id: "tx-002", 
        type: "deposit",
        user: "user_0892",
        amount: 500.00,
        asset: "BTC",
        status: "completed",
        timestamp: new Date(Date.now() - 600000)
      },
      {
        id: "tx-003",
        type: "trade",
        user: "user_0445",
        amount: 2500.00,
        asset: "ETH",
        status: "completed", 
        timestamp: new Date(Date.now() - 900000)
      }
    ]
  });

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
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
          <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>
          <p className="text-gray-600">Обзор платформы и ключевые метрики</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Сегодня</SelectItem>
              <SelectItem value="7d">7 дней</SelectItem>
              <SelectItem value="30d">30 дней</SelectItem>
              <SelectItem value="90d">90 дней</SelectItem>
            </SelectContent>
          </Select>
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Доходы и активность</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="revenue" className="space-y-4">
              <TabsList>
                <TabsTrigger value="revenue">Доходы</TabsTrigger>
                <TabsTrigger value="trades">Сделки</TabsTrigger>
                <TabsTrigger value="users">Пользователи</TabsTrigger>
              </TabsList>
              
              <TabsContent value="revenue">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dashboardData.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })} />
                    <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Доходы']} />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="trades">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })} />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, 'Сделки']} />
                    <Bar dataKey="trades" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="users">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })} />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, 'Новые пользователи']} />
                    <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Asset Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Распределение активов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={dashboardData.assetDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value}%`}
                  >
                    {dashboardData.assetDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-2">
                {dashboardData.assetDistribution.map((asset) => (
                  <div key={asset.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: asset.color }}
                      />
                      <span className="font-medium">{asset.name}</span>
                    </div>
                    <span className="text-gray-600">${asset.amount.toLocaleString()}</span>
                  </div>
                ))}
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
            <CardTitle>Топ активы по объему</CardTitle>
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
              <CardTitle>Последние транзакции</CardTitle>
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
    </div>
  );
}
