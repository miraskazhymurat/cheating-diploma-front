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
    if (!token) {
      console.warn(`[WS] No auth token, skipping ${path}`);
      return;
    }

    let active = true;
    let ws: WebSocket | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let attempt = 0;

    const connect = () => {
      if (!active) return;
      attempt++;
      console.log(`[WS] Connecting to ${path} (attempt ${attempt})`);

      ws = new WebSocket(`${WS_BASE}${path}?token=${token}`);

      ws.onopen = () => {
        console.log(`[WS] Connected: ${path}`);
        attempt = 0;
      };

      ws.onmessage = (e) => {
        try {
          const parsed: WsEvent = JSON.parse(e.data);
          onMessageRef.current(parsed);
        } catch {
          // ignore malformed frames
        }
      };

      ws.onclose = (e) => {
        console.log(`[WS] Closed: ${path} code=${e.code} reason="${e.reason}"`);
        if (!active) return;
        // exponential backoff: 3s, 6s, 12s, max 30s
        const delay = Math.min(3000 * Math.pow(2, attempt - 1), 30000);
        console.log(`[WS] Reconnecting in ${delay}ms...`);
        timer = setTimeout(connect, delay);
      };

      ws.onerror = (e) => {
        console.error(`[WS] Error on ${path}`, e);
        ws?.close();
      };
    };

    connect();

    return () => {
      console.log(`[WS] Cleanup: ${path}`);
      active = false;
      if (timer) clearTimeout(timer);
      ws?.close();
    };
  }, [path, enabled]);
}
