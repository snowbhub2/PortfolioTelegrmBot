import { useLanguage, Language } from "@/hooks/useLanguage";
import { useTelegram } from "@/hooks/useTelegram";
import { Card } from "@/components/ui/card";
import { CheckIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LanguageOption {
  code: Language;
  nativeName: string;
  englishName: string;
}

const languageOptions: LanguageOption[] = [
  {
    code: 'en',
    nativeName: 'English',
    englishName: 'English',
  },
  {
    code: 'ru',
    nativeName: 'Русский',
    englishName: 'Russian',
  },
];

export default function LanguageSelect() {
  const { hapticFeedback } = useTelegram();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLanguageSelect = (langCode: Language) => {
    hapticFeedback("light");
    setLanguage(langCode);
    // Перейти на головну сторінку після вибору мови
    setTimeout(() => {
      navigate("/");
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-4">
        {/* Language Title */}
        <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
          {t('language.title')}
        </h2>
        
        {/* Language Options */}
        <Card>
          {languageOptions.map((option, index) => (
            <div
              key={option.code}
              className={`p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors ${
                index !== languageOptions.length - 1
                  ? "border-b border-border"
                  : ""
              }`}
              onClick={() => handleLanguageSelect(option.code)}
            >
              <div className="flex-1">
                <div className="font-medium text-lg">{option.englishName}</div>
                <div className="text-sm text-muted-foreground">
                  {option.nativeName}
                </div>
              </div>
              {language === option.code && (
                <CheckIcon className="w-5 h-5 text-primary" />
              )}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
