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
import NotFound from "./pages/NotFound";
import BottomNavigation from "./components/BottomNavigation";
import { Layout } from "./components/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Wallet page with bottom navigation
const WalletWithNav = () => (
  <>
    <Wallet />
    <BottomNavigation />
  </>
);

createRoot(document.getElementById("root")!).render(<App />);
