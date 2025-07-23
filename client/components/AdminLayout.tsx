import { useState, useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import AdminDashboardSimple from "@/pages/AdminDashboardSimple";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Users,
  BarChart3,
  Coins,
  ArrowRightLeft,
  Settings,
  Menu,
  X,
  LogOut,
  TrendingUp,
  Shield,
  Bell,
  CreditCard,
  AlertTriangle,
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "moderator";
  avatar?: string;
}

export const AdminLayout = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentAdmin] = useState<AdminUser>({
    id: "admin-1",
    name: "Админ",
    email: "admin@platform.com", 
    role: "super_admin"
  });

  // Pending counts for badges
  const [pendingCounts, setPendingCounts] = useState({
    withdrawals: 3,
    verifications: 7,
    support: 12
  });

  const navigation = [
    {
      name: "Дашборд",
      href: "/admin",
      icon: BarChart3,
      current: location.pathname === "/admin"
    },
    {
      name: "Клиенты",
      href: "/admin/clients",
      icon: Users,
      current: location.pathname.startsWith("/admin/clients")
    },
    {
      name: "Активы",
      href: "/admin/assets",
      icon: Coins,
      current: location.pathname.startsWith("/admin/assets"),
      children: [
        { name: "Все активы", href: "/admin/assets" },
        { name: "Трендинг", href: "/admin/assets/trending" }
      ]
    },
    {
      name: "Транзакции",
      href: "/admin/transactions",
      icon: ArrowRightLeft,
      current: location.pathname.startsWith("/admin/transactions"),
      children: [
        { name: "Все транзакции", href: "/admin/transactions" },
        { name: "Выводы", href: "/admin/transactions/withdrawals", badge: pendingCounts.withdrawals },
        { name: "Пополнения", href: "/admin/transactions/deposits" }
      ]
    },
    {
      name: "Безопасность",
      href: "/admin/security",
      icon: Shield,
      current: location.pathname.startsWith("/admin/security"),
      badge: pendingCounts.verifications
    },
    {
      name: "Уведомления",
      href: "/admin/notifications",
      icon: Bell,
      current: location.pathname.startsWith("/admin/notifications"),
      badge: pendingCounts.support
    },
    {
      name: "Настройки",
      href: "/admin/settings",
      icon: Settings,
      current: location.pathname.startsWith("/admin/settings")
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Админ Панель</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => (
              <div key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    item.current
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
                
                {/* Sub-navigation */}
                {item.children && item.current && (
                  <div className="ml-8 mt-2 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        className={cn(
                          "flex items-center justify-between px-3 py-1.5 text-sm rounded-md transition-colors",
                          location.pathname === child.href
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        <span>{child.name}</span>
                        {child.badge && (
                          <Badge variant="destructive" className="h-4 px-1 text-xs">
                            {child.badge}
                          </Badge>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Admin info */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-white">
                  {currentAdmin.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{currentAdmin.name}</p>
                <p className="text-xs text-gray-500">{currentAdmin.role}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-semibold text-gray-900">
                {navigation.find(item => item.current)?.name || "Админ Панель"}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Platform status indicator */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Платформа активна</span>
              </div>

              {/* Urgent notifications */}
              {pendingCounts.withdrawals > 0 && (
                <Link to="/admin/transactions/withdrawals">
                  <Button variant="outline" size="sm" className="text-orange-600 border-orange-200">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {pendingCounts.withdrawals} выводов
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {location.pathname === "/admin" ? <AdminDashboardSimple /> : <Outlet />}
        </main>
      </div>
    </div>
  );
};
