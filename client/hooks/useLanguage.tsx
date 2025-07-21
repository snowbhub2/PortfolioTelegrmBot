import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ru' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Переклади для всієї платформи
const translations = {
  ru: {
    // Bottom Navigation
    'nav.wallet': 'Портфель',
    'nav.market': 'Ринок',
    'nav.bonuses': 'Бонусы',
    'nav.history': 'История',
    
    // Settings
    'settings.title': 'ОСНОВНЫЕ НАСТРОЙКИ',
    'settings.notifications': 'Уведомления',
    'settings.passcode': 'Код-пароль и Face ID',
    'settings.language': 'Язык',
    'settings.currency': 'Основная валюта',
    'settings.enabled': 'Вкл',
    'settings.verification': 'Уровень в��рификации',
    'settings.max': 'Макси',
    'settings.not_applies': 'Не распространяется на аккаунт CFD Space.',
    'settings.support': 'Обратиться в поддержку',
    'settings.faq': 'FAQ Коше��ька',
    'settings.news': 'Новости Кошелька',
    'settings.agreement': 'Пользовательское соглашение',
    'settings.privacy': 'Политика конфиденциальности',
    'settings.footer_text': 'Мини-приложение управляется TG Wallet Inc.',
    'settings.footer_text2': 'Сервис независим и не связан с Telegram.',
    'settings.learn_more': 'Узнать больше',
    
    // Language Selection
    'language.title': 'ЯЗЫК',
    'language.english': 'English',
    'language.russian': 'Русский',
    
    // Notifications
    'notifications.title': 'УВЕДОМЛЕНИЯ',
    'notifications.market_trends': 'Тренды рынка',
    'notifications.market_trends_desc': 'Изменение цен на активы',
    'notifications.updates': 'Обновления',
    'notifications.updates_desc': 'Новые сервисы и возможности',
    'notifications.promotions': 'Акции',
    'notifications.promotions_desc': 'Розыгрыши и бонусы',
    'notifications.educational': 'Образовательный контент',
    'notifications.educational_desc': 'Гайды и советы',
    'notifications.feedback': 'Обратная связ��',
    'notifications.feedback_desc': 'Опросы и исследования',
    'notifications.always_on': 'Уведомления о транзакциях и безопасности всегда будут включены.',
    'notifications.news_channel': 'Все новости вы можете прочитать в канале',
    'notifications.crypto_news': 'Новости Крипто Кошелька',
    'notifications.cfd_title': 'УВЕДОМЛЕНИЯ CFD КОШЕЛЬКА',
    'notifications.cfd_for': 'Уведомления для',
    'notifications.cfd_desc': 'Получайте уведомления, когда вам приходят CFD токены и NFT в CFD Кошелёк.',
    'notifications.cfd_news': 'Новости CFD Кошелька',
    'notifications.cfd_news_text': 'Все новости можно узнать в канале',
    'notifications.on': 'Вкл',
    'notifications.off': 'Выкл',
    
    // Notification Categories
    'notifications.category.market_trends': 'УВЕДОМЛЕНИЯ ТРЕНДОВ РЫНКА',
    'notifications.category.updates': 'У��Е��ОМЛЕНИЯ ОБНОВЛЕНИЙ',
    'notifications.category.promotions': 'УВЕДОМЛЕНИЯ АКЦИЙ',
    'notifications.category.educational': 'УВЕДОМЛЕНИЯ ОБРАЗОВАТЕЛЬНОГО КОНТЕНТА',
    'notifications.category.feedback': 'УВЕДОМЛЕНИЯ ОБ ОБРАТНОЙ СВЯЗИ',
    'notifications.category.feedback_desc': 'Опросы пользователей, которые помогают улучшить сервис.',
    
    // Wallet
    'wallet.title': 'Портфель',
    'wallet.balance.portfolio': 'Баланс Портфеля',
    'wallet.balance.allTime': 'за весь час',
    'wallet.actions.withdraw': 'Вывести',
    'wallet.actions.deposit': 'Пополнить',
    'wallet.actions.exchange': 'Обменять',
    'wallet.actions.transfer': 'Перевести',
    'wallet.notification.earnTitle': 'Зарабатывайте до 15% APY',
    'wallet.notification.withDollars': 'с долларами',
    'wallet.notification.startEarning': 'Начать зарабатывать →',
    'wallet.assets.title': 'АКТИВЫ',
    'wallet.assets.hide': 'Скрыть',
    'wallet.assets.show': 'Показать',
    'wallet.assets.cashDollars': 'Доллары',
    'wallet.assets.forTrading': 'Для тор��овли',
    'wallet.assets.boughtAt': 'Купили за:',
    'wallet.assets.noAssets': 'Пока нет активов',
    'wallet.assets.buyOnMarket': 'Купи��е активы на странице Рынок',
    'wallet.trending.title': 'В ТРЕНДЕ',
    'wallet.trending.viewAll': 'Все',
    'wallet.trending.perDay': 'за день',
    'wallet.demo.message': '🎭 Demo режим - для полных функций запустите через Telegram бота',
    'wallet.tabs.wallet': 'Портфель',
    'wallet.tabs.cfd': 'CFD',
    'wallet.settings.open': 'Открыть настройки',
    'wallet.trading.title': 'Торговля',
    'wallet.trading.currentPrice': 'Текущая цена',
    'wallet.trading.buy': 'КУПИТЬ',
    'wallet.trading.sell': 'ПРОДАТЬ',
    'wallet.trading.warning': 'Торговля криптовалютами связана с высокими рисками',
    'wallet.gold': 'Золото',

    // Додаткові переклади для всіх текстів
    'wallet.notification.earnTitle': 'За��абатывайте до 15% APY',
    'wallet.notification.withDollars': 'с долларами',
    'wallet.notification.startEarning': 'Начать зарабатывать →',
    'wallet.trending.perDay': 'за день',
    'wallet.demo.message': '🎭 Demo режим - для полных функций запустите через Telegram бота',
    'wallet.settings.open': 'Открыть настройки',
    
    // Market
    'market.title': 'Ринок',
    'market.search_placeholder': 'Поиск',
    'market.trending_title': 'В ТРЕНДЕ',
    'market.per_day': 'за день',
    'market.top_of_day': 'ТОП ДНЯ',
    'market.tab.all': 'Все',
    'market.tab.stocks': 'Акции',
    'market.tab.crypto': 'Криптовалюты',
    'market.tab.gold': 'Золото',
    'market.asset.gold': 'Золото',
    'market.asset.silver': 'Серебро',
    'market.asset.platinum': 'Платина',

    // History Page - базові переклади
    'history.transaction.buy': 'Покупка',
    'history.transaction.sell': 'Продаж',
    'history.operations_history': 'История операций',
    'history.time.just_now': 'Только что',
    'history.no_transactions': 'Пока нет транзакций',
    'history.go_to_trading': 'Перейти к торговле',

    // Bonuses Page
    'bonuses.title_header': 'Бонусы в Кошельке',
    'bonuses.subtitle': 'Получайте бонусы за хранение криптовалюты.',
    'bonuses.how_it_works': 'Как это работает',
    'bonuses.tab.active': 'Активные',
    'bonuses.tab.completed': 'Завершённые',

    // CoinDetail Page
    'coin.about.crypto': 'О КРИПТОВАЛЮТЕ',
    'coin.about.stock': 'ОБ АКЦИИ',
    'coin.about.precious_metal': 'О ДРАГОЦЕННОМ МЕТАЛЛЕ',
    'coin.about.currency': 'О ВАЛЮТЕ',
    'coin.in_portfolio': 'В ПОРТФЕЛЕ',
    'coin.balance': 'Баланс',
    'coin.quantity': 'Количество',
    'coin.current_value': 'Текущая стоимость',
    'coin.btn.buy': 'Купить',
    'coin.btn.sell': 'Продать',
    'coin.btn.deposit': 'Пополнить',
    'coin.btn.withdraw': 'Вывести',

    // Exchange Page
    'exchange.title_header': 'Обмен',
    'exchange.you_pay': 'Вы платите',
    'exchange.you_receive': 'Вы получаете',
    'exchange.max': 'Макс',
    'exchange.search': 'Поиск',
    'exchange.back': 'Назад',
    'exchange.asset.dollars': 'Доллары',

    // Додаткові переклади для завершення Wallet.tsx
    'wallet.trending.viewAll': 'Все',
    'wallet.trending.title': 'В ТР��НДЕ',
    'wallet.demo.message': '🎭 Demo режим - для полных функций запустите через Telegram бота',
    'wallet.settings.open': 'Открыть на��тройки',
    'wallet.user.avatar': 'аватар пользователя',

    // Deposit Pages
    'deposit.method.title': 'Как вы хотите купить',
    'deposit.method.subtitle': 'криптовалюту',
    'deposit.method.bank_card': 'Банковская карта',
    'deposit.method.bank_card_desc': 'Купить криптовалюту ��о карте',
    'deposit.method.p2p_express': 'P2P Экспресс',
    'deposit.method.p2p_express_desc': 'Сделки с надёжными продавцами',
    'deposit.method.p2p_market': 'P2P Маркет',
    'deposit.method.p2p_market_desc': 'Купить без посредников',
    'deposit.method.telegram_stars': 'Пополнить через Telegram Stars',
    'deposit.method.external_wallet': 'Внешний кошелёк',
    'deposit.method.external_wallet_desc': 'Перевести с другого кошелька',

    // Deposit Asset Selection
    'deposit.asset.popular': 'ПОПУЛЯРНЫЕ',
    'deposit.asset.all': 'ВСЕ',
    'deposit.asset.not_found': 'Активы не найдены',

    // Deposit Network Selection
    'deposit.network.warning': 'Убедитесь, что вы выбрали нужную сеть. Неверный выбор может привест�� к утрате средств.',
    'deposit.network.select': 'ВЫБЕРИТЕ СЕТЬ',

    // Deposit Address
    'deposit.address.title': 'Ваш адрес в',
    'deposit.address.warning_start': 'На этот адрес отправляйте только',
    'deposit.address.warning_end': 'Активы других сетей или NFT будут безвозвратно утрачены.',
    'deposit.address.qr_description': 'Отсканируйте QR-код для отправки',
    'deposit.address.qr_description_end': 'на свой кошелёк.',
    'deposit.address.your_address': 'Ваш адрес',
    'deposit.address.copy': 'Копировать адрес',
    'deposit.address.copied': 'Адрес скопирован в буфер',
    'deposit.address.copied_notification': 'Адрес скопирован в буфер.',

    // Withdraw Pages
    'withdraw.method.title': 'Как отправить',
    'withdraw.method.subtitle': 'криптовалюту',
    'withdraw.method.telegram.title': 'Контакт в Telegram',
    'withdraw.method.telegram.description': 'Мгновенно и без комиссий',
    'withdraw.method.external.title': 'Внешний кошелёк или биржа',
    'withdraw.method.external.description': 'Нужно указать криптоадрес',
    
    // History
    'history.title': 'Ис��ория',
    'history.all': 'Все',
    'history.deposits': 'Пополнения',
    'history.withdrawals': 'Выводы',
    'history.trades': 'Сделки',
    'history.transfers': 'Переводы',
    'history.no_transactions': 'У вас пока нет транзакций',
    'history.start_trading': 'Начните торговать, чтобы увидеть историю здесь',

    // Additional History translations
    'history.subtitle': 'Все ваши транзакции и операции',
    'history.filter.all': 'Все',
    'history.filter.buy': 'Покупки',
    'history.filter.sell': 'Продажи',
    'history.filter.deposit': 'Пополнения',
    'history.filter.withdraw': 'Выведения',
    'history.empty.title': 'Пока нет транзакций',
    'history.empty.subtitle_all': 'Ваши операции появятся здесь',
    'history.empty.subtitle_filtered': 'Нет операций этого типа',
    'history.empty.go_to_market': 'Перейти к торговле',
    'history.transaction.buy': 'Покупка',
    'history.transaction.sell': 'Продажа',
    'history.transaction.asset': 'акти��а',
    'history.transaction.deposit': 'Пополнение звездами',
    'history.transaction.withdraw': 'Выведение в звезды',
    'history.transaction.transfer_to_cfd': 'Перевод в CFD',
    'history.transaction.transfer_from_cfd': 'Перевод из CFD',
    'history.transaction.default': 'Транзакция',
    'history.time.now': 'Только что',
    'history.time.hours_ago': 'ч назад',
    'history.time.days_ago': 'дн назад',
    'history.portfolio.total_value': 'Общая стоимость портфеля',
    'history.portfolio.cash': 'Наличные',
    
    // Bonuses
    'bonuses.title': 'Бонусы',
    'bonuses.available': 'Доступные бонусы',
    'bonuses.completed': 'Выполненные',
    'bonuses.no_bonuses': 'У вас пока нет доступных бонусов',
    
    // Asset Details
    'asset.about': 'О КРИПТОВАЛЮТЕ',
    'asset.about_stock': 'ОБ АКЦИИ',
    'asset.about_gold': 'О ЗОЛОТЕ',
    'asset.about_currency': 'О ВАЛЮТЕ',
    'asset.portfolio': 'В портфеле',
    'asset.not_in_portfolio': 'Нет активов в по��тфеле',
    'asset.transaction_history': 'История операций',
    'asset.no_transactions': 'Нет операций с этим активом',
    'asset.buy': 'Купить',
    'asset.sell': 'Продать',
    'asset.deposit_btn': 'Пополнить',
    'asset.withdraw_btn': 'Вывести',
    
    // Exchange
    'exchange.title': 'Обмен',
    'exchange.you_pay': 'Вы платите',
    'exchange.you_receive': 'Вы получаете',
    'exchange.rate': 'Курс',
    'exchange.min_amount': 'Мин. сумма',
    'exchange.max_amount': 'Макс. су��ма',
    'exchange.exchange_btn': 'Обменять',
    'exchange.insufficient_balance': 'Недостаточно средств',
    'exchange.enter_amount': 'Введите сумму',
    'exchange.select_asset': 'Выберите актив',
    
    // Common
    'common.back': 'Назад',
    'common.next': 'Далее',
    'common.continue': 'Продолжить',
    'common.cancel': 'Отмена',
    'common.confirm': 'Подтвердить',
    'common.close': 'Закрыть',
    'common.save': 'Сохранить',
    'common.edit': 'Редактировать',
    'common.delete': 'Удалить',
    'common.loading': 'Загрузка...',
    'common.error': '��шибка',
    'common.success': 'Ус��ешно',
    'common.amount': 'Сумма',
    'common.address': 'Адрес',
    'common.fee': 'Комиссия',
    'common.total': 'Итого',
    'common.available': 'Доступно',
    'common.balance': 'Баланс',
    'common.price': 'Цена',
    'common.volume': 'Объём',
    'common.change': 'Изменение',
    'common.date': 'Дата',
    'common.time': 'Время',
    'common.status': 'Статус',
    'common.type': 'Тип',
    'common.search': 'Поиск',
    'common.filter': 'Фильтр',
    'common.sort': 'Сортировка',
    'common.all': 'Все',
    'common.none': 'Нет',
    'common.yes': 'Да',
    'common.no': 'Нет',
    'common.refresh': 'Обновить',
    'common.retry': 'Повторить',
    'common.skip': 'Пропустить',
    'common.done': 'Готово',
    'common.copied': 'Скопировано',
    'common.copy': 'Копировать',
    'common.share': 'Поделиться',
    'common.help': 'Помощь',
    'common.support': 'Поддержка',
    'common.about': 'О приложении',
    'common.version': 'Версия',
    'common.update': 'Обновить',
    'common.new': 'Новый',
    'common.old': 'Старый',
    'common.recent': 'Недавние',
    'common.popular': 'Популярные',
    'common.recommended': 'Рекомендуемые',
    'common.trending': 'В тренде',
    'common.top': 'Топ',
    'common.bottom': 'Ни��',
    'common.left': 'Слева',
    'common.right': 'Справа',
    'common.center': 'Центр',
    'common.up': 'Вверх',
    'common.down': 'Вниз',
    'common.high': 'Высокий',
    'common.low': 'Низкий',
    'common.medium': 'Средний',
    'common.fast': 'Быстро',
    'common.slow': 'Медленно',
    'common.normal': 'Обычно',
    'common.custom': 'Настроить',
    'common.auto': 'Автоматически',
    'common.manual': 'Вручную',
    'common.optional': 'Опциональн��',
    'common.required': 'Обязательно',
    'common.recommended': 'Рекомендуется',
  },
  en: {
    // Bottom Navigation
    'nav.wallet': 'Portfolio',
    'nav.market': 'Market',
    'nav.bonuses': 'Bonuses',
    'nav.history': 'History',
    
    // Settings
    'settings.title': 'MAIN SETTINGS',
    'settings.notifications': 'Notifications',
    'settings.passcode': 'Passcode and Face ID',
    'settings.language': 'Language',
    'settings.currency': 'Primary currency',
    'settings.enabled': 'On',
    'settings.verification': 'Verification level',
    'settings.max': 'Max',
    'settings.not_applies': 'Does not apply to CFD Space account.',
    'settings.support': 'Contact support',
    'settings.faq': 'Wallet FAQ',
    'settings.news': 'Wallet News',
    'settings.agreement': 'User agreement',
    'settings.privacy': 'Privacy policy',
    'settings.footer_text': 'Mini-app is managed by TG Wallet Inc.',
    'settings.footer_text2': 'Service is independent and not related to Telegram.',
    'settings.learn_more': 'Learn more',
    
    // Language Selection
    'language.title': 'LANGUAGE',
    'language.english': 'English',
    'language.russian': 'Russian',
    
    // Notifications
    'notifications.title': 'NOTIFICATIONS',
    'notifications.market_trends': 'Market trends',
    'notifications.market_trends_desc': 'Asset price changes',
    'notifications.updates': 'Updates',
    'notifications.updates_desc': 'New services and features',
    'notifications.promotions': 'Promotions',
    'notifications.promotions_desc': 'Giveaways and bonuses',
    'notifications.educational': 'Educational content',
    'notifications.educational_desc': 'Guides and tips',
    'notifications.feedback': 'Feedback',
    'notifications.feedback_desc': 'Surveys and research',
    'notifications.always_on': 'Transaction and security notifications are always enabled.',
    'notifications.news_channel': 'You can read all news in the channel',
    'notifications.crypto_news': 'Crypto Wallet News',
    'notifications.cfd_title': 'CFD WALLET NOTIFICATIONS',
    'notifications.cfd_for': 'Notifications for',
    'notifications.cfd_desc': 'Get notifications when you receive CFD tokens and NFTs in CFD Wallet.',
    'notifications.cfd_news': 'CFD Wallet News',
    'notifications.cfd_news_text': 'All news can be found in the channel',
    'notifications.on': 'On',
    'notifications.off': 'Off',
    
    // Notification Categories
    'notifications.category.market_trends': 'MARKET TRENDS NOTIFICATIONS',
    'notifications.category.updates': 'UPDATE NOTIFICATIONS',
    'notifications.category.promotions': 'PROMOTION NOTIFICATIONS',
    'notifications.category.educational': 'EDUCATIONAL CONTENT NOTIFICATIONS',
    'notifications.category.feedback': 'FEEDBACK NOTIFICATIONS',
    'notifications.category.feedback_desc': 'User surveys that help improve the service.',
    
    // Wallet
    'wallet.title': 'Portfolio',
    'wallet.balance.portfolio': 'Portfolio Balance',
    'wallet.balance.allTime': 'all time',
    'wallet.actions.withdraw': 'Withdraw',
    'wallet.actions.deposit': 'Deposit',
    'wallet.actions.exchange': 'Exchange',
    'wallet.actions.transfer': 'Transfer',
    'wallet.notification.earnTitle': 'Earn up to 15% APY',
    'wallet.notification.withDollars': 'with dollars',
    'wallet.notification.startEarning': 'Start earning →',
    'wallet.assets.title': 'ASSETS',
    'wallet.assets.hide': 'Hide',
    'wallet.assets.show': 'Show',
    'wallet.assets.cashDollars': 'Dollars',
    'wallet.assets.forTrading': 'For trading',
    'wallet.assets.boughtAt': 'Bought for:',
    'wallet.assets.noAssets': 'No assets yet',
    'wallet.assets.buyOnMarket': 'Buy assets on Market page',
    'wallet.trending.title': 'TRENDING',
    'wallet.trending.viewAll': 'All',
    'wallet.trending.perDay': 'per day',
    'wallet.demo.message': '🎭 Demo mode - for full features launch via Telegram bot',
    'wallet.tabs.wallet': 'Portfolio',
    'wallet.tabs.cfd': 'CFD',
    'wallet.settings.open': 'Open settings',
    'wallet.trading.title': 'Trading',
    'wallet.trading.currentPrice': 'Current price',
    'wallet.trading.buy': 'BUY',
    'wallet.trading.sell': 'SELL',
    'wallet.trading.warning': 'Cryptocurrency trading involves high risks',
    'wallet.gold': 'Gold',

    // Додаткові переклади для всіх текстів (англійська)
    'wallet.notification.earnTitle': 'Earn up to 15% APY',
    'wallet.notification.withDollars': 'with dollars',
    'wallet.notification.startEarning': 'Start earning →',
    'wallet.trending.perDay': 'per day',
    'wallet.demo.message': '🎭 Demo mode - for full features launch via Telegram bot',
    'wallet.settings.open': 'Open settings',
    
    // Market
    'market.title': 'Market',
    'market.trending': 'Trending',
    'market.all_assets': 'All assets',
    'market.crypto': 'Crypto',
    'market.stocks': 'Stocks',
    'market.gold': 'Gold',
    'market.price_change': 'Price change',
    
    // History
    'history.title': 'History',
    'history.all': 'All',
    'history.deposits': 'Deposits',
    'history.withdrawals': 'Withdrawals',
    'history.trades': 'Trades',
    'history.transfers': 'Transfers',
    'history.no_transactions': 'You don\'t have any transactions yet',
    'history.start_trading': 'Start trading to see history here',
    
    // Bonuses
    'bonuses.title': 'Bonuses',
    'bonuses.available': 'Available bonuses',
    'bonuses.completed': 'Completed',
    'bonuses.no_bonuses': 'You don\'t have any available bonuses yet',
    
    // Asset Details
    'asset.about': 'ABOUT CRYPTOCURRENCY',
    'asset.about_stock': 'ABOUT STOCK',
    'asset.about_gold': 'ABOUT GOLD',
    'asset.about_currency': 'ABOUT CURRENCY',
    'asset.portfolio': 'In portfolio',
    'asset.not_in_portfolio': 'No assets in portfolio',
    'asset.transaction_history': 'Transaction history',
    'asset.no_transactions': 'No transactions with this asset',
    'asset.buy': 'Buy',
    'asset.sell': 'Sell',
    'asset.deposit_btn': 'Deposit',
    'asset.withdraw_btn': 'Withdraw',
    
    // Exchange
    'exchange.title': 'Exchange',
    'exchange.you_pay': 'You pay',
    'exchange.you_receive': 'You receive',
    'exchange.rate': 'Rate',
    'exchange.min_amount': 'Min. amount',
    'exchange.max_amount': 'Max. amount',
    'exchange.exchange_btn': 'Exchange',
    'exchange.insufficient_balance': 'Insufficient balance',
    'exchange.enter_amount': 'Enter amount',
    'exchange.select_asset': 'Select asset',
    
    // Common
    'common.back': 'Back',
    'common.next': 'Next',
    'common.continue': 'Continue',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.amount': 'Amount',
    'common.address': 'Address',
    'common.fee': 'Fee',
    'common.total': 'Total',
    'common.available': 'Available',
    'common.balance': 'Balance',
    'common.price': 'Price',
    'common.volume': 'Volume',
    'common.change': 'Change',
    'common.date': 'Date',
    'common.time': 'Time',
    'common.status': 'Status',
    'common.type': 'Type',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.all': 'All',
    'common.none': 'None',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.refresh': 'Refresh',
    'common.retry': 'Retry',
    'common.skip': 'Skip',
    'common.done': 'Done',
    'common.copied': 'Copied',
    'common.copy': 'Copy',
    'common.share': 'Share',
    'common.help': 'Help',
    'common.support': 'Support',
    'common.about': 'About',
    'common.version': 'Version',
    'common.update': 'Update',
    'common.new': 'New',
    'common.old': 'Old',
    'common.recent': 'Recent',
    'common.popular': 'Popular',
    'common.recommended': 'Recommended',
    'common.trending': 'Trending',
    'common.top': 'Top',
    'common.bottom': 'Bottom',
    'common.left': 'Left',
    'common.right': 'Right',
    'common.center': 'Center',
    'common.up': 'Up',
    'common.down': 'Down',
    'common.high': 'High',
    'common.low': 'Low',
    'common.medium': 'Medium',
    'common.fast': 'Fast',
    'common.slow': 'Slow',
    'common.normal': 'Normal',
    'common.custom': 'Custom',
    'common.auto': 'Auto',
    'common.manual': 'Manual',
    'common.optional': 'Optional',
    'common.required': 'Required',
    'common.recommended': 'Recommended',

    // Deposit Pages (English)
    'deposit.method.title': 'How would you like to buy',
    'deposit.method.subtitle': 'cryptocurrency',
    'deposit.method.bank_card': 'Bank Card',
    'deposit.method.bank_card_desc': 'Buy cryptocurrency by card',
    'deposit.method.p2p_express': 'P2P Express',
    'deposit.method.p2p_express_desc': 'Deals with reliable sellers',
    'deposit.method.p2p_market': 'P2P Market',
    'deposit.method.p2p_market_desc': 'Buy without intermediaries',
    'deposit.method.telegram_stars': 'Top up via Telegram Stars',
    'deposit.method.external_wallet': 'External Wallet',
    'deposit.method.external_wallet_desc': 'Transfer from another wallet',

    // Deposit Asset Selection (English)
    'deposit.asset.popular': 'POPULAR',
    'deposit.asset.all': 'ALL',
    'deposit.asset.not_found': 'Assets not found',

    // Deposit Network Selection (English)
    'deposit.network.warning': 'Make sure you select the correct network. Wrong choice may lead to loss of funds.',
    'deposit.network.select': 'SELECT NETWORK',

    // Deposit Address (English)
    'deposit.address.title': 'Your address in',
    'deposit.address.warning_start': 'Send only',
    'deposit.address.warning_end': 'Assets from other networks or NFTs will be permanently lost.',
    'deposit.address.qr_description': 'Scan QR code to send',
    'deposit.address.qr_description_end': 'to your wallet.',
    'deposit.address.your_address': 'Your address',
    'deposit.address.copy': 'Copy address',
    'deposit.address.copied': 'Address copied to buffer',
    'deposit.address.copied_notification': 'Address copied to buffer.',

    // Withdraw Pages (English)
    'withdraw.method.title': 'How to send',
    'withdraw.method.subtitle': 'cryptocurrency',
    'withdraw.method.telegram.title': 'Telegram Contact',
    'withdraw.method.telegram.description': 'Instant and no fees',
    'withdraw.method.external.title': 'External wallet or exchange',
    'withdraw.method.external.description': 'Need to specify crypto address',
  },
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage || 'ru';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
