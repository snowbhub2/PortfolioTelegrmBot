import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTelegram } from "@/hooks/useTelegram";

interface ChartData {
  time: string;
  price: number;
}

interface InteractiveChartProps {
  assetId: string;
  currentPrice: number;
  change24h: number;
  width?: number;
  height?: number;
}

// Генератор даних графіка для різних інтервалів
const generateChartData = (
  assetId: string,
  currentPrice: number,
  change24h: number,
  interval: string,
): ChartData[] => {
  const dataPoints: { [key: string]: number } = {
    "1Д": 24, // 24 години
    "7Д": 168, // 7 днів по 24 години
    "1М": 720, // 30 днів по 24 години
    "1Г": 8760, // 365 днів по 24 години
    Все: 17520, // 2 роки
  };

  const points = dataPoints[interval] || 24;
  const data: ChartData[] = [];

  // Розраховуємо початкову ціну на основі зміни за 24 години
  const startPrice = currentPrice / (1 + change24h / 100);

  // Генеруємо випадкові дані з загальним трендом
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1);

    // Основний тренд від початкової до поточної ціни
    let price = startPrice + (currentPrice - startPrice) * progress;

    // Додаємо випадкові коливання (більше для довших періодів)
    const volatility =
      interval === "1Д" ? 0.02 : interval === "7Д" ? 0.05 : 0.1;
    const randomFactor = 1 + (Math.random() - 0.5) * volatility;
    price *= randomFactor;

    // Обмежуємо мінімальну ціну
    price = Math.max(price, startPrice * 0.5);

    // Генеруємо час залежно від інтервалу
    let timeLabel = "";
    if (interval === "1Д") {
      const hour = Math.floor(i / 1);
      timeLabel = `${hour.toString().padStart(2, "0")}:00`;
    } else if (interval === "7Д") {
      const day = Math.floor(i / 24) + 1;
      timeLabel = `День ${day}`;
    } else {
      const month = Math.floor(i / 720) + 1;
      timeLabel = `Міс ${month}`;
    }

    data.push({
      time: timeLabel,
      price: price,
    });
  }

  return data;
};

export function InteractiveChart({
  assetId,
  currentPrice,
  change24h,
  width = 400,
  height = 200,
}: InteractiveChartProps) {
  const { hapticFeedback } = useTelegram();
  const [selectedInterval, setSelectedInterval] = useState("1Д");
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const intervals = ["1Д", "7Д", "1М", "1Г", "Все"];

  useEffect(() => {
    const data = generateChartData(
      assetId,
      currentPrice,
      change24h,
      selectedInterval,
    );
    setChartData(data);
  }, [assetId, currentPrice, change24h, selectedInterval]);

  const handleIntervalChange = (interval: string) => {
    hapticFeedback("light");
    setSelectedInterval(interval);
  };

  if (chartData.length === 0) return null;

  const maxPrice = Math.max(...chartData.map((d) => d.price));
  const minPrice = Math.min(...chartData.map((d) => d.price));
  const priceRange = maxPrice - minPrice;

  if (priceRange === 0) return null;

  const isPositive = change24h >= 0;
  const strokeColor = isPositive
    ? "hsl(var(--success))"
    : "hsl(var(--destructive))";

  // Генеруємо точки для лінії графіка
  const points = chartData
    .map((point, index) => {
      const x = (index / (chartData.length - 1)) * (width - 40) + 20;
      const y =
        height - 40 - ((point.price - minPrice) / priceRange) * (height - 80);
      return `${x},${y}`;
    })
    .join(" ");

  // Генеруємо область заливки
  const areaPoints = `20,${height - 20} ${points} ${width - 20},${height - 20}`;

  return (
    <div className="w-full">
      {/* Chart Container */}
      <div className="relative mb-4">
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
        >
          {/* Grid Lines */}
          {[0.2, 0.4, 0.6, 0.8].map((ratio, i) => {
            const y = height - 40 - ratio * (height - 80);
            const price = minPrice + ratio * priceRange;
            return (
              <g key={i}>
                <line
                  x1="20"
                  y1={y}
                  x2={width - 20}
                  y2={y}
                  stroke="hsl(var(--muted))"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
                <text
                  x={width - 15}
                  y={y + 3}
                  fontSize="10"
                  fill="hsl(var(--muted-foreground))"
                  textAnchor="start"
                >
                  ${price.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <polygon points={areaPoints} fill={strokeColor} opacity="0.1" />

          {/* Main Line */}
          <polyline
            points={points}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover Points */}
          {chartData.map((point, index) => {
            const x = (index / (chartData.length - 1)) * (width - 40) + 20;
            const y =
              height -
              40 -
              ((point.price - minPrice) / priceRange) * (height - 80);

            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r={hoveredPoint === index ? "4" : "0"}
                fill={strokeColor}
                className="transition-all duration-200"
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}

          {/* Gradient Definition */}
          <defs>
            <linearGradient
              id={`gradient-${assetId}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor={strokeColor} />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint !== null && (
          <div className="absolute top-2 left-2 bg-card border border-border rounded p-2 text-sm shadow-lg">
            <div className="font-medium">
              ${chartData[hoveredPoint].price.toFixed(4)}
            </div>
            <div className="text-muted-foreground text-xs">
              {chartData[hoveredPoint].time}
            </div>
          </div>
        )}
      </div>

      {/* Interval Selection */}
      <div className="flex gap-2 justify-center">
        {intervals.map((interval) => (
          <Button
            key={interval}
            variant={selectedInterval === interval ? "default" : "outline"}
            size="sm"
            onClick={() => handleIntervalChange(interval)}
            className="text-xs px-3 py-1"
          >
            {interval}
          </Button>
        ))}
      </div>
    </div>
  );
}
