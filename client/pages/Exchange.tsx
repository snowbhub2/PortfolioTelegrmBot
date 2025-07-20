import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowUpDownIcon, ChevronRightIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ExchangeAsset {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  price: number;
  icon: string;
  color: string;
}

// Assets available for exchange - from wallet assets section
const exchangeAssets: ExchangeAsset[] = [
  {
    id: "usd",
    symbol: "USDT",
    name: "Доллары",
    balance: 5500,
    price: 1,
    icon: "$",
    color: "bg-green-500",
  },
  {
    id: "ton",
    symbol: "TON",
    name: "Toncoin",
    balance: 10.5,
    price: 3.03,
    icon: "🔷",
    color: "bg-blue-500",
  },
  {
    id: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    balance: 0.025,
    price: 117456.06,
    icon: "₿",
    color: "bg-orange-500",
  },
  {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    balance: 1.2,
    price: 2945.61,
    icon: "Ξ",
    color: "bg-purple-500",
  },
];

export default function Exchange() {
  const { hapticFeedback, tg } = useTelegram();
  const navigate = useNavigate();

  const [fromAsset, setFromAsset] = useState<ExchangeAsset>(exchangeAssets[0]); // USDT
  const [toAsset, setToAsset] = useState<ExchangeAsset>(exchangeAssets[1]); // TON
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [showFromAssets, setShowFromAssets] = useState(false);
  const [showToAssets, setShowToAssets] = useState(false);

  useEffect(() => {
    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => navigate("/"));
    }
    return () => {
      if (tg) {
        tg.BackButton.hide();
      }
    };
  }, [tg, navigate]);

  // Calculate exchange rate and amounts
  useEffect(() => {
    if (fromAmount && !isNaN(parseFloat(fromAmount))) {
      const amount = parseFloat(fromAmount);
      const rate = fromAsset.price / toAsset.price;
      const result = amount * rate;
      setToAmount(result.toFixed(6));
    } else {
      setToAmount("");
    }
  }, [fromAmount, fromAsset.price, toAsset.price]);

  const handleSwapAssets = () => {
    hapticFeedback("light");
    const tempAsset = fromAsset;
    setFromAsset(toAsset);
    setToAsset(tempAsset);
    setFromAmount("");
    setToAmount("");
  };

  const handleFromAssetSelect = (asset: ExchangeAsset) => {
    hapticFeedback("light");
    if (asset.id !== toAsset.id) {
      setFromAsset(asset);
      setFromAmount("");
      setToAmount("");
    }
    setShowFromAssets(false);
  };

  const handleToAssetSelect = (asset: ExchangeAsset) => {
    hapticFeedback("light");
    if (asset.id !== fromAsset.id) {
      setToAsset(asset);
      setFromAmount("");
      setToAmount("");
    }
    setShowToAssets(false);
  };

  const handleMaxAmount = () => {
    hapticFeedback("light");
    setFromAmount(fromAsset.balance.toString());
  };

  const handleCheckDeal = () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      hapticFeedback("medium");
      return;
    }

    if (parseFloat(fromAmount) > fromAsset.balance) {
      hapticFeedback("medium");
      return;
    }

    hapticFeedback("light");
    // In real app would process the exchange
    console.log("Exchange:", {
      from: fromAsset.symbol,
      to: toAsset.symbol,
      fromAmount: parseFloat(fromAmount),
      toAmount: parseFloat(toAmount),
    });
  };

  const exchangeRate = toAsset.price / fromAsset.price;
  const isValidAmount =
    fromAmount &&
    parseFloat(fromAmount) > 0 &&
    parseFloat(fromAmount) <= fromAsset.balance;

  const availableFromAssets = exchangeAssets.filter(
    (asset) => asset.id !== toAsset.id,
  );
  const availableToAssets = exchangeAssets.filter(
    (asset) => asset.id !== fromAsset.id,
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-4 space-y-6">
        {/* From Asset */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 ${fromAsset.color} rounded-full flex items-center justify-center`}
              >
                <span className="text-white text-sm font-bold">
                  {fromAsset.id === "usd" ? "$" : fromAsset.icon}
                </span>
              </div>
              <span className="text-sm">Вы платите</span>
            </div>
            <div className="text-sm text-primary">
              Внести • {fromAsset.balance.toFixed(6)} {fromAsset.symbol}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <input
              type="number"
              placeholder="0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="text-4xl font-bold bg-transparent border-0 focus:outline-none w-2/3"
            />
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setShowFromAssets(true)}
            >
              <span className="text-2xl font-bold text-muted-foreground">
                {fromAsset.symbol}
              </span>
              <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          {fromAsset.balance > 0 && (
            <div className="flex justify-end mt-2">
              <button
                onClick={handleMaxAmount}
                className="text-sm text-primary"
              >
                Макс.
              </button>
            </div>
          )}
        </Card>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full"
            onClick={handleSwapAssets}
          >
            <ArrowUpDownIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* To Asset */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div
              className={`w-8 h-8 ${toAsset.color} rounded-full flex items-center justify-center`}
            >
              <span className="text-white text-sm font-bold">
                {toAsset.id === "usd" ? "$" : toAsset.icon}
              </span>
            </div>
            <span className="text-sm">Вы получите</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold w-2/3">{toAmount || "0"}</div>
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setShowToAssets(true)}
            >
              <span className="text-2xl font-bold text-muted-foreground">
                {toAsset.symbol}
              </span>
              <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </Card>

        {/* Exchange Rate */}
        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            1 {toAsset.symbol} ≈ {exchangeRate.toFixed(2)} {fromAsset.symbol}
          </div>
        </div>

        {/* Check Deal Button */}
        <Button
          className="w-full py-4 text-lg font-medium"
          disabled={!isValidAmount}
          onClick={handleCheckDeal}
        >
          Проверить сделку
        </Button>
      </div>

      {/* From Asset Selection Modal */}
      {showFromAssets && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-card rounded-t-lg w-full max-w-md border border-border animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold">Выберите актив</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFromAssets(false)}
              >
                ×
              </Button>
            </div>
            <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
              {availableFromAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleFromAssetSelect(asset)}
                >
                  <div
                    className={`w-10 h-10 ${asset.color} rounded-full flex items-center justify-center`}
                  >
                    <span className="text-white text-lg font-bold">
                      {asset.id === "usd" ? "$" : asset.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{asset.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {asset.balance} {asset.symbol}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* To Asset Selection Modal */}
      {showToAssets && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-card rounded-t-lg w-full max-w-md border border-border animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold">Выберите актив</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowToAssets(false)}
              >
                ×
              </Button>
            </div>
            <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
              {availableToAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleToAssetSelect(asset)}
                >
                  <div
                    className={`w-10 h-10 ${asset.color} rounded-full flex items-center justify-center`}
                  >
                    <span className="text-white text-lg font-bold">
                      {asset.id === "usd" ? "$" : asset.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{asset.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {asset.balance} {asset.symbol}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
