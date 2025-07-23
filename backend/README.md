# Crypto Trading Platform Backend

Профессиональная backend система для торговой криптовалютной платформы с интеграцией Telegram.

## 🚀 Технологический стек

- **FastAPI** - современный веб-фреймворк для Python
- **SQLModel** - типизированные SQL модели с SQLAlchemy 2.0
- **Pydantic** - валидация данных и сериализация
- **PostgreSQL** - основная база данных (Supabase)
- **Redis** - кэширование и очереди сообщений
- **Celery** - асинхронные задачи и фоновые процессы
- **Aiogram 3** - Telegram Bot API
- **Alpha Vantage API** - рыночные данные в реальном времени

## 📁 Структура проекта

```
backend/
├── app/
│   ├── api/                 # API endpoints
│   │   └── routes/         # Маршруты API
│   ├── auth/               # Аутентификация
│   ├── core/               # Основные настройки
│   ├── db/                 # База данных
│   ├── models/             # SQLModel модели
│   ├── schemas/            # Pydantic схемы
│   ├── services/           # Бизнес-логика
│   ├── tasks/              # Celery задачи
│   ├── utils/              # Утилиты
│   └── main.py            # Точка входа
├── tests/                  # Тесты
├── docs/                   # Документация
├── scripts/                # Скрипты развертывания
├── alembic/               # Миграции БД
├── docker-compose.yml     # Docker композиция
├── Dockerfile            # Docker образ
├── requirements.txt      # Python зависимости
└── README.md            # Документация
```

## 🛠 Быстрый запуск

### 1. Клонир��вание и настройка

```bash
cd backend
cp .env.example .env
# Отредактируйте .env файл с вашими настройками
```

### 2. Запуск с Docker (Рекомендуется)

```bash
# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f backend

# Остановка
docker-compose down
```

### 3. Локальная разработка

```bash
# Создание виртуального окружения
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate     # Windows

# Установка зависимостей
pip install -r requirements.txt

# Запуск сервера разработки
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Celery (для фоновых задач)

```bash
# Worker
celery -A app.tasks.celery_app worker --loglevel=info

# Beat (планировщик)
celery -A app.tasks.celery_app beat --loglevel=info

# Flower (мониторинг)
celery -A app.tasks.celery_app flower
```

## 🔧 Конфигурация

### Переменные окружения

Скопируйте `.env.example` в `.env` и настройте:

- `DATABASE_URL` - URL подключения к PostgreSQL (Supabase)
- `TELEGRAM_BOT_TOKEN` - токен Telegram бота
- `ALPHA_VANTAGE_API_KEY` - ключ Alpha Vantage API
- `SECRET_KEY` - секретный ключ для JWT токенов

### Supabase настройка

1. Перейдите в [Supabase Dashboard](https://zwbnpukhgetmqcvevhhk.supabase.co)
2. Используйте предоставленные в задании данные:
   - Project URL: `https://zwbnpukhgetmqcvevhhk.supabase.co`
   - API Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 📚 API Документация

После запуска сервера доступна автоматическая документация:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Основные эндпоинты

- `GET /health` - проверка состояния сервиса
- `POST /auth/telegram/auth` - авторизация через Telegram
- `GET /api/v1/users/me` - информация о текущем пользователе
- `GET /api/v1/trading/assets` - список активов
- `POST /api/v1/trading/orders` - создание ордера
- `GET /api/v1/admin/users` - управление пользователями (только админ)

## 🔐 Безопасност��

### Аутентификация

Система использует JWT токены с Telegram авторизацией:

```python
# Пример использования в headers
Authorization: Bearer <your-jwt-token>
```

### Роли пользователей

- **ADMIN** - полный доступ ко всем функциям
- **USER** - доступ к торговым функциям
- **MODERATOR** - ограниченный админ доступ

Пользователь с `telegram_id = 8103090312` автоматически получает роль ADMIN.

## 📊 Мониторинг

### Celery Flower

Мониторинг фоновых задач: http://localhost:5555

### Логирование

Логи настроены с использованием структурированного логирования:

```bash
# Просмотр логов Docker
docker-compose logs -f backend

# Локальные логи
tail -f logs/app.log
```

## 🧪 Тестирование

```bash
# Запуск всех тестов
pytest

# Запуск с покрытием
pytest --cov=app tests/

# Запуск конкретного теста
pytest tests/test_auth.py
```

## 🚀 Развертывание в продакшене

### 1. Подготовка

```bash
# Установка переменных окружения для продакшена
export ENVIRONMENT=production
export DEBUG=false
export DATABASE_URL=postgresql://...
```

### 2. Docker развертывание

```bash
# Сборка продакшен образа
docker build -t crypto-trading-backend .

# Запуск
docker run -d \
  --name crypto-trading-backend \
  -p 8000:8000 \
  --env-file .env.production \
  crypto-trading-backend
```

### 3. Миграции базы данных

```bash
# Генерация миграции
alembic revision --autogenerate -m "Initial migration"

# Применение миграций
alembic upgrade head
```

## 🔌 Интеграции

### Telegram Bot

Автоматическая авторизация и уведомления через Telegram:

- Авторизация через Telegram Login Widget
- Telegram Mini App поддержка
- Push уведомления о сделках
- Команды бота для управления счетом

### Alpha Vantage API

Получение рыночных данных в реальном времени:

- Цены криптовалют и акций
- Исторические данные
- Технические индикаторы
- Автоматическое обновление каждые 60 секунд

### Платежи Telegram Stars

Интеграция с Telegram Stars для пополнения счета:

```python
# Создание счета на оплату
await create_telegram_stars_invoice(
    user_id=user.telegram_id,
    amount=100,  # в звездах
    description="Пополнение счета"
)
```

## 🛠 Разработка

### Добавление новых эндпоинтов

1. Создайте модель в `app/models/`
2. Добавьте схемы в `app/schemas/`
3. Реализуйте бизнес-логику в `app/services/`
4. Создайте роуты в `app/api/routes/`
5. Добавьте тесты в `tests/`

### Фоновые задачи

```python
# app/tasks/trading.py
@celery_app.task
def update_asset_prices():
    # Логика обновления цен
    pass

# Регистрация в Celery Beat
celery_app.conf.beat_schedule = {
    'update-prices': {
        'task': 'app.tasks.trading.update_asset_prices',
        'schedule': 60.0,  # каждые 60 секунд
    },
}
```

## 📈 Производительность

### Кэширование

Используется Redis для кэширования:

- Цены активов (TTL: 60 секунд)
- Пользовательские сессии
- Часто запрашиваемые данные

### Оптимизация запросов

- Использование индексов БД
- Lazy loading для связанных объектов
- Пагинация для больших наборов данных

## 🤝 Участие в разработке

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE).

## 🆘 Поддержка

- **Документация**: Встроенная Swagger документация
- **Issues**: GitHub Issues для багов и предложений
- **Email**: support@platform.com
- **Telegram**: @platform_support

## 🔄 Changelog

### v1.0.0
- Начальная версия API
- Telegram авторизация
- Базовая торговая система
- Админ панель
- Alpha Vantage инт��грация
