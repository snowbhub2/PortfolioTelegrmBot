import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  X,
  Clock,
  AlertTriangle,
  RefreshCw,
  Download,
  ArrowUpCircle,
  ArrowDownCircle,
  Activity,
  MessageCircle,
  DollarSign,
  TrendingUp,
  BarChart3
} from "lucide-react";

interface Transaction {
  id: string;
  userId: string;
  username: string;
  type: "deposit" | "withdraw" | "buy" | "sell" | "transfer";
  assetId?: string;
  amount: number;
  price?: number;
  fee: number;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  timestamp: Date;
  description: string;
  hash?: string;
  address?: string;
  network?: string;
  notes?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

export default function AdminTransactions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "all";
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setIsLoading(true);
    
    // Mock transactions data
    const mockTransactions: Transaction[] = Array.from({ length: 100 }, (_, i) => {
      const types = ["deposit", "withdraw", "buy", "sell", "transfer"];
      const statuses = ["pending", "processing", "completed", "failed"];
      const type = types[Math.floor(Math.random() * types.length)] as any;
      const status = statuses[Math.floor(Math.random() * statuses.length)] as any;
      
      // Increase pending withdrawals for demo
      const finalStatus = (type === "withdraw" && Math.random() < 0.4) ? "pending" : status;
      
      return {
        id: `tx-${i + 1}`,
        userId: `user-${Math.floor(Math.random() * 100)}`,
        username: `user_${Math.floor(Math.random() * 1000)}`,
        type,
        assetId: type === "buy" || type === "sell" ? ["btc", "eth", "usdt"][Math.floor(Math.random() * 3)] : undefined,
        amount: Math.random() * 10000,
        price: type === "buy" || type === "sell" ? Math.random() * 50000 : undefined,
        fee: Math.random() * 50,
        status: finalStatus,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} transaction`,
        hash: Math.random().toString(36).substring(2, 15),
        address: type === "withdraw" ? "0x" + Math.random().toString(36).substring(2, 42) : undefined,
        network: type === "withdraw" ? ["ETH", "BSC", "TRX"][Math.floor(Math.random() * 3)] : undefined
      };
    });

    setTransactions(mockTransactions);
    setFilteredTransactions(mockTransactions);
    setIsLoading(false);
  };

  // Filter transactions based on tab and filters
  useEffect(() => {
    let filtered = transactions;

    // Filter by tab
    if (tab === "withdrawals") {
      filtered = filtered.filter(tx => tx.type === "withdraw");
    } else if (tab === "deposits") {
      filtered = filtered.filter(tx => tx.type === "deposit");
    } else if (tab === "trades") {
      filtered = filtered.filter(tx => tx.type === "buy" || tx.type === "sell");
    }

    // Apply additional filters
    filtered = filtered.filter(tx => {
      const matchesSearch = searchQuery === "" || 
        tx.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.hash?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === "all" || tx.type === typeFilter;
      const matchesStatus = statusFilter === "all" || tx.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });

    setFilteredTransactions(filtered);
  }, [transactions, tab, searchQuery, typeFilter, statusFilter]);

  const approveTransaction = async (transactionId: string) => {
    setTransactions(transactions.map(tx => 
      tx.id === transactionId 
        ? { ...tx, status: "completed", approvedBy: "admin-1" }
        : tx
    ));
    setSelectedTransaction(null);
  };

  const rejectTransaction = async (transactionId: string) => {
    if (!rejectionReason.trim()) {
      alert("Пожалуйста, укажите причину отклонения");
      return;
    }

    setTransactions(transactions.map(tx => 
      tx.id === transactionId 
        ? { ...tx, status: "failed", rejectionReason, approvedBy: "admin-1" }
        : tx
    ));
    setSelectedTransaction(null);
    setRejectionReason("");
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800"
    };
    
    const labels = {
      pending: "Ожидает",
      processing: "Обработка",
      completed: "Завершено",
      failed: "Отклонено",
      cancelled: "Отменено"
    };

    return (
      <Badge className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
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

  const getTypeBadge = (type: string) => {
    const styles = {
      deposit: "bg-green-100 text-green-800",
      withdraw: "bg-red-100 text-red-800",
      buy: "bg-blue-100 text-blue-800",
      sell: "bg-purple-100 text-purple-800",
      transfer: "bg-gray-100 text-gray-800"
    };
    
    const labels = {
      deposit: "Пополнение",
      withdraw: "Вывод",
      buy: "Покупка",
      sell: "Продажа",
      transfer: "Перевод"
    };

    return (
      <Badge variant="outline" className={styles[type as keyof typeof styles]}>
        {labels[type as keyof typeof labels]}
      </Badge>
    );
  };

  const exportTransactions = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,User,Type,Asset,Amount,Status,Date,Hash\n" +
      filteredTransactions.map(tx => 
        `${tx.id},${tx.username},${tx.type},${tx.assetId || 'N/A'},${tx.amount},${tx.status},${tx.timestamp.toISOString()},${tx.hash || 'N/A'}`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transactions_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Statistics
  const stats = {
    total: transactions.length,
    pending: transactions.filter(tx => tx.status === "pending").length,
    completed: transactions.filter(tx => tx.status === "completed").length,
    totalVolume: transactions.reduce((sum, tx) => sum + tx.amount, 0),
    pendingWithdrawals: transactions.filter(tx => tx.type === "withdraw" && tx.status === "pending").length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Управление транзакциями</h1>
          <p className="text-gray-600">
            Всего транзакций: {stats.total} • Ожидают: {stats.pending} • Общий объем: ${stats.totalVolume.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={exportTransactions}
          >
            <Download className="w-4 h-4 mr-2" />
            Экспорт
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadTransactions}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Обновить
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Всего транзакций</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ожидают подтверждения</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Выводы на подтверждении</p>
                <p className="text-2xl font-bold text-red-600">{stats.pendingWithdrawals}</p>
              </div>
              <ArrowDownCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Общий объем</p>
                <p className="text-2xl font-bold text-green-600">${stats.totalVolume.toFixed(0)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Actions Alert */}
      {stats.pendingWithdrawals > 0 && (
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            У вас {stats.pendingWithdrawals} выводов ожидают подтверждения. Пожалуйста, проверьте их как можно скорее.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs 
        value={tab} 
        onValueChange={(value) => {
          const newParams = new URLSearchParams(searchParams);
          newParams.set("tab", value);
          setSearchParams(newParams);
        }}
      >
        <TabsList>
          <TabsTrigger value="all">Все транзакции</TabsTrigger>
          <TabsTrigger value="withdrawals">
            Выводы
            {stats.pendingWithdrawals > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                {stats.pendingWithdrawals}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="deposits">Пополнения</TabsTrigger>
          <TabsTrigger value="trades">Торговля</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Поиск по пользователю, ID, хешу..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    <SelectItem value="deposit">Пополнения</SelectItem>
                    <SelectItem value="withdraw">Выводы</SelectItem>
                    <SelectItem value="buy">Покупки</SelectItem>
                    <SelectItem value="sell">Продажи</SelectItem>
                    <SelectItem value="transfer">Переводы</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="pending">Ожидают</SelectItem>
                    <SelectItem value="processing">Обработка</SelectItem>
                    <SelectItem value="completed">Завершено</SelectItem>
                    <SelectItem value="failed">Отклонено</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {filteredTransactions.length} результатов
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Транзакция</TableHead>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>Сумма</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.slice(0, 50).map((tx) => (
                      <TableRow key={tx.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {getTypeIcon(tx.type)}
                            <div>
                              <p className="font-medium text-gray-900">{tx.id}</p>
                              {tx.hash && (
                                <p className="text-xs text-gray-500 font-mono">
                                  {tx.hash.substring(0, 16)}...
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{tx.username}</p>
                            <p className="text-sm text-gray-500">{tx.userId}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {getTypeBadge(tx.type)}
                            {tx.assetId && (
                              <p className="text-xs text-gray-500 uppercase">{tx.assetId}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">${tx.amount.toFixed(2)}</p>
                            {tx.fee > 0 && (
                              <p className="text-xs text-gray-500">Комиссия: ${tx.fee.toFixed(2)}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(tx.status)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">
                              {tx.timestamp.toLocaleDateString('ru-RU')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {tx.timestamp.toLocaleTimeString('ru-RU')}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedTransaction(tx)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Детали транзакции {tx.id}</DialogTitle>
                                </DialogHeader>
                                {selectedTransaction && (
                                  <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Пользователь</Label>
                                        <p className="text-sm">{selectedTransaction.username} ({selectedTransaction.userId})</p>
                                      </div>
                                      <div>
                                        <Label>Тип транзакции</Label>
                                        <p className="text-sm">{getTypeBadge(selectedTransaction.type)}</p>
                                      </div>
                                      <div>
                                        <Label>Сумма</Label>
                                        <p className="text-sm font-medium">${selectedTransaction.amount.toFixed(2)}</p>
                                      </div>
                                      <div>
                                        <Label>Комиссия</Label>
                                        <p className="text-sm">${selectedTransaction.fee.toFixed(2)}</p>
                                      </div>
                                      <div>
                                        <Label>Статус</Label>
                                        <p className="text-sm">{getStatusBadge(selectedTransaction.status)}</p>
                                      </div>
                                      <div>
                                        <Label>Дата</Label>
                                        <p className="text-sm">{selectedTransaction.timestamp.toLocaleString('ru-RU')}</p>
                                      </div>
                                      {selectedTransaction.hash && (
                                        <div className="col-span-2">
                                          <Label>Хеш транзакции</Label>
                                          <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                                            {selectedTransaction.hash}
                                          </p>
                                        </div>
                                      )}
                                      {selectedTransaction.address && (
                                        <div className="col-span-2">
                                          <Label>Адрес получателя</Label>
                                          <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                                            {selectedTransaction.address}
                                          </p>
                                        </div>
                                      )}
                                    </div>

                                    {selectedTransaction.status === "pending" && selectedTransaction.type === "withdraw" && (
                                      <div className="space-y-4 border-t pt-4">
                                        <h4 className="font-medium">Действия по транзакции</h4>
                                        <div className="flex space-x-3">
                                          <Button
                                            onClick={() => approveTransaction(selectedTransaction.id)}
                                            className="bg-green-600 hover:bg-green-700"
                                          >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Одобрить
                                          </Button>
                                          <Dialog>
                                            <DialogTrigger asChild>
                                              <Button variant="destructive">
                                                <X className="w-4 h-4 mr-2" />
                                                Отклонить
                                              </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                              <DialogHeader>
                                                <DialogTitle>Отклонить транзакцию</DialogTitle>
                                              </DialogHeader>
                                              <div className="space-y-4">
                                                <div>
                                                  <Label htmlFor="reason">Причина отклонения</Label>
                                                  <Textarea
                                                    id="reason"
                                                    placeholder="Укажите причину отклонения транзакции..."
                                                    value={rejectionReason}
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                    rows={3}
                                                  />
                                                </div>
                                                <div className="flex justify-end space-x-2">
                                                  <Button variant="outline">
                                                    Отмена
                                                  </Button>
                                                  <Button
                                                    variant="destructive"
                                                    onClick={() => rejectTransaction(selectedTransaction.id)}
                                                  >
                                                    Отклонить
                                                  </Button>
                                                </div>
                                              </div>
                                            </DialogContent>
                                          </Dialog>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
