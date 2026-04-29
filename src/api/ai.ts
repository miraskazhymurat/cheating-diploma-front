import axios from "axios";

const AI_BASE_URL = "https://stingray-app-2-taahf.ondigitalocean.app/";

const aiClient = axios.create({ baseURL: AI_BASE_URL });

// ── Types ────────────────────────────────────────────────────────────────────

export interface BurnoutAlert {
  id: string;
  employee_id: number;
  user_id: number;
  full_name: string;
  risk_level: "low" | "medium" | "high" | "critical";
  risk_score: number;
  signals: string[];
  interventions: string[];
}

export interface BurnoutResponse {
  board_id: number;
  alerts: BurnoutAlert[];
}

export interface PromotionScores {
  performance: number;
  delivery: number;
  collaboration: number;
  impact: number;
}

export interface PromotionCandidate {
  id: string;
  employee_id: number;
  user_id: number;
  full_name: string;
  scores: PromotionScores;
  total: number;
}

export interface PromotionResponse {
  board_id: number;
  candidates: PromotionCandidate[];
}

export interface CandidateScore {
  employee_id: number;
  user_id: number;
  full_name: string;
  email: string;
  photo: string;
  rank: number;
  composite_score: number;
  skill_match: number;
  workload_score: number;
  performance_score: number;
  availability_score: number;
  growth_score: number;
  reasoning: string;
  data_summary: {
    active_tasks: number;
    completed_tasks: number;
    total_assigned: number;
    contribution_score: number;
    active_days: number;
  };
}

export interface AssigneeResponse {
  task_title: string;
  board_id: number;
  candidates: CandidateScore[];
  analysis_summary: string;
}

export interface AssigneeRequest {
  board_id: number;
  task_title: string;
  task_description?: string;
  priority?: string;
  difficulty?: string;
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function fetchBestAssignee(req: AssigneeRequest): Promise<AssigneeResponse> {
  const res = await aiClient.post<AssigneeResponse>("/ai/best-assignee", req);
  return res.data;
}

export async function fetchBestTester(req: AssigneeRequest): Promise<AssigneeResponse> {
  const res = await aiClient.post<AssigneeResponse>("/ai/best-tester", req);
  return res.data;
}

export async function fetchBurnoutAlerts(boardId: number): Promise<BurnoutResponse> {
  const res = await aiClient.get<BurnoutResponse>(`/ai/burnout-alerts/${boardId}`);
  return res.data;
}

export async function fetchPromotionCandidates(boardId: number): Promise<PromotionResponse> {
  const res = await aiClient.get<PromotionResponse>(`/ai/promotion-candidates/${boardId}`);
  return res.data;
}
