#!/usr/bin/env node
"use strict";

const axios = require("axios");
const FormData = require("form-data");

const BASE = "http://192.168.100.32:8080";
const EMAIL = process.argv[2];
const PASSWORD = process.argv[3];

if (!EMAIL || !PASSWORD) {
  console.error("Usage: node scripts/seed-demo.mjs <email> <password>");
  process.exit(1);
}

// ── helpers ────────────────────────────────────────────────────────────────

function makeApi(token) {
  var headers = {};
  if (token) headers["Authorization"] = "Bearer " + token;
  var inst = axios.create({ baseURL: BASE, headers: headers });
  inst.interceptors.response.use(function(r) { return r.data; });
  return inst;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sleep(ms) {
  return new Promise(function(resolve) { setTimeout(resolve, ms); });
}

function get(obj, key) {
  if (!obj) return undefined;
  if (obj.data && obj.data[key] !== undefined) return obj.data[key];
  return obj[key];
}

function getArr(obj) {
  if (Array.isArray(obj)) return obj;
  if (obj && Array.isArray(obj.data)) return obj.data;
  return [];
}

// ── demo data ──────────────────────────────────────────────────────────────

var STATUSES = [
  { title: "Backlog",     colour: "#94a3b8" },
  { title: "In Progress", colour: "#f59e0b" },
  { title: "Review",      colour: "#818cf8" },
  { title: "Done",        colour: "#22c55e" },
];

// priority_id: 1=low, 2=medium, 3=high
// statusIdx: 0=Backlog, 1=In Progress, 2=Review, 3=Done
var TASKS = [
  // ── Done ──────────────────────────────────────────────────────────────
  {
    statusIdx: 3,
    priority_id: 3,
    title: "Set up project repository and CI/CD pipeline",
    description:
      "Initialize the Go monorepo with the folder structure defined in the architecture doc. " +
      "Configure GitHub Actions to run `go build`, `go vet`, and `go test ./...` on every push to main. " +
      "Add a Dockerfile and docker-compose.yml for local Postgres + Redis. " +
      "Target: green CI badge before any feature work begins.",
  },
  {
    statusIdx: 3,
    priority_id: 3,
    title: "Implement JWT authentication (register + login)",
    description:
      "Create POST /auth/register and POST /auth/login endpoints. " +
      "Passwords hashed with bcrypt (cost 12). " +
      "Issue RS256 JWT with 24 h expiry; include user_id and role claims. " +
      "Store refresh token in an httpOnly cookie. " +
      "Write integration tests using testcontainers-go to spin up a real Postgres instance.",
  },
  {
    statusIdx: 3,
    priority_id: 3,
    title: "Design and migrate initial database schema",
    description:
      "Write migration 001_initial.sql covering: teams, employees, employee_skills, tasks, " +
      "task_dependencies, task_comments, task_status_log, and assignments tables. " +
      "All primary keys are UUID. Add the indexes listed in Section 5.2 of the architecture doc. " +
      "Verify migration runs cleanly in both directions with golang-migrate.",
  },
  {
    statusIdx: 3,
    priority_id: 2,
    title: "Build login and registration screens",
    description:
      "React 18 + TypeScript screens: /login and /register. " +
      "Form validation with react-hook-form + zod. " +
      "On success, store JWT in localStorage and redirect to /dashboard. " +
      "On 401 the axios interceptor clears the token and redirects to /login automatically. " +
      "Include a loading spinner and user-friendly error messages for 400/409 responses.",
  },
  {
    statusIdx: 3,
    priority_id: 2,
    title: "Create employee profile setup flow",
    description:
      "After first login, redirect to /setup-profile. " +
      "Fields: full name, photo upload (JPEG/PNG max 5 MB), phone, birthday, team selection. " +
      "Store photo on the server and return a URL. " +
      "Mark profile as complete in the employees table so the redirect only fires once.",
  },
  // ── Review ─────────────────────────────────────────────────────────────
  {
    statusIdx: 2,
    priority_id: 3,
    title: "Implement task CRUD API endpoints",
    description:
      "POST /boards/:id/tasks, GET /boards/:id/tasks, GET /tasks/:id, PATCH /tasks/:id, DELETE /tasks/:id. " +
      "PATCH must enforce the status state machine (open -> in_progress -> review -> done; no skipping). " +
      "Reject illegal transitions with 422 and a descriptive error body. " +
      "Support multipart upload for attachments on task creation. " +
      "All routes require a valid JWT; scope reads to board members.",
  },
  {
    statusIdx: 2,
    priority_id: 2,
    title: "Board view with drag-and-drop between columns",
    description:
      "Kanban board using react-dnd + HTML5Backend. " +
      "Columns are driven by /boards/:id/statuses so they are fully dynamic. " +
      "Dragging a card calls PATCH /tasks/:id with the new status_id and optimistically updates the UI. " +
      "On failure roll back the card to its original column and show a toast. " +
      "Tested on Chrome, Firefox, and Safari.",
  },
  // ── In Progress ────────────────────────────────────────────────────────
  {
    statusIdx: 1,
    priority_id: 3,
    title: "AI-powered task complexity estimation (Tier 1 heuristic)",
    description:
      "Implement the heuristic complexity scorer in infra/ai/heuristic_complexity.go. " +
      "Formula: word_count_factor + subtask_count x 0.5 + dependency_count x 1.0 + tag_weight + priority_weight, " +
      "normalised to 1-10. Bucket into LOW / MEDIUM / HIGH / CRITICAL. " +
      "Run automatically on task creation and expose GET /tasks/:id/complexity. " +
      "Store result in ai_predictions table with model_version='heuristic_v1'.",
  },
  {
    statusIdx: 1,
    priority_id: 2,
    title: "Employee workload dashboard",
    description:
      "GET /analytics/employee/:id/summary returns: active task count, total estimated hours remaining, " +
      "utilisation percentage, and last 4 weeks of task-completion velocity. " +
      "Front-end card shows a mini bar chart (Recharts) with week-over-week trend. " +
      "Manager-only route: developers see only their own summary.",
  },
  {
    statusIdx: 1,
    priority_id: 2,
    title: "Real-time board chat with WebSocket",
    description:
      "Each board has a chat channel. Front-end connects via WebSocket on /ws/boards/:id/chat. " +
      "Messages are persisted to Postgres and loaded on initial connect (last 100 messages). " +
      "Support text messages, @mentions (auto-complete from board members), and emoji reactions. " +
      "Show typing indicators with a 2-second debounce.",
  },
  // ── Backlog ────────────────────────────────────────────────────────────
  {
    statusIdx: 0,
    priority_id: 3,
    title: "Burnout detection background job",
    description:
      "Cron job runs every 6 hours. For each active employee compute the 5-signal burnout score: " +
      "hours_worked (0.30), velocity_decline (0.25), overtime (0.20), context_switching (0.15), weekend_work (0.10). " +
      "Write results to burnout_signals table. " +
      "If risk_level changes to RED, create an in-app notification for the employee's manager. " +
      "Threshold: risk_score > 0.6 = RED, > 0.35 = YELLOW.",
  },
  {
    statusIdx: 0,
    priority_id: 2,
    title: "AI employee matching — suggest best assignee for a task",
    description:
      "POST /tasks/:id/suggest-assignee scores every active team member using the weighted formula: " +
      "skill_match x 0.35 + workload x 0.30 + performance x 0.20 + availability x 0.10 + growth x 0.05. " +
      "Filter out employees with workload_score = 0 (overloaded) or on vacation. " +
      "Return top-3 candidates with scoring breakdown and a HIGH / MEDIUM / LOW confidence label. " +
      "Store the recommendation in ai_predictions for feedback tracking.",
  },
  {
    statusIdx: 0,
    priority_id: 2,
    title: "Gamification: points, levels, streaks, and leaderboard",
    description:
      "Award points on task completion: base 10 pts x complexity multiplier (1 + score/10), " +
      "+5 on-time bonus, +3 quality bonus (no rework in 5 days), +2/day streak. " +
      "Level thresholds: Novice 0 -> Contributor 100 -> Performer 300 -> Expert 700 -> Elite 1500 -> Legend 3000. " +
      "Daily cap of 100 pts to prevent gaming. " +
      "GET /gamification/leaderboard returns 30-day rolling scores.",
  },
  {
    statusIdx: 0,
    priority_id: 1,
    title: "Promotion recommendation engine (PM-only)",
    description:
      "Weekly cron computes a promotion_score per employee over a rolling 90-day window: " +
      "consistency x 0.30 + difficulty_trend x 0.25 + quality x 0.20 + reliability x 0.15 + collaboration x 0.10. " +
      "Results written to promotion_recommendations, visible only to PM role. " +
      "Never surfaced to the employee themselves. Anti-gaming: sudden spikes in easy tasks do not boost " +
      "difficulty_trend because it requires a sustained increase over the quarter.",
  },
  {
    statusIdx: 0,
    priority_id: 1,
    title: "Mobile-responsive layout and dark mode polish",
    description:
      "Audit all screens at 375 px (iPhone SE), 768 px (iPad), and 1440 px (desktop). " +
      "Board view stacks columns vertically on mobile with horizontal scroll on tablet. " +
      "Dark mode: verify contrast ratios meet WCAG AA (4.5:1 for body text) using the Tailwind dark: variants already in place. " +
      "Fix any overflow, truncation, or z-index issues found during audit.",
  },
];

// ── main ───────────────────────────────────────────────────────────────────

async function main() {
  var anonApi = makeApi(null);

  // 1. Login
  console.log("Logging in as " + EMAIL + " ...");
  var loginRes = await anonApi.post("/auth/login", { email: EMAIL, password: PASSWORD });
  var token = get(loginRes, "token");
  var userId = get(loginRes, "user_id");
  if (!token) throw new Error("Login failed — no token in response:\n" + JSON.stringify(loginRes));
  console.log("  ok token received, user_id = " + userId);

  var auth = makeApi(token);

  // 2. Create board
  console.log("Creating demo board ...");
  var boardRes = await auth.post("/boards", {
    name: "JumysOrny - MVP Sprint",
    description: "Demo board for diploma presentation. Covers Auth, Task Management, AI Engine, Gamification.",
  });
  var board = boardRes && boardRes.data ? boardRes.data : boardRes;
  var boardId = board && board.id;
  if (!boardId) throw new Error("Board creation failed:\n" + JSON.stringify(boardRes));
  console.log("  ok board id = " + boardId);

  // 3. Create statuses
  console.log("Creating statuses ...");
  var statusIds = [];
  for (var i = 0; i < STATUSES.length; i++) {
    var s = STATUSES[i];
    await sleep(150);
    var statusRes = await auth.post("/statuses", { board_id: boardId, title: s.title });
    var created = statusRes && statusRes.data ? statusRes.data : statusRes;
    var sid = (created && created.board_status_id) || (created && created.status_id) || (created && created.id);
    if (!sid) throw new Error("Status creation failed for " + s.title + ":\n" + JSON.stringify(statusRes));
    await sleep(80);
    await auth.patch("/statuses/" + sid, { colour: s.colour }).catch(function() {});
    statusIds.push(sid);
    console.log("  ok status \"" + s.title + "\" id=" + sid);
  }

  // 4. Fetch board members for assignment
  console.log("Fetching board members ...");
  var membersRes = await auth.get("/boards/" + boardId + "/members");
  var members = getArr(membersRes);
  var assigneeIds = [];
  for (var j = 0; j < members.length; j++) {
    if (members[j].id) assigneeIds.push(members[j].id);
  }
  if (assigneeIds.length === 0) assigneeIds.push(userId);
  console.log("  ok assignees: " + assigneeIds.join(", "));

  // 5. Create tasks
  console.log("Creating tasks ...");
  for (var k = 0; k < TASKS.length; k++) {
    var task = TASKS[k];
    await sleep(150);
    var targetStatusId = statusIds[task.statusIdx];
    var assignee_id = pick(assigneeIds);

    var form = new FormData();
    form.append("title", task.title);
    form.append("description", task.description);
    form.append("priority_id", String(task.priority_id));
    form.append("assignee_id", String(assignee_id));

    var taskRes = await auth
      .post("/boards/" + boardId + "/tasks", form, { headers: form.getHeaders() })
      .catch(function(e) { throw new Error("Task creation failed for \"" + task.title + "\": " + e.message); });

    var createdTask = taskRes && taskRes.data ? taskRes.data : taskRes;
    var taskId = createdTask && createdTask.id;

    if (targetStatusId && taskId) {
      await sleep(80);
      await auth.patch("/tasks/" + taskId, { status_id: targetStatusId }).catch(function() {});
    }

    var priorityLabel = ["", "Low", "Medium", "High"][task.priority_id];
    console.log("  ok [" + STATUSES[task.statusIdx].title + "] [" + priorityLabel + "] " + task.title);
  }

  console.log("\nDone! Board ID: " + boardId);
  console.log("Open it at: http://localhost:5173/boards/" + boardId);
}

main().catch(function(err) {
  console.error("\nSeed failed: " + err.message);
  process.exit(1);
});
