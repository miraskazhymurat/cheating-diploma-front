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

export function useCreatePoll(boardId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ question, options }: { question: string; options: string[] }) =>
      chatApi.createPoll(boardId, question, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", boardId] });
    },
  });
}

export function useVotePoll(boardId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (optionId: number) => chatApi.votePoll(boardId, optionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", boardId] });
    },
  });
}

export function useDeleteMessage(boardId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (msgId: number) => chatApi.deleteMessage(boardId, msgId),
    onSuccess: (_, msgId) => {
      queryClient.setQueryData<import("../api/chat").ChatMessage[]>(["chat", boardId, 50, 0], (old) =>
        old ? old.filter((m) => m.id !== msgId) : old
      );
    },
  });
}
