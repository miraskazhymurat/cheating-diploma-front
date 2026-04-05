import { Link } from "react-router";
import { Check, X, Clock } from "lucide-react";
import { boardInvites, boards, employees, getCurrentUser } from "../data/mockData";

export function Inbox() {
  const currentUser = getCurrentUser();
  
  // Get pending invites for current user
  const pendingInvites = boardInvites.filter(
    (invite) => invite.toUserId === currentUser.id && invite.status === "pending"
  );

  const handleAccept = (inviteId: string) => {
    // TODO: Accept invite logic
    console.log("Accept invite:", inviteId);
  };

  const handleReject = (inviteId: string) => {
    // TODO: Reject invite logic
    console.log("Reject invite:", inviteId);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[15px] text-zinc-100 mb-1">Inbox</h1>
          <p className="text-[12px] text-zinc-500">Board invitations</p>
        </div>

        {/* Invites List */}
        {pendingInvites.length > 0 ? (
          <div className="space-y-3">
            {pendingInvites.map((invite) => {
              const board = boards.find((b) => b.id === invite.boardId);
              const fromUser = employees.find((e) => e.id === invite.fromUserId);
              
              if (!board || !fromUser) return null;

              return (
                <div
                  key={invite.id}
                  className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
                          <span className="text-[10px] text-zinc-300">
                            {fromUser.name.charAt(0)}
                          </span>
                        </div>
                        <span className="text-[13px] text-zinc-300">{fromUser.name}</span>
                        <span className="text-[12px] text-zinc-500">invited you to</span>
                      </div>
                      
                      <div className="ml-8">
                        <h3 className="text-[13px] text-zinc-100 mb-1">{board.name}</h3>
                        {board.description && (
                          <p className="text-[12px] text-zinc-500 line-clamp-2">
                            {board.description}
                          </p>
                        )}
                      </div>

                      <div className="ml-8 mt-2 flex items-center gap-2 text-[11px] text-zinc-600">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(invite.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleAccept(invite.id)}
                        className="p-2 rounded-md bg-emerald-950/30 text-emerald-400 border border-emerald-900/50 hover:bg-emerald-950/50 transition-colors"
                        title="Accept"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReject(invite.id)}
                        className="p-2 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 transition-colors"
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-full bg-zinc-900/50 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-5 h-5 text-zinc-500" />
            </div>
            <p className="text-[13px] text-zinc-500 mb-1">No pending invites</p>
            <p className="text-[12px] text-zinc-600">
              You'll see board invitations here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
