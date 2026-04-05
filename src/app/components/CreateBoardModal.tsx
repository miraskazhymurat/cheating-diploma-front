import { X, Search, UserPlus } from "lucide-react";
import { useState } from "react";
import { employees, getCurrentUser } from "../data/mockData";

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateBoardModal({ isOpen, onClose }: CreateBoardModalProps) {
  const [boardName, setBoardName] = useState("");
  const [description, setDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const currentUser = getCurrentUser();

  if (!isOpen) return null;

  // Filter users (exclude current user as they're added by default)
  const availableUsers = employees.filter((e) => e.id !== currentUser.id);
  
  // Filter by search query
  const filteredUsers = availableUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMember = (userId: string) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleCreate = () => {
    // TODO: Create board logic
    console.log("Create board:", {
      name: boardName,
      description,
      members: [currentUser.id, ...selectedMembers],
    });
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div
          className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <h2 className="text-[15px] text-zinc-100">Create new board</h2>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6 overflow-y-auto max-h-[calc(85vh-140px)]">
            {/* Board Info */}
            <div className="mb-6">
              <div className="mb-4">
                <label htmlFor="boardName" className="text-[11px] text-zinc-400 block mb-2">
                  Board name *
                </label>
                <input
                  id="boardName"
                  type="text"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  placeholder="e.g. Product Development"
                  className="w-full px-3 py-2 text-[13px] bg-zinc-900/50 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="text-[11px] text-zinc-400 block mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this board for?"
                  rows={3}
                  className="w-full px-3 py-2 text-[13px] bg-zinc-900/50 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700 text-zinc-100 placeholder:text-zinc-600 resize-none"
                />
              </div>
            </div>

            {/* Invite Members */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[12px] text-zinc-400">Invite members</h3>
                <span className="text-[11px] text-zinc-600">
                  {selectedMembers.length} selected
                </span>
              </div>

              {/* Search */}
              <div className="mb-3 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-9 pr-3 py-2 text-[13px] bg-zinc-900/50 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                />
              </div>

              {/* User List */}
              <div className="space-y-2 max-h-60 overflow-y-auto border border-zinc-800 rounded-md p-2">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const isSelected = selectedMembers.includes(user.id);
                    return (
                      <button
                        key={user.id}
                        onClick={() => toggleMember(user.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                          isSelected
                            ? "bg-blue-950/30 border border-blue-900/50"
                            : "hover:bg-zinc-900/50 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center">
                            <span className="text-[10px] text-zinc-300">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <div className="text-left">
                            <div className="text-[12px] text-zinc-100">{user.name}</div>
                            <div className="text-[11px] text-zinc-500">{user.email}</div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                            <svg
                              className="w-2.5 h-2.5 text-white"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-[12px] text-zinc-500 text-center py-4">
                    No users found
                  </p>
                )}
              </div>

              <p className="text-[11px] text-zinc-600 mt-2">
                You will be added as the owner automatically
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-zinc-800">
            <button
              onClick={onClose}
              className="text-[12px] px-4 py-2 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!boardName.trim()}
              className="text-[12px] px-4 py-2 bg-zinc-100 text-zinc-900 rounded-md hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create board
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
