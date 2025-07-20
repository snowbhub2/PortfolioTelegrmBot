import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeftIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  RefreshCwIcon,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import BottomNavigation from "@/components/BottomNavigation";

// Asset data mapping
const assetData = {
  usd: {
    name: "Доллары",
    symbol: "USDT",
    icon: "$",
    iconBg: "bg-green-500",
    balance: "0 USDT",
    price: 1.0,
    change24h: 0.02,
    priceChange: "+0.00 $",
  },
  ton: {
    name: "Toncoin",
    symbol: "TON",
    icon: "🔷",
    iconBg: "bg-blue-500",
    balance: "0 TON",
    price: 2.92,
    change24h: -0.47,
    priceChange: "-0.01 $",
  },
  btc: {
    name: "Bitcoin",
    symbol: "BTC",
    icon: "₿",
    iconBg: "bg-orange-500",
    balance: "0 BTC",
    price: 120256.98,
    change24h: 1.31,
    priceChange: "+1 557.73 $",
  },
  eth: {
    name: "Ethereum",
    symbol: "ETH",
    icon: "Ξ",
    iconBg: "bg-purple-500",
    balance: "0 ETH",
    price: 2945.61,
    change24h: -0.81,
    priceChange: "-24.12 $",
  },
  gold: {
    name: "Золото",
    symbol: "GOLD",
    icon: "🥇",
    iconBg: "bg-yellow-500",
    balance: "0 GOLD",
    price: 2650.5,
    change24h: 0.75,
    priceChange: "+19.88 $",
  },
};

const mockTransactions = [
  {
    id: "1",
    type: "exchange",
    description: "Обмен: BTC на USDT",
    amount: "0,0000509 BTC",
    status: "Отправлено",
    date: "6 дек. 2024 г. в 1...",
    isPositive: false,
  },
  {
    id: "2",
    type: "exchange",
    description: "Обмен: TON на BTC",
    amount: "+0,0000509 BTC",
    status: "Получено",
    date: "16 нояб. 2024 г...",
    isPositive: true,
  },
];

export default function AssetDetail() {
  const { tg, hapticFeedback } = useTelegram();
  const navigate = useNavigate();
  const { assetId } = useParams();

  const asset = assetData[assetId as keyof typeof assetData];

  if (!asset) {
    return <div>Asset not found</div>;
  }

  useEffect(() => {
    if (tg) {
      tg.BackButton.show();
      const handleBack = () => {
        hapticFeedback("light");
        navigate("/");
      };
      tg.BackButton.onClick(handleBack);

      return () => {
        tg.BackButton.offClick(handleBack);
      };
    }
  }, [tg, navigate, hapticFeedback]);

  const handleAction = (action: string) => {
    hapticFeedback("medium");
    console.log(`${action} ${asset.symbol}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-primary"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <span className="text-primary">Назад</span>
        </div>
        <div className="text-center">
          <h1 className="font-semibold">Гаманець ✓</h1>
          <p className="text-sm text-muted-foreground">мініЗастосунок</p>
        </div>
        <Button variant="ghost" size="icon">
          <div className="w-5 h-5 flex items-center justify-center">⋯</div>
        </Button>
      </div>

      {/* Asset Info */}
      <div className="text-center py-8">
        <div
          className={`w-20 h-20 ${asset.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}
        >
          <span className="text-white text-3xl font-bold">{asset.icon}</span>
        </div>
        <h2 className="text-3xl font-bold mb-2">{asset.name}</h2>
        <div className="text-3xl font-bold mb-2">0,00 $</div>
        <div className="text-muted-foreground">{asset.balance}</div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-4 gap-4 px-4 mb-8">
        <div className="flex flex-col items-center">
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full mb-2"
            onClick={() => handleAction("send")}
          >
            <ArrowUpIcon className="w-5 h-5" />
          </Button>
          <span className="text-xs text-primary">Отправить</span>
        </div>
        <div className="flex flex-col items-center">
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full mb-2"
            onClick={() => handleAction("receive")}
          >
            <ArrowDownIcon className="w-5 h-5" />
          </Button>
          <span className="text-xs text-primary">Получить</span>
        </div>
        <div className="flex flex-col items-center">
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full mb-2 bg-primary text-primary-foreground"
            onClick={() => handleAction("buy")}
          >
            <span className="text-lg font-bold">+</span>
          </Button>
          <span className="text-xs text-primary">Купить</span>
        </div>
        <div className="flex flex-col items-center">
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full mb-2"
            onClick={() => handleAction("exchange")}
          >
            <RefreshCwIcon className="w-5 h-5" />
          </Button>
          <span className="text-xs text-primary">Обменять</span>
        </div>
      </div>

      {/* Price Section */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-muted-foreground">ЦЕНА</h3>
          <span className="text-primary text-sm">Подробнее</span>
        </div>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold mb-1">
                {asset.price.toLocaleString()} $
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`${asset.change24h >= 0 ? "text-success" : "text-destructive"}`}
                >
                  {asset.change24h >= 0 ? "↑" : "↓"}{" "}
                  {Math.abs(asset.change24h).toFixed(2)}%
                </span>
                <span
                  className={`${asset.change24h >= 0 ? "text-success" : "text-destructive"}`}
                >
                  {asset.priceChange}
                </span>
                <span className="text-muted-foreground">24ч</span>
              </div>
            </div>
            <div className="w-20 h-12">
              <svg width="80" height="48" className="text-success">
                <polyline
                  points="0,36 20,30 40,24 60,18 80,12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Transaction History */}
      <div className="px-4">
        <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
          ИСТОРИЯ ТРАНЗАКЦИЙ
        </h3>
        <div className="space-y-3">
          {mockTransactions.map((transaction) => (
            <Card key={transaction.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <RefreshCwIcon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.date}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-medium ${transaction.isPositive ? "text-success" : "text-foreground"}`}
                  >
                    {transaction.amount}
                  </div>
                  <div
                    className={`text-sm ${transaction.isPositive ? "text-success" : "text-muted-foreground"}`}
                  >
                    {transaction.status}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
