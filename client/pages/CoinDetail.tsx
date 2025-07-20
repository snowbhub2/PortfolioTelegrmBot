import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
// ArrowLeftIcon removed - using Telegram mini app navigation
import { useNavigate, useParams } from "react-router-dom";
import { TRENDING_ASSETS } from "@/data/trendingAssets";
import { PortfolioManager } from "@/lib/portfolio";
import { usePriceUpdates } from "@/lib/priceService";
import { BuyAssetModal } from "@/components/BuyAssetModal";
import { SellAssetModal } from "@/components/SellAssetModal";
import { InteractiveChart } from "@/components/InteractiveChart";

// Interactive chart with real data is now used instead of mock data

// Розширений список активів для деталей
const allAssets = [
  ...TRENDING_ASSETS,
  // Акції
  {
    id: "aapl",
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 189.84,
    change24h: 1.25,
    icon: "🍎",
    iconBgColor: "bg-gray-500",
    category: "stocks",
  },
  {
    id: "tsla",
    symbol: "TSLA",
    name: "Tesla",
    price: 248.98,
    change24h: -2.15,
    icon: "🚗",
    iconBgColor: "bg-red-500",
    category: "stocks",
  },
  {
    id: "msft",
    symbol: "MSFT",
    name: "Microsoft",
    price: 415.75,
    change24h: 0.85,
    icon: "🖥️",
    iconBgColor: "bg-blue-500",
    category: "stocks",
  },
  {
    id: "googl",
    symbol: "GOOGL",
    name: "Alphabet",
    price: 172.48,
    change24h: 1.15,
    icon: "🔍",
    iconBgColor: "bg-green-500",
    category: "stocks",
  },
  // Золото
  {
    id: "gold",
    symbol: "GOLD",
    name: "Золото",
    price: 2650.5,
    change24h: 0.75,
    icon: "🥇",
    iconBgColor: "bg-yellow-500",
    category: "gold",
  },
  {
    id: "silver",
    symbol: "SILVER",
    name: "Срібло",
    price: 30.85,
    change24h: 1.22,
    icon: "🥈",
    iconBgColor: "bg-gray-400",
    category: "gold",
  },
  // Крипто
  {
    id: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    price: 109008.18,
    change24h: 1.09,
    icon: "₿",
    iconBgColor: "bg-orange-500",
    category: "crypto",
  },
  {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    price: 2620.19,
    change24h: 3.52,
    icon: "Ξ",
    iconBgColor: "bg-blue-600",
    category: "crypto",
  },
  {
    id: "ton",
    symbol: "TON",
    name: "Toncoin",
    price: 2.92,
    change24h: -0.47,
    icon: "🔷",
    iconBgColor: "bg-blue-500",
    category: "crypto",
  },
  {
    id: "sol",
    symbol: "SOL",
    name: "Solana",
    price: 152.47,
    change24h: 1.67,
    icon: "🌅",
    iconBgColor: "bg-purple-500",
    category: "crypto",
  },
];

export default function CoinDetail() {
  const { tg, hapticFeedback, user } = useTelegram();
  const navigate = useNavigate();
  const { coinId } = useParams();
  // timeRange moved to InteractiveChart component
  const [portfolioManager, setPortfolioManager] =
    useState<PortfolioManager | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);

  // Реальні ціни активів
  const priceUpdates = usePriceUpdates();

  // Find the asset based on coinId
  let asset = allAssets.find((a) => a.id === coinId) || {
    id: "hedera",
    symbol: "HBAR",
    name: "Hedera",
    price: 0.172,
    change24h: 6.48,
    icon: "H",
    iconBgColor: "bg-foreground",
    category: "crypto",
  };

  // Оновлюємо ціну з реальних даних якщо доступно
  if (priceUpdates[asset.id]) {
    asset = {
      ...asset,
      price: priceUpdates[asset.id].price,
      change24h: priceUpdates[asset.id].change24h,
    };
  }

  // Back button is now handled automatically by Telegram mini app

  useEffect(() => {
    // Ініціалізація портфеля
    const userId = user?.id?.toString() || "demo_user";
    const portfolio = new PortfolioManager(userId);
    setPortfolioManager(portfolio);
  }, [user]);

  const handleBuy = () => {
    hapticFeedback("medium");
    setShowBuyModal(true);
  };

  const handleSell = () => {
    hapticFeedback("medium");
    setShowSellModal(true);
  };

  const handleBuySuccess = () => {
    hapticFeedback("light");
    // Портфель автоматично оновиться через реактивність
  };

  // Chart functionality moved to InteractiveChart component

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Simple padding for top spacing */}
      <div className="pt-4"></div>

      {/* Space for better layout */}

      {/* Coin Info */}
      <div className="p-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{asset.name}</h2>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-success text-sm">
                  ↑ {asset.change24h.toFixed(2)}%
                </span>
                <span className="text-success text-sm">
                  +{((asset.price * asset.change24h) / 100).toFixed(4)} $
                </span>
                <span className="text-muted-foreground text-sm">Сегодня</span>
              </div>
            </div>
            <div
              className={`w-12 h-12 ${asset.iconBgColor} rounded-full flex items-center justify-center text-white font-bold text-xl`}
            >
              {asset.icon}
            </div>
          </div>

          <div className="text-3xl font-bold mb-4">
            {asset.price.toLocaleString()} $
          </div>

          {/* Interactive Chart */}
          <InteractiveChart
            assetId={asset.id}
            currentPrice={asset.price}
            change24h={asset.change24h}
            width={400}
            height={200}
          />
        </Card>
      </div>

      {/* About Section */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-3 text-muted-foreground">
          О КРИПТОВАЛЮТЕ
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Hedera запустили в 2018 году. Вместо блокчейна она использует
          технологию hashgraph — данные записывают{" "}
          <span className="text-primary">��одробнее</span>
        </p>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Вы можете только поку��ать, продавать или хранить HBAR в Кошельке.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-3">
        <Button
          className="w-full bg-primary text-primary-foreground"
          onClick={handleBuy}
        >
          Купить
        </Button>
        <Button variant="outline" className="w-full" onClick={handleSell}>
          Продать
        </Button>
      </div>

      {/* Buy Asset Modal */}
      <BuyAssetModal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        asset={{
          ...asset,
          category: asset.category || "crypto",
        }}
        portfolioManager={portfolioManager}
        onSuccess={handleBuySuccess}
      />

      {/* Sell Asset Modal */}
      <SellAssetModal
        isOpen={showSellModal}
        onClose={() => setShowSellModal(false)}
        asset={{
          ...asset,
          category: asset.category || "crypto",
        }}
        portfolioManager={portfolioManager}
        onSuccess={handleBuySuccess}
      />
    </div>
  );
}
