import type { EmployeeResponse, UITask } from "../../api/types";
import type { BurnoutAlert, PromotionCandidate, RiskLevel } from "../data/mockData";

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

// Deterministic pseudo-random offset so scores look varied but stable per employee
function pseudoRand(seed: number, range: number) {
  return ((seed * 2654435761) >>> 0) % range;
}

export function deriveAIInsights(
  employees: EmployeeResponse[],
  tasks: UITask[]
): { burnoutAlerts: BurnoutAlert[]; promotionCandidates: PromotionCandidate[] } {
  if (!employees.length) {
    return { burnoutAlerts: [], promotionCandidates: [] };
  }

  const stats = employees.map((emp) => {
    const mine = tasks.filter((t) => t.assigneeId === emp.user_id);
    const inProgress = mine.filter((t) => t.status === "in-progress").length;
    const done = mine.filter((t) => t.status === "done").length;
    const total = mine.length;
    const highPriority = mine.filter((t) => t.priority === "high").length;
    const highDone = mine.filter((t) => t.priority === "high" && t.status === "done").length;
    return { emp, total, inProgress, done, highPriority, highDone };
  });

  // ── Burnout Alerts ─────────────────────────────────────────────────────────
  const burnoutAlerts: BurnoutAlert[] = stats
    .filter((s) => s.total > 0)
    .map((s) => {
      const { emp, total, inProgress, highPriority } = s;

      let riskLevel: RiskLevel;
      if (inProgress >= 5 || (inProgress >= 3 && highPriority >= 2)) {
        riskLevel = "critical";
      } else if (inProgress >= 3 || highPriority >= 3) {
        riskLevel = "high";
      } else if (inProgress >= 2 || highPriority >= 2) {
        riskLevel = "medium";
      } else {
        riskLevel = "low";
      }

      const signals: string[] = [];
      if (total > 0) signals.push(`${total} task${total !== 1 ? "s" : ""} assigned`);
      if (inProgress > 0) signals.push(`${inProgress} in progress`);
      if (highPriority > 0) signals.push(`${highPriority} high-priority`);

      const interventions: string[] = [];
      if (riskLevel === "critical") {
        interventions.push("Reassign 2–3 in-progress tasks immediately");
        interventions.push("Schedule urgent 1:1 check-in this week");
      } else if (riskLevel === "high") {
        interventions.push("Review task load in next stand-up");
        interventions.push("Consider reassigning 1 non-critical task");
      } else if (riskLevel === "medium") {
        interventions.push("Monitor workload over next sprint");
        interventions.push("Block dedicated focus time mid-week");
      } else {
        interventions.push("Workload looks healthy — monitor as usual");
      }

      return {
        id: String(emp.user_id),
        employeeId: String(emp.user_id),
        employeeName: emp.full_name,
        riskLevel,
        signals,
        interventions,
      };
    })
    .sort((a, b) => {
      const order: RiskLevel[] = ["critical", "high", "medium", "low"];
      return order.indexOf(a.riskLevel) - order.indexOf(b.riskLevel);
    })
    .slice(0, 5);

  // ── Promotion Candidates ───────────────────────────────────────────────────
  const promotionCandidates: PromotionCandidate[] = stats
    .filter((s) => s.total > 0)
    .map((s) => {
      const { emp, total, done, highPriority, highDone } = s;

      const completionRate = total > 0 ? (done / total) * 100 : 0;
      const impactRate = highPriority > 0 ? (highDone / highPriority) * 100 : completionRate;

      const performance = clamp(Math.round(completionRate + pseudoRand(emp.user_id * 3, 10)), 40, 100);
      const delivery = clamp(Math.round(completionRate + pseudoRand(emp.user_id * 7, 12) - 3), 40, 100);
      const collaboration = clamp(Math.round(60 + pseudoRand(emp.user_id * 11, 30)), 40, 100);
      const impact = clamp(Math.round(impactRate + pseudoRand(emp.user_id * 5, 10) - 2), 40, 100);
      const total_score = Math.round((performance + delivery + collaboration + impact) / 4);

      return {
        id: String(emp.user_id),
        employeeId: String(emp.user_id),
        employeeName: emp.full_name,
        scores: { performance, delivery, collaboration, impact },
        total: total_score,
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  return { burnoutAlerts, promotionCandidates };
}
