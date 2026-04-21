import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { commentApi } from "../api/comment";

export function useTaskComments(taskId: number) {
  return useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => commentApi.getByTask(taskId),
    enabled: taskId > 0,
  });
}

export function useAddComment(taskId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => commentApi.create(taskId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", taskId] });
    },
  });
}

export function useDeleteComment(taskId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) => commentApi.delete(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", taskId] });
    },
  });
}
