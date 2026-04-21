import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inviteApi } from "../api/invite";

export function useInvites() {
  return useQuery({
    queryKey: ["invites"],
    queryFn: inviteApi.getAll,
  });
}

export function usePendingInviteCount() {
  const { data } = useInvites();
  return data?.filter((i) => i.status === "pending").length ?? 0;
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: number) => inviteApi.accept(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useRejectInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: number) => inviteApi.reject(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites"] });
    },
  });
}

export function useSendInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      boardId,
      userId,
    }: {
      boardId: number;
      userId: number;
    }) => inviteApi.send(boardId, userId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites"] });
      queryClient.invalidateQueries({ queryKey: ["board"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
