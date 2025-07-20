export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  price: number;
  change24h: number;
  icon: string;
}

export interface Transaction {
  id: string;
  type: "send" | "receive" | "exchange" | "bonus";
  asset: string;
  amount: number;
  usdValue: number;
  status: "completed" | "pending" | "failed";
  timestamp: Date;
  description: string;
  icon: string;
}

export interface BonusReward {
  id: string;
  name: string;
  symbol: string;
  apy: number;
  icon: string;
  status: "active" | "completed";
}

export interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  icon: string;
  sparkline: number[];
}
