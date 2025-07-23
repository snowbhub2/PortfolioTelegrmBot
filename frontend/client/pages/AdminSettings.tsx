import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Shield,
  DollarSign,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Save,
  RefreshCw,
  Bell,
  Mail,
  Smartphone,
  Globe,
  Database,
  Key,
  BarChart3,
  MessageCircle
} from "lucide-react";

interface PlatformSettings {
  // Trading settings
  tradingEnabled: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  
  // Financial limits
  minDepositAmount: number;
  maxDepositAmount: number;
  minWithdrawAmount: number;
  maxWithdrawAmount: number;
  minTradeAmount: number;
  maxTradeAmount: number;
  dailyWithdrawLimit: number;
  
  // Fees
  tradingFeePercentage: number;
  withdrawFeePercentage: number;
  depositFeePercentage: number;
  
  // Security
  twoFactorRequired: boolean;
  maxLoginAttempts: number;
  sessionTimeout: number;
  ipWhitelisting: boolean;
  
  // Verification
  kycRequired: boolean;
  kycRequiredAmount: number;
  documentVerificationRequired: boolean;
  
  // Notifications
  emailNotifications: boolean;
  smsNotifications: boolean;
  telegramNotifications: boolean;
  
  // Platform
  supportEmail: string;
  supportTelegram: string;
  platformName: string;
  welcomeMessage: string;
  termsOfService: string;
  privacyPolicy: string;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<PlatformSettings>({
    // Trading settings
    tradingEnabled: true,
    maintenanceMode: false,
    maintenanceMessage: "Платформа временно недоступна для технического обслуживания. Пожалуйста, попробуйте позже.",
    
    // Financial limits
    minDepositAmount: 10,
    maxDepositAmount: 100000,
    minWithdrawAmount: 20,
    maxWithdrawAmount: 50000,
    minTradeAmount: 1,
    maxTradeAmount: 100000,
    dailyWithdrawLimit: 10000,
    
    // Fees
    tradingFeePercentage: 0.1,
    withdrawFeePercentage: 0.5,
    depositFeePercentage: 0,
    
    // Security
    twoFactorRequired: false,
    maxLoginAttempts: 5,
    sessionTimeout: 24,
    ipWhitelisting: false,
    
    // Verification
    kycRequired: false,
    kycRequiredAmount: 10000,
    documentVerificationRequired: false,
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    telegramNotifications: true,
    
    // Platform
    supportEmail: "support@platform.com",
    supportTelegram: "@platform_support",
    platformName: "Crypto Trading Platform",
    welcomeMessage: "Добро пожаловать на нашу торговую платформу!",
    termsOfService: "",
    privacyPolicy: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setHasChanges(false);
    alert("Настройки успешно сохранены!");
  };

  const updateSetting = (key: keyof PlatformSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const toggleMaintenanceMode = () => {
    const newValue = !settings.maintenanceMode;
    updateSetting('maintenanceMode', newValue);
    
    if (newValue) {
      updateSetting('tradingEnabled', false);
      alert("Включен режим технического обслуживания. Торговля автоматически отключена.");
    } else {
      updateSetting('tradingEnabled', true);
      alert("Режим технического обслуживания отключен. Торговля снова доступна.");
    }
  };

  const resetToDefaults = () => {
    if (confirm("Вы уверены, что хотите сбросить все настройки к значениям по умолчанию?")) {
      // Reset to default values
      setSettings({
        tradingEnabled: true,
        maintenanceMode: false,
        maintenanceMessage: "Платформа временно недоступна для технического обслуживания. Пожалуйста, попробуйте позже.",
        minDepositAmount: 10,
        maxDepositAmount: 100000,
        minWithdrawAmount: 20,
        maxWithdrawAmount: 50000,
        minTradeAmount: 1,
        maxTradeAmount: 100000,
        dailyWithdrawLimit: 10000,
        tradingFeePercentage: 0.1,
        withdrawFeePercentage: 0.5,
        depositFeePercentage: 0,
        twoFactorRequired: false,
        maxLoginAttempts: 5,
        sessionTimeout: 24,
        ipWhitelisting: false,
        kycRequired: false,
        kycRequiredAmount: 10000,
        documentVerificationRequired: false,
        emailNotifications: true,
        smsNotifications: false,
        telegramNotifications: true,
        supportEmail: "support@platform.com",
        supportTelegram: "@platform_support",
        platformName: "Crypto Trading Platform",
        welcomeMessage: "Добро пожаловать на нашу торговую платформу!",
        termsOfService: "",
        privacyPolicy: ""
      });
      setHasChanges(true);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800">Настройки платформы</h1>
            </div>
            <p className="text-slate-600 ml-13 font-medium">Конфигурация основных параметров системы</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={resetToDefaults}
              className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
            >
              По умолчанию
            </Button>
            <Button
              onClick={saveSettings}
              disabled={!hasChanges || isSaving}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 font-medium"
            >
              <Save className={`w-4 h-4 mr-2 ${isSaving ? "animate-spin" : ""}`} />
              {isSaving ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </div>
      </div>

      {/* Changes Alert */}
      {hasChanges && (
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            У вас есть несохраненные изменения. Не забудьте сохранить настройки.
          </AlertDescription>
        </Alert>
      )}

      {/* Platform Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Статус торговли</p>
                <p className={`text-2xl font-bold ${settings.tradingEnabled ? 'text-green-600' : 'text-red-600'}`}>
                  {settings.tradingEnabled ? 'Активна' : 'Отключена'}
                </p>
              </div>
              <div className={`p-3 rounded-full ${settings.tradingEnabled ? 'bg-green-100' : 'bg-red-100'}`}>
                <Activity className={`w-6 h-6 ${settings.tradingEnabled ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Режим обслуживания</p>
                <p className={`text-2xl font-bold ${settings.maintenanceMode ? 'text-yellow-600' : 'text-green-600'}`}>
                  {settings.maintenanceMode ? 'Включен' : 'Отключен'}
                </p>
              </div>
              <div className={`p-3 rounded-full ${settings.maintenanceMode ? 'bg-yellow-100' : 'bg-green-100'}`}>
                <Settings className={`w-6 h-6 ${settings.maintenanceMode ? 'text-yellow-600' : 'text-green-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Безопасность</p>
                <p className="text-2xl font-bold text-blue-600">
                  {settings.twoFactorRequired ? 'Высокая' : 'Стандартная'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="platform" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="platform">Платформа</TabsTrigger>
          <TabsTrigger value="trading">Торговля</TabsTrigger>
          <TabsTrigger value="security">Безопасность</TabsTrigger>
          <TabsTrigger value="fees">Комиссии</TabsTrigger>
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
        </TabsList>

        {/* Platform Settings */}
        <TabsContent value="platform" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Основные настройки платформы
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="platformName">Название платформы</Label>
                  <Input
                    id="platformName"
                    value={settings.platformName}
                    onChange={(e) => updateSetting('platformName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Email поддержки</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => updateSetting('supportEmail', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcomeMessage">Приветственное сообщение</Label>
                <Textarea
                  id="welcomeMessage"
                  value={settings.welcomeMessage}
                  onChange={(e) => updateSetting('welcomeMessage', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Режим технического обслуживания</Label>
                    <p className="text-sm text-gray-500">
                      Отключает торговлю и показывает сообщение о техработах
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={toggleMaintenanceMode}
                  />
                </div>

                {settings.maintenanceMode && (
                  <div className="space-y-2">
                    <Label htmlFor="maintenanceMessage">Сообщение о техработах</Label>
                    <Textarea
                      id="maintenanceMessage"
                      value={settings.maintenanceMessage}
                      onChange={(e) => updateSetting('maintenanceMessage', e.target.value)}
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trading Settings */}
        <TabsContent value="trading" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Настройки торговли
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Торговля включена</Label>
                  <p className="text-sm text-gray-500">
                    Разрешить пользователям покупать и продавать активы
                  </p>
                </div>
                <Switch
                  checked={settings.tradingEnabled && !settings.maintenanceMode}
                  onCheckedChange={(value) => updateSetting('tradingEnabled', value)}
                  disabled={settings.maintenanceMode}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="minTradeAmount">Минимальная сумма торговли ($)</Label>
                  <Input
                    id="minTradeAmount"
                    type="number"
                    value={settings.minTradeAmount}
                    onChange={(e) => updateSetting('minTradeAmount', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxTradeAmount">Максимальная сумма торговли ($)</Label>
                  <Input
                    id="maxTradeAmount"
                    type="number"
                    value={settings.maxTradeAmount}
                    onChange={(e) => updateSetting('maxTradeAmount', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minDepositAmount">Минимальное пополнение ($)</Label>
                  <Input
                    id="minDepositAmount"
                    type="number"
                    value={settings.minDepositAmount}
                    onChange={(e) => updateSetting('minDepositAmount', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxDepositAmount">Максимальное пополнение ($)</Label>
                  <Input
                    id="maxDepositAmount"
                    type="number"
                    value={settings.maxDepositAmount}
                    onChange={(e) => updateSetting('maxDepositAmount', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minWithdrawAmount">Минимальный вывод ($)</Label>
                  <Input
                    id="minWithdrawAmount"
                    type="number"
                    value={settings.minWithdrawAmount}
                    onChange={(e) => updateSetting('minWithdrawAmount', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxWithdrawAmount">Максимальный вывод ($)</Label>
                  <Input
                    id="maxWithdrawAmount"
                    type="number"
                    value={settings.maxWithdrawAmount}
                    onChange={(e) => updateSetting('maxWithdrawAmount', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dailyWithdrawLimit">Дневной лимит вывода ($)</Label>
                <Input
                  id="dailyWithdrawLimit"
                  type="number"
                  value={settings.dailyWithdrawLimit}
                  onChange={(e) => updateSetting('dailyWithdrawLimit', parseFloat(e.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Настройки безопасности
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Обязательная двухфакторная аутентификация</Label>
                    <p className="text-sm text-gray-500">
                      Требовать 2FA для всех пользователей
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoFactorRequired}
                    onCheckedChange={(value) => updateSetting('twoFactorRequired', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Обязательная верификация KYC</Label>
                    <p className="text-sm text-gray-500">
                      Требовать прохождение верификации для торговли
                    </p>
                  </div>
                  <Switch
                    checked={settings.kycRequired}
                    onCheckedChange={(value) => updateSetting('kycRequired', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Белый список IP-адресов</Label>
                    <p className="text-sm text-gray-500">
                      Разрешить доступ только с определенных IP-адресов
                    </p>
                  </div>
                  <Switch
                    checked={settings.ipWhitelisting}
                    onCheckedChange={(value) => updateSetting('ipWhitelisting', value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Максимум попыток входа</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Таймаут сессии (часы)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              {settings.kycRequired && (
                <div className="space-y-2">
                  <Label htmlFor="kycRequiredAmount">Сумма для обязательной KYC ($)</Label>
                  <Input
                    id="kycRequiredAmount"
                    type="number"
                    value={settings.kycRequiredAmount}
                    onChange={(e) => updateSetting('kycRequiredAmount', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-sm text-gray-500">
                    Если сумма депозитов превышает это значение, потребуется KYC
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fees Settings */}
        <TabsContent value="fees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Настройки комиссий
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tradingFeePercentage">Торговая комиссия (%)</Label>
                  <Input
                    id="tradingFeePercentage"
                    type="number"
                    step="0.01"
                    value={settings.tradingFeePercentage}
                    onChange={(e) => updateSetting('tradingFeePercentage', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-sm text-gray-500">
                    Комиссия взимается с каждой торговой операции
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="withdrawFeePercentage">Комиссия за вывод (%)</Label>
                  <Input
                    id="withdrawFeePercentage"
                    type="number"
                    step="0.01"
                    value={settings.withdrawFeePercentage}
                    onChange={(e) => updateSetting('withdrawFeePercentage', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-sm text-gray-500">
                    Комиссия взимается при выводе средств
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="depositFeePercentage">Комиссия за пополнение (%)</Label>
                  <Input
                    id="depositFeePercentage"
                    type="number"
                    step="0.01"
                    value={settings.depositFeePercentage}
                    onChange={(e) => updateSetting('depositFeePercentage', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-sm text-gray-500">
                    Комиссия взимается при пополнении счета
                  </p>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  Изменения комиссий вступают в силу для новых транза��ций после сохранения настроек.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Настройки уведомлений
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <Label>Email уведомления</Label>
                      <p className="text-sm text-gray-500">
                        Отправлять уведомления по электронной почте
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(value) => updateSetting('emailNotifications', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-gray-500" />
                    <div>
                      <Label>SMS уведомления</Label>
                      <p className="text-sm text-gray-500">
                        Отправлять уведомления по SMS
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(value) => updateSetting('smsNotifications', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="w-5 h-5 text-gray-500" />
                    <div>
                      <Label>Telegram уведомления</Label>
                      <p className="text-sm text-gray-500">
                        Отправлять уведомления через Telegram бота
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.telegramNotifications}
                    onCheckedChange={(value) => updateSetting('telegramNotifications', value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportTelegram">Telegram поддержки</Label>
                <Input
                  id="supportTelegram"
                  value={settings.supportTelegram}
                  onChange={(e) => updateSetting('supportTelegram', e.target.value)}
                  placeholder="@username"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
