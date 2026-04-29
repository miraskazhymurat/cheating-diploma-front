import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardApi } from "../api/board";
import type { CreateBoardRequest } from "../api/types";
import type { NotionImportRequest } from "../api/board";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: boardApi.getDashboard,
  });
}

export function useBoard(id: number) {
  return useQuery({
    queryKey: ["board", id],
    queryFn: () => boardApi.getById(id),
    enabled: id > 0,
  });
}

export function useCreateBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBoardRequest) => boardApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useImportNotionBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notionDatabaseId: string) => boardApi.importFromNotion(notionDatabaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useImportNotionV2() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NotionImportRequest) => boardApi.importFromNotionV2(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useBoardMemberStats(boardId: number) {
  return useQuery({
    queryKey: ["board", boardId, "member-stats"],
    queryFn: () => boardApi.getMemberStats(boardId),
    enabled: boardId > 0,
  });
}

export function useUpdateBoard(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description: string }) => boardApi.update(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(["board", id], updated);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => boardApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
