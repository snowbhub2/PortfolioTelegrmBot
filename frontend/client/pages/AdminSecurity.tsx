import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  RefreshCw,
  Search,
  Filter,
  UserCheck,
  UserX,
  Ban,
  Key,
  Smartphone,
  Mail,
  Globe
} from "lucide-react";

interface SecurityEvent {
  id: string;
  userId: string;
  username: string;
  type: "login_attempt" | "failed_login" | "password_change" | "2fa_enabled" | "suspicious_activity" | "account_locked";
  description: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  status: "resolved" | "pending" | "investigating";
  riskLevel: "low" | "medium" | "high";
}

interface PendingVerification {
  id: string;
  userId: string;
  username: string;
  type: "kyc" | "document" | "phone" | "email";
  submittedAt: Date;
  documents?: string[];
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string;
}

export default function AdminSecurity() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState<PendingVerification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setIsLoading(true);
    
    // Mock security events
    const mockEvents: SecurityEvent[] = [
      {
        id: "se-001",
        userId: "user-0045",
        username: "crypto_whale_pro",
        type: "failed_login",
        description: "Множественные неудачные попытки входа",
        ipAddress: "192.168.1.100",
        userAgent: "Chrome/120.0.0.0",
        timestamp: new Date(Date.now() - 300000),
        status: "pending",
        riskLevel: "high"
      },
      {
        id: "se-002",
        userId: "user-0123",
        username: "bitcoin_trader",
        type: "suspicious_activity",
        description: "Необычная торговая активность из нового местоположения",
        ipAddress: "185.220.101.50",
        userAgent: "Firefox/119.0",
        timestamp: new Date(Date.now() - 600000),
        status: "investigating",
        riskLevel: "medium"
      },
      {
        id: "se-003",
        userId: "user-0087",
        username: "day_trader_99",
        type: "login_attempt",
        description: "Вход с нового устройства",
        ipAddress: "203.0.113.45",
        userAgent: "Safari/16.0",
        timestamp: new Date(Date.now() - 900000),
        status: "resolved",
        riskLevel: "low"
      },
      {
        id: "se-004",
        userId: "user-0156",
        username: "eth_maximalist",
        type: "account_locked",
        description: "Аккаунт заблокирован из-за подозрительной активности",
        ipAddress: "198.51.100.20",
        userAgent: "Chrome/120.0.0.0",
        timestamp: new Date(Date.now() - 1200000),
        status: "pending",
        riskLevel: "high"
      },
      {
        id: "se-005",
        userId: "user-0203",
        username: "hodl_master",
        type: "2fa_enabled",
        description: "Двухфакторная аутентификация включена",
        ipAddress: "172.16.0.15",
        userAgent: "Chrome/120.0.0.0",
        timestamp: new Date(Date.now() - 1800000),
        status: "resolved",
        riskLevel: "low"
      }
    ];

    // Mock pending verifications
    const mockVerifications: PendingVerification[] = [
      {
        id: "pv-001",
        userId: "user-0234",
        username: "new_trader_2024",
        type: "kyc",
        submittedAt: new Date(Date.now() - 3600000),
        documents: ["passport.jpg", "utility_bill.pdf"],
        status: "pending"
      },
      {
        id: "pv-002",
        userId: "user-0345",
        username: "crypto_investor",
        type: "document",
        submittedAt: new Date(Date.now() - 7200000),
        documents: ["id_card.jpg"],
        status: "pending"
      },
      {
        id: "pv-003",
        userId: "user-0456",
        username: "whale_hunter",
        type: "phone",
        submittedAt: new Date(Date.now() - 10800000),
        status: "pending"
      },
      {
        id: "pv-004",
        userId: "user-0567",
        username: "defi_lover",
        type: "email",
        submittedAt: new Date(Date.now() - 14400000),
        status: "pending"
      }
    ];

    setSecurityEvents(mockEvents);
    setPendingVerifications(mockVerifications);
    setIsLoading(false);
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "failed_login":
        return <UserX className="w-4 h-4 text-red-500" />;
      case "login_attempt":
        return <UserCheck className="w-4 h-4 text-blue-500" />;
      case "suspicious_activity":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "account_locked":
        return <Ban className="w-4 h-4 text-red-500" />;
      case "2fa_enabled":
        return <Shield className="w-4 h-4 text-green-500" />;
      default:
        return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      investigating: "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800"
    };
    
    const labels = {
      pending: "Ожидает",
      investigating: "Расследуется",
      resolved: "Решено"
    };

    return (
      <Badge className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
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

  const getVerificationTypeIcon = (type: string) => {
    switch (type) {
      case "kyc":
        return <Shield className="w-4 h-4 text-blue-500" />;
      case "document":
        return <Eye className="w-4 h-4 text-purple-500" />;
      case "phone":
        return <Smartphone className="w-4 h-4 text-green-500" />;
      case "email":
        return <Mail className="w-4 h-4 text-orange-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const approveVerification = (verificationId: string) => {
    setPendingVerifications(prev => prev.map(v => 
      v.id === verificationId ? { ...v, status: "approved", reviewedBy: "admin-1" } : v
    ));
  };

  const rejectVerification = (verificationId: string) => {
    setPendingVerifications(prev => prev.map(v => 
      v.id === verificationId ? { ...v, status: "rejected", reviewedBy: "admin-1" } : v
    ));
  };

  const filteredEvents = securityEvents.filter(event => {
    const matchesSearch = searchQuery === "" || 
      event.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.ipAddress.includes(searchQuery);

    const matchesType = typeFilter === "all" || event.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const stats = {
    totalEvents: securityEvents.length,
    highRiskEvents: securityEvents.filter(e => e.riskLevel === "high").length,
    pendingEvents: securityEvents.filter(e => e.status === "pending").length,
    pendingVerifications: pendingVerifications.filter(v => v.status === "pending").length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🛡️ Безопасность</h1>
          <p className="text-gray-600">
            Мониторинг безопасности и верификация пользователей
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadSecurityData}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Обновить
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">События безопасности</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Высокий риск</p>
                <p className="text-2xl font-bold text-red-600">{stats.highRiskEvents}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ожидают проверки</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingEvents}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Верификации</p>
                <p className="text-2xl font-bold text-blue-600">{stats.pendingVerifications}</p>
              </div>
              <UserCheck className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="events" className="space-y-6">
        <TabsList>
          <TabsTrigger value="events">События безопасности</TabsTrigger>
          <TabsTrigger value="verifications">
            Верификации
            {stats.pendingVerifications > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                {stats.pendingVerifications}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Поиск по пользователю, IP..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Тип события" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    <SelectItem value="failed_login">Неудачные входы</SelectItem>
                    <SelectItem value="suspicious_activity">Подозрительная активность</SelectItem>
                    <SelectItem value="account_locked">Блокировки аккаунтов</SelectItem>
                    <SelectItem value="login_attempt">Попытки входа</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {filteredEvents.length} результатов
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Событие</TableHead>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>IP адрес</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Риск</TableHead>
                      <TableHead>Время</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event) => (
                      <TableRow key={event.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {getEventTypeIcon(event.type)}
                            <div>
                              <p className="font-medium text-gray-900">{event.description}</p>
                              <p className="text-sm text-gray-500">{event.userAgent}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{event.username}</p>
                            <p className="text-sm text-gray-500">{event.userId}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {event.ipAddress}
                          </code>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(event.status)}
                        </TableCell>
                        <TableCell>
                          {getRiskBadge(event.riskLevel)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">
                              {event.timestamp.toLocaleDateString('ru-RU')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {event.timestamp.toLocaleTimeString('ru-RU')}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ожидающие верификации</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingVerifications.filter(v => v.status === "pending").map((verification) => (
                  <div key={verification.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getVerificationTypeIcon(verification.type)}
                      <div>
                        <p className="font-medium text-gray-900">{verification.username}</p>
                        <p className="text-sm text-gray-500">
                          {verification.type.toUpperCase()} • {verification.submittedAt.toLocaleString('ru-RU')}
                        </p>
                        {verification.documents && (
                          <p className="text-xs text-gray-400">
                            Документы: {verification.documents.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rejectVerification(verification.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Отклонить
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => approveVerification(verification.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Одобрить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
