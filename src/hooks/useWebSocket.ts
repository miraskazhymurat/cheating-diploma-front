import { useEffect, useRef, useCallback } from "react";
import { BASE_URL } from "../api/axiosInstance";

const WS_BASE = BASE_URL.replace(/^http/, "ws");

export interface WsEvent<T = unknown> {
  type: string;
  data: T;
}

interface UseWebSocketOptions {
  onMessage: (event: WsEvent) => void;
  enabled?: boolean;
}

export function useWebSocket(path: string, options: UseWebSocketOptions) {
  const { onMessage, enabled = true } = options;
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    if (!isMounted.current || !enabled) return;

    const token = localStorage.getItem("authToken");
    if (!token) return;

    const url = `${WS_BASE}${path}?token=${token}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const parsed: WsEvent = JSON.parse(e.data);
        onMessageRef.current(parsed);
      } catch {
        // ignore malformed frames
      }
    };

    ws.onclose = () => {
      if (!isMounted.current) return;
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [path, enabled]);

  useEffect(() => {
    isMounted.current = true;
    if (enabled) connect();

    return () => {
      isMounted.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect, enabled]);
}
