import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardApi } from "../api/board";
import type { CreateBoardRequest } from "../api/types";

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

export function useDeleteBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => boardApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
