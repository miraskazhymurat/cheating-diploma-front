import { createBrowserRouter, Navigate } from "react-router";
import { Boards } from "./pages/Boards";
import { Dashboard } from "./pages/Dashboard";
import { TaskDetail } from "./pages/TaskDetail";
import { BoardSettings } from "./pages/BoardSettings";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/boards" replace />,
  },
  {
    path: "/boards",
    element: (
      <ProtectedRoute>
        <Boards />
      </ProtectedRoute>
    ),
  },
  {
    path: "/board/:boardId",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/board/:boardId/settings",
    element: (
      <ProtectedRoute>
        <BoardSettings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/task/:taskId",
    element: (
      <ProtectedRoute>
        <TaskDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);