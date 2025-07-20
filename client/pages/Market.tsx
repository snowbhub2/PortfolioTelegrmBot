import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MarketAsset } from "@/types/crypto";
import { ArrowLeftIcon, SearchIcon, TrendingUpIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "@/components/BottomNavigation";
import { TRENDING_ASSETS } from "@/data/trendingAssets";
import { usePriceUpdates } from "@/lib/priceService";
import {
  getTopPerformingAssets,
  generateMiniChartData,
} from "@/lib/trendingAssets";
import { MiniChart } from "@/components/MiniChart";

const mockTrendingAssets: MarketAsset[] = [
  {
    id: "cati",
    symbol: "CATI",
    name: "CATI",
    price: 0.0813,
    change24h: 3.16,
    marketCap: 81300000,
    icon: "🐱",
    sparkline: [0.078, 0.079, 0.081, 0.0813],
  },
  {
    id: "xtz",
    symbol: "XTZ",
    name: "XTZ",
    price: 0.536,
    change24h: 3.2,
    marketCap: 536000000,
    icon: "🔷",
    sparkline: [0.52, 0.525, 0.53, 0.536],
  },
];

// Акції
const stockAssets: MarketAsset[] = [
  {
    id: "aapl",
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 189.84,
    change24h: 1.25,
    marketCap: 2880000000000,
    icon: "🍎",
    sparkline: [188, 189, 189.5, 189.84],
  },
  {
    id: "tsla",
    symbol: "TSLA",
    name: "Tesla",
    price: 248.98,
    change24h: -2.15,
    marketCap: 793000000000,
    icon: "🚗",
    sparkline: [255, 252, 250, 248.98],
  },
  {
    id: "msft",
    symbol: "MSFT",
    name: "Microsoft",
    price: 415.75,
    change24h: 0.85,
    marketCap: 3100000000000,
    icon: "🖥️",
    sparkline: [412, 414, 415, 415.75],
  },
  {
    id: "googl",
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 172.48,
    change24h: 1.15,
    marketCap: 2150000000000,
    icon: "🔍",
    sparkline: [170, 171, 172, 172.48],
  },
];

// Криптовалюти
const cryptoAssets: MarketAsset[] = [
  {
    id: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    price: 109008.18,
    change24h: 1.09,
    marketCap: 2150000000000,
    icon: "₿",
    sparkline: [108000, 108500, 109000, 109008],
  },
  {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    price: 2620.19,
    change24h: 3.52,
    marketCap: 315000000000,
    icon: "Ξ",
    sparkline: [2530, 2580, 2610, 2620],
  },
  {
    id: "ton",
    symbol: "TON",
    name: "Toncoin",
    price: 2.92,
    change24h: -0.47,
    marketCap: 10000000000,
    icon: "🔷",
    sparkline: [2.95, 2.93, 2.92, 2.92],
  },
  {
    id: "sol",
    symbol: "SOL",
    name: "Solana",
    price: 152.47,
    change24h: 1.67,
    marketCap: 72000000000,
    icon: "🌅",
    sparkline: [150, 151, 152, 152.47],
  },
];

// Золото та метали
const goldAssets: MarketAsset[] = [
  {
    id: "gold",
    symbol: "GOLD",
    name: "Золото",
    price: 2650.5,
    change24h: 0.75,
    marketCap: 0,
    icon: "🥇",
    sparkline: [2640, 2645, 2648, 2650.5],
  },
  {
    id: "silver",
    symbol: "SILVER",
    name: "Срібло",
    price: 30.85,
    change24h: 1.22,
    marketCap: 0,
    icon: "🥈",
    sparkline: [30.5, 30.7, 30.8, 30.85],
  },
  {
    id: "platinum",
    symbol: "PLATINUM",
    name: "Платина",
    price: 945.2,
    change24h: -0.45,
    marketCap: 0,
    icon: "⚪",
    sparkline: [950, 948, 946, 945.2],
  },
];

export default function Market() {
  const { tg, hapticFeedback } = useTelegram();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "all" | "stocks" | "crypto" | "gold"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Реальні ціни активів
  const priceUpdates = usePriceUpdates();

  // Топ-4 активи за зростанням
  const [topAssets, setTopAssets] = useState(TRENDING_ASSETS.slice(0, 4));

  // Оновлення топ-активів при зміні цін
  useEffect(() => {
    if (Object.keys(priceUpdates).length > 0) {
      const topPerformers = getTopPerformingAssets(priceUpdates);
      setTopAssets(topPerformers);
    }
  }, [priceUpdates]);

  // Back button is now handled automatically by Telegram mini app

  const handleAssetClick = (asset: MarketAsset) => {
    hapticFeedback("medium");
    navigate(`/coin/${asset.id}`);
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000000) {
      return `${(marketCap / 1000000000).toFixed(1)}B`;
    } else if (marketCap >= 1000000) {
      return `${(marketCap / 1000000).toFixed(1)}M`;
    }
    return marketCap.toString();
  };

  const MiniSparkline = ({ data }: { data: number[] }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;

    return (
      <svg width="40" height="20" className="text-success">
        <polyline
          points={data
            .map((point, index) => {
              const x = (index / (data.length - 1)) * 40;
              const y = 20 - ((point - min) / range) * 20;
              return `${x},${y}`;
            })
            .join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Empty Header */}
      <div className="h-[17px] sm:h-16 p-4"></div>

      {/* Search */}
      <div className="px-4 mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Поиск"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Trending Section */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
          В ТРЕНДЕ
        </h2>

        <div
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory touch-pan-x"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {topAssets.map((asset) => {
            const chartData = generateMiniChartData(asset);
            const isPositive = asset.change24h >= 0;

            return (
              <Card
                key={asset.id}
                className="p-4 hover:bg-muted/50 transition-colors cursor-pointer w-[calc(50vw-24px)] flex-shrink-0 snap-start"
                onClick={() =>
                  handleAssetClick({
                    id: asset.id,
                    symbol: asset.symbol,
                    name: asset.name,
                    price: asset.price,
                    change24h: asset.change24h,
                    marketCap: 0,
                    icon: asset.icon,
                    sparkline: chartData,
                  })
                }
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 ${asset.iconBgColor} rounded-full flex items-center justify-center`}
                  >
                    <span className="text-white text-xl font-bold">
                      {asset.icon}
                    </span>
                  </div>
                  <div className="w-16 h-8">
                    <MiniChart
                      data={chartData}
                      isPositive={isPositive}
                      width={64}
                      height={32}
                    />
                  </div>
                </div>
                <div>
                  <div className="font-bold text-lg mb-1">{asset.symbol}</div>
                  <div
                    className={`text-base mb-2 ${isPositive ? "text-success" : "text-destructive"}`}
                  >
                    {isPositive ? "↑" : "↓"}{" "}
                    {Math.abs(asset.change24h).toFixed(2)}% за день
                  </div>
                  <div className="text-base font-semibold">
                    {asset.price.toLocaleString()} $
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Top Assets Section */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
          ТОП ДНЯ
        </h2>

        {/* Tabs */}
        <div className="flex space-x-6 mb-4 overflow-x-auto">
          {[
            { key: "all", label: "Все" },
            { key: "stocks", label: "Акції" },
            { key: "crypto", label: "Криптовалюти" },
            { key: "gold", label: "Золото" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as any);
                hapticFeedback("light");
              }}
              className={`pb-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Assets List */}
        <div className="space-y-2">
          {(() => {
            let assetsToShow: MarketAsset[] = [];

            switch (activeTab) {
              case "stocks":
                assetsToShow = stockAssets;
                break;
              case "crypto":
                assetsToShow = cryptoAssets;
                break;
              case "gold":
                assetsToShow = goldAssets;
                break;
              default:
                assetsToShow = [...stockAssets, ...cryptoAssets, ...goldAssets];
            }

            return assetsToShow.map((asset, index) => {
              // Оновлюємо ціну з реальних даних ��кщо доступно
              const realTimePrice = priceUpdates[asset.id];
              const currentAsset = realTimePrice
                ? {
                    ...asset,
                    price: realTimePrice.price,
                    change24h: realTimePrice.change24h,
                  }
                : asset;

              return (
                <Card
                  key={currentAsset.id}
                  className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleAssetClick(currentAsset)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-lg">{currentAsset.icon}</span>
                      </div>
                      <div>
                        <div className="font-medium">{currentAsset.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {currentAsset.symbol}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${currentAsset.price.toLocaleString()}
                      </div>
                      <div
                        className={`text-sm ${
                          currentAsset.change24h >= 0
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      >
                        {currentAsset.change24h >= 0 ? "↑" : "↓"}
                        {Math.abs(currentAsset.change24h).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </Card>
              );
            });
          })()}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
