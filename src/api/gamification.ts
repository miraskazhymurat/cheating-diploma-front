import { axiosInstance } from "./axiosInstance";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LevelDef {
  level: number;
  name: string;
  min: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  full_name: string;
  photo: string;
  rolling_points: number;
  total_points: number;
  current_level: number;
  level_name: string;
  current_streak: number;
}

export interface UserStatsResponse {
  user_id: number;
  total_points: number;
  rolling_30d_points: number;
  current_level: number;
  level_name: string;
  current_streak: number;
  longest_streak: number;
  today_points: number;
  daily_cap: number;
  daily_cap_hit: boolean;
  levels: LevelDef[];
}

export interface PointTransactionResponse {
  id: number;
  task_id?: number;
  points: number;
  reason: string;
  earned_at: string;
}

export interface KudosStatusResponse {
  given_this_week: number;
  max_per_week: number;
}

export interface GiveKudosRequest {
  to_user_id: number;
  task_id?: number;
  message?: string;
}

// ─── Human-readable reason labels ────────────────────────────────────────────

export const REASON_LABELS: Record<string, string> = {
  task_completed:   "Task completed",
  on_time_bonus:    "On-time bonus",
  quality_bonus:    "Quality bonus",
  streak_bonus:     "Streak bonus",
  streak_milestone: "Streak milestone 🔥",
  combo_bonus:      "Combo bonus",
  kudos_received:   "Peer kudos received",
  rework_penalty:   "Rework penalty",
};

// ─── API calls ────────────────────────────────────────────────────────────────

export const gamificationApi = {
  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    const { data } = await axiosInstance.get<LeaderboardEntry[]>("/leaderboard");
    return data;
  },

  getMyStats: async (): Promise<UserStatsResponse> => {
    const { data } = await axiosInstance.get<UserStatsResponse>("/gamification/me");
    return data;
  },

  getUserStats: async (userId: number): Promise<UserStatsResponse> => {
    const { data } = await axiosInstance.get<UserStatsResponse>(`/gamification/users/${userId}`);
    return data;
  },

  getPointsHistory: async (): Promise<PointTransactionResponse[]> => {
    const { data } = await axiosInstance.get<PointTransactionResponse[]>("/gamification/history");
    return data;
  },

  getKudosStatus: async (): Promise<KudosStatusResponse> => {
    const { data } = await axiosInstance.get<KudosStatusResponse>("/gamification/kudos/status");
    return data;
  },

  giveKudos: async (payload: GiveKudosRequest): Promise<void> => {
    await axiosInstance.post("/kudos", payload);
  },
};
