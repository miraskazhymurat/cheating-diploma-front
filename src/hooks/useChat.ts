import { useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { chatApi, type SendMessageParams, type ChatMessage } from "../api/chat";

export function useChatMessages(boardId: number) {
  return useInfiniteQuery({
    queryKey: ["chat", boardId],
    queryFn: ({ pageParam }) => chatApi.getMessages(boardId, 50, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.length === 50 ? lastPageParam + 50 : undefined,
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

export function useUnvotePoll(boardId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (optionId: number) => chatApi.unvotePoll(boardId, optionId),
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
      queryClient.setQueryData<InfiniteData<ChatMessage[]>>(["chat", boardId], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => page.filter((m) => m.id !== msgId)),
        };
      });
    },
  });
}
