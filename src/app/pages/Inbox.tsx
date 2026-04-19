import { Check, X, Clock } from "lucide-react";
import { useInvites, useAcceptInvite, useRejectInvite } from "../../hooks/useInvites";

export function Inbox() {
  const { data: invites = [], isLoading, isError } = useInvites();
  const acceptInvite = useAcceptInvite();
  const rejectInvite = useRejectInvite();

  const pendingInvites = invites.filter((i) => i.status === "pending");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-[15px] text-zinc-900 dark:text-zinc-100 mb-1">Inbox</h1>
          <p className="text-[12px] text-zinc-500">Board invitations</p>
        </div>

        {isLoading && (
          <div className="text-center py-16">
            <p className="text-[13px] text-zinc-500">Loading invitations…</p>
          </div>
        )}

        {isError && (
          <div className="text-center py-16">
            <p className="text-[13px] text-red-500 dark:text-red-400">Failed to load invitations.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {pendingInvites.length > 0 ? (
              <div className="space-y-3">
                {pendingInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="p-4 rounded-lg bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                            <span className="text-[10px] text-zinc-600 dark:text-zinc-300">
                              {(invite.inviter_name ?? `#${invite.inviter_id}`).charAt(0)}
                            </span>
                          </div>
                          <span className="text-[13px] text-zinc-700 dark:text-zinc-300">
                            {invite.inviter_name ?? `User #${invite.inviter_id}`}
                          </span>
                          <span className="text-[12px] text-zinc-500">invited you to</span>
                        </div>

                        <div className="ml-8">
                          <h3 className="text-[13px] text-zinc-900 dark:text-zinc-100 mb-1">
                            {invite.board_name}
                          </h3>
                        </div>

                        <div className="ml-8 mt-2 flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-600">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(invite.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => acceptInvite.mutate(invite.id)}
                          disabled={acceptInvite.isPending || rejectInvite.isPending}
                          className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors disabled:opacity-50"
                          title="Accept"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => rejectInvite.mutate(invite.id)}
                          disabled={acceptInvite.isPending || rejectInvite.isPending}
                          className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-5 h-5 text-zinc-500" />
                </div>
                <p className="text-[13px] text-zinc-500 mb-1">No pending invites</p>
                <p className="text-[12px] text-zinc-400 dark:text-zinc-600">You'll see board invitations here</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
