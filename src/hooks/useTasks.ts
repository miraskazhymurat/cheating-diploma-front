import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskApi } from "../api/task";
import type { CreateTaskRequest, TaskResponse, TimeEstimateResponse, UpdateTaskRequest } from "../api/types";

export function useBoardTasks(boardId: number) {
  return useQuery({
    queryKey: ["tasks", boardId],
    queryFn: () => taskApi.getBoardTasks(boardId),
    enabled: boardId > 0,
  });
}

export function useCreateTask(boardId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskRequest) => taskApi.create(boardId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
    },
  });
}

export function useDeleteAttachment(boardId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: number) => taskApi.deleteAttachment(attachmentId),
    onMutate: async (attachmentId) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", boardId] });
      const previous = queryClient.getQueryData<TaskResponse[]>(["tasks", boardId]);
      queryClient.setQueryData<TaskResponse[]>(["tasks", boardId], (old) =>
        old?.map((t) => ({
          ...t,
          attachments: t.attachments?.filter((a) => a.id !== attachmentId),
        })) ?? []
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["tasks", boardId], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
    },
  });
}

export function useUploadAttachment(boardId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, file }: { taskId: number; file: File }) =>
      taskApi.uploadAttachment(taskId, file),
    onSuccess: (attachment, { taskId }) => {
      queryClient.setQueryData<TaskResponse[]>(["tasks", boardId], (old) =>
        old?.map((t) =>
          t.id === taskId
            ? { ...t, attachments: [...(t.attachments ?? []), attachment] }
            : t
        ) ?? []
      );
    },
  });
}

export function useDeleteTask(boardId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: number) => taskApi.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
    },
  });
}

export function useEstimateTaskTime() {
  return useMutation<TimeEstimateResponse, Error, number>({
    mutationFn: (taskId: number) => taskApi.estimateTime(taskId),
  });
}

export function useUpdateTask(boardId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: number; payload: UpdateTaskRequest }) =>
      taskApi.update(taskId, payload),
    onMutate: async ({ taskId, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", boardId] });
      const previous = queryClient.getQueryData<TaskResponse[]>(["tasks", boardId]);
      queryClient.setQueryData<TaskResponse[]>(["tasks", boardId], (old) =>
        old?.map((t) => (t.id === taskId ? { ...t, ...payload } : t)) ?? []
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["tasks", boardId], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
    },
  });
}
