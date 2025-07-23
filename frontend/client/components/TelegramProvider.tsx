import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useTelegramNavigation } from "@/hooks/useTelegramNavigation";
import { useTelegram } from "@/hooks/useTelegram";

interface TelegramContextType {
  // Navigation
  navigateWithHaptic: (path: string, options?: { 
    replace?: boolean;
    haptic?: "light" | "medium" | "heavy";
    params?: Record<string, any>;
  }) => void;
  
  // Main button
  showMainButton: (text: string, onClick: () => void, options?: {
    color?: string;
    textColor?: string;
    haptic?: "light" | "medium" | "heavy";
  }) => void;
  hideMainButton: () => void;
  
  // Popups
  showPopup: (message: string, options?: {
    title?: string;
    buttons?: Array<{ id: string; type?: "default" | "ok" | "close" | "cancel" | "destructive"; text: string }>;
  }) => Promise<string>;
  showConfirm: (message: string, title?: string) => Promise<boolean>;
  showAlert: (message: string, title?: string) => Promise<string>;
  
  // Haptic feedback
  haptic: {
    light: () => void;
    medium: () => void;
    heavy: () => void;
    success: () => void;
    warning: () => void;
    error: () => void;
    selection: () => void;
  };
  
  // Theme
  theme: {
    isDark: boolean;
    backgroundColor?: string;
    headerColor?: string;
    setHeaderColor: (color: string) => void;
    setBackgroundColor: (color: string) => void;
  };
  
  // User data
  user: any;
  
  // Utilities
  closeMiniApp: () => void;
  webApp: any;
  
  // State
  isBackButtonVisible: boolean;
  isMainButtonVisible: boolean;
  currentPath: string;
  isTelegramMiniApp: boolean;
}

const TelegramContext = createContext<TelegramContextType | null>(null);

interface TelegramProviderProps {
  children: ReactNode;
}

export const TelegramProvider: React.FC<TelegramProviderProps> = ({ children }) => {
  const location = useLocation();
  const { user, webApp } = useTelegram();
  const navigation = useTelegramNavigation();

  // Determine if we're in Telegram Mini App environment
  const isTelegramMiniApp = !!(webApp || window?.Telegram?.WebApp);

  // Auto-setup based on route
  useEffect(() => {
    if (!webApp) return;

    const currentPath = location.pathname;

    // Configure theme based on current page
    if (currentPath.startsWith("/admin")) {
      // Admin pages - darker theme
      webApp.setHeaderColor?.("#1f2937");
      webApp.setBackgroundColor?.("#f9fafb");
    } else {
      // User pages - default theme
      webApp.setHeaderColor?.("#3b82f6");
      webApp.setBackgroundColor?.("#ffffff");
    }

    // Configure back button behavior
    if (currentPath === "/") {
      webApp.BackButton?.hide();
    } else {
      webApp.BackButton?.show();
    }

    // Hide main button by default on route change
    webApp.MainButton?.hide();

  }, [location.pathname, webApp]);

  // Setup viewport handling
  useEffect(() => {
    if (!webApp) return;

    // Expand the mini app to full height
    webApp.expand?.();

    // Handle viewport changes
    const handleViewportChanged = () => {
      console.log("Viewport changed:", {
        height: webApp.viewportHeight,
        stableHeight: webApp.viewportStableHeight
      });
    };

    if (webApp.onEvent) {
      webApp.onEvent("viewportChanged", handleViewportChanged);
      
      return () => {
        webApp.offEvent?.("viewportChanged", handleViewportChanged);
      };
    }
  }, [webApp]);

  // Handle theme changes
  useEffect(() => {
    if (!webApp) return;

    const handleThemeChanged = () => {
      console.log("Theme changed:", webApp.colorScheme);
      // You can update your app's theme here based on webApp.colorScheme
    };

    if (webApp.onEvent) {
      webApp.onEvent("themeChanged", handleThemeChanged);
      
      return () => {
        webApp.offEvent?.("themeChanged", handleThemeChanged);
      };
    }
  }, [webApp]);

  // Enhanced haptic feedback with fallbacks
  const enhancedHaptic = {
    light: () => {
      try {
        navigation.haptic.light();
      } catch (error) {
        console.warn("Haptic feedback not available:", error);
      }
    },
    medium: () => {
      try {
        navigation.haptic.medium();
      } catch (error) {
        console.warn("Haptic feedback not available:", error);
      }
    },
    heavy: () => {
      try {
        navigation.haptic.heavy();
      } catch (error) {
        console.warn("Haptic feedback not available:", error);
      }
    },
    success: () => {
      try {
        navigation.haptic.success();
      } catch (error) {
        console.warn("Haptic feedback not available:", error);
      }
    },
    warning: () => {
      try {
        navigation.haptic.warning();
      } catch (error) {
        console.warn("Haptic feedback not available:", error);
      }
    },
    error: () => {
      try {
        navigation.haptic.error();
      } catch (error) {
        console.warn("Haptic feedback not available:", error);
      }
    },
    selection: () => {
      try {
        navigation.haptic.selection();
      } catch (error) {
        console.warn("Haptic feedback not available:", error);
      }
    }
  };

  const contextValue: TelegramContextType = {
    // Navigation
    navigateWithHaptic: navigation.navigateWithHaptic,
    
    // Main button
    showMainButton: navigation.showMainButton,
    hideMainButton: navigation.hideMainButton,
    
    // Popups
    showPopup: navigation.showPopup,
    showConfirm: navigation.showConfirm,
    showAlert: navigation.showAlert,
    
    // Haptic feedback
    haptic: enhancedHaptic,
    
    // Theme
    theme: navigation.theme,
    
    // User data
    user,
    
    // Utilities
    closeMiniApp: navigation.closeMiniApp,
    webApp,
    
    // State
    isBackButtonVisible: navigation.isBackButtonVisible,
    isMainButtonVisible: navigation.isMainButtonVisible,
    currentPath: navigation.currentPath,
    isTelegramMiniApp
  };

  return (
    <TelegramContext.Provider value={contextValue}>
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegramContext = () => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error("useTelegramContext must be used within a TelegramProvider");
  }
  return context;
};

// Hook for optional Telegram context (doesn't throw if not in provider)
export const useTelegramContextOptional = () => {
  return useContext(TelegramContext);
};
