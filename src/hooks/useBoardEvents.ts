import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket, type WsEvent } from "./useWebSocket";
import type { TaskResponse, BoardStatusResponse } from "../api/types";

export function useBoardEvents(boardId: number) {
  const queryClient = useQueryClient();

  useWebSocket(`/boards/${boardId}/events`, {
    enabled: boardId > 0,
    onMessage: (event: WsEvent) => {
      const { type, data } = event;

      switch (type) {
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

        case "member_removed": {
          queryClient.invalidateQueries({ queryKey: ["employees", boardId] });
          break;
        }
      }
    },
  });
}
