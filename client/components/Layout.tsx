import { ReactNode } from "react";
import { useAutoBackButton } from "@/hooks/useAutoBackButton";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  useAutoBackButton();

  return <>{children}</>;
};
