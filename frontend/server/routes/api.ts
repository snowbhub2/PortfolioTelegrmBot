import { Request, Response } from "express";

// Mock data to simulate the backend
const mockUsers = [
  {
    id: "1",
    telegram_id: "123456789",
    username: "user123",
    first_name: "John",
    last_name: "Doe",
    email: "user@example.com",
    balance: "1000.00",
    status: "active",
    user_type: "regular",
    created_at: new Date().toISOString()
  }
];

const mockAssets = [
  {
    id: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    current_price: "47000.00",
    price_change_24h: "1250.00",
    price_change_percentage_24h: 2.73,
    market_cap: "900000000000",
    volume_24h: "25000000000",
    is_active: true,
    description: "The original cryptocurrency"
  },
  {
    id: "eth",
    symbol: "ETH", 
    name: "Ethereum",
    current_price: "3500.00",
    price_change_24h: "150.00",
    price_change_percentage_24h: 4.48,
    market_cap: "420000000000",
    volume_24h: "15000000000",
    is_active: true,
    description: "Smart contract platform"
  }
];

const mockPortfolio = {
  total_value: "5000.00",
  total_balance: "1000.00", 
  total_profit_loss: "250.00",
  profit_loss_percentage: 5.25,
  holdings: [
    {
      asset_id: "btc",
      asset_symbol: "BTC",
      asset_name: "Bitcoin",
      quantity: "0.1",
      average_price: "45000.00", 
      current_price: "47000.00",
      total_value: "4700.00",
      profit_loss: "200.00",
      profit_loss_percentage: 4.44
    }
  ]
};

const mockNotifications = [
  {
    id: "1",
    user_id: "1",
    type: "trading",
    title: "Order Completed",
    message: "Your BTC buy order has been completed",
    priority: "normal",
    is_read: false,
    is_actionable: true,
    action_url: "/portfolio",
    created_at: new Date().toISOString()
  }
];

// Health check
export function handleHealth(req: Request, res: Response) {
  res.json({
    status: "healthy",
    version: "1.0.0",
    environment: "development",
    services: {
      database: "connected",
      redis: "connected", 
      telegram_bot: "running",
      celery: "running"
    }
  });
}

// API Root
export function handleApiRoot(req: Request, res: Response) {
  res.json({
    message: "Crypto Trading Platform API",
    version: "1.0.0",
    status: "running"
  });
}

// Authentication endpoints
export function handleTelegramAuth(req: Request, res: Response) {
  const { init_data, hash } = req.body;
  
  // Mock authentication response
  res.json({
    access_token: "mock_jwt_token_" + Date.now(),
    token_type: "bearer",
    expires_in: 86400,
    user: mockUsers[0]
  });
}

// User endpoints
export function handleGetCurrentUser(req: Request, res: Response) {
  res.json(mockUsers[0]);
}

export function handleUpdateUser(req: Request, res: Response) {
  const updates = req.body;
  const updatedUser = { ...mockUsers[0], ...updates };
  res.json(updatedUser);
}

export function handleGetUserPortfolio(req: Request, res: Response) {
  res.json(mockPortfolio);
}

export function handleGetUserTransactions(req: Request, res: Response) {
  const { limit = 50, offset = 0, type = "all" } = req.query;
  
  const mockTransactions = [
    {
      id: "1",
      type: "buy",
      asset_symbol: "BTC", 
      quantity: "0.1",
      price: "45000.00",
      total_amount: "4500.00",
      fee: "4.50",
      status: "completed",
      created_at: new Date().toISOString()
    }
  ];
  
  res.json({
    transactions: mockTransactions,
    total: mockTransactions.length,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string)
  });
}

// Trading endpoints
export function handleGetAssets(req: Request, res: Response) {
  const { limit = 50, offset = 0, search = "" } = req.query;
  
  let filteredAssets = mockAssets;
  if (search) {
    filteredAssets = mockAssets.filter(asset => 
      asset.symbol.toLowerCase().includes((search as string).toLowerCase()) ||
      asset.name.toLowerCase().includes((search as string).toLowerCase())
    );
  }
  
  res.json({
    assets: filteredAssets,
    total: filteredAssets.length,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string)
  });
}

export function handleGetAsset(req: Request, res: Response) {
  const { asset_id } = req.params;
  const asset = mockAssets.find(a => a.id === asset_id);
  
  if (!asset) {
    return res.status(404).json({ error: true, message: "Asset not found" });
  }
  
  res.json(asset);
}

export function handleCreateOrder(req: Request, res: Response) {
  const { asset_id, order_type, side, quantity, price } = req.body;
  
  const asset = mockAssets.find(a => a.id === asset_id);
  if (!asset) {
    return res.status(404).json({ error: true, message: "Asset not found" });
  }
  
  const orderPrice = price || parseFloat(asset.current_price);
  const totalAmount = parseFloat(quantity) * orderPrice;
  const fee = totalAmount * 0.001; // 0.1% fee
  
  const order = {
    id: "order_" + Date.now(),
    user_id: "1",
    asset_id,
    order_type,
    side,
    quantity,
    price: orderPrice.toString(),
    total_amount: totalAmount.toString(),
    fee: fee.toString(),
    status: "completed",
    filled_quantity: quantity,
    remaining_quantity: "0.0",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  res.status(201).json(order);
}

export function handleGetOrders(req: Request, res: Response) {
  const { status = "all", limit = 50, offset = 0 } = req.query;
  
  const mockOrders = [
    {
      id: "1",
      user_id: "1", 
      asset_id: "btc",
      order_type: "market",
      side: "buy",
      quantity: "0.1",
      price: "47000.00",
      total_amount: "4700.00",
      fee: "4.70",
      status: "completed",
      created_at: new Date().toISOString()
    }
  ];
  
  res.json({
    orders: mockOrders,
    total: mockOrders.length,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string)
  });
}

// Notification endpoints
export function handleGetNotifications(req: Request, res: Response) {
  const { limit = 50, offset = 0, unread_only = false } = req.query;
  
  let filteredNotifications = mockNotifications;
  if (unread_only === 'true') {
    filteredNotifications = mockNotifications.filter(n => !n.is_read);
  }
  
  res.json({
    notifications: filteredNotifications,
    total: filteredNotifications.length,
    unread_count: filteredNotifications.filter(n => !n.is_read).length,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string)
  });
}

export function handleMarkNotificationRead(req: Request, res: Response) {
  const { notification_id } = req.params;
  
  const notification = mockNotifications.find(n => n.id === notification_id);
  if (!notification) {
    return res.status(404).json({ error: true, message: "Notification not found" });
  }
  
  notification.is_read = true;
  res.json(notification);
}

// Admin endpoints
export function handleAdminDashboard(req: Request, res: Response) {
  res.json({
    total_users: 1500,
    active_users: 1200,
    total_volume_24h: "5000000.00",
    total_trades_24h: 2500,
    pending_withdrawals: 15,
    pending_deposits: 8,
    total_assets: 100,
    active_assets: 95,
    system_status: "healthy",
    recent_activities: [
      {
        type: "user_registration",
        description: "New user registered",
        timestamp: new Date().toISOString()
      }
    ]
  });
}

export function handleGetAdminUsers(req: Request, res: Response) {
  const { status = "active", limit = 50, offset = 0, search = "" } = req.query;
  
  res.json({
    users: mockUsers,
    total: mockUsers.length,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string)
  });
}
