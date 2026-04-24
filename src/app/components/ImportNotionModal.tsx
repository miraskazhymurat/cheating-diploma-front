import { useState } from "react";
import { X, ExternalLink, CheckCircle2 } from "lucide-react";
import { useImportNotionBoard } from "../../hooks/useBoards";

interface ImportNotionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportNotionModal({ isOpen, onClose }: ImportNotionModalProps) {
  const [databaseId, setDatabaseId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const importBoard = useImportNotionBoard();

  if (!isOpen) return null;

  const handleClose = () => {
    setDatabaseId("");
    setError("");
    setSuccess(false);
    onClose();
  };

  const handleImport = async () => {
    const trimmed = databaseId.trim();
    if (!trimmed) return;
    setError("");
    try {
      await importBoard.mutateAsync(trimmed);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message ?? "Failed to import. Check the database ID and try again.");
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={handleClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg w-full max-w-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              {/* Notion N logo */}
              <div className="w-5 h-5 rounded bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shrink-0">
                <span className="text-[11px] font-bold text-white dark:text-zinc-900 leading-none">N</span>
              </div>
              <h2 className="text-[15px] text-zinc-900 dark:text-zinc-100">Import from Notion</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {success ? (
            /* Success state */
            <div className="px-6 py-10 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <p className="text-[14px] text-zinc-900 dark:text-zinc-100 mb-1">Board imported!</p>
              <p className="text-[12px] text-zinc-500 mb-6">Your Notion database has been added as a new board.</p>
              <button
                onClick={handleClose}
                className="text-[13px] px-5 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-700 dark:hover:bg-white transition-colors"
              >
                View boards
              </button>
            </div>
          ) : (
            <>
              {/* Body */}
              <div className="px-6 py-6 space-y-5">
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-[12px]">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="notionDbId" className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-2">
                    Notion Database ID *
                  </label>
                  <input
                    id="notionDbId"
                    type="text"
                    value={databaseId}
                    onChange={(e) => setDatabaseId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleImport()}
                    placeholder="8a4f2b1e3c7d4a9f8b2e1c3d7a4f9b2e"
                    className="w-full px-3 py-2 text-[13px] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 font-mono"
                  />
                </div>

                {/* How to find the ID */}
                <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 space-y-2">
                  <p className="text-[11px] text-zinc-700 dark:text-zinc-300 font-medium">How to find your Database ID</p>
                  <ol className="space-y-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 list-decimal list-inside">
                    <li>Open your Notion database in a browser</li>
                    <li>
                      Copy the URL — it looks like:
                      <span className="block mt-1 ml-4 font-mono text-[10px] text-zinc-400 dark:text-zinc-500 break-all">
                        notion.so/your-workspace/<span className="text-zinc-700 dark:text-zinc-300">8a4f2b1e3c7d…</span>?v=…
                      </span>
                    </li>
                    <li>The long ID between the last <code className="text-[10px]">/</code> and the <code className="text-[10px]">?</code> is your Database ID</li>
                  </ol>
                  <a
                    href="https://developers.notion.com/docs/working-with-databases"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors mt-1"
                  >
                    Notion docs
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={handleClose}
                  className="text-[12px] px-4 py-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!databaseId.trim() || importBoard.isPending}
                  className="text-[12px] px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-700 dark:hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importBoard.isPending ? "Importing…" : "Import board"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
