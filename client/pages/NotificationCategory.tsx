import { useState } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { useLanguage } from "@/hooks/useLanguage";
import { Card } from "@/components/ui/card";
import { CheckIcon } from "lucide-react";
import { useParams } from "react-router-dom";

interface CategoryConfig {
  title: string;
  description: string;
}

export default function NotificationCategory() {
  const { hapticFeedback } = useTelegram();
  const { t } = useLanguage();
  const { categoryId } = useParams<{ categoryId: string }>();
  
  const [isEnabled, setIsEnabled] = useState(true);

  // Перемістив categoryConfigs всередину компонента, щоб мати доступ до t()
  const categoryConfigs: Record<string, CategoryConfig> = {
    "market-trends": {
      title: t('notifications.category.market_trends'),
      description: t('notifications.market_trends_desc')
    },
    "updates": {
      title: t('notifications.category.updates'),
      description: t('notifications.updates_desc')
    },
    "promotions": {
      title: t('notifications.category.promotions'),
      description: t('notifications.promotions_desc')
    },
    "educational": {
      title: t('notifications.category.educational'),
      description: t('notifications.educational_desc')
    },
    "feedback": {
      title: t('notifications.category.feedback'),
      description: t('notifications.category.feedback_desc')
    },
  };
  
  const config = categoryConfigs[categoryId || ""] || {
    title: t('notifications.title'),
    description: t('notifications.category.feedback_desc')
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
                {t('notifications.on')}
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
                {t('notifications.off')}
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
