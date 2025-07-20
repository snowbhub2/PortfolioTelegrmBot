export interface TrendingAsset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  icon: string;
  iconBgColor: string;
}

export const TRENDING_ASSETS: TrendingAsset[] = [
  {
    id: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    price: 118004.4,
    change24h: 6.06,
    icon: "₿",
    iconBgColor: "bg-orange-500",
  },
  {
    id: "pi",
    symbol: "PI",
    name: "Pi Network",
    price: 0.5,
    change24h: 5.09,
    icon: "π",
    iconBgColor: "bg-purple-500",
  },
  {
    id: "wld",
    symbol: "WLD",
    name: "Worldcoin",
    price: 1.097,
    change24h: 17.7,
    icon: "W",
    iconBgColor: "bg-gray-800",
  },
  {
    id: "algo",
    symbol: "ALGO",
    name: "Algorand",
    price: 0.2207,
    change24h: 12.51,
    icon: "A",
    iconBgColor: "bg-teal-500",
  },
];
