import { useQuery } from "@tanstack/react-query";
import { fetchBurnoutAlerts, fetchPromotionCandidates } from "../api/ai";

export function useBurnoutAlerts(boardId: number) {
  return useQuery({
    queryKey: ["burnout-alerts", boardId],
    queryFn: () => fetchBurnoutAlerts(boardId),
    enabled: boardId > 0,
    staleTime: 2 * 60 * 1000,
  });
}

export function usePromotionCandidates(boardId: number) {
  return useQuery({
    queryKey: ["promotion-candidates", boardId],
    enabled: boardId > 0,
    queryFn: () => fetchPromotionCandidates(boardId),
    staleTime: 2 * 60 * 1000,
  });
}
