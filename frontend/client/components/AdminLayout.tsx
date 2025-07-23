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
      name: "��ранзакции",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-sm shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-slate-200",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-lg">Админ Панель</span>
                <p className="text-xs text-blue-100">Управление платформой</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-white hover:bg-white/20"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3">Основное</h3>
            </div>
            {navigation.map((item) => (
              <div key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group",
                    item.current
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-[1.02]"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:transform hover:scale-[1.01]"
                  )}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className={cn(
                      "w-5 h-5 transition-colors",
                      item.current ? "text-white" : "text-slate-500 group-hover:text-slate-700"
                    )} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {item.badge && (
                    <Badge
                      variant="destructive"
                      className="h-6 px-2 text-xs font-semibold bg-red-500 hover:bg-red-600 shadow-sm"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>

                {/* Sub-navigation */}
                {item.children && item.current && (
                  <div className="ml-6 mt-2 space-y-1 border-l-2 border-blue-200 pl-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors",
                          location.pathname === child.href
                            ? "bg-blue-50 text-blue-700 font-medium border border-blue-200"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                        )}
                      >
                        <span>{child.name}</span>
                        {child.badge && (
                          <Badge variant="destructive" className="h-5 px-1.5 text-xs font-semibold">
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
          <div className="p-4 border-t border-slate-200 bg-slate-50/50">
            <div className="flex items-center space-x-3 mb-4 p-3 bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-sm font-bold text-white">
                  {currentAdmin.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{currentAdmin.name}</p>
                <p className="text-xs text-slate-500 font-medium">{currentAdmin.role}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-slate-300 font-medium"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-72">
        {/* Top header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-20 px-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  {navigation.find(item => item.current)?.name || "Админ Панель"}
                </h1>
                <p className="text-sm text-slate-600 mt-0.5">Управление и мони��оринг платформы</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Platform status indicator */}
              <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Платформа активна</span>
              </div>

              {/* Urgent notifications */}
              {pendingCounts.withdrawals > 0 && (
                <Link to="/admin/transactions/withdrawals">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-orange-700 border-orange-300 bg-orange-50 hover:bg-orange-100 font-medium shadow-sm"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {pendingCounts.withdrawals} выводов
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
