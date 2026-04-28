import { useEffect, useRef } from "react";
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
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!enabled) return;

    const token = localStorage.getItem("authToken");
    if (!token) return;

    let active = true;
    let ws: WebSocket | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (!active) return;
      ws = new WebSocket(`${WS_BASE}${path}?token=${token}`);

      ws.onmessage = (e) => {
        try {
          const parsed: WsEvent = JSON.parse(e.data);
          onMessageRef.current(parsed);
        } catch {
          // ignore malformed frames
        }
      };

      ws.onclose = () => {
        if (!active) return;
        timer = setTimeout(connect, 3000);
      };

      ws.onerror = () => ws?.close();
    };

    connect();

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
      ws?.close();
    };
  }, [path, enabled]);
}
