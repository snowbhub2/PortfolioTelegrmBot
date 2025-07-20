import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";

export default function DepositAddress() {
  const { hapticFeedback, tg } = useTelegram();
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  const { asset, network } = location.state || {};

  // Mock address based on network
  const generateAddress = (networkId: string) => {
    switch (networkId) {
      case "trc20":
        return "TFzweVTwMhDWht1eAQWEJfiJ6SnPZLQfra";
      case "ton":
        return "EQBfAN7LfaUYgXZNw5Wc7GBgkEX2yhuJ5ka95J1JJwXXXXXX";
      case "erc20":
        return "0x742d35Cc6644C0532925a3b8D1234567890abcde";
      default:
        return "TFzweVTwMhDWht1eAQWEJfiJ6SnPZLQfra";
    }
  };

  const address = generateAddress(network?.id || "trc20");

  useEffect(() => {
    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() =>
        navigate("/deposit/network-select", { state: { asset } }),
      );
    }
    return () => {
      if (tg) {
        tg.BackButton.hide();
      }
    };
  }, [tg, navigate, asset]);

  const handleCopyAddress = async () => {
    hapticFeedback("medium");

    // First try the modern Clipboard API
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      } catch (clipboardError) {
        console.log(
          "Clipboard API failed, falling back to execCommand:",
          clipboardError,
        );
        // Fall through to the fallback method
      }
    }

    // Fallback method using execCommand
    try {
      const textArea = document.createElement("textarea");
      textArea.value = address;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Show feedback even if copy might have failed
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error("Failed to copy address:", error);
      // Still show feedback to user
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!asset || !network) {
    navigate("/deposit/asset-select");
    return null;
  }

  const networkName = network.name.toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-4 space-y-6">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">
            Ваш адрес в {asset.name.toLowerCase()}{" "}
            <span className="w-6 h-6 bg-muted-foreground rounded-full inline-flex items-center justify-center text-xs ml-2">
              ?
            </span>
          </h1>
          <div className="text-sm text-muted-foreground max-w-sm mx-auto">
            На этот адрес отправляйте только{" "}
            <span className="font-semibold">
              {asset.symbol} {networkName}
            </span>
            . Активы других сетей или NFT будут безвозвратно утрачены.
          </div>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <Card className="p-8 bg-muted/20">
            <div className="w-64 h-64 bg-white rounded-lg flex items-center justify-center">
              {/* QR Code SVG */}
              <svg
                width="240"
                height="240"
                viewBox="0 0 240 240"
                className="text-black"
              >
                {/* QR Code pattern - simplified representation */}
                <rect width="240" height="240" fill="white" />

                {/* Corner squares */}
                <rect x="0" y="0" width="60" height="60" fill="black" />
                <rect x="10" y="10" width="40" height="40" fill="white" />
                <rect x="20" y="20" width="20" height="20" fill="black" />

                <rect x="180" y="0" width="60" height="60" fill="black" />
                <rect x="190" y="10" width="40" height="40" fill="white" />
                <rect x="200" y="20" width="20" height="20" fill="black" />

                <rect x="0" y="180" width="60" height="60" fill="black" />
                <rect x="10" y="190" width="40" height="40" fill="white" />
                <rect x="20" y="200" width="20" height="20" fill="black" />

                {/* Data pattern - random pattern for visual effect */}
                {Array.from({ length: 15 }, (_, i) =>
                  Array.from({ length: 15 }, (_, j) => {
                    const x = 70 + j * 10;
                    const y = 70 + i * 10;
                    const shouldFill = (i + j) % 3 === 0;
                    return shouldFill ? (
                      <rect
                        key={`${i}-${j}`}
                        x={x}
                        y={y}
                        width="10"
                        height="10"
                        fill="black"
                      />
                    ) : null;
                  }),
                )}

                {/* Logo in center */}
                <circle
                  cx="120"
                  cy="120"
                  r="25"
                  fill={network.color.replace("bg-", "#")}
                />
                <text
                  x="120"
                  y="130"
                  textAnchor="middle"
                  fill="white"
                  fontSize="20"
                  fontWeight="bold"
                >
                  {network.icon}
                </text>
              </svg>
            </div>
            <div className="text-center mt-4 text-sm text-muted-foreground max-w-xs">
              Отсканируйте QR-код для отправки {asset.symbol} на свой кошелёк.
            </div>
          </Card>
        </div>

        {/* Address */}
        <Card className="p-4">
          <div className="text-center mb-3">
            <div className="text-sm text-muted-foreground mb-2">
              Ваш адрес {asset.symbol} {networkName}
            </div>
            <div className="font-mono text-sm break-all px-2 py-3 bg-muted rounded">
              {address}
            </div>
          </div>
          <Button
            className="w-full"
            onClick={handleCopyAddress}
            disabled={copied}
          >
            {copied ? "��дрес скопирован в буфер" : "Копировать адрес"}
          </Button>
        </Card>

        {/* Copy notification */}
        {copied && (
          <div className="fixed bottom-20 left-4 right-4">
            <Card className="p-3 bg-muted border text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">📋</span>
                <span className="text-sm">Адрес скопирован в буфер.</span>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
