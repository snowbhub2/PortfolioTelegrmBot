import { useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTelegram } from "./useTelegram";

interface NavigationState {
  path: string;
  timestamp: number;
  params?: Record<string, any>;
}

export const useTelegramNavigation = () => {
  const { webApp, tg } = useTelegram();
  const navigate = useNavigate();
  const location = useLocation();

  // History management
  const saveNavigationState = useCallback((path: string, params?: Record<string, any>) => {
    const history = JSON.parse(localStorage.getItem("tg_navigation_history") || "[]");
    const newState: NavigationState = {
      path,
      timestamp: Date.now(),
      params
    };
    
    // Avoid duplicates and limit history size
    const filteredHistory = history.filter((item: NavigationState) => item.path !== path);
    const updatedHistory = [...filteredHistory, newState].slice(-10);
    
    localStorage.setItem("tg_navigation_history", JSON.stringify(updatedHistory));
  }, []);

  const getLastLocation = useCallback(() => {
    const history = JSON.parse(localStorage.getItem("tg_navigation_history") || "[]");
    return history.length > 1 ? history[history.length - 2] : null;
  }, []);

  const handleBackButton = useCallback(() => {
    const lastLocation = getLastLocation();
    
    if (lastLocation) {
      // Navigate to the last location
      navigate(lastLocation.path);
    } else {
      // Default back behavior - go to home
      navigate("/");
    }
  }, [navigate, getLastLocation]);

  // Setup Telegram back button
  useEffect(() => {
    if (!webApp) return;

    const currentPath = location.pathname;
    
    // Save current navigation state
    saveNavigationState(currentPath);

    // Show/hide back button based on current location
    if (currentPath === "/") {
      webApp.BackButton.hide();
    } else {
      webApp.BackButton.show();
      webApp.BackButton.onClick(handleBackButton);
    }

    // Cleanup
    return () => {
      webApp.BackButton.offClick(handleBackButton);
    };
  }, [webApp, location.pathname, handleBackButton, saveNavigationState]);

  // Handle browser navigation events for proper state management
  useEffect(() => {
    const handlePopState = () => {
      if (webApp) {
        const currentPath = location.pathname;
        if (currentPath === "/") {
          webApp.BackButton.hide();
        } else {
          webApp.BackButton.show();
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [webApp, location.pathname]);

  // Enhanced navigation with haptic feedback
  const navigateWithHaptic = useCallback((path: string, options?: { 
    replace?: boolean;
    haptic?: "light" | "medium" | "heavy";
    params?: Record<string, any>;
  }) => {
    // Provide haptic feedback
    if (webApp?.HapticFeedback && options?.haptic) {
      webApp.HapticFeedback.impactOccurred(options.haptic);
    }

    // Save navigation state
    saveNavigationState(path, options?.params);

    // Navigate
    if (options?.replace) {
      navigate(path, { replace: true });
    } else {
      navigate(path);
    }
  }, [webApp, navigate, saveNavigationState]);

  // Setup main button helpers
  const showMainButton = useCallback((text: string, onClick: () => void, options?: {
    color?: string;
    textColor?: string;
    haptic?: "light" | "medium" | "heavy";
  }) => {
    if (!webApp?.MainButton) return;

    webApp.MainButton.setText(text);
    
    if (options?.color) {
      webApp.MainButton.setParams({ color: options.color });
    }
    
    if (options?.textColor) {
      webApp.MainButton.setParams({ text_color: options.textColor });
    }

    const handleClick = () => {
      if (options?.haptic && webApp.HapticFeedback) {
        webApp.HapticFeedback.impactOccurred(options.haptic);
      }
      onClick();
    };

    webApp.MainButton.onClick(handleClick);
    webApp.MainButton.show();
  }, [webApp]);

  const hideMainButton = useCallback(() => {
    if (webApp?.MainButton) {
      webApp.MainButton.hide();
    }
  }, [webApp]);

  // Close mini app
  const closeMiniApp = useCallback(() => {
    if (webApp) {
      webApp.close();
    }
  }, [webApp]);

  // Show popup
  const showPopup = useCallback((message: string, options?: {
    title?: string;
    buttons?: Array<{ id: string; type?: "default" | "ok" | "close" | "cancel" | "destructive"; text: string }>;
  }) => {
    if (!webApp?.showPopup) return Promise.resolve("");

    return new Promise<string>((resolve) => {
      webApp.showPopup({
        title: options?.title || "Уведомление",
        message,
        buttons: options?.buttons || [{ id: "ok", type: "ok", text: "OK" }]
      }, (buttonId: string) => {
        resolve(buttonId);
      });
    });
  }, [webApp]);

  // Show confirmation
  const showConfirm = useCallback((message: string, title?: string) => {
    return showPopup(message, {
      title: title || "Подтверждение",
      buttons: [
        { id: "cancel", type: "cancel", text: "Отмена" },
        { id: "ok", type: "ok", text: "OK" }
      ]
    }).then(buttonId => buttonId === "ok");
  }, [showPopup]);

  // Show alert
  const showAlert = useCallback((message: string, title?: string) => {
    return showPopup(message, {
      title: title || "Внимание",
      buttons: [{ id: "ok", type: "ok", text: "OK" }]
    });
  }, [showPopup]);

  // Haptic feedback helpers
  const haptic = {
    light: () => webApp?.HapticFeedback?.impactOccurred("light"),
    medium: () => webApp?.HapticFeedback?.impactOccurred("medium"),
    heavy: () => webApp?.HapticFeedback?.impactOccurred("heavy"),
    success: () => webApp?.HapticFeedback?.notificationOccurred("success"),
    warning: () => webApp?.HapticFeedback?.notificationOccurred("warning"),
    error: () => webApp?.HapticFeedback?.notificationOccurred("error"),
    selection: () => webApp?.HapticFeedback?.selectionChanged()
  };

  // Theme and UI helpers
  const theme = {
    isDark: webApp?.colorScheme === "dark",
    backgroundColor: webApp?.backgroundColor,
    headerColor: webApp?.headerColor,
    setHeaderColor: (color: string) => webApp?.setHeaderColor?.(color),
    setBackgroundColor: (color: string) => webApp?.setBackgroundColor?.(color)
  };

  return {
    // Navigation
    navigateWithHaptic,
    handleBackButton,
    getLastLocation,
    
    // Main button
    showMainButton,
    hideMainButton,
    
    // Popups and dialogs
    showPopup,
    showConfirm,
    showAlert,
    
    // Haptic feedback
    haptic,
    
    // Theme
    theme,
    
    // Utilities
    closeMiniApp,
    
    // Direct access to webApp
    webApp,
    tg,
    
    // State
    isBackButtonVisible: webApp?.BackButton?.isVisible || false,
    isMainButtonVisible: webApp?.MainButton?.isVisible || false,
    currentPath: location.pathname
  };
};
