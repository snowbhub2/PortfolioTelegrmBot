import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTelegram } from "./useTelegram";

// Routes that should show back button (not the main page)
const ROUTES_WITH_BACK_BUTTON = [
  "/settings",
  "/history",
  "/bonuses",
  "/market",
  "/exchange",
  "/coin/",
  "/asset/",
  "/withdraw/",
  "/deposit/",
];

// Routes that should never show back button
const ROUTES_WITHOUT_BACK_BUTTON = ["/"];

export const useAutoBackButton = () => {
  const { tg, hapticFeedback } = useTelegram();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("🔙 useAutoBackButton: перевірка tg object:", tg);
    console.log("📍 Поточний шлях:", location.pathname);

    if (!tg) {
      console.warn("⚠️ useAutoBackButton: tg object недоступний");
      return;
    }

    const currentPath = location.pathname;

    // Check if current route should show back button
    const shouldShowBackButton =
      ROUTES_WITH_BACK_BUTTON.some((route) => currentPath.startsWith(route)) &&
      !ROUTES_WITHOUT_BACK_BUTTON.includes(currentPath);

    if (shouldShowBackButton) {
      tg.BackButton.show();

      const handleBack = () => {
        hapticFeedback?.("light");

        // Custom back navigation logic
        if (
          currentPath.startsWith("/coin/") ||
          currentPath.startsWith("/asset/")
        ) {
          navigate("/");
        } else if (currentPath.startsWith("/withdraw/")) {
          if (currentPath === "/withdraw/method") {
            navigate("/");
          } else if (currentPath === "/withdraw/asset-select") {
            navigate("/withdraw/method");
          } else if (currentPath === "/withdraw/wallet-address") {
            navigate("/withdraw/asset-select");
          } else if (currentPath === "/withdraw/amount") {
            navigate("/withdraw/wallet-address");
          } else if (currentPath === "/withdraw/processing") {
            navigate("/withdraw/amount");
          } else if (currentPath === "/withdraw/telegram-stars") {
            navigate("/withdraw/method");
          } else {
            navigate(-1);
          }
        } else if (currentPath.startsWith("/deposit/")) {
          if (currentPath === "/deposit/method") {
            navigate("/");
          } else if (currentPath === "/deposit/asset-select") {
            navigate("/deposit/method");
          } else if (currentPath === "/deposit/network-select") {
            navigate("/deposit/asset-select");
          } else if (currentPath === "/deposit/address") {
            navigate("/deposit/network-select");
          } else {
            navigate(-1);
          }
        } else {
          // For other pages, just go back to main page
          navigate("/");
        }
      };

      tg.BackButton.onClick(handleBack);

      return () => {
        tg.BackButton.offClick(handleBack);
      };
    } else {
      tg.BackButton.hide();
    }
  }, [tg, location.pathname, navigate, hapticFeedback]);

  return { tg, hapticFeedback };
};
