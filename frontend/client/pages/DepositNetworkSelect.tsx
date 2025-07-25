import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { useLanguage } from "@/hooks/useLanguage";
import { Card } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";

interface Network {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const networks: Network[] = [
  {
    id: "trc20",
    name: "TRC20",
    description: "Tron",
    icon: "🔴",
    color: "bg-red-500",
  },
  {
    id: "ton",
    name: "TON",
    description: "TON",
    icon: "🔷",
    color: "bg-blue-500",
  },
  {
    id: "erc20",
    name: "ERC20",
    description: "Ethereum",
    icon: "🟣",
    color: "bg-purple-500",
  },
];

export default function DepositNetworkSelect() {
  const { hapticFeedback, tg } = useTelegram();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");

  const asset = location.state?.asset;

  useEffect(() => {
    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() =>
        navigate("/deposit/asset-select", { state: { asset } }),
      );
    }
    return () => {
      if (tg) {
        tg.BackButton.hide();
      }
    };
  }, [tg, navigate, asset]);

  const handleNetworkSelect = (network: Network) => {
    hapticFeedback("medium");
    setSelectedNetwork(network.id);

    // Navigate to address page after brief delay
    setTimeout(() => {
      navigate("/deposit/address", {
        state: { asset, network },
      });
    }, 150);
  };

  if (!asset) {
    navigate("/deposit/asset-select");
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-4 space-y-6">
        {/* Warning */}
        <Card className="p-4 bg-muted/50">
          <div className="text-sm text-muted-foreground">
            {t('deposit.network.warning')}
          </div>
        </Card>

        {/* Title */}
        <div>
          <h2 className="text-sm text-muted-foreground font-medium mb-4">
            {t('deposit.network.select')} {asset.symbol}
          </h2>
        </div>

        {/* Network Options */}
        <div className="space-y-3">
          {networks.map((network) => (
            <Card
              key={network.id}
              className={`p-4 cursor-pointer transition-colors ${
                selectedNetwork === network.id
                  ? "ring-2 ring-primary bg-primary/5"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => handleNetworkSelect(network)}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 ${network.color} rounded-full flex items-center justify-center`}
                >
                  <span className="text-white text-xl">{network.icon}</span>
                </div>
                <div>
                  <div className="font-semibold text-lg">{network.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {network.description}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
