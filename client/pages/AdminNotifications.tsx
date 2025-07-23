import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  MessageCircle,
  Mail,
  Smartphone,
  Send,
  Eye,
  RefreshCw,
  Search,
  Filter,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus
} from "lucide-react";

interface SupportTicket {
  id: string;
  userId: string;
  username: string;
  subject: string;
  message: string;
  category: "technical" | "billing" | "account" | "trading" | "general";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: Date;
  lastReply?: Date;
  assignedTo?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  target: "all" | "active" | "verified" | "specific";
  targetUsers?: string[];
  scheduledFor?: Date;
  sentAt?: Date;
  status: "draft" | "scheduled" | "sent";
  createdBy: string;
}

export default function AdminNotifications() {
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateNotificationOpen, setIsCreateNotificationOpen] = useState(false);

  // New notification form state
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "info",
    target: "all"
  });

  useEffect(() => {
    loadNotificationData();
  }, []);

  const loadNotificationData = async () => {
    setIsLoading(true);
    
    // Mock support tickets
    const mockTickets: SupportTicket[] = [
      {
        id: "ticket-001",
        userId: "user-0123",
        username: "crypto_whale_pro",
        subject: "Проблема с выводом средств",
        message: "Не могу вывести средства уже 2 дня. Транзакция висит в статусе 'обработка'.",
        category: "technical",
        priority: "high",
        status: "open",
        createdAt: new Date(Date.now() - 3600000),
        assignedTo: "support-1"
      },
      {
        id: "ticket-002",
        userId: "user-0456",
        username: "bitcoin_trader",
        subject: "Вопрос по комиссиям",
        message: "Объясните, пожалуйста, как рассчитываются комиссии за торговлю.",
        category: "billing",
        priority: "medium",
        status: "in_progress",
        createdAt: new Date(Date.now() - 7200000),
        lastReply: new Date(Date.now() - 1800000),
        assignedTo: "support-2"
      },
      {
        id: "ticket-003",
        userId: "user-0789",
        username: "day_trader_99",
        subject: "Верификация аккаунта",
        message: "Загрузил документы для верификации 3 дня назад, до сих пор не проверили.",
        category: "account",
        priority: "medium",
        status: "open",
        createdAt: new Date(Date.now() - 10800000)
      },
      {
        id: "ticket-004",
        userId: "user-0321",
        username: "eth_maximalist",
        subject: "Ошибка при покупке ETH",
        message: "При попытке купить ETH выдает ошибку 'Недостаточно средств', хотя баланс достаточный.",
        category: "trading",
        priority: "urgent",
        status: "open",
        createdAt: new Date(Date.now() - 900000)
      },
      {
        id: "ticket-005",
        userId: "user-0654",
        username: "hodl_master",
        subject: "Предложение по улучшению",
        message: "Было бы здорово добавить push-уведомления о изменении цен.",
        category: "general",
        priority: "low",
        status: "resolved",
        createdAt: new Date(Date.now() - 86400000),
        lastReply: new Date(Date.now() - 43200000)
      }
    ];

    // Mock notifications
    const mockNotifications: Notification[] = [
      {
        id: "notif-001",
        title: "Техническое обслуживание",
        message: "Запланировано техническое обслуживание платформы на 2 часа.",
        type: "warning",
        target: "all",
        scheduledFor: new Date(Date.now() + 3600000),
        status: "scheduled",
        createdBy: "admin-1"
      },
      {
        id: "notif-002",
        title: "Новые активы добавлены",
        message: "На платформе теперь доступны для торговли новые криптовалюты: ADA и DOT.",
        type: "success",
        target: "verified",
        sentAt: new Date(Date.now() - 3600000),
        status: "sent",
        createdBy: "admin-1"
      },
      {
        id: "notif-003",
        title: "Важные изменения в комиссиях",
        message: "С 1 января изменяются тарифы на торговые комиссии.",
        type: "info",
        target: "active",
        status: "draft",
        createdBy: "admin-2"
      }
    ];

    setSupportTickets(mockTickets);
    setNotifications(mockNotifications);
    setIsLoading(false);
  };

  const getTicketPriorityBadge = (priority: string) => {
    const styles = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800"
    };
    
    const labels = {
      low: "Низкий",
      medium: "Средний",
      high: "Высокий",
      urgent: "Срочно"
    };

    return (
      <Badge className={styles[priority as keyof typeof styles]}>
        {labels[priority as keyof typeof labels]}
      </Badge>
    );
  };

  const getTicketStatusBadge = (status: string) => {
    const styles = {
      open: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800"
    };
    
    const labels = {
      open: "Открыт",
      in_progress: "В работе",
      resolved: "Решен",
      closed: "Закры��"
    };

    return (
      <Badge className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getNotificationTypeBadge = (type: string) => {
    const styles = {
      info: "bg-blue-100 text-blue-800",
      warning: "bg-yellow-100 text-yellow-800",
      success: "bg-green-100 text-green-800",
      error: "bg-red-100 text-red-800"
    };
    
    const labels = {
      info: "Информация",
      warning: "Предупреждение",
      success: "Успех",
      error: "Ошибка"
    };

    return (
      <Badge className={styles[type as keyof typeof styles]}>
        {labels[type as keyof typeof labels]}
      </Badge>
    );
  };

  const createNotification = () => {
    if (!newNotification.title || !newNotification.message) {
      alert("Пожалуйста, заполните все поля");
      return;
    }

    const notification: Notification = {
      id: `notif-${Date.now()}`,
      title: newNotification.title,
      message: newNotification.message,
      type: newNotification.type as any,
      target: newNotification.target as any,
      status: "draft",
      createdBy: "admin-1"
    };

    setNotifications([notification, ...notifications]);
    setNewNotification({ title: "", message: "", type: "info", target: "all" });
    setIsCreateNotificationOpen(false);
  };

  const sendNotification = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId 
        ? { ...n, status: "sent", sentAt: new Date() }
        : n
    ));
  };

  const filteredTickets = supportTickets.filter(ticket => {
    const matchesSearch = searchQuery === "" || 
      ticket.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalTickets: supportTickets.length,
    openTickets: supportTickets.filter(t => t.status === "open").length,
    urgentTickets: supportTickets.filter(t => t.priority === "urgent").length,
    totalNotifications: notifications.length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📢 Уведомления и поддержка</h1>
          <p className="text-gray-600">
            Управление уведомлениями и обработка заявок поддержки
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={isCreateNotificationOpen} onOpenChange={setIsCreateNotificationOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Создать уведомление
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новое уведомление</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Заголовок</Label>
                  <Input
                    id="title"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                    placeholder="Введите заголовок уведомления"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Сообщение</Label>
                  <Textarea
                    id="message"
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                    placeholder="Введите текст уведомления"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Тип</Label>
                    <Select value={newNotification.type} onValueChange={(value) => setNewNotification({...newNotification, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Информация</SelectItem>
                        <SelectItem value="warning">Предупреждение</SelectItem>
                        <SelectItem value="success">Успех</SelectItem>
                        <SelectItem value="error">Ошибка</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="target">Получатели</Label>
                    <Select value={newNotification.target} onValueChange={(value) => setNewNotification({...newNotification, target: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все пользователи</SelectItem>
                        <SelectItem value="active">Активные</SelectItem>
                        <SelectItem value="verified">Верифицированные</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateNotificationOpen(false)}>
                    Отмена
                  </Button>
                  <Button onClick={createNotification}>
                    Создать
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            size="sm"
            onClick={loadNotificationData}
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
                <p className="text-sm font-medium text-gray-600">Всего заявок</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTickets}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Открытые заявки</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.openTickets}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Срочные</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgentTickets}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Уведомления</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalNotifications}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tickets" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tickets">
            Заявки поддержки
            {stats.openTickets > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                {stats.openTickets}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Поиск по пользователю, теме..."
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
                    <SelectItem value="open">Открытые</SelectItem>
                    <SelectItem value="in_progress">В работе</SelectItem>
                    <SelectItem value="resolved">Решенные</SelectItem>
                    <SelectItem value="closed">Закрытые</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {filteredTickets.length} результатов
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Tickets Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Заявка</TableHead>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Приоритет</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Создана</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{ticket.subject}</p>
                            <p className="text-sm text-gray-500 line-clamp-2">
                              {ticket.message.substring(0, 100)}...
                            </p>
                            <Badge variant="outline" className="mt-1">
                              {ticket.category}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{ticket.username}</p>
                            <p className="text-sm text-gray-500">{ticket.userId}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getTicketPriorityBadge(ticket.priority)}
                        </TableCell>
                        <TableCell>
                          {getTicketStatusBadge(ticket.status)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">
                              {ticket.createdAt.toLocaleDateString('ru-RU')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {ticket.createdAt.toLocaleTimeString('ru-RU')}
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

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Управление уведомлениями</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900">{notification.title}</h3>
                        {getNotificationTypeBadge(notification.type)}
                        <Badge variant="outline">
                          {notification.target === "all" ? "Все" : 
                           notification.target === "active" ? "Активные" : "Верифицированные"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="text-xs text-gray-500">
                        {notification.status === "sent" && notification.sentAt && 
                          `Отправлено: ${notification.sentAt.toLocaleString('ru-RU')}`}
                        {notification.status === "scheduled" && notification.scheduledFor && 
                          `Запланировано на: ${notification.scheduledFor.toLocaleString('ru-RU')}`}
                        {notification.status === "draft" && "Черновик"}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {notification.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={() => sendNotification(notification.id)}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Отправить
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
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
