import { Link } from "react-router";
import { Plus, Users } from "lucide-react";
import { boards, employees, getCurrentUser } from "../data/mockData";
import { CreateBoardModal } from "../components/CreateBoardModal";
import { useState } from "react";

export function Boards() {
  const currentUser = getCurrentUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Get boards where user is owner or member
  const userBoards = boards.filter(
    (board) => board.ownerId === currentUser.id || board.members.includes(currentUser.id)
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-[15px] text-zinc-100 mb-1">Your Boards</h1>
            <p className="text-[12px] text-zinc-500">Manage your task boards</p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="text-[12px] px-3 py-1.5 bg-zinc-100 text-zinc-900 rounded-md hover:bg-white transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            New Board
          </button>
        </div>

        {/* Boards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userBoards.map((board) => {
            const owner = employees.find((e) => e.id === board.ownerId);
            const memberCount = board.members.length;
            const isOwner = board.ownerId === currentUser.id;

            return (
              <Link
                key={board.id}
                to={`/board/${board.id}`}
                className="block p-6 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 transition-colors group"
              >
                <div className="mb-4">
                  <h3 className="text-[14px] text-zinc-100 mb-1 group-hover:text-white transition-colors">
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
                    <span>{memberCount} {memberCount === 1 ? "member" : "members"}</span>
                  </div>
                  
                  {isOwner && (
                    <span className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded">
                      Owner
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {userBoards.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[13px] text-zinc-500 mb-4">No boards yet</p>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="text-[12px] px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-700 transition-colors"
            >
              Create your first board
            </button>
          </div>
        )}
      </div>

      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}