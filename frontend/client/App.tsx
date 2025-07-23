import "./global.css";
import "./types/telegram";
import "./telegram-init";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Wallet from "./pages/Wallet";
import History from "./pages/History";
import Bonuses from "./pages/Bonuses";
import Market from "./pages/Market";
import CoinDetail from "./pages/CoinDetail";
import AssetDetail from "./pages/AssetDetail";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import NotificationCategory from "./pages/NotificationCategory";
import LanguageSelect from "./pages/LanguageSelect";
import { LanguageProvider } from "./hooks/useLanguage";
import WithdrawMethodSelect from "./pages/WithdrawMethodSelect";
import TelegramStarsExchange from "./pages/TelegramStarsExchange";
import WithdrawAssetSelect from "./pages/WithdrawAssetSelect";
import WithdrawWalletAddress from "./pages/WithdrawWalletAddress";
import WithdrawAmount from "./pages/WithdrawAmount";
import WithdrawProcessing from "./pages/WithdrawProcessing";
import DepositMethodSelect from "./pages/DepositMethodSelect";
import DepositAssetSelect from "./pages/DepositAssetSelect";
import DepositNetworkSelect from "./pages/DepositNetworkSelect";
import DepositAddress from "./pages/DepositAddress";
import Exchange from "./pages/Exchange";
import Transfer from "./pages/Transfer";
import DepositStars from "./pages/DepositStars";
import CFDPage from "./pages/CFDPage";
import NotFound from "./pages/NotFound";
import BottomNavigation from "./components/BottomNavigation";
import { Layout } from "./components/Layout";
import { AdminLayout } from "./components/AdminLayout";
import { TelegramProvider } from "./components/TelegramProvider";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminDashboardSimple from "./pages/AdminDashboardSimple";
import AdminClients from "./pages/AdminClients";
import AdminClientDetail from "./pages/AdminClientDetail";
import AdminAssets from "./pages/AdminAssets";
import AdminTransactions from "./pages/AdminTransactions";
import AdminSettings from "./pages/AdminSettings";
import AdminSecurity from "./pages/AdminSecurity";
import AdminNotifications from "./pages/AdminNotifications";
import AdminTest from "./pages/AdminTest";

const queryClient = new QueryClient();

const App = () => (
  <LanguageProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <TelegramProvider>
            <Layout>
              <div className="min-h-screen bg-background text-foreground">
                <Routes>
                  <Route path="/" element={<WalletWithNav />} />
              <Route path="/history" element={<History />} />
              <Route path="/bonuses" element={<Bonuses />} />
              <Route path="/market" element={<Market />} />
              <Route path="/coin/:coinId" element={<CoinDetail />} />
              <Route path="/asset/:assetId" element={<AssetDetail />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/notifications/:categoryId" element={<NotificationCategory />} />
              <Route path="/language" element={<LanguageSelect />} />
              <Route
                path="/withdraw/method"
                element={<WithdrawMethodSelect />}
              />
              <Route
                path="/withdraw/telegram-stars"
                element={<TelegramStarsExchange />}
              />
              <Route
                path="/withdraw/external"
                element={<WithdrawAssetSelect />}
              />
              <Route
                path="/withdraw/wallet-address"
                element={<WithdrawWalletAddress />}
              />
              <Route path="/withdraw/amount" element={<WithdrawAmount />} />
              <Route
                path="/withdraw/processing"
                element={<WithdrawProcessing />}
              />
              <Route path="/deposit/method" element={<DepositMethodSelect />} />
              <Route
                path="/deposit/asset-select"
                element={<DepositAssetSelect />}
              />
              <Route
                path="/deposit/network-select"
                element={<DepositNetworkSelect />}
              />
              <Route path="/deposit/address" element={<DepositAddress />} />
              <Route path="/exchange" element={<Exchange />} />
              <Route path="/transfer" element={<Transfer />} />
              <Route path="/deposit/stars" element={<DepositStars />} />
              <Route path="/cfd" element={<CFDPage />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminProtectedRoutes />}>
                <Route index element={<AdminDashboardSimple />} />
                <Route path="dashboard" element={<AdminDashboardSimple />} />
                <Route path="clients" element={<AdminClients />} />
                <Route path="clients/:clientId" element={<AdminClientDetail />} />
                <Route path="assets" element={<AdminAssets />} />
                <Route path="assets/trending" element={<AdminAssets />} />
                <Route path="transactions" element={<AdminTransactions />} />
                <Route path="transactions/withdrawals" element={<AdminTransactions />} />
                <Route path="transactions/deposits" element={<AdminTransactions />} />
                <Route path="security" element={<AdminSecurity />} />
                <Route path="notifications" element={<AdminNotifications />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="test" element={<AdminTest />} />
              </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </Layout>
          </TelegramProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </LanguageProvider>
);

// Wallet page with bottom navigation
const WalletWithNav = () => (
  <>
    <Wallet />
    <BottomNavigation />
  </>
);

// Admin protected routes component
const AdminProtectedRoutes = () => {
  // For demo purposes, always allow access and auto-create token
  const adminToken = "demo_admin_token_2024";
  localStorage.setItem("admin_token", adminToken);
  localStorage.setItem("admin_user", JSON.stringify({
    id: "admin-1",
    name: "Демо Админ",
    email: "admin@platform.com",
    role: "super_admin"
  }));

  return <AdminLayout />;
};

createRoot(document.getElementById("root")!).render(<App />);
