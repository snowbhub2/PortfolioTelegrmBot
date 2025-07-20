import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeftIcon, ArrowUpIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function WithdrawAmount() {
  const { hapticFeedback, tg } = useTelegram();
  const navigate = useNavigate();
  const location = useLocation();
  const [amount, setAmount] = useState("");
  const [showInsufficientFunds, setShowInsufficientFunds] = useState(false);

  const { asset, address, network } = location.state || {};

  // Using the balance from the asset data passed from previous screen
  const userBalance = asset?.balance || 0;

  useEffect(() => {
    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() =>
        navigate("/withdraw/wallet-address", { state: { asset } }),
      );
    }
    return () => {
      if (tg) {
        tg.BackButton.hide();
      }
    };
  }, [tg, navigate, asset]);

  // Show insufficient funds error when amount is greater than balance
  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    setShowInsufficientFunds(numAmount > userBalance && numAmount > 0);
  }, [amount, userBalance]);

  const handleMaxAmount = () => {
    hapticFeedback("light");
    setAmount(userBalance.toString());
  };

  const handleContinue = () => {
    const numAmount = parseFloat(amount) || 0;

    if (!amount || numAmount <= 0) {
      hapticFeedback("medium");
      return;
    }

    if (numAmount > userBalance) {
      hapticFeedback("medium");
      setShowInsufficientFunds(true);
      return;
    }

    hapticFeedback("light");
    navigate("/withdraw/processing", {
      state: {
        asset,
        address,
        network,
        amount: numAmount,
        type: "external-wallet",
      },
    });
  };

  const isValidAmount =
    amount && parseFloat(amount) > 0 && parseFloat(amount) <= userBalance;
  const shortAddress = address
    ? `${address.slice(0, 2)}...${address.slice(-4)}`
    : "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col h-screen">
        {/* Address Display */}
        {address && (
          <div className="p-4">
            <div className="flex items-center justify-center">
              <div className="bg-muted rounded-full px-4 py-2 flex items-center gap-2">
                <ArrowUpIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{shortAddress}</span>
              </div>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div className="flex-1 flex flex-col justify-center px-4">
          <div className="text-center mb-8">
            <div className="mb-4">
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-6xl font-bold bg-transparent border-0 focus:outline-none text-center w-full"
                style={{ fontSize: amount.length > 8 ? "3rem" : "4rem" }}
              />
              <div className="text-lg text-muted-foreground mt-2">USDT</div>
            </div>

            <div className="text-sm text-muted-foreground">
              1 USDT ≈ 0,99 USD ↑↓
            </div>

            {showInsufficientFunds && (
              <div className="mt-4">
                <div className="text-red-500 font-medium">
                  Недостаточно средств.{" "}
                  <button className="text-primary underline">Докупить.</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Balance and Max Button */}
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">$</span>
              </div>
              <span className="text-sm">
                Баланс: {userBalance.toLocaleString()} USDT
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMaxAmount}
              className="text-primary"
            >
              Макс.
            </Button>
          </div>

          <Button
            className="w-full py-4 text-lg font-medium"
            disabled={!isValidAmount}
            onClick={handleContinue}
          >
            Далее
          </Button>
        </div>
      </div>
    </div>
  );
}
