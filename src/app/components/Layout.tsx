import { ReactNode } from "react";
import { Header } from "./Header";
import { useUserWebSocket } from "../../hooks/useUserWebSocket";
import { useLevelUpNotifier } from "../../hooks/useLevelUpNotifier";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  useUserWebSocket();
  useLevelUpNotifier();

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <Header />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
