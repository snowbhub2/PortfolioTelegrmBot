import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MarketAsset } from "@/types/crypto";
import { SearchIcon, TrendingUpIcon } from "lucide-react";
import { PortfolioManager } from "@/lib/portfolio";

const mockTradingAssets: MarketAsset[] = [
  {
    id: "btc",
    symbol: "BTC/USD",
    name: "Bitcoin",
    price: 109008.18,
    change24h: 1.09,
    marketCap: 2150000000000,
    icon: "₿",
    sparkline: [108000, 108500, 109000, 109008],
  },
  {
    id: "eth",
    symbol: "ETH/USD",
    name: "Ethereum",
    price: 2620.19,
    change24h: 3.52,
    marketCap: 315000000000,
    icon: "Ξ",
    sparkline: [2530, 2580, 2610, 2620],
  },
  {
    id: "ada",
    symbol: "ADA/USD",
    name: "Cardano",
    price: 0.89,
    change24h: 2.34,
    marketCap: 31000000000,
    icon: "🔷",
    sparkline: [0.85, 0.87, 0.88, 0.89],
  },
  {
    id: "dot",
    symbol: "DOT/USD",
    name: "Polkadot",
    price: 7.23,
    change24h: -1.45,
    marketCap: 9000000000,
    icon: "⚫",
    sparkline: [7.4, 7.3, 7.25, 7.23],
  },
];

export default function CFD() {
  const { hapticFeedback, user } = useTelegram();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset | null>(null);
  const [portfolioManager, setPortfolioManager] =
    useState<PortfolioManager | null>(null);
  const [cfdBalance, setCfdBalance] = useState(0);

  useEffect(() => {
    // Ініціалізація портфеля
    const userId = user?.id?.toString() || "demo_user";
    const portfolio = new PortfolioManager(userId);
    setPortfolioManager(portfolio);
    setCfdBalance(portfolio.getCfdBalance());
  }, [user]);

  const handleAssetClick = (asset: MarketAsset) => {
    hapticFeedback("medium");
    setSelectedAsset(asset);
  };

  const handleTrade = (type: "buy" | "sell") => {
    hapticFeedback("medium");
    console.log(`${type} ${selectedAsset?.symbol}`);
  };

  return (
    <div className="flex-1">
      {/* Content starts directly without header */}

      {/* Trading Balance */}
      <div className="p-4 text-center bg-muted/20">
        <div className="text-2xl font-bold">${cfdBalance.toFixed(2)}</div>
        <div className="text-sm text-muted-foreground">Торговий баланс CFD</div>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Пошук активів"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Popular Pairs */}
      <div className="px-4 mb-4">
        <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
          ПОПУЛЯРНІ ПАРИ
        </h2>
        <div className="space-y-2">
          {mockTradingAssets.map((asset) => (
            <Card
              key={asset.id}
              className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleAssetClick(asset)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-lg">{asset.icon}</span>
                  </div>
                  <div>
                    <div className="font-medium">{asset.symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      {asset.name}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    ${asset.price.toLocaleString()}
                  </div>
                  <div
                    className={`text-sm ${
                      asset.change24h >= 0 ? "text-success" : "text-destructive"
                    }`}
                  >
                    {asset.change24h >= 0 ? "↑" : "↓"}
                    {Math.abs(asset.change24h).toFixed(2)}%
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Trade Panel */}
      {selectedAsset && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
          <div className="text-center mb-4">
            <div className="font-medium">{selectedAsset.symbol}</div>
            <div className="text-2xl font-bold">
              ${selectedAsset.price.toLocaleString()}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              className="bg-success text-success-foreground"
              onClick={() => handleTrade("buy")}
            >
              КУПИТИ
            </Button>
            <Button
              className="bg-destructive text-destructive-foreground"
              onClick={() => handleTrade("sell")}
            >
              ПРОДАТИ
            </Button>
          </div>
        </div>
      )}

      <div className="pb-24" />
    </div>
  );
}
