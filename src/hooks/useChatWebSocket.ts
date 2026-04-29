import { useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { useWebSocket, type WsEvent } from "./useWebSocket";
import type { ChatMessage } from "../api/chat";

interface ChatWebSocketOptions {
  onNewMessage?: (msg: ChatMessage) => void;
}

export function useChatWebSocket(boardId: number, options?: ChatWebSocketOptions) {
  const queryClient = useQueryClient();

  useWebSocket(`/boards/${boardId}/ws`, {
    enabled: boardId > 0,
    onMessage: (event: WsEvent) => {
      const { type, data } = event;

      switch (type) {
        case "new_message": {
          const message = data as ChatMessage;
          options?.onNewMessage?.(message);
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
                    msg.poll?.id === updatedPoll.id
                      ? { ...msg, poll: updatedPoll }
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
