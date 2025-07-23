import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  MessageCircle,
  Ban,
  UserCheck,
  Edit,
  Eye,
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
  Activity,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  Wallet,
  BarChart3
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface ClientData {
  id: string;
  telegramId: string;
  username: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  registrationDate: Date;
  lastActive: Date;
  status: "active" | "inactive" | "banned" | "pending";
  balanceUSD: number;
  totalDeposits: number;
  totalWithdrawals: number;
  tradesCount: number;
  totalVolume: number;
  verificationLevel: "none" | "basic" | "advanced";
  country?: string;
  riskLevel: "low" | "medium" | "high";
  notes?: string;
}

interface Transaction {
  id: string;
  type: "buy" | "sell" | "deposit" | "withdraw";
  assetId?: string;
  amount: number;
  price?: number;
  timestamp: Date;
  status: "completed" | "pending" | "failed";
  description: string;
}

interface Asset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercentage: number;
}

export default function AdminClientDetail() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [balanceHistory, setBalanceHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    loadClientData();
  }, [clientId]);

  const loadClientData = async () => {
    setIsLoading(true);
    
    // Mock client data
    const mockClient: ClientData = {
      id: clientId!,
      telegramId: "1234567890",
      username: "crypto_trader",
      firstName: "Иван",
      lastName: "Петров",
      email: "ivan.petrov@example.com",
      phone: "+380123456789",
      registrationDate: new Date("2024-01-15"),
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: "active",
      balanceUSD: 5247.82,
      totalDeposits: 15000,
      totalWithdrawals: 3200,
      tradesCount: 89,
      totalVolume: 45230.50,
      verificationLevel: "basic",
      country: "Ukraine",
      riskLevel: "medium",
      notes: "Активный трейдер, регулярно пополняет счет"
    };

    // Mock transactions
    const mockTransactions: Transaction[] = [
      {
        id: "tx-1",
        type: "deposit",
        amount: 1000,
        timestamp: new Date(Date.now() - 3600000),
        status: "completed",
        description: "Пополнение через Telegram Stars"
      },
      {
        id: "tx-2", 
        type: "buy",
        assetId: "btc",
        amount: 500,
        price: 45000,
        timestamp: new Date(Date.now() - 7200000),
        status: "completed",
        description: "Покупка Bitcoin"
      },
      {
        id: "tx-3",
        type: "withdraw",
        amount: 200,
        timestamp: new Date(Date.now() - 10800000),
        status: "pending",
        description: "Вывод в Telegram Stars"
      }
    ];

    // Mock assets
    const mockAssets: Asset[] = [
      {
        id: "btc",
        symbol: "BTC",
        name: "Bitcoin",
        quantity: 0.0234,
        avgPrice: 44500,
        currentPrice: 46000,
        value: 1076.40,
        pnl: 35.10,
        pnlPercentage: 3.37
      },
      {
        id: "eth",
        symbol: "ETH", 
        name: "Ethereum",
        quantity: 1.5,
        avgPrice: 2800,
        currentPrice: 2950,
        value: 4425.00,
        pnl: 225.00,
        pnlPercentage: 5.36
      }
    ];

    // Mock balance history
    const mockBalanceHistory = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      balance: 3000 + Math.random() * 3000 + i * 50,
      deposits: Math.random() * 1000,
      withdrawals: Math.random() * 500
    }));

    setClient(mockClient);
    setTransactions(mockTransactions);
    setAssets(mockAssets);
    setBalanceHistory(mockBalanceHistory);
    setIsLoading(false);
  };

  const sendTelegramMessage = async () => {
    if (!messageText.trim()) return;
    
    setIsSendingMessage(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In real app, would send message via Telegram Bot API
    alert(`Сообщение отправлено пользователю ${client?.username}:\n\n${messageText}`);
    setMessageText("");
    setIsSendingMessage(false);
  };

  const updateClientStatus = async (newStatus: string) => {
    if (!client) return;
    
    const confirmMessage = newStatus === "banned" 
      ? "Вы уверены, что хотите заблокировать этого пользователя?"
      : `Изменить статус пользователя на "${newStatus}"?`;
      
    if (confirm(confirmMessage)) {
      setClient({ ...client, status: newStatus as any });
      alert(`Статус пользователя изменен на "${newStatus}"`);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      banned: "bg-red-100 text-red-800", 
      pending: "bg-yellow-100 text-yellow-800"
    };
    
    const labels = {
      active: "Активен",
      inactive: "Неактивен",
      banned: "Заблокирован",
      pending: "Ожидание"
    };

    return (
      <Badge className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowUpCircle className="w-4 h-4 text-green-500" />;
      case "withdraw":
        return <ArrowDownCircle className="w-4 h-4 text-red-500" />;
      case "buy":
      case "sell":
        return <Activity className="w-4 h-4 text-blue-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "failed":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading || !client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка данных клиента...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/admin/clients")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {client.firstName} {client.lastName}
            </h1>
            <p className="text-gray-600">@{client.username} • ID: {client.telegramId}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <MessageCircle className="w-4 h-4 mr-2" />
                Написать в Telegram
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Отправить сообщение в Telegram</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="message">Сообщение для {client.username}</Label>
                  <Textarea
                    id="message"
                    placeholder="Введите ваше сообщение..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setMessageText("")}
                  >
                    Отмена
                  </Button>
                  <Button
                    onClick={sendTelegramMessage}
                    disabled={!messageText.trim() || isSendingMessage}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSendingMessage ? "Отправка..." : "Отправить"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Client Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="text-lg">
                  {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {getStatusBadge(client.status)}
                  <Badge variant="outline">
                    {client.verificationLevel === "none" ? "Не верифицирован" : 
                     client.verificationLevel === "basic" ? "Базовая верификация" : "Полная верификация"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Регистрация: {client.registrationDate.toLocaleDateString('ru-RU')}
                </p>
                <p className="text-sm text-gray-600">
                  Последняя активность: {client.lastActive.toLocaleString('ru-RU')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Текущий баланс</p>
                <p className="text-2xl font-bold text-gray-900">${client.balanceUSD.toFixed(2)}</p>
                <p className="text-sm text-gray-600">
                  Всего активов: ${(client.balanceUSD + assets.reduce((sum, asset) => sum + asset.value, 0)).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Wallet className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Объем торгов</p>
                <p className="text-2xl font-bold text-gray-900">${client.totalVolume.toFixed(0)}</p>
                <p className="text-sm text-gray-600">
                  {client.tradesCount} сделок
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        {client.status === "active" && (
          <Button
            variant="outline" 
            onClick={() => updateClientStatus("banned")}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Ban className="w-4 h-4 mr-2" />
            Заблокировать
          </Button>
        )}
        {client.status === "banned" && (
          <Button
            variant="outline"
            onClick={() => updateClientStatus("active")}
            className="text-green-600 border-green-200 hover:bg-green-50"
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Разблокировать
          </Button>
        )}
        <Button variant="outline">
          <Edit className="w-4 h-4 mr-2" />
          Редактировать
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="transactions">Транзакции</TabsTrigger>
          <TabsTrigger value="assets">Активы</TabsTrigger>
          <TabsTrigger value="notes">Заметки</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Balance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>История баланса</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={balanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })} 
                  />
                  <YAxis tickFormatter={(value) => `$${value.toFixed(0)}`} />
                  <Tooltip 
                    formatter={(value: any) => [`$${value.toFixed(2)}`, 'Баланс']}
                    labelFormatter={(date) => new Date(date).toLocaleDateString('ru-RU')}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.2} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Всего пополнений</p>
                    <p className="text-2xl font-bold text-green-600">${client.totalDeposits.toFixed(2)}</p>
                  </div>
                  <ArrowUpCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Всего выводов</p>
                    <p className="text-2xl font-bold text-red-600">${client.totalWithdrawals.toFixed(2)}</p>
                  </div>
                  <ArrowDownCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Прибыль/Убыток</p>
                    <p className="text-2xl font-bold text-green-600">
                      +${(assets.reduce((sum, asset) => sum + asset.pnl, 0)).toFixed(2)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>История транзакций</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getTransactionIcon(tx.type)}
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-sm text-gray-500">
                          {tx.timestamp.toLocaleString('ru-RU')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${tx.amount.toFixed(2)}</p>
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
        </TabsContent>

        <TabsContent value="assets">
          <Card>
            <CardHeader>
              <CardTitle>Портфель активов</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Актив</TableHead>
                    <TableHead>Количество</TableHead>
                    <TableHead>Средняя цена</TableHead>
                    <TableHead>Текущая цена</TableHead>
                    <TableHead>Стоимость</TableHead>
                    <TableHead>P&L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{asset.symbol}</p>
                          <p className="text-sm text-gray-500">{asset.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>{asset.quantity}</TableCell>
                      <TableCell>${asset.avgPrice.toFixed(2)}</TableCell>
                      <TableCell>${asset.currentPrice.toFixed(2)}</TableCell>
                      <TableCell>${asset.value.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className={asset.pnl >= 0 ? "text-green-600" : "text-red-600"}>
                          <p className="font-medium">
                            {asset.pnl >= 0 ? "+" : ""}${asset.pnl.toFixed(2)}
                          </p>
                          <p className="text-sm">
                            {asset.pnl >= 0 ? "+" : ""}{asset.pnlPercentage.toFixed(2)}%
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Заметки администратора</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea 
                  placeholder="Добавить заметку о клиенте..."
                  value={client.notes || ""}
                  onChange={(e) => setClient({ ...client, notes: e.target.value })}
                  rows={6}
                />
                <Button>
                  Сохранить заметки
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
