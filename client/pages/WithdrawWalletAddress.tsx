import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeftIcon, ScanIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface RecentWallet {
  id: string;
  address: string;
  network: string;
  shortAddress: string;
  date: string;
}

const recentWallets: RecentWallet[] = [
  {
    id: "1",
    address: "TJFo1234567890ZcNN",
    network: "TRC20",
    shortAddress: "TJFo...ZcNN",
    date: "15 августа в 17:02",
  },
  {
    id: "2",
    address: "TTLh1234567890KdzM",
    network: "TRC20",
    shortAddress: "TTLh...KdzM",
    date: "15 августа в 16:57",
  },
  {
    id: "3",
    address: "TVzH1234567890JpvE",
    network: "TON",
    shortAddress: "TVzH...JpvE",
    date: "26 февраля в 15:16",
  },
];

const networks = [
  { id: "ton", name: "TON", fee: "1 USDT" },
  { id: "trc20", name: "TRC20", fee: "3,5 USDT" },
  { id: "erc20", name: "ERC20", fee: "4 USDT" },
];

export default function WithdrawWalletAddress() {
  const { hapticFeedback, tg } = useTelegram();
  const navigate = useNavigate();
  const location = useLocation();
  const [address, setAddress] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("ton");
  const [showRecent, setShowRecent] = useState(true);

  const asset = location.state?.asset;

  useEffect(() => {
    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => navigate("/withdraw/external"));
    }
    return () => {
      if (tg) {
        tg.BackButton.hide();
      }
    };
  }, [tg, navigate]);

  const handleNetworkSelect = (networkId: string) => {
    hapticFeedback("light");
    setSelectedNetwork(networkId);
  };

  const handleRecentWalletSelect = (wallet: RecentWallet) => {
    hapticFeedback("light");
    setAddress(wallet.address);
    setSelectedNetwork(wallet.network.toLowerCase());
  };

  const handleScanQR = () => {
    hapticFeedback("medium");
    // In real app would open QR scanner
    console.log("Open QR scanner");
  };

  const handleClearRecent = () => {
    hapticFeedback("light");
    setShowRecent(false);
  };

  const handleContinue = () => {
    if (!address.trim()) {
      hapticFeedback("medium");
      return;
    }

    hapticFeedback("medium");
    navigate("/withdraw/amount", {
      state: {
        asset,
        address: address.trim(),
        network: selectedNetwork,
      },
    });
  };

  const isValidAddress = address.trim().length > 10;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-4 space-y-6">
        {/* Address Input */}
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <input
                type="text"
                placeholder="Адрес USDT"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="flex-1 text-lg bg-transparent border-0 focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleScanQR}
                  className="text-primary px-2"
                >
                  <ScanIcon className="w-4 h-4 mr-1" />
                  Вставить
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Network Selection */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm text-muted-foreground font-medium">
              СЕТЬ ДЛЯ ВЫВОДА
            </h3>
            <div className="w-4 h-4 bg-muted-foreground/20 rounded-full flex items-center justify-center">
              <span className="text-xs">?</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {networks.map((network) => (
              <Card
                key={network.id}
                className={`p-3 cursor-pointer transition-colors ${
                  selectedNetwork === network.id
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => handleNetworkSelect(network.id)}
              >
                <div className="text-center">
                  <div className="font-semibold mb-1">{network.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Комиссия: {network.fee}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Wallets */}
        {showRecent && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-muted-foreground font-medium">
                НЕДАВНИЕ
              </h3>
              <button
                onClick={handleClearRecent}
                className="text-sm text-primary"
              >
                ОЧИСТИТЬ
              </button>
            </div>

            <div className="space-y-3">
              {recentWallets.map((wallet) => (
                <Card
                  key={wallet.id}
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleRecentWalletSelect(wallet)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">💎</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{wallet.shortAddress}</div>
                      <div className="text-sm text-muted-foreground">
                        {wallet.network} · {wallet.date}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <Button
          className="w-full py-4 text-lg font-medium"
          disabled={!isValidAddress}
          onClick={handleContinue}
        >
          Далее
        </Button>
      </div>
    </div>
  );
}
