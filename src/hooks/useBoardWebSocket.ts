import { useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { useWebSocket, type WsEvent } from "./useWebSocket";
import type { TaskResponse, BoardStatusResponse } from "../api/types";
import type { ChatMessage } from "../api/chat";

export function useBoardWebSocket(boardId: number) {
  const queryClient = useQueryClient();

  useWebSocket(`/boards/${boardId}/ws`, {
    enabled: boardId > 0,
    onMessage: (event: WsEvent) => {
      const { type, data } = event;

      switch (type) {
        // ── Chat events ──────────────────────────────────────────────────
        case "new_message": {
          const message = data as ChatMessage;
          queryClient.setQueryData<InfiniteData<ChatMessage[]>>(
            ["chat", boardId],
            (old) => {
              if (!old) return old;
              const alreadyExists = old.pages.some((page) =>
                page.some((m) => m.id === message.id)
              );
              if (alreadyExists) return old;
              return { ...old, pages: [[message, ...old.pages[0]], ...old.pages.slice(1)] };
            }
          );
          break;
        }

        case "delete_message": {
          const { id } = data as { id: number };
          queryClient.setQueryData<InfiniteData<ChatMessage[]>>(
            ["chat", boardId],
            (old) => {
              if (!old) return old;
              return {
                ...old,
                pages: old.pages.map((page) => page.filter((m) => m.id !== id)),
              };
            }
          );
          break;
        }

        case "update_poll": {
          type PollPayload = NonNullable<ChatMessage["poll"]>;
          const updatedPoll = data as PollPayload;
          queryClient.setQueryData<InfiniteData<ChatMessage[]>>(
            ["chat", boardId],
            (old) => {
              if (!old) return old;
              return {
                ...old,
                pages: old.pages.map((page) =>
                  page.map((msg) =>
                    msg.poll?.id === updatedPoll.id ? { ...msg, poll: updatedPoll } : msg
                  )
                ),
              };
            }
          );
          break;
        }

        // ── Task events ──────────────────────────────────────────────────
        case "task_created": {
          const task = data as TaskResponse;
          queryClient.setQueryData<TaskResponse[]>(["tasks", boardId], (old) => {
            if (!old) return [task];
            if (old.some((t) => t.id === task.id)) return old;
            return [...old, task];
          });
          break;
        }

        case "task_updated": {
          const task = data as TaskResponse;
          queryClient.setQueryData<TaskResponse[]>(["tasks", boardId], (old) =>
            old?.map((t) => (t.id === task.id ? task : t)) ?? []
          );
          break;
        }

        case "task_deleted": {
          const { id } = data as { id: number };
          queryClient.setQueryData<TaskResponse[]>(["tasks", boardId], (old) =>
            old?.filter((t) => t.id !== id) ?? []
          );
          break;
        }

        // ── Status events ────────────────────────────────────────────────
        case "status_created":
        case "status_deleted":
        case "statuses_reordered":
        case "status_default_changed": {
          queryClient.invalidateQueries({ queryKey: ["statuses", boardId] });
          break;
        }

        case "status_updated": {
          const status = data as BoardStatusResponse;
          queryClient.setQueryData<BoardStatusResponse[]>(
            ["statuses", boardId],
            (old) => old?.map((s) => (s.board_status_id === status.board_status_id ? status : s)) ?? []
          );
          break;
        }

        // ── Member events ────────────────────────────────────────────────
        case "member_removed": {
          queryClient.invalidateQueries({ queryKey: ["employees", boardId] });
          break;
        }
      }
    },
  });
}
