import { useState } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  TrendingUpIcon,
  LightbulbIcon,
  MegaphoneIcon,
  GraduationCapIcon,
  MessageCircleIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NotificationCategory {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  hasSettings?: boolean;
}

export default function Notifications() {
  const { hapticFeedback } = useTelegram();
  const navigate = useNavigate();

  const [notificationSettings, setNotificationSettings] = useState<NotificationCategory[]>([
    {
      id: "market-trends",
      icon: <TrendingUpIcon className="w-5 h-5 text-green-500" />,
      title: "Тренды рынка",
      description: "Изменение цен на активы",
      enabled: true,
      hasSettings: true,
    },
    {
      id: "updates",
      icon: <LightbulbIcon className="w-5 h-5 text-yellow-500" />,
      title: "Обновления",
      description: "Новые сервисы и возможности",
      enabled: true,
      hasSettings: true,
    },
    {
      id: "promotions",
      icon: <MegaphoneIcon className="w-5 h-5 text-blue-500" />,
      title: "Акции",
      description: "Розыгрыши и бонусы",
      enabled: true,
      hasSettings: true,
    },
    {
      id: "educational",
      icon: <GraduationCapIcon className="w-5 h-5 text-orange-500" />,
      title: "Образовательный контент",
      description: "Гайды и советы",
      enabled: true,
      hasSettings: true,
    },
    {
      id: "feedback",
      icon: <MessageCircleIcon className="w-5 h-5 text-purple-500" />,
      title: "Обратная связь",
      description: "Опросы и исследования",
      enabled: true,
      hasSettings: true,
    },
  ]);

  const [cfdNotifications, setCfdNotifications] = useState({
    enabled: true,
    address: "UQAW...2hFY",
  });

  const toggleNotification = (id: string) => {
    hapticFeedback("light");
    setNotificationSettings(prev =>
      prev.map(item =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const toggleCfdNotifications = () => {
    hapticFeedback("light");
    setCfdNotifications(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const handleCategoryClick = (category: NotificationCategory) => {
    if (category.hasSettings) {
      hapticFeedback("medium");
      // Тут можна додати навігацію до детальних налаштувань категорії
      console.log(`Открыть настройки для: ${category.title}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-4">
        {/* Main Notifications Section */}
        <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
          УВЕДОМЛЕНИЯ
        </h2>
        
        <Card className="mb-6">
          {notificationSettings.map((item, index) => (
            <div
              key={item.id}
              className={`p-4 flex items-center justify-between ${
                index !== notificationSettings.length - 1
                  ? "border-b border-border"
                  : ""
              }`}
            >
              <div 
                className="flex items-center gap-3 flex-1 cursor-pointer"
                onClick={() => handleCategoryClick(item)}
              >
                {item.icon}
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.description}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {item.enabled ? "Вкл" : "Выкл"}
                </span>
                {item.hasSettings && (
                  <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>
          ))}
        </Card>

        {/* Transaction Security Notice */}
        <div className="mb-4 text-sm text-muted-foreground">
          Уведомления о транзакциях и безопасности всегда будут включены.
        </div>

        {/* News Channel Link */}
        <div className="mb-6 text-sm text-muted-foreground">
          Все новости вы можете прочитать в канале{" "}
          <Button
            variant="ghost"
            className="text-primary p-0 h-auto text-sm"
            onClick={() => hapticFeedback("light")}
          >
            Новости Крипто Кошелька
          </Button>
          .
        </div>

        {/* CFD Wallet Notifications */}
        <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
          УВЕДОМЛЕНИЯ CFD КОШЕЛЬКА
        </h2>

        <Card className="mb-4">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">Уведомления для</span>
              <div className="flex items-center gap-2 text-primary">
                <span className="text-sm">{cfdNotifications.address}</span>
                <ChevronRightIcon className="w-4 h-4" />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="font-medium">Вкл</span>
                </div>
                <Switch
                  checked={cfdNotifications.enabled}
                  onCheckedChange={toggleCfdNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                  <span className="font-medium text-muted-foreground">Выкл</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="text-sm text-muted-foreground">
          Получайте уведомления, когда вам приходят CFD токены и NFT в CFD Кошелёк.
        </div>

        {/* News Channel Link for CFD */}
        <div className="mt-6 text-sm text-muted-foreground">
          Все новости можно узнать в канале{" "}
          <Button
            variant="ghost"
            className="text-primary p-0 h-auto text-sm"
            onClick={() => hapticFeedback("light")}
          >
            Новости CFD Кошелька
          </Button>
          .
        </div>
      </div>
    </div>
  );
}
