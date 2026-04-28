import { Link } from "react-router";
import { Plus, Users } from "lucide-react";
import { CreateBoardModal } from "../components/CreateBoardModal";
import { CreateProfileModal } from "../components/CreateProfileModal";
import { NotionImportModal } from "../components/NotionImportModal";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useDashboard } from "../../hooks/useBoards";

export function Boards() {
  const { user } = useAuth();
  const { data, isLoading } = useDashboard();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isNotionModalOpen, setIsNotionModalOpen] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);

  const userBoards = data?.boards ?? [];
  const isFirstLogin = (data?.isFirstLogin ?? false) && !profileCompleted;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-[15px] text-foreground mb-1">
              {user?.name ? `Welcome, ${user.name}` : "Your Boards"}
            </h1>
            <p className="text-[12px] text-muted-foreground">Manage your task boards</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNotionModalOpen(true)}
              className="text-[12px] px-2.5 py-1.5 bg-muted text-foreground border border-border rounded-md hover:bg-secondary transition-colors inline-flex items-center gap-1.5"
              title="Import from Notion"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
              </svg>
              <span className="hidden sm:inline">Import from Notion</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-[12px] px-2.5 py-1.5 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity inline-flex items-center gap-1.5"
              title="New Board"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">New Board</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-[13px] text-muted-foreground">Loading boards…</p>
          </div>
        ) : (
          <>
            {/* Boards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userBoards.map((board) => (
                <Link
                  key={board.id}
                  to={`/board/${board.id}`}
                  className="block p-6 rounded-lg bg-card border border-border hover:bg-muted/50 hover:border-border/80 transition-colors group"
                >
                  <div className="mb-4">
                    <h3 className="text-[14px] text-foreground mb-1 group-hover:text-foreground/80 transition-colors">
                      {board.name}
                    </h3>
                    {board.description && (
                      <p className="text-[12px] text-muted-foreground line-clamp-2">
                        {board.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      <span>
                        {board.memberCount}{" "}
                        {board.memberCount === 1 ? "member" : "members"}
                      </span>
                    </div>

                    {board.isOwner && (
                      <span className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground rounded">
                        Owner
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {userBoards.length === 0 && (
              <div className="text-center py-16">
                <p className="text-[13px] text-muted-foreground mb-4">No boards yet</p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="text-[12px] px-3 py-1.5 bg-muted text-foreground rounded-md hover:bg-secondary transition-colors"
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
        onComplete={() => setProfileCompleted(true)}
      />
      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <NotionImportModal
        isOpen={isNotionModalOpen}
        onClose={() => setIsNotionModalOpen(false)}
      />
    </div>
  );
}
