// Утиліти для управління трендовими активами
import { AssetPrice } from "./priceService";

// Всі доступні активи для трендингу
export interface TrendingAsset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  icon: string;
  iconBgColor: string;
  category: "stocks" | "crypto" | "gold";
}

export const ALL_TRENDING_ASSETS: TrendingAsset[] = [
  // Криптовалюти
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

  // Золото та метали
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
  {
    id: "platinum",
    symbol: "PLATINUM",
    name: "Платина",
    price: 945.2,
    change24h: -0.45,
    icon: "⚪",
    iconBgColor: "bg-gray-600",
    category: "gold",
  },

  // Додаткові активи для різноманітності
  {
    id: "xrp",
    symbol: "XRP",
    name: "XRP",
    price: 2.313,
    change24h: 0.94,
    icon: "🔷",
    iconBgColor: "bg-blue-400",
    category: "crypto",
  },
];

// Функція для отримання топ-4 активів за зростанням
export function getTopPerformingAssets(
  priceUpdates: Record<string, AssetPrice>,
): TrendingAsset[] {
  // Оновлюємо ціни активів з реальних даних
  const updatedAssets = ALL_TRENDING_ASSETS.map((asset) => {
    const priceUpdate = priceUpdates[asset.id];
    return priceUpdate
      ? {
          ...asset,
          price: priceUpdate.price,
          change24h: priceUpdate.change24h,
        }
      : asset;
  });

  // Сортуємо за зростанням за 24 години (від найбільшого до найменшого)
  const sortedAssets = updatedAssets.sort((a, b) => b.change24h - a.change24h);

  // Повертаємо топ-4
  return sortedAssets.slice(0, 4);
}

// Генератор міні-графіків для активів
export function generateMiniChartData(
  asset: TrendingAsset,
  pointsCount: number = 20,
): number[] {
  const currentPrice = asset.price;
  const change24h = asset.change24h;

  // Розраховуємо початкову ціну (24 години тому)
  const startPrice = currentPrice / (1 + change24h / 100);

  // Генеруємо точки між початковою та поточною ціною
  const points: number[] = [];
  for (let i = 0; i < pointsCount; i++) {
    const progress = i / (pointsCount - 1);

    // Додаємо трохи випадковості для реалістичності
    const randomFactor = 1 + (Math.random() - 0.5) * 0.02; // ±1% випадковості

    // Інтерполяція між ��очатковою та кінцевою ціною
    const interpolatedPrice =
      startPrice + (currentPrice - startPrice) * progress;
    points.push(interpolatedPrice * randomFactor);
  }

  return points;
}
