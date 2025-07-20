import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { Card } from "@/components/ui/card";
import { SearchIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DepositAsset {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  color: string;
  isPopular: boolean;
}

const depositAssets: DepositAsset[] = [
  // Popular
  {
    id: "usd",
    name: "Доллары",
    symbol: "USDT",
    icon: "$",
    color: "bg-green-500",
    isPopular: true,
  },
  {
    id: "ton",
    name: "Toncoin",
    symbol: "TON",
    icon: "🔷",
    color: "bg-blue-500",
    isPopular: true,
  },
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    icon: "₿",
    color: "bg-orange-500",
    isPopular: true,
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    icon: "Ξ",
    color: "bg-purple-500",
    isPopular: true,
  },
  // All others
  {
    id: "link",
    name: "Chainlink",
    symbol: "LINK",
    icon: "⬡",
    color: "bg-blue-600",
    isPopular: false,
  },
  {
    id: "shib",
    name: "Shiba Inu",
    symbol: "SHIB",
    icon: "🐕",
    color: "bg-red-500",
    isPopular: false,
  },
  {
    id: "pepe",
    name: "Pepe",
    symbol: "PEPE",
    icon: "🐸",
    color: "bg-green-600",
    isPopular: false,
  },
  {
    id: "ondo",
    name: "Ondo",
    symbol: "ONDO",
    icon: "⚪",
    color: "bg-gray-800",
    isPopular: false,
  },
  {
    id: "pol",
    name: "POL (prev. MATIC)",
    symbol: "POL",
    icon: "🔷",
    color: "bg-purple-600",
    isPopular: false,
  },
];

export default function DepositAssetSelect() {
  const { hapticFeedback, tg } = useTelegram();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => navigate("/deposit/method"));
    }
    return () => {
      if (tg) {
        tg.BackButton.hide();
      }
    };
  }, [tg, navigate]);

  const filteredAssets = depositAssets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const popularAssets = filteredAssets.filter((asset) => asset.isPopular);
  const allAssets = filteredAssets.filter((asset) => !asset.isPopular);

  const handleAssetSelect = (asset: DepositAsset) => {
    hapticFeedback("medium");
    navigate("/deposit/network-select", {
      state: { asset },
    });
  };

  const renderAssetItem = (asset: DepositAsset) => (
    <div
      key={asset.id}
      className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
      onClick={() => handleAssetSelect(asset)}
    >
      <div
        className={`w-12 h-12 ${asset.color} rounded-full flex items-center justify-center`}
      >
        <span className="text-white text-xl font-bold">{asset.icon}</span>
      </div>
      <div>
        <div className="font-semibold text-lg">{asset.name}</div>
        <div className="text-sm text-muted-foreground">{asset.symbol}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-4">
        {/* Search */}
        <div className="relative mb-6">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-muted rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Popular Section */}
      {popularAssets.length > 0 && (
        <div className="mb-6">
          <div className="px-4 mb-3">
            <h2 className="text-sm text-muted-foreground font-medium">
              ПОПУЛЯРНЫЕ
            </h2>
          </div>
          <Card className="mx-4">
            {popularAssets.map((asset) => renderAssetItem(asset))}
          </Card>
        </div>
      )}

      {/* All Section */}
      {allAssets.length > 0 && (
        <div>
          <div className="px-4 mb-3">
            <h2 className="text-sm text-muted-foreground font-medium">ВСЕ</h2>
          </div>
          <Card className="mx-4">
            {allAssets.map((asset) => renderAssetItem(asset))}
          </Card>
        </div>
      )}

      {filteredAssets.length === 0 && (
        <div className="text-center py-8">
          <div className="text-muted-foreground">Активы не найдены</div>
        </div>
      )}
    </div>
  );
}
