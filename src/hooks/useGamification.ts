import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gamificationApi, type GiveKudosRequest } from "../api/gamification";

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: gamificationApi.getLeaderboard,
    staleTime: 60_000, // refresh every minute
  });
}

export function useMyGamificationStats() {
  return useQuery({
    queryKey: ["gamification", "me"],
    queryFn: gamificationApi.getMyStats,
    staleTime: 30_000,
  });
}

export function useUserGamificationStats(userId: number) {
  return useQuery({
    queryKey: ["gamification", "user", userId],
    queryFn: () => gamificationApi.getUserStats(userId),
    enabled: userId > 0,
    staleTime: 30_000,
  });
}

export function usePointsHistory() {
  return useQuery({
    queryKey: ["gamification", "history"],
    queryFn: gamificationApi.getPointsHistory,
    staleTime: 30_000,
  });
}

export function useKudosStatus() {
  return useQuery({
    queryKey: ["gamification", "kudos-status"],
    queryFn: gamificationApi.getKudosStatus,
    staleTime: 60_000,
  });
}

export function useGiveKudos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GiveKudosRequest) => gamificationApi.giveKudos(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}
