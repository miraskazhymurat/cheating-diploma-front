import { useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { useWebSocket, type WsEvent } from "./useWebSocket";
import type { ChatMessage } from "../api/chat";

export function useChatWebSocket(boardId: number) {
  const queryClient = useQueryClient();

  useWebSocket(`/boards/${boardId}/ws`, {
    enabled: boardId > 0,
    onMessage: (event: WsEvent) => {
      const { type, data } = event;

      switch (type) {
        case "new_message": {
          const message = data as ChatMessage;
          queryClient.setQueryData<InfiniteData<ChatMessage[]>>(
            ["chat", boardId],
            (old) => {
              if (!old) return old;
              const firstPage = [message, ...old.pages[0]];
              return { ...old, pages: [firstPage, ...old.pages.slice(1)] };
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
          const updatedPoll = data as { id: number; question: string; options: ChatMessage["poll"] };
          queryClient.setQueryData<InfiniteData<ChatMessage[]>>(
            ["chat", boardId],
            (old) => {
              if (!old) return old;
              return {
                ...old,
                pages: old.pages.map((page) =>
                  page.map((msg) =>
                    msg.poll && msg.poll.id === (updatedPoll as any).id
                      ? { ...msg, poll: updatedPoll as any }
                      : msg
                  )
                ),
              };
            }
          );
          break;
        }
      }
    },
  });
}
