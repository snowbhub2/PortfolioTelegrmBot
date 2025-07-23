import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleHealth,
  handleApiRoot,
  handleTelegramAuth,
  handleGetCurrentUser,
  handleUpdateUser,
  handleGetUserPortfolio,
  handleGetUserTransactions,
  handleGetAssets,
  handleGetAsset,
  handleCreateOrder,
  handleGetOrders,
  handleGetNotifications,
  handleMarkNotificationRead,
  handleAdminDashboard,
  handleGetAdminUsers,
} from "./routes/api";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/health", handleHealth);

  // Legacy API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });
  app.get("/api/demo", handleDemo);

  // API v1 Routes
  app.get("/api/v1", handleApiRoot);

  // Authentication routes
  app.post("/auth/telegram", handleTelegramAuth);

  // User management routes
  app.get("/api/v1/users/me", handleGetCurrentUser);
  app.put("/api/v1/users/me", handleUpdateUser);
  app.get("/api/v1/users/portfolio", handleGetUserPortfolio);
  app.get("/api/v1/users/transactions", handleGetUserTransactions);

  // Trading routes
  app.get("/api/v1/trading/assets", handleGetAssets);
  app.get("/api/v1/trading/assets/:asset_id", handleGetAsset);
  app.post("/api/v1/trading/orders", handleCreateOrder);
  app.get("/api/v1/trading/orders", handleGetOrders);

  // Notification routes
  app.get("/api/v1/notifications", handleGetNotifications);
  app.put(
    "/api/v1/notifications/:notification_id/read",
    handleMarkNotificationRead,
  );

  // Admin routes
  app.get("/api/v1/admin/dashboard", handleAdminDashboard);
  app.get("/api/v1/admin/users", handleGetAdminUsers);

  // Error handling middleware
  app.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      console.error(err.stack);
      res.status(500).json({
        error: true,
        message: "Internal server error",
        status_code: 500,
      });
    },
  );

  // 404 handler
  app.use((req: express.Request, res: express.Response) => {
    res.status(404).json({
      error: true,
      message: "Endpoint not found",
      status_code: 404,
    });
  });

  return app;
}
