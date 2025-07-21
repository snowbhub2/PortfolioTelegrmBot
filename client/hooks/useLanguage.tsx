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
    'nav.wallet': 'Кошелёк',
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
    'settings.verification': 'Уровень верификации',
    'settings.max': 'Макси',
    'settings.not_applies': 'Не распространяется на аккаунт CFD Space.',
    'settings.support': 'Обратиться в поддержку',
    'settings.faq': 'FAQ Кошелька',
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
    'notifications.feedback': 'Обратная связь',
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
    'notifications.category.updates': 'УВЕДОМЛЕНИЯ ОБНОВЛЕНИЙ',
    'notifications.category.promotions': 'УВЕДОМЛЕНИЯ АКЦИЙ',
    'notifications.category.educational': 'УВЕДОМЛЕНИЯ ОБРАЗОВАТЕЛЬНОГО КОНТЕНТА',
    'notifications.category.feedback': 'УВЕДОМЛЕНИЯ ОБ ОБРАТНОЙ СВЯЗИ',
    'notifications.category.feedback_desc': 'Опросы пользователей, которые помогают улучшить сервис.',
    
    // Wallet
    'wallet.title': 'Кошелёк',
    'wallet.balance': 'Баланс',
    'wallet.total_balance': 'Общий баланс',
    'wallet.portfolio': 'Портфель',
    'wallet.portfolio_balance': 'Баланс Портфеля',
    'wallet.all_time': 'за весь час',
    'wallet.quick_actions': 'Быстрые действия',
    'wallet.deposit': 'Пополнить',
    'wallet.withdraw': 'Вывести',
    'wallet.exchange': 'Обменять',
    'wallet.transfer': 'Перевести',
    'wallet.trending': 'Популярные активы',
    'wallet.in_trend': 'В ТРЕНДЕ',
    'wallet.assets': 'АКТИВЫ',
    'wallet.view_all': 'Все',
    'wallet.show': 'Показать',
    'wallet.hide': 'Скрыть',
    'wallet.no_assets': 'Пока нет активов',
    'wallet.buy_on_market': 'Купите активы на странице Рынок',
    'wallet.start_trading': 'Начните торговать, чтобы увидеть свои активы здесь',
    'wallet.dollars_cash': 'Дол��ары (наличка)',
    'wallet.for_trading': 'Для торговли',
    'wallet.bought_for': 'Купили за:',
    'wallet.per_day': 'за день',
    'wallet.earn_apy': 'Зарабатывайте до 15% APY',
    'wallet.with_dollars': 'с долларами',
    'wallet.start_earning': 'Начать зарабатывать →',
    'wallet.current_price': 'Текущая цена',
    'wallet.buy': 'КУПИТЬ',
    'wallet.sell': 'ПРОДАТЬ',
    'wallet.trading_warning': 'Торговля криптовалютами связана с высокими рисками',
    'wallet.demo_mode': '🎭 Demo режим - для полных функций запустите через Telegram бота',
    'wallet.open_settings': 'Открыть настройки',
    'wallet.trading': 'Торговля',
    'wallet.cfd': 'CFD',
    
    // Market
    'market.title': 'Ринок',
    'market.trending': 'Популярные',
    'market.all_assets': 'Все активы',
    'market.crypto': 'Криптовалюты',
    'market.stocks': 'Акции',
    'market.gold': 'Золото',
    'market.price_change': 'Изменение цены',
    
    // History
    'history.title': 'История',
    'history.all': 'Все',
    'history.deposits': 'П��полнения',
    'history.withdrawals': 'Выводы',
    'history.trades': 'Сделки',
    'history.transfers': 'Переводы',
    'history.no_transactions': 'У вас пока нет транзакций',
    'history.start_trading': 'Начните торговать, чтобы увидеть историю здесь',
    
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
    'asset.not_in_portfolio': 'Нет активов в портфеле',
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
    'exchange.max_amount': 'Макс. сумма',
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
    'common.error': 'Ошибка',
    'common.success': 'Успешно',
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
    'common.bottom': 'Низ',
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
    'common.optional': 'Опционально',
    'common.required': 'Обязательно',
    'common.recommended': 'Рекомендуется',
  },
  en: {
    // Bottom Navigation
    'nav.wallet': 'Wallet',
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
    'wallet.title': 'Wallet',
    'wallet.balance': 'Balance',
    'wallet.total_balance': 'Total balance',
    'wallet.portfolio': 'Portfolio',
    'wallet.quick_actions': 'Quick actions',
    'wallet.deposit': 'Deposit',
    'wallet.withdraw': 'Withdraw',
    'wallet.exchange': 'Exchange',
    'wallet.transfer': 'Transfer',
    'wallet.trending': 'Trending assets',
    'wallet.view_all': 'View all',
    'wallet.no_assets': 'You don\'t have any assets in your portfolio yet',
    'wallet.start_trading': 'Start trading to see your assets here',
    
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
