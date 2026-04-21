import { X } from "lucide-react";
import { useState } from "react";
import { useCreateBoard } from "../../hooks/useBoards";

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateBoardModal({ isOpen, onClose }: CreateBoardModalProps) {
  const [boardName, setBoardName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const createBoard = useCreateBoard();

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!boardName.trim()) return;
    setError("");

    try {
      await createBoard.mutateAsync({ name: boardName.trim(), description: description.trim() || undefined });
      setBoardName("");
      setDescription("");
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to create board.");
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg w-full max-w-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-[15px] text-zinc-900 dark:text-zinc-100">Create new board</h2>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-[12px]">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="boardName" className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-2">
                Board name *
              </label>
              <input
                id="boardName"
                type="text"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                placeholder="e.g. Product Development"
                className="w-full px-3 py-2 text-[13px] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this board for?"
                rows={3}
                className="w-full px-3 py-2 text-[13px] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={onClose}
              className="text-[12px] px-4 py-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!boardName.trim() || createBoard.isPending}
              className="text-[12px] px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-700 dark:hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createBoard.isPending ? "Creating…" : "Create board"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
