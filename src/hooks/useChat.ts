import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../api/chat";

export function useChatMessages(boardId: number) {
  return useQuery({
    queryKey: ["chat", boardId],
    queryFn: () => chatApi.getMessages(boardId),
    enabled: boardId > 0,
  });
}

export function useSendMessage(boardId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => chatApi.sendMessage(boardId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", boardId] });
    },
  });
}
