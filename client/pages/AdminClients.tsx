import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Search,
  Filter,
  Eye,
  MessageCircle,
  MoreHorizontal,
  UserCheck,
  UserX,
  Download,
  RefreshCw,
  ArrowUpDown,
  TrendingUp,
  TrendingDown
} from "lucide-react";

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
}

export default function AdminClients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientData[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof ClientData>("registrationDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Mock data - in real app would come from API
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const realNames = [
      ["Александр", "Иванов"], ["Мария", "Петрова"], ["Дмитрий", "Сидоров"], ["Елена", "Козлова"],
      ["Сергей", "Попов"], ["Анна", "Волкова"], ["Михаил", "Соколов"], ["Ольга", "Зайцева"],
      ["Владимир", "Лебедев"], ["Татьяна", "Новикова"], ["Игорь", "Морозов"], ["Наталья", "Павлова"],
      ["Алексей", "Волков"], ["Светлана", "Семенова"], ["Андрей", "Голубев"], ["Ирина", "Виноградова"],
      ["Николай", "Богданов"], ["Юлия", "Воробьева"], ["Василий", "Федоров"], ["Екатерина", "Михайлова"],
      ["Константин", "Беляев"], ["Людмила", "Тарасова"], ["Геннадий", "Белов"], ["Валентина", "Комарова"],
      ["Виктор", "Орлов"], ["Галина", "Киселева"], ["Анатолий", "Макаров"], ["Вера", "Ильина"],
      ["Евгений", "Костин"], ["Любовь", "Гусева"], ["Валерий", "Титов"], ["Надежда", "Кузнецова"],
      ["Борис", "Кудрявцев"], ["Раиса", "Максимова"], ["Станислав", "Сергеев"], ["Зинаида", "Николаева"],
      ["Петр", "Щербаков"], ["Лариса", "Степанова"], ["Виталий", "Романов"], ["Марина", "Понома��ева"],
      ["Олег", "Захаров"], ["Тамара", "Григорьева"], ["Роман", "Данилов"], ["Инна", "Савельева"],
      ["Юрий", "Жуков"], ["Елизавета", "Яковлева"], ["Павел", "Антонов"], ["Нина", "Арсеньева"],
      ["Валентин", "Демидов"], ["Лидия", "Крылова"], ["Максим", "Мамонтов"], ["Альбина", "Денисова"]
    ];

    const usernames = [
      "crypto_king", "bitcoin_trader", "eth_holder", "moon_rider", "diamond_hands",
      "whale_watcher", "alt_hunter", "hodl_master", "day_trader", "swing_pro",
      "profit_seeker", "chart_master", "bull_runner", "bear_fighter", "trend_follower",
      "risk_taker", "safe_player", "volume_tracker", "price_action", "technical_guru",
      "fundamental_guy", "news_trader", "scalper_pro", "position_trader", "arbitrage_king",
      "defi_lover", "nft_collector", "yield_farmer", "liquidity_provider", "staking_master",
      "mining_expert", "blockchain_dev", "crypto_analyst", "market_maker", "institutional_player",
      "retail_hero", "degen_trader", "conservative_investor", "momentum_trader", "value_hunter",
      "growth_seeker", "income_generator", "capital_preserver", "wealth_builder", "fortune_maker",
      "money_manager", "asset_allocator", "portfolio_optimizer", "diversification_king", "hedge_fund_wannabe"
    ];

    const countries = ["Ukraine", "Russia", "Belarus", "Kazakhstan", "Poland", "Germany", "USA", "Canada"];

    const mockClients: ClientData[] = Array.from({ length: 150 }, (_, i) => {
      const nameIndex = i % realNames.length;
      const usernameIndex = i % usernames.length;
      const [firstName, lastName] = realNames[nameIndex];
      const username = usernames[usernameIndex] + (i > 49 ? `_${Math.floor(i/50)}` : "");

      const registrationDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
      const daysSinceReg = (Date.now() - registrationDate.getTime()) / (24 * 60 * 60 * 1000);

      // More realistic data based on registration time
      const isActive = Math.random() < 0.85;
      const status = isActive ?
        (Math.random() < 0.05 ? "banned" : "active") :
        (Math.random() < 0.1 ? "pending" : "inactive");

      const baseDeposit = Math.random() < 0.1 ? Math.random() * 100000 : Math.random() * 25000;
      const totalDeposits = baseDeposit * (1 + Math.random() * 3);
      const totalWithdrawals = totalDeposits * (0.3 + Math.random() * 0.5);
      const balanceUSD = Math.max(0, totalDeposits - totalWithdrawals + (Math.random() - 0.5) * 5000);

      const tradesCount = Math.floor(daysSinceReg * (Math.random() * 5));
      const totalVolume = tradesCount * (1000 + Math.random() * 10000);

      return {
        id: `client-${String(i + 1).padStart(4, '0')}`,
        telegramId: `${1000000000 + i}`,
        username,
        firstName,
        lastName,
        email: `${username}@${["gmail.com", "yahoo.com", "outlook.com", "proton.me"][Math.floor(Math.random() * 4)]}`,
        phone: `+${[380, 7, 375, 7, 48, 49, 1][Math.floor(Math.random() * 7)]}${Math.floor(Math.random() * 900000000 + 100000000)}`,
        registrationDate,
        lastActive: new Date(Date.now() - Math.random() * (isActive ? 7 : 30) * 24 * 60 * 60 * 1000),
        status: status as any,
        balanceUSD,
        totalDeposits,
        totalWithdrawals,
        tradesCount,
        totalVolume,
        verificationLevel: totalDeposits > 10000 ? "advanced" : (totalDeposits > 1000 ? "basic" : "none") as any,
        country: countries[Math.floor(Math.random() * countries.length)],
        riskLevel: (totalVolume > 50000 ? "high" : (totalVolume > 10000 ? "medium" : "low")) as any
      };
    });

    setClients(mockClients);
    setFilteredClients(mockClients);
    setIsLoading(false);
  };

  // Filter and search logic
  useEffect(() => {
    let filtered = clients.filter(client => {
      const matchesSearch = searchQuery === "" || 
        client.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.telegramId.includes(searchQuery);

      const matchesStatus = statusFilter === "all" || client.status === statusFilter;
      const matchesVerification = verificationFilter === "all" || client.verificationLevel === verificationFilter;

      return matchesSearch && matchesStatus && matchesVerification;
    });

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredClients(filtered);
    setCurrentPage(1);
  }, [clients, searchQuery, statusFilter, verificationFilter, sortField, sortDirection]);

  const handleSort = (field: keyof ClientData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
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

  const getVerificationBadge = (level: string) => {
    const styles = {
      none: "bg-gray-100 text-gray-800",
      basic: "bg-blue-100 text-blue-800",
      advanced: "bg-green-100 text-green-800"
    };
    
    const labels = {
      none: "Не верифицирован",
      basic: "Базовая",
      advanced: "Полная"
    };

    return (
      <Badge variant="outline" className={styles[level as keyof typeof styles]}>
        {labels[level as keyof typeof labels]}
      </Badge>
    );
  };

  const getRiskBadge = (risk: string) => {
    const styles = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800"
    };
    
    const labels = {
      low: "Низкий",
      medium: "Средний", 
      high: "Высокий"
    };

    return (
      <Badge variant="outline" className={styles[risk as keyof typeof styles]}>
        {labels[risk as keyof typeof labels]}
      </Badge>
    );
  };

  const sendTelegramMessage = (client: ClientData) => {
    // In real app, this would open a modal or redirect to Telegram
    alert(`Отправить сообщение пользователю ${client.username} в Telegram (ID: ${client.telegramId})`);
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Username,Name,Email,Status,Balance,Total Deposits,Total Withdrawals,Trades,Registration Date\n" +
      filteredClients.map(client => 
        `${client.id},${client.username},"${client.firstName} ${client.lastName}",${client.email},${client.status},${client.balanceUSD},${client.totalDeposits},${client.totalWithdrawals},${client.tradesCount},${client.registrationDate.toISOString()}`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "clients_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Управление клиентами</h1>
          <p className="text-gray-600">
            Всего клиентов: {filteredClients.length} из {clients.length}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={exportData}
          >
            <Download className="w-4 h-4 mr-2" />
            Экспорт
          </Button>
          <Button
            variant="outline" 
            size="sm"
            onClick={loadClients}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Обновить
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Поиск по имени, email, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="inactive">Неактивные</SelectItem>
                <SelectItem value="banned">Заблокированные</SelectItem>
                <SelectItem value="pending">Ожидающие</SelectItem>
              </SelectContent>
            </Select>

            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Верификация" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все уровни</SelectItem>
                <SelectItem value="none">Не верифицированы</SelectItem>
                <SelectItem value="basic">Базовая</SelectItem>
                <SelectItem value="advanced">Полная</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {filteredClients.length} результатов
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Клиент</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("status")}
                      className="hover:bg-transparent p-0 h-auto font-medium"
                    >
                      Статус
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("balanceUSD")}
                      className="hover:bg-transparent p-0 h-auto font-medium"
                    >
                      Баланс
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("totalVolume")}
                      className="hover:bg-transparent p-0 h-auto font-medium"
                    >
                      Объем торгов
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </Button>
                  </TableHead>
                  <TableHead>Верификация</TableHead>
                  <TableHead>Риск</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("registrationDate")}
                      className="hover:bg-transparent p-0 h-auto font-medium"
                    >
                      Регистрация
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentClients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">
                            {client.firstName} {client.lastName}
                          </p>
                          <p className="text-sm text-gray-500">@{client.username}</p>
                          <p className="text-xs text-gray-400">ID: {client.telegramId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(client.status)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">${client.balanceUSD.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">
                          Деп: ${client.totalDeposits.toFixed(0)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">${client.totalVolume.toFixed(0)}</p>
                        <p className="text-sm text-gray-500">
                          {client.tradesCount} сделок
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getVerificationBadge(client.verificationLevel)}
                    </TableCell>
                    <TableCell>
                      {getRiskBadge(client.riskLevel)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">
                          {client.registrationDate.toLocaleDateString('ru-RU')}
                        </p>
                        <p className="text-xs text-gray-500">
                          Активен: {client.lastActive.toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/clients/${client.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendTelegramMessage(client)}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-gray-600">
                Показано {startIndex + 1}-{Math.min(endIndex, filteredClients.length)} из {filteredClients.length}
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Назад
                </Button>
                <span className="text-sm text-gray-600">
                  Страница {currentPage} из {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Далее
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
