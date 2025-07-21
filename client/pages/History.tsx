import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  RefreshCwIcon,
  ShoppingCartIcon,
  DollarSignIcon,
  SendIcon,
  StarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "@/components/BottomNavigation";
import { PortfolioManager, Transaction } from "@/lib/portfolio";

// Функція для отримання іконки транзакції
const getTransactionIcon = (type: Transaction["type"]) => {
  switch (type) {
    case "buy":
      return <ShoppingCartIcon className="w-5 h-5 text-success" />;
    case "sell":
      return <TrendingDownIcon className="w-5 h-5 text-destructive" />;
    case "deposit":
      return <StarIcon className="w-5 h-5 text-blue-500" />;
    case "withdraw":
      return <ArrowUpIcon className="w-5 h-5 text-orange-500" />;
    case "transfer_to_cfd":
      return <SendIcon className="w-5 h-5 text-purple-500" />;
    case "transfer_from_cfd":
      return <SendIcon className="w-5 h-5 text-purple-500" />;
    default:
      return <RefreshCwIcon className="w-5 h-5 text-muted-foreground" />;
  }
};

// Функція для отримання кольору транзакції
const getTransactionColor = (type: Transaction["type"]) => {
  switch (type) {
    case "buy":
    case "deposit":
    case "transfer_from_cfd":
      return "text-success";
    case "sell":
    case "withdraw":
    case "transfer_to_cfd":
      return "text-destructive";
    default:
      return "text-muted-foreground";
  }
};

// Функція для форматування назви транзакції
const getTransactionTitle = (transaction: Transaction) => {
  switch (transaction.type) {
    case "buy":
      return `Покуп��а ${transaction.assetId?.toUpperCase() || "активу"}`;
    case "sell":
      return `Продаж ${transaction.assetId?.toUpperCase() || "активу"}`;
    case "deposit":
      return "Поповнення звездами";
    case "withdraw":
      return "Виведення у зірки";
    case "transfer_to_cfd":
      return "Переказ д�� CFD";
    case "transfer_from_cfd":
      return "Переказ з CFD";
    default:
      return "Транзакція";
  }
};

export default function History() {
  const { user, hapticFeedback, tg } = useTelegram();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [portfolioManager, setPortfolioManager] =
    useState<PortfolioManager | null>(null);
  const [filter, setFilter] = useState<
    "all" | "buy" | "sell" | "deposit" | "withdraw"
  >("all");

  // Back button is now handled automatically by Telegram mini app

  useEffect(() => {
    // Ініціаліз��ція портфеля
    const userId = user?.id?.toString() || "demo_user";
    const portfolio = new PortfolioManager(userId);
    setPortfolioManager(portfolio);

    // Завантаження транзакцій
    setTransactions(portfolio.getTransactions());
  }, [user]);

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === "all") return true;
    return transaction.type === filter;
  });

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffHours = diff / (1000 * 60 * 60);
    const diffDays = diff / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      return "Щойно";
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)} год тому`;
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)} дн тому`;
    } else {
      return date.toLocaleDateString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pb-20">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-semibold">Історія операцій</h1>
          <p className="text-sm text-muted-foreground">
            Всі ваші транзакції та операції
          </p>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-border">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { key: "all", label: "Всі" },
              { key: "buy", label: "Покупки" },
              { key: "sell", label: "Продажі" },
              { key: "deposit", label: "Поповнення" },
              { key: "withdraw", label: "Виведення" },
            ].map((item) => (
              <Button
                key={item.key}
                variant={filter === item.key ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilter(item.key as any);
                  hapticFeedback("light");
                }}
                className="whitespace-nowrap"
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="p-4">
          {filteredTransactions.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-4xl mb-4">📊</div>
              <div className="font-medium mb-2">Поки немає транзакцій</div>
              <div className="text-sm text-muted-foreground mb-4">
                {filter === "all"
                  ? "Ваші операції з'являться тут"
                  : "Немає операцій цього типу"}
              </div>
              <Button onClick={() => navigate("/market")} variant="outline">
                Перейти до торгівлі
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction, index) => (
                <Card key={`${transaction.id}-${index}`} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-full">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <div className="font-medium">
                          {getTransactionTitle(transaction)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(transaction.timestamp)}
                        </div>
                        {transaction.quantity && transaction.price && (
                          <div className="text-xs text-muted-foreground">
                            {transaction.quantity.toFixed(2)} × $
                            {transaction.price.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-semibold ${getTransactionColor(transaction.type)}`}
                      >
                        {transaction.type === "buy" ||
                        transaction.type === "withdraw" ||
                        transaction.type === "transfer_to_cfd"
                          ? "-"
                          : "+"}
                        ${transaction.amount.toFixed(2)}
                      </div>
                      {transaction.assetId && (
                        <div className="text-xs text-muted-foreground">
                          {transaction.assetId.toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Детальний опис */}
                  {transaction.description && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <div className="text-xs text-muted-foreground">
                        {transaction.description}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Summary Card */}
        {portfolioManager && (
          <div className="p-4">
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">
                  Загальна вартість портфеля
                </div>
                <div className="text-2xl font-bold text-primary">
                  ${portfolioManager.getTotalPortfolioValue().toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Готівка: ${portfolioManager.getCashBalance().toFixed(2)} |
                  CFD: ${portfolioManager.getCfdBalance().toFixed(2)}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
