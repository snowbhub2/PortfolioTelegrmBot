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
const getTransactionTitle = (transaction: Transaction, t: any) => {
  switch (transaction.type) {
    case "buy":
      return `${t('history.transaction.buy')} ${transaction.assetId?.toUpperCase() || t('history.transaction.asset')}`;
    case "sell":
      return `${t('history.transaction.sell')} ${transaction.assetId?.toUpperCase() || t('history.transaction.asset')}`;
    case "deposit":
      return t('history.transaction.deposit');
    case "withdraw":
      return t('history.transaction.withdraw');
    case "transfer_to_cfd":
      return t('history.transaction.transfer_to_cfd');
    case "transfer_from_cfd":
      return t('history.transaction.transfer_from_cfd');
    default:
      return t('history.transaction.default');
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
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Back button is now handled automatically by Telegram mini app

  useEffect(() => {
    // Ініціаліз��ці�� портфеля
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

  // Функція для генерації номеру транзакції
  const generateTransactionId = (transaction: Transaction, index: number) => {
    const prefix = transaction.type.toUpperCase().slice(0, 3);
    const timestamp = transaction.timestamp.getTime().toString().slice(-6);
    return `${prefix}${timestamp}${index.toString().padStart(3, '0')}`;
  };

  // Функція для отримання курсу обміну
  const getExchangeRate = (transaction: Transaction) => {
    if (transaction.price && transaction.quantity) {
      return transaction.price;
    }
    return 1; // Default rate for USD or transfers
  };

  // Функція для отримання типу транзакції для деталей
  const getTransactionGroup = (type: Transaction["type"]) => {
    switch (type) {
      case "buy":
        return t('history.details.group.purchase');
      case "sell":
        return t('history.details.group.sale');
      case "deposit":
        return t('history.details.group.deposit');
      case "withdraw":
        return t('history.details.group.withdrawal');
      case "transfer_to_cfd":
      case "transfer_from_cfd":
        return t('history.details.group.transfer');
      default:
        return t('history.details.group.other');
    }
  };

  // Функція для відкриття деталей транзакції
  const handleTransactionClick = (transaction: Transaction) => {
    hapticFeedback("light");
    setSelectedTransaction(transaction);
    setShowDetails(true);
  };

  // Функція для закриття деталей
  const handleCloseDetails = () => {
    hapticFeedback("light");
    setShowDetails(false);
    setSelectedTransaction(null);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffHours = diff / (1000 * 60 * 60);
    const diffDays = diff / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      return t('history.time.now');
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)} ${t('history.time.hours_ago')}`;
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)} ${t('history.time.days_ago')}`;
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
          <h1 className="text-xl font-semibold">{t('history.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('history.subtitle')}
          </p>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-border">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { key: "all", label: t('history.filter.all') },
              { key: "buy", label: t('history.filter.buy') },
              { key: "sell", label: t('history.filter.sell') },
              { key: "deposit", label: t('history.filter.deposit') },
              { key: "withdraw", label: t('history.filter.withdraw') },
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
              <div className="font-medium mb-2">{t('history.empty.title')}</div>
              <div className="text-sm text-muted-foreground mb-4">
                {filter === "all"
                  ? t('history.empty.subtitle_all')
                  : t('history.empty.subtitle_filtered')}
              </div>
              <Button onClick={() => navigate("/market")} variant="outline">
                {t('history.empty.go_to_market')}
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction, index) => (
                <Card
                  key={`${transaction.id}-${index}`}
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleTransactionClick(transaction)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-full">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <div className="font-medium">
                          {getTransactionTitle(transaction, t)}
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
                      {transaction.status && (
                        <div className={`text-xs ${
                          transaction.status === 'completed' ? 'text-success' :
                          transaction.status === 'pending' ? 'text-warning' :
                          transaction.status === 'processing' ? 'text-info' :
                          'text-destructive'
                        }`}>
                          {t(`history.status.${transaction.status}`)}
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
                  {t('history.portfolio.total_value')}
                </div>
                <div className="text-2xl font-bold text-primary">
                  ${portfolioManager.getTotalPortfolioValue().toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t('history.portfolio.cash')}: ${portfolioManager.getCashBalance().toFixed(2)} |
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
