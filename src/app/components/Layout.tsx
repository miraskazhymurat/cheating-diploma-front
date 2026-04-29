import { ReactNode } from "react";
import { Header } from "./Header";
import { useUserWebSocket } from "../../hooks/useUserWebSocket";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  useUserWebSocket();

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <Header />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
