import { useParams, Link } from "react-router";
import { Settings, ArrowLeft, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { boards, employees, getCurrentUser } from "../data/mockData";
import { Badge } from "../components/ui/badge";

export function BoardSettings() {
  const { boardId } = useParams();
  const currentUser = getCurrentUser();
  const board = boards.find((b) => b.id === boardId);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invites, setInvites] = useState<string[]>([]);

  if (!board) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[13px] text-zinc-500 mb-4">Board not found</p>
          <Link
            to="/boards"
            className="text-[12px] text-zinc-400 hover:text-zinc-100 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to boards
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = board.ownerId === currentUser.id;
  const boardMembers = employees.filter((e) => board.members.includes(e.id));
  const owner = employees.find((e) => e.id === board.ownerId);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail && !invites.includes(inviteEmail)) {
      setInvites([...invites, inviteEmail]);
      setInviteEmail("");
    }
  };

  const removeInvite = (email: string) => {
    setInvites(invites.filter((e) => e !== email));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link
          to={`/board/${boardId}`}
          className="text-[12px] text-zinc-400 hover:text-zinc-100 transition-colors inline-flex items-center gap-2 mb-8"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to board
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-4 h-4 text-zinc-400" />
            <h1 className="text-[15px] text-zinc-100">Board Settings</h1>
          </div>
          <p className="text-[12px] text-zinc-500">{board.name}</p>
        </div>

        <div className="space-y-8">
          {/* Board Info */}
          <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
            <h2 className="text-[13px] text-zinc-300 mb-4">Board Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-zinc-500 block mb-1">Board Name</label>
                <input
                  type="text"
                  defaultValue={board.name}
                  disabled={!isOwner}
                  className="w-full px-3 py-2 text-[13px] bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700 text-zinc-100 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-500 block mb-1">Description</label>
                <textarea
                  defaultValue={board.description}
                  disabled={!isOwner}
                  rows={3}
                  className="w-full px-3 py-2 text-[13px] bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700 text-zinc-100 disabled:opacity-50 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
            <h2 className="text-[13px] text-zinc-300 mb-4">Members ({boardMembers.length})</h2>
            <div className="space-y-2">
              {boardMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                      <span className="text-[11px] text-zinc-300">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-[13px] text-zinc-100">{member.name}</div>
                      <div className="text-[11px] text-zinc-500">{member.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.id === board.ownerId && (
                      <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 bg-zinc-900 text-zinc-400 border-zinc-800">
                        Owner
                      </Badge>
                    )}
                    {isOwner && member.id !== board.ownerId && (
                      <button className="text-[11px] text-zinc-500 hover:text-red-400 transition-colors">
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invite Members */}
          {isOwner && (
            <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <h2 className="text-[13px] text-zinc-300 mb-4">Invite Members</h2>
              <form onSubmit={handleInvite} className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="flex-1 px-3 py-2 text-[13px] bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                  />
                  <button
                    type="submit"
                    className="text-[12px] px-4 py-2 bg-zinc-100 text-zinc-900 rounded-md hover:bg-white transition-colors inline-flex items-center gap-2 shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Invite
                  </button>
                </div>
              </form>

              {/* Pending Invites */}
              {invites.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] text-zinc-500 mb-2">Pending invites:</p>
                  {invites.map((email) => (
                    <div
                      key={email}
                      className="flex items-center justify-between px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800"
                    >
                      <span className="text-[12px] text-zinc-300">{email}</span>
                      <button
                        onClick={() => removeInvite(email)}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
