import { useState } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { Card } from "@/components/ui/card";
import { CheckIcon } from "lucide-react";
import { useParams } from "react-router-dom";

interface CategoryConfig {
  title: string;
  description: string;
}

const categoryConfigs: Record<string, CategoryConfig> = {
  "market-trends": {
    title: "УВЕДОМЛЕНИЯ ТРЕНДОВ РЫНКА",
    description: "Изменения цен на активы."
  },
  "updates": {
    title: "УВЕДОМЛЕНИЯ ОБНОВЛЕНИЙ",
    description: "Новые сервисы и возможности."
  },
  "promotions": {
    title: "УВЕДОМЛЕНИЯ АКЦИЙ",
    description: "Розыгрыши и бонусы."
  },
  "educational": {
    title: "УВЕДОМЛЕНИЯ ОБРАЗОВАТЕЛЬНОГО КОНТЕНТА",
    description: "Гайды и советы."
  },
  "feedback": {
    title: "УВЕДОМЛЕНИЯ ОБ ОБРАТНОЙ СВЯЗИ",
    description: "Опросы пользователей, которые помогают улучшить сервис."
  },
};

export default function NotificationCategory() {
  const { hapticFeedback } = useTelegram();
  const { categoryId } = useParams<{ categoryId: string }>();
  
  const [isEnabled, setIsEnabled] = useState(true);
  
  const config = categoryConfigs[categoryId || ""] || {
    title: "УВЕДОМЛЕНИЯ",
    description: "Настройки уведомлений."
  };

  const handleToggle = (enabled: boolean) => {
    hapticFeedback("light");
    setIsEnabled(enabled);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-4">
        {/* Category Title */}
        <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
          {config.title}
        </h2>
        
        {/* Toggle Options */}
        <Card className="mb-4">
          <div className="p-4 space-y-3">
            {/* Enabled Option */}
            <div 
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                isEnabled 
                  ? "bg-primary/10 border border-primary/20" 
                  : "hover:bg-muted/50"
              }`}
              onClick={() => handleToggle(true)}
            >
              <span className={`font-medium ${isEnabled ? "text-primary" : "text-foreground"}`}>
                Вкл
              </span>
              {isEnabled && (
                <CheckIcon className="w-5 h-5 text-primary" />
              )}
            </div>

            {/* Disabled Option */}
            <div 
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                !isEnabled 
                  ? "bg-primary/10 border border-primary/20" 
                  : "hover:bg-muted/50"
              }`}
              onClick={() => handleToggle(false)}
            >
              <span className={`font-medium ${!isEnabled ? "text-primary" : "text-foreground"}`}>
                Выкл
              </span>
              {!isEnabled && (
                <CheckIcon className="w-5 h-5 text-primary" />
              )}
            </div>
          </div>
        </Card>

        {/* Description */}
        <div className="text-sm text-muted-foreground">
          {config.description}
        </div>
      </div>
    </div>
  );
}
