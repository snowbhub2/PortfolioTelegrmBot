import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { Card } from "@/components/ui/card";
import { ArrowLeftIcon, SearchIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Asset {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  usdValue: number;
  icon: string;
  color: string;
}

const availableAssets: Asset[] = [
  {
    id: "usd",
    name: "Доллары",
    symbol: "USDT",
    balance: 5500,
    usdValue: 5500,
    icon: "$",
    color: "bg-green-500",
  },
];

export default function WithdrawAssetSelect() {
  const { hapticFeedback, tg } = useTelegram();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => navigate("/withdraw/method"));
    }
    return () => {
      if (tg) {
        tg.BackButton.hide();
      }
    };
  }, [tg, navigate]);

  const filteredAssets = availableAssets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAssetSelect = (asset: Asset) => {
    hapticFeedback("medium");
    navigate("/withdraw/wallet-address", {
      state: { asset },
    });
  };

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

        {/* Section Title */}
        <div className="mb-4">
          <h2 className="text-sm text-muted-foreground font-medium">
            ВЫ ВЫВОДИТЕ
          </h2>
        </div>

        {/* Assets List */}
        <div className="space-y-3">
          {filteredAssets.map((asset) => (
            <Card
              key={asset.id}
              className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleAssetSelect(asset)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 ${asset.color} rounded-full flex items-center justify-center`}
                  >
                    <span className="text-white text-xl font-bold">
                      {asset.icon}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{asset.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {asset.balance.toLocaleString("en-US", {
                        minimumFractionDigits: asset.balance < 1 ? 6 : 0,
                        maximumFractionDigits: asset.balance < 1 ? 6 : 0,
                      })}{" "}
                      {asset.symbol}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg">
                    {asset.usdValue.toFixed(2)} $
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {asset.balance < 1
                      ? asset.balance.toFixed(6)
                      : asset.balance.toLocaleString()}{" "}
                    {asset.symbol}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Активы не найдены</div>
          </div>
        )}
      </div>
    </div>
  );
}
