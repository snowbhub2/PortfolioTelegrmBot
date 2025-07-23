import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  Plus,
  Edit,
  Eye,
  TrendingUp,
  TrendingDown,
  Star,
  MoreHorizontal,
  RefreshCw,
  Upload,
  Download,
  Settings,
  BarChart3,
  Activity,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  X
} from "lucide-react";

interface Asset {
  id: string;
  symbol: string;
  name: string;
  icon: string;
  category: "crypto" | "stocks" | "gold" | "currency";
  currentPrice: number;
  change24h: number;
  volume24h: number;
  marketCap?: number;
  isActive: boolean;
  isTrending: boolean;
  isVisible: boolean;
  minTradeAmount: number;
  maxTradeAmount: number;
  precision: number;
  description?: string;
  addedDate: Date;
  lastUpdated: Date;
}

export default function AdminAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // New asset form state
  const [newAsset, setNewAsset] = useState({
    symbol: "",
    name: "",
    category: "crypto",
    minTradeAmount: 1,
    maxTradeAmount: 100000,
    precision: 2,
    description: "",
    currentPrice: 0
  });

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setIsLoading(true);
    
    // Mock assets data
    const mockAssets: Asset[] = [
      {
        id: "btc",
        symbol: "BTC",
        name: "Bitcoin",
        icon: "₿",
        category: "crypto",
        currentPrice: 46250.00,
        change24h: 2.34,
        volume24h: 28500000,
        marketCap: 890000000000,
        isActive: true,
        isTrending: true,
        isVisible: true,
        minTradeAmount: 0.001,
        maxTradeAmount: 10,
        precision: 8,
        description: "Первая и самая популярная криптовалюта",
        addedDate: new Date("2024-01-01"),
        lastUpdated: new Date()
      },
      {
        id: "eth",
        symbol: "ETH", 
        name: "Ethereum",
        icon: "Ξ",
        category: "crypto",
        currentPrice: 2950.50,
        change24h: -1.23,
        volume24h: 15200000,
        marketCap: 355000000000,
        isActive: true,
        isTrending: true,
        isVisible: true,
        minTradeAmount: 0.01,
        maxTradeAmount: 100,
        precision: 6,
        description: "Платформа для смарт-контрактов",
        addedDate: new Date("2024-01-01"),
        lastUpdated: new Date()
      },
      {
        id: "usdt",
        symbol: "USDT",
        name: "Tether",
        icon: "₮",
        category: "crypto",
        currentPrice: 1.00,
        change24h: 0.01,
        volume24h: 45600000,
        marketCap: 95000000000,
        isActive: true,
        isTrending: false,
        isVisible: true,
        minTradeAmount: 1,
        maxTradeAmount: 50000,
        precision: 2,
        description: "Стейблкоин привязанный к доллару США",
        addedDate: new Date("2024-01-01"),
        lastUpdated: new Date()
      },
      {
        id: "aapl",
        symbol: "AAPL",
        name: "Apple Inc.",
        icon: "🍎",
        category: "stocks",
        currentPrice: 185.64,
        change24h: 1.87,
        volume24h: 52000000,
        isActive: true,
        isTrending: false,
        isVisible: true,
        minTradeAmount: 0.1,
        maxTradeAmount: 1000,
        precision: 2,
        description: "Акции компании Apple",
        addedDate: new Date("2024-01-15"),
        lastUpdated: new Date()
      },
      {
        id: "gold",
        symbol: "GOLD",
        name: "Золото",
        icon: "🥇",
        category: "gold",
        currentPrice: 2040.50,
        change24h: 0.78,
        volume24h: 8500000,
        isActive: true,
        isTrending: true,
        isVisible: true,
        minTradeAmount: 0.01,
        maxTradeAmount: 100,
        precision: 3,
        description: "Драгоценный металл",
        addedDate: new Date("2024-01-01"),
        lastUpdated: new Date()
      }
    ];

    setAssets(mockAssets);
    setFilteredAssets(mockAssets);
    setIsLoading(false);
  };

  // Filter and search logic
  useEffect(() => {
    let filtered = assets.filter(asset => {
      const matchesSearch = searchQuery === "" || 
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter;
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && asset.isActive) ||
        (statusFilter === "inactive" && !asset.isActive) ||
        (statusFilter === "trending" && asset.isTrending) ||
        (statusFilter === "hidden" && !asset.isVisible);

      return matchesSearch && matchesCategory && matchesStatus;
    });

    setFilteredAssets(filtered);
  }, [assets, searchQuery, categoryFilter, statusFilter]);

  const toggleAssetProperty = (assetId: string, property: keyof Asset) => {
    setAssets(assets.map(asset => 
      asset.id === assetId 
        ? { ...asset, [property]: !asset[property], lastUpdated: new Date() }
        : asset
    ));
  };

  const addNewAsset = () => {
    if (!newAsset.symbol || !newAsset.name) {
      alert("Пожалуйста, заполните обязательные поля");
      return;
    }

    const asset: Asset = {
      id: newAsset.symbol.toLowerCase(),
      symbol: newAsset.symbol.toUpperCase(),
      name: newAsset.name,
      icon: newAsset.symbol.charAt(0).toUpperCase(),
      category: newAsset.category as any,
      currentPrice: newAsset.currentPrice,
      change24h: 0,
      volume24h: 0,
      isActive: true,
      isTrending: false,
      isVisible: true,
      minTradeAmount: newAsset.minTradeAmount,
      maxTradeAmount: newAsset.maxTradeAmount,
      precision: newAsset.precision,
      description: newAsset.description,
      addedDate: new Date(),
      lastUpdated: new Date()
    };

    setAssets([...assets, asset]);
    setNewAsset({
      symbol: "",
      name: "",
      category: "crypto",
      minTradeAmount: 1,
      maxTradeAmount: 100000,
      precision: 2,
      description: "",
      currentPrice: 0
    });
    setIsAddDialogOpen(false);
  };

  const updateAssetPrices = async () => {
    setIsLoading(true);
    // Simulate API call to update prices
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setAssets(assets.map(asset => ({
      ...asset,
      currentPrice: asset.currentPrice * (1 + (Math.random() - 0.5) * 0.1),
      change24h: (Math.random() - 0.5) * 10,
      volume24h: asset.volume24h * (1 + (Math.random() - 0.5) * 0.3),
      lastUpdated: new Date()
    })));
    
    setIsLoading(false);
  };

  const getTrendingCount = () => assets.filter(a => a.isTrending).length;
  const getActiveCount = () => assets.filter(a => a.isActive).length;

  const getCategoryBadge = (category: string) => {
    const styles = {
      crypto: "bg-blue-100 text-blue-800",
      stocks: "bg-green-100 text-green-800",
      gold: "bg-yellow-100 text-yellow-800",
      currency: "bg-purple-100 text-purple-800"
    };
    
    const labels = {
      crypto: "Крипто",
      stocks: "Акции", 
      gold: "Золото",
      currency: "Валюта"
    };

    return (
      <Badge className={styles[category as keyof typeof styles]}>
        {labels[category as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Управление активами</h1>
          <p className="text-gray-600">
            Всего активов: {filteredAssets.length} • Активных: {getActiveCount()} • В тренде: {getTrendingCount()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={updateAssetPrices}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Обновить цены
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Добавить актив
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Добавить новый актив</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="symbol">Символ *</Label>
                    <Input
                      id="symbol"
                      placeholder="BTC"
                      value={newAsset.symbol}
                      onChange={(e) => setNewAsset({...newAsset, symbol: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Категория</Label>
                    <Select value={newAsset.category} onValueChange={(value) => setNewAsset({...newAsset, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="crypto">Криптовалюта</SelectItem>
                        <SelectItem value="stocks">Акции</SelectItem>
                        <SelectItem value="gold">Золото</SelectItem>
                        <SelectItem value="currency">Валюта</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="name">Название *</Label>
                  <Input
                    id="name"
                    placeholder="Bitcoin"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Текущая цена</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    value={newAsset.currentPrice}
                    onChange={(e) => setNewAsset({...newAsset, currentPrice: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minAmount">Мин. сумма</Label>
                    <Input
                      id="minAmount"
                      type="number"
                      step="0.001"
                      value={newAsset.minTradeAmount}
                      onChange={(e) => setNewAsset({...newAsset, minTradeAmount: parseFloat(e.target.value) || 1})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="precision">Точность</Label>
                    <Input
                      id="precision"
                      type="number"
                      min="0"
                      max="8"
                      value={newAsset.precision}
                      onChange={(e) => setNewAsset({...newAsset, precision: parseInt(e.target.value) || 2})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    placeholder="Описание актива..."
                    value={newAsset.description}
                    onChange={(e) => setNewAsset({...newAsset, description: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button onClick={addNewAsset}>
                    Добавить
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего активов</p>
                <p className="text-2xl font-bold">{assets.length}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Активные</p>
                <p className="text-2xl font-bold text-green-600">{getActiveCount()}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">В тренде</p>
                <p className="text-2xl font-bold text-yellow-600">{getTrendingCount()}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Общий объем</p>
                <p className="text-2xl font-bold">
                  ${assets.reduce((sum, a) => sum + a.volume24h, 0).toLocaleString()}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Поиск активов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                <SelectItem value="crypto">Криптовалюты</SelectItem>
                <SelectItem value="stocks">Акции</SelectItem>
                <SelectItem value="gold">Золото</SelectItem>
                <SelectItem value="currency">Валюты</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="active">Активны��</SelectItem>
                <SelectItem value="inactive">Неактивные</SelectItem>
                <SelectItem value="trending">В тренде</SelectItem>
                <SelectItem value="hidden">Скрытые</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {filteredAssets.length} результатов
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Актив</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead>Изменение 24ч</TableHead>
                  <TableHead>Объем 24ч</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Трендинг</TableHead>
                  <TableHead>Видимость</TableHead>
                  <TableHead>Настройки</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow key={asset.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-white">{asset.icon}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{asset.symbol}</p>
                          <p className="text-sm text-gray-500">{asset.name}</p>
                          {getCategoryBadge(asset.category)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">${asset.currentPrice.toFixed(asset.precision)}</p>
                      <p className="text-xs text-gray-500">
                        Обновлено: {asset.lastUpdated.toLocaleTimeString('ru-RU')}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center ${asset.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {asset.change24h >= 0 ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        <span className="font-medium">
                          {Math.abs(asset.change24h).toFixed(2)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">${asset.volume24h.toLocaleString()}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={asset.isActive}
                          onCheckedChange={() => toggleAssetProperty(asset.id, 'isActive')}
                        />
                        <span className="text-sm">
                          {asset.isActive ? 'Активен' : 'Отключен'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={asset.isTrending}
                          onCheckedChange={() => toggleAssetProperty(asset.id, 'isTrending')}
                        />
                        {asset.isTrending && <Star className="w-4 h-4 text-yellow-500" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={asset.isVisible}
                          onCheckedChange={() => toggleAssetProperty(asset.id, 'isVisible')}
                        />
                        <span className="text-sm">
                          {asset.isVisible ? 'Видимый' : 'Скрытый'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        <p>Мин: {asset.minTradeAmount}</p>
                        <p>Макс: {asset.maxTradeAmount.toLocaleString()}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingAsset(asset)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Trending Assets Alert */}
      {getTrendingCount() > 5 && (
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            У вас более 5 активов в тренде. Рекомендуется ограничить количество трендинговых активов для лучшего пользовательского опыта.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
