import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { statusApi } from "../api/status";
import type { BoardStatusResponse } from "../api/types";

export function useBoardStatuses(boardId: number) {
  return useQuery({
    queryKey: ["statuses", boardId],
    queryFn: () => statusApi.getBoardStatuses(boardId),
    enabled: boardId > 0,
  });
}

export function useCreateStatus(boardId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => statusApi.create({ board_id: boardId, title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statuses", boardId] });
    },
  });
}

export function useDeleteStatus(boardId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (boardStatusId: number) => statusApi.delete(boardStatusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statuses", boardId] });
    },
  });
}

export function useUpdateStatus(boardId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ boardStatusId, color }: { boardStatusId: number; color: string }) =>
      statusApi.update(boardStatusId, { colour: color }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statuses", boardId] });
    },
  });
}

export function useSetDefaultStatus(boardId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (boardStatusId: number) => statusApi.setDefault(boardStatusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statuses", boardId] });
    },
  });
}

export function useReorderStatuses(boardId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (statuses: { board_status_id: number; position: number }[]) =>
      statusApi.reorder(statuses),
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: ["statuses", boardId] });
      const prev = queryClient.getQueryData<BoardStatusResponse[]>(["statuses", boardId]);
      if (prev) {
        const posMap = new Map(newOrder.map((s) => [s.board_status_id, s.position]));
        const optimistic = [...prev]
          .map((s) => ({ ...s, position: posMap.get(s.board_status_id) ?? s.position }))
          .sort((a, b) => a.position - b.position);
        queryClient.setQueryData(["statuses", boardId], optimistic);
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["statuses", boardId], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["statuses", boardId] });
    },
  });
}
