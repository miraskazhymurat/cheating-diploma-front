import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatApi, type SendMessageParams } from "../api/chat";

export function useChatMessages(boardId: number, limit = 50, offset = 0) {
  return useQuery({
    queryKey: ["chat", boardId, limit, offset],
    queryFn: () => chatApi.getMessages(boardId, limit, offset),
    enabled: boardId > 0,
  });
}

export function useSendMessage(boardId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: SendMessageParams) => chatApi.sendMessage(boardId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", boardId] });
    },
  });
}
