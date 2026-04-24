import { Link } from "react-router";
import { Plus, Users } from "lucide-react";
import { CreateBoardModal } from "../components/CreateBoardModal";
import { ImportNotionModal } from "../components/ImportNotionModal";
import { CreateProfileModal } from "../components/CreateProfileModal";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useDashboard } from "../../hooks/useBoards";
import { useMe } from "../../hooks/useEmployee";
import { useQueryClient } from "@tanstack/react-query";

export function Boards() {
  const { user } = useAuth();
  const { data: employee } = useMe();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isNotionModalOpen, setIsNotionModalOpen] = useState(false);
  const { data, isLoading, isError } = useDashboard();

  const boards = data?.boards ?? [];
  const isFirstLogin = data?.isFirstLogin ?? false;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[15px] text-zinc-900 dark:text-zinc-100 mb-1 truncate">
              {employee?.full_name ?? user?.name ? `Welcome, ${employee?.full_name ?? user?.name}` : "Your Boards"}
            </h1>
            <p className="text-[12px] text-zinc-500">Manage your task boards</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsNotionModalOpen(true)}
              className="inline-flex items-center gap-2 border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors px-2 py-1.5 sm:px-3"
              title="Import from Notion"
            >
              <div className="w-3.5 h-3.5 rounded bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shrink-0">
                <span className="text-[8px] font-bold text-white dark:text-zinc-900 leading-none">N</span>
              </div>
              <span className="hidden sm:inline text-[12px]">Import from Notion</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-700 dark:hover:bg-white transition-colors px-2 py-1.5 sm:px-3"
              title="New Board"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline text-[12px]">New Board</span>
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-16">
            <p className="text-[13px] text-zinc-500">Loading boards…</p>
          </div>
        )}

        {isError && (
          <div className="text-center py-16">
            <p className="text-[13px] text-red-500 dark:text-red-400">Failed to load boards. Please try again.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {boards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {boards.map((board) => (
                  <Link
                    key={board.id}
                    to={`/board/${board.id}`}
                    className="block p-6 rounded-lg bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group"
                  >
                    <div className="mb-4">
                      <h3 className="text-[14px] text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-black dark:group-hover:text-white transition-colors">
                        {board.name}
                      </h3>
                      {board.description && (
                        <p className="text-[12px] text-zinc-500 line-clamp-2">
                          {board.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                        <Users className="w-3.5 h-3.5" />
                        <span>
                          {board.memberCount}{" "}
                          {board.memberCount === 1 ? "member" : "members"}
                        </span>
                      </div>
                      {board.isOwner && (
                        <span className="text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded">
                          Owner
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-[13px] text-zinc-500 mb-4">No boards yet</p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="text-[12px] px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Create your first board
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <CreateProfileModal
        isOpen={isFirstLogin}
        onComplete={() => {
          queryClient.invalidateQueries({ queryKey: ["dashboard"] });
          queryClient.invalidateQueries({ queryKey: ["employee", "me"] });
        }}
      />
      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <ImportNotionModal
        isOpen={isNotionModalOpen}
        onClose={() => setIsNotionModalOpen(false)}
      />
    </div>
  );
}
