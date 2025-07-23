# 🚀 Crypto Trading Platform

Полнофункциональная торговая криптовалютная платформа с Telegram интеграцией, админ панелью и рыночными данными в реальном времени.

## 📋 Обзор проекта

Это профессиональная торговая платформа, которая включает:

- **Frontend**: React + TypeScript + Tailwind CSS + Telegram Mini App
- **Backend**: FastAPI + SQLModel + PostgreSQL + Redis + Celery
- **Интеграции**: Telegram Bot API, Alpha Vantage, Supabase

## 🏗 Архитектура

```
crypto-trading-platform/
├── frontend/               # React приложение
│   ├── client/            # Исходный код ��ронтенда
│   ├── public/            # Статические файлы
│   ├── package.json       # Зависимости Node.js
│   └── vite.config.ts     # Конфигурация Vite
├── backend/               # FastAPI приложение
│   ├── app/              # Исходный код бэкенда
│   ├── tests/            # Тесты
│   ├── requirements.txt  # Python зависимости
│   └── docker-compose.yml # Docker контейнеры
└── README.md             # Документация проекта
```

## 🚀 Быстрый запуск

### Полный запуск с Docker

```bash
# Клонирование репозитория
git clone <repository-url>
cd crypto-trading-platform

# Запуск backend сервисов
cd backend
cp .env.example .env
docker-compose up -d

# Запуск frontend (в новом терминале)
cd ../frontend
npm install
npm run dev
```

### Отдельный запуск компонентов

#### Frontend

```bash
cd frontend
npm install
npm run dev
# Доступен на http://localhost:5173
```

#### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# Доступен на http://localhost:8000
```

## 🌐 Доступ к приложению

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Документация**: http://localhost:8000/docs
- **Celery Flower**: http://localhost:5555

## 🔧 Конфигурация

### Backend (.env)

```env
# Supabase Database
DATABASE_URL=postgresql://postgres:password@zwbnpukhgetmqcvevhhk.supabase.co:5432/postgres
SUPABASE_URL=https://zwbnpukhgetmqcvevhhk.supabase.co
SUPABASE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3Ym5wdWtoZ2V0bXFjdmV2aGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzk5MTcsImV4cCI6MjA2ODg1NTkxN30.tFFjq2KB3oz_vcaL9vvysju28rL6M_4R1Y7EIo_fULU

# Telegram Bot
TELEGRAM_BOT_TOKEN=7583253418:AAE8FfyJRoUKsPJyYKUvmJjGBRsVNaMLC_w
TELEGRAM_ADMIN_ID=8103090312

# Alpha Vantage API
ALPHA_VANTAGE_API_KEY=WXQQ5D56DW1XH92C
```

### Frontend

Обновите `frontend/client/App.tsx` для подключения к backend API:

```typescript
const API_BASE_URL = "http://localhost:8000/api/v1";
```

## 🎯 Основные функции

### 👤 Пользователи

- ✅ Авторизация через Telegram
- ✅ Автоматическое создание аккаунтов
- ✅ Роли (Admin/User/Moderator)
- ✅ KYC верификация
- ✅ Управление профилем

### 💰 Торговля

- ✅ Реальные цены активов (Alpha Vantage)
- ✅ Портфель пользователя
- ✅ Ордера (Market/Limit)
- ✅ История транзакций
- ✅ P&L расчеты

### 🏛 Админ панель

- ✅ Управление пользователями
- ✅ Управление активами
- ✅ Модерация транзакций
- ✅ Настройки платформы
- ✅ Аналитика и отчеты

### 📱 Telegram интеграция

- ✅ Telegram Mini App
- ✅ Push уведомления
- ✅ Авторизация через WebApp
- ✅ Платежи Telegram Stars

### 💳 Платежи

- ✅ Telegram Stars
- ✅ USDT через Telegram Wallet
- ✅ Автоматическое подтверждение депозитов
- ✅ Система выводов с модерацией

## 🛠 Технологии

### Frontend

- **React 18** - UI библиотека
- **TypeScript** - типизация
- **Vite** - сборщик
- **Tailwind CSS** - стили
- **Radix UI** - компоненты
- **Recharts** - графики
- **React Query** - управление состоянием сервера

### Backend

- **FastAPI** - веб-фреймворк
- **SQLModel** - ORM с типами
- **PostgreSQL** - база данных
- **Redis** - кэширование
- **Celery** - фоновые задачи
- **Aiogram 3** - Telegram Bot API
- **Alpha Vantage** - рыночные данные

## 🔐 Безопасность

- JWT токены для авторизации
- Telegram WebApp верификация
- Rate limiting
- SQL injection защита
- XSS защита
- HTTPS enforce в продакшене

## 📊 Мониторинг

- Structured logging
- Health check endpoints
- Celery task monitoring (Flower)
- Database connection pooling
- Error tracking готов для Sentry

## 🚀 Развертывание

### Локальная разработка

1. Настройте `.env` файлы
2. Запустите `docker-compose up -d` в `backend/`
3. Запустите `npm run dev` в `frontend/`

### Продакшен (Netlify + любой хостинг)

#### Frontend (Netlify)

```bash
cd frontend
npm run build
# Загрузите dist/ папку на Netlify
```

#### Backend (VPS/Cloud)

```bash
# На сервере
git clone <repo>
cd backend
docker-compose -f docker-compose.prod.yml up -d
```

### Переме��ные окружения для продакшена

```env
ENVIRONMENT=production
DEBUG=false
ALLOWED_ORIGINS=https://your-frontend-domain.com
DATABASE_URL=postgresql://user:pass@your-db-host:5432/dbname
```

## 📱 Telegram Bot настройка

1. Создайте бота через @BotFather
2. Установите webhook:
   ```bash
   curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
        -d "url=https://your-backend-domain.com/webhook"
   ```
3. Настройте Mini App в @BotFather

## 🧪 Тестирование

### Backend

```bash
cd backend
pytest
pytest --cov=app tests/
```

### Frontend

```bash
cd frontend
npm test
npm run test:coverage
```

## 📈 Производительность

- Кэширование цен активов (Redis)
- Lazy loading компонентов
- Database indexing
- Connection pooling
- CDN для статических файлов

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch
3. Внесите изменения
4. Добавьте тесты
5. Создайте Pull Request

## 📚 Документация

- [Backend API](./backend/README.md)
- [Frontend Guide](./frontend/README.md)
- [API Documentation](http://localhost:8000/docs)
- [Telegram Integration Guide](./docs/telegram.md)

## ⚡ FAQ

**Q: Как получить доступ к админ панели?**
A: Используйте Telegram ID `8103090312` для автоматического получения админ роли.

**Q: Как добавить новый актив?**
A: Через админ панель или API endpoint `POST /api/v1/admin/assets`

**Q: Как настроить уведомления?**
A: В профиле пользователя можно настроить каналы уведомлений (Telegram/Email)

## 📄 Лицензия

MIT License - см. [LICENSE](LICENSE)

## 🆘 Поддержка

- **GitHub Issues**: Для багов и предложений
- **Email**: support@platform.com
- **Telegram**: @platform_support

---

**Сделано с ❤️ для crypto trading community**
