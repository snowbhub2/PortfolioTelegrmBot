# 🎨 Crypto Trading Platform Frontend

Современный frontend для торговой криптовалютной платформы с Telegram интеграцией.

## 🚀 Технологии

- **React 18** с TypeScript
- **Vite** для быстрой разработки
- **Tailwind CSS** для стилизации
- **Radix UI** компоненты
- **React Query** для работы с API
- **Recharts** для графиков
- **Telegram Web App SDK** для интеграции

## 📁 Структура проекта

```
frontend/
├── client/
│   ├── components/          # Компоненты
│   │   ├── ui/             # UI компоненты
│   │   ├── AdminLayout.tsx # Админ панель
│   │   └── Layout.tsx      # Основной лэйаут
│   ├── pages/              # Страницы
│   │   ├── Admin*.tsx      # Админ страницы
│   │   ├── Wallet.tsx      # Главная страница
│   │   └── Market.tsx      # Рынок
│   ├── hooks/              # Кастомные хуки
│   ├── lib/                # Утилиты
│   ├── types/              # TypeScript типы
│   └── App.tsx            # Главный компонент
├── public/                 # Статические файлы
├── package.json           # Зависимости
└── vite.config.ts        # Конфигурация Vite
```

## 🛠 Быстрый запуск

### Установка зависимостей

```bash
cd frontend
npm install
```

### Запуск dev сервера

```bash
npm run dev
# Доступен на http://localhost:5173
```

### Сборка для продакшена

```bash
npm run build
npm run preview  # Предпросмотр собранной версии
```

## 🔧 Конфигурация

### Переменные окружения

Создайте `.env` файл:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_TELEGRAM_BOT_NAME=your_bot_name
VITE_APP_NAME=Crypto Trading Platform
```

### Настройка API

Обновите базовый URL API в `client/lib/api.ts`:

```typescript
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
```

## 📱 Telegram Mini App

### Инициализация

Telegram Web App автоматически инициализируется в `client/telegram-init.ts`:

```typescript
import { useTelegram } from "@/hooks/useTelegram";

function App() {
  const { tg, user } = useTelegram();

  useEffect(() => {
    tg.ready();
  }, []);
}
```

### Авторизация

Авторизация происходит автоматически через Telegram WebApp:

```typescript
// Хук для получения данных пользователя
const { user, isLoading } = useUser();
```

## 🎨 UI/UX

### Дизайн система

Используется собственная дизайн система на базе:

- **Tailwind CSS** для стилей
- **Radix UI** для интерактивных компонентов
- **Lucide React** для иконок

### Темы

Поддерживается светлая �� темная тема:

```typescript
// Переключение темы
const { theme, toggleTheme } = useTheme();
```

### Адаптивность

Полностью адаптивный дизайн:

- Mobile-first подход
- Поддержка всех размеров экранов
- Touch-friendly интерфейс

## 📊 Компоненты

### Основные страницы

- **Wallet** - портфель и баланс
- **Market** - рынок и торговля
- **History** - история операций
- **Settings** - настройки профиля

### Админ панель

- **Dashboard** - общая статистика
- **Users** - управление пользователями
- **Assets** - управление активами
- **Transactions** - модерация операций
- **Settings** - настройки платформы

### UI компоненты

```typescript
// Примеры использования
<Button variant="primary" size="lg">
  Купить
</Button>

<Card>
  <CardHeader>
    <CardTitle>Портфель</CardTitle>
  </CardHeader>
  <CardContent>
    <Portfolio data={portfolioData} />
  </CardContent>
</Card>
```

## 🔌 API интеграция

### React Query

Используется для управления серверным состоянием:

```typescript
// Получение данных
const { data: assets, isLoading } = useQuery({
  queryKey: ["assets"],
  queryFn: () => api.getAssets(),
});

// Мутации
const buyAssetMutation = useMutation({
  mutationFn: api.buyAsset,
  onSuccess: () => {
    queryClient.invalidateQueries(["portfolio"]);
  },
});
```

### WebSocket (планируется)

Для real-time обновлений:

```typescript
// Подписка на обновления цен
const { price } = useRealtimePrice("BTC");
```

## 📈 Графики

### Recharts

Используется для отображения графиков:

```typescript
<LineChart data={priceHistory}>
  <Line dataKey="price" stroke="#2563eb" />
  <XAxis dataKey="date" />
  <YAxis />
</LineChart>
```

## 🔐 Безопасность

### Аутентификация

- JWT токены в localStorage
- Автоматическое обновление токенов
- Защищенные роуты

### Валидация

- Client-side валидация форм
- Sanitization пользовательского ввода
- Type safety с TypeScript

## 🧪 Тестирование

### Настройка ��естов

```bash
npm run test        # Запуск тестов
npm run test:ui     # UI для тестов
npm run coverage    # Покрытие кода
```

### Примеры тестов

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

## 🚀 Деплой

### Netlify (рекомендуется)

1. Подключите GitHub репозиторий
2. Настройте build команды:
   ```
   Build command: npm run build
   Publish directory: dist
   ```
3. Добавьте переменные окружения

### Vercel

```bash
npm install -g vercel
vercel --prod
```

### Статический хостинг

```bash
npm run build
# Загрузите папку dist/ на любой статический хостинг
```

## 🔧 Разработка

### Добавление новой страницы

1. Создайте компонент в `client/pages/`
2. Добавьте роут в `client/App.tsx`
3. Обновите навигацию если нужно

### Создание компонента

```typescript
// client/components/MyComponent.tsx
interface MyComponentProps {
  title: string;
  data: any[];
}

export function MyComponent({ title, data }: MyComponentProps) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{title}</h2>
      {/* Ваш код */}
    </div>
  );
}
```

### Стилизация

```typescript
// Используйте Tailwind CSS классы
<div className="bg-white rounded-lg shadow-md p-6">
  <h3 className="text-lg font-semibold mb-4">Заголовок</h3>
  <p className="text-gray-600">Описание</p>
</div>
```

## 📚 Ресурсы

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
- [Telegram Web Apps](https://core.telegram.org/bots/webapps)

## 🤝 Участие в разработке

1. Fork репозитория
2. Создайте feature branch
3. Внесите изменения
4. Добавьте тесты
5. Создайте Pull Request

## 📝 Код-стиль

- Используйте TypeScript для типобезопасности
- Следуйте ESLint правилам
- Используйте Prettier для форматирования
- Компоненты в PascalCase
- Файлы в kebab-case

## 🐛 Отладка

### Dev Tools

- React Developer Tools
- Redux DevTools (если используется)
- Network tab для API запросов

### Логирование

```typescript
// Включите debug режим
localStorage.setItem("debug", "true");
```

## 📄 Лицензия

MIT License

---

**Happy coding! 🚀**
