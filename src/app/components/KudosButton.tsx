import { Heart, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useGiveKudos, useKudosStatus } from "../../hooks/useGamification";

interface KudosButtonProps {
  toUserId: number;
  toUserName: string;
  taskId?: number;
  fromUserId?: number;
}

export function KudosButton({ toUserId, toUserName, taskId, fromUserId }: KudosButtonProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const { data: status } = useKudosStatus();
  const giveKudos = useGiveKudos();

  const given      = status?.given_this_week ?? 0;
  const maxPerWeek = status?.max_per_week ?? 3;
  const remaining  = maxPerWeek - given;
  const canGive    = remaining > 0 && fromUserId !== toUserId;

  const handleSubmit = () => {
    if (!canGive) return;
    giveKudos.mutate(
      { to_user_id: toUserId, task_id: taskId, message: message.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(`Kudos sent to ${toUserName}! +5 pts`);
          setMessage("");
          setOpen(false);
        },
        onError: (err) => {
          toast.error(err.message ?? "Failed to send kudos");
        },
      }
    );
  };

  if (!canGive && fromUserId === toUserId) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={!canGive}
        title={canGive ? `Give kudos (${remaining} remaining this week)` : "Weekly kudos limit reached"}
        className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors
          ${canGive
            ? "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/30 hover:bg-pink-100 dark:hover:bg-pink-950/50 border border-pink-200 dark:border-pink-900/50"
            : "text-zinc-400 dark:text-zinc-600 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 cursor-not-allowed"
          }`}
      >
        <Heart className="w-3 h-3" />
        Kudos
        {status && (
          <span className="text-[10px] opacity-70">({remaining}/{maxPerWeek})</span>
        )}
      </button>

      {open && canGive && (
        <div className="absolute bottom-full left-0 mb-2 z-50 w-56 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg p-3">
          <p className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Give kudos to {toUserName}
          </p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-600 mb-2">
            Awards +5 pts · {remaining} left this week
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Optional message…"
            rows={2}
            maxLength={200}
            className="w-full px-2 py-1.5 text-[12px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-pink-300 dark:focus:ring-pink-700 resize-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSubmit}
              disabled={giveKudos.isPending}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded bg-pink-500 hover:bg-pink-600 text-white text-[11px] font-medium transition-colors disabled:opacity-60"
            >
              <Send className="w-3 h-3" />
              {giveKudos.isPending ? "Sending…" : "Send"}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-2 py-1 rounded text-[11px] text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
