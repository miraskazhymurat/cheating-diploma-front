import { useParams, Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Settings, ArrowLeft, UserPlus, X, Search, Plus, Trash2, ChevronUp, ChevronDown, Star } from "lucide-react";
import { useState, useRef, useEffect } from "react";

function StatusColorPicker({ initialColor, onSave }: { initialColor: string; onSave: (color: string) => void }) {
  const [color, setColor] = useState(initialColor);
  const inputRef = useRef<HTMLInputElement>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    // native 'change' fires only when the picker is closed/confirmed, unlike React onChange
    const handleChange = (e: Event) => onSaveRef.current((e.target as HTMLInputElement).value);
    input.addEventListener("change", handleChange);
    return () => input.removeEventListener("change", handleChange);
  }, []);

  return (
    <label className="relative w-5 h-5 cursor-pointer shrink-0" title="Change color">
      <span className="block w-5 h-5 rounded border border-border" style={{ backgroundColor: color }} />
      <input
        ref={inputRef}
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
      />
    </label>
  );
}
import { Badge } from "../components/ui/badge";
import { useAuth } from "../context/AuthContext";
import { useBoard, useDeleteBoard } from "../../hooks/useBoards";
import { useAllEmployees, useBoardEmployees, useDeleteMember} from "../../hooks/useEmployee";
import { useSendInvite } from "../../hooks/useInvites";
import { useBoardStatuses, useCreateStatus, useDeleteStatus, useReorderStatuses, useSetDefaultStatus, useUpdateStatus } from "../../hooks/useStatuses";

export function BoardSettings() {
  const { boardId: boardIdParam } = useParams();
  const boardId = Number(boardIdParam);
  const { user } = useAuth();
  const sendInvite = useSendInvite();
  const deleteBoard = useDeleteBoard();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: board } = useBoard(boardId);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invites, setInvites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newStatusTitle, setNewStatusTitle] = useState("");

  const { data: rawStatuses } = useBoardStatuses(boardId);
  const statuses = rawStatuses ?? [];
  const createStatus = useCreateStatus(boardId);
  const deleteStatus = useDeleteStatus(boardId);
  const reorderStatuses = useReorderStatuses(boardId);
  const updateStatus = useUpdateStatus(boardId);
  const setDefaultStatus = useSetDefaultStatus(boardId);
  const { data: boardMembers } = useBoardEmployees(boardId);
  const deleteMember = useDeleteMember(boardId);
  const { data: employees } = useAllEmployees();

  if (!board) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex items-center justify-center" style={{ height: "calc(100vh - 3.5rem)" }}>
          <div className="text-center">
            <p className="text-[13px] text-muted-foreground mb-4">Board not found</p>
            <Link
              to="/boards"
              className="text-[12px] text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to boards
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = board.ownerId == user?.id;

  const availableUsers = employees?.filter(
    (e) => !boardMembers?.some((bm) => bm.user_id === e.user_id)
  );

  const filteredUsers = availableUsers?.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (inviteEmail && !invites.includes(inviteEmail)) {
      setInvites([...invites, inviteEmail]);
      setInviteEmail("");
    }
  };

  const handleInviteUser = (userId: number) => {
    sendInvite.mutate(
      { boardId, userId },
      {
        onSuccess: () => toast.success("Invite sent successfully"),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const removeInvite = (email: string) => {
    setInvites(invites.filter((e) => e !== email));
  };

  return (
    <div className="min-h-full bg-background max-w-3xl mx-auto px-6 py-12">
      {/* Back Button */}
      <Link
        to={`/board/${boardId}`}
        className="text-[12px] text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 mb-8"
      >
        <ArrowLeft className="w-3 h-3" />
        Back to board
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <h1 className="text-[15px] text-foreground">Board Settings</h1>
        </div>
        <p className="text-[12px] text-muted-foreground">{board.name}</p>
      </div>

      <div className="space-y-8">
          {/* Board Info */}
          <div className="p-6 rounded-lg bg-card border border-border">
            <h2 className="text-[13px] text-foreground/70 mb-4">Board Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Board Name</label>
                <input
                  type="text"
                  defaultValue={board.name}
                  disabled={!isOwner}
                  className="w-full px-3 py-2 text-[13px] bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring/70 focus:border-ring/70 text-foreground disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Description</label>
                <textarea
                  defaultValue={board.description}
                  disabled={!isOwner}
                  rows={3}
                  className="w-full px-3 py-2 text-[13px] bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring/70 focus:border-ring/70 text-foreground disabled:opacity-50 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Statuses */}
          <div className="p-6 rounded-lg bg-card border border-border">
            <h2 className="text-[13px] text-foreground/70 mb-4">Statuses</h2>
            <div className="space-y-2 mb-4">
              {statuses.map((status, idx) => (
                <div
                  key={status.board_status_id}
                  className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/50 border border-border"
                >
                  <div className="flex items-center gap-2">
                    <StatusColorPicker
                      initialColor={status.colour ?? "#6b7280"}
                      onSave={(color) => updateStatus.mutate({ boardStatusId: status.board_status_id, color })}
                    />
                    <span className="text-[13px] text-foreground">{status.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setDefaultStatus.mutate(status.board_status_id)}
                      disabled={!!status.is_default || setDefaultStatus.isPending}
                      title={status.is_default ? "Default status" : "Set as default"}
                      className="p-1 transition-colors disabled:cursor-default"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${status.is_default ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground hover:text-yellow-400"}`}
                      />
                    </button>
                    <button
                      disabled={idx === 0}
                      onClick={() => {
                        const reordered = [...statuses];
                        [reordered[idx - 1], reordered[idx]] = [reordered[idx], reordered[idx - 1]];
                        reorderStatuses.mutate(
                          reordered.map((s, i) => ({ board_status_id: s.board_status_id, position: i + 1 }))
                        );
                      }}
                      className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={idx === statuses.length - 1}
                      onClick={() => {
                        const reordered = [...statuses];
                        [reordered[idx], reordered[idx + 1]] = [reordered[idx + 1], reordered[idx]];
                        reorderStatuses.mutate(
                          reordered.map((s, i) => ({ board_status_id: s.board_status_id, position: i + 1 }))
                        );
                      }}
                      className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteStatus.mutate(status.board_status_id)}
                      className="p-1 text-muted-foreground hover:text-red-500 transition-colors ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newStatusTitle.trim()) return;
                createStatus.mutate(newStatusTitle.trim(), {
                  onSuccess: () => setNewStatusTitle(""),
                });
              }}
              className="flex gap-2 w-full"
            >
              <input
                type="text"
                value={newStatusTitle}
                onChange={(e) => setNewStatusTitle(e.target.value)}
                placeholder="New status name..."
                className="flex-1 min-w-0 px-3 py-2 text-[13px] bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring/70 focus:border-ring/70 text-foreground placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                disabled={!newStatusTitle.trim() || createStatus.isPending}
                className="text-[12px] px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-700 dark:hover:bg-white transition-colors inline-flex items-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </form>
          </div>

          {/* Members */}
          <div className="p-6 rounded-lg bg-card border border-border">
            <h2 className="text-[13px] text-foreground/70 mb-4">Members ({boardMembers?.length})</h2>
            <div className="space-y-2">
              {boardMembers?.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {member.photo ? (
                        <img src={member.photo} alt={member.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[11px] text-muted-foreground">{member.full_name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <div className="text-[13px] text-foreground">{member.full_name}</div>
                      <div className="text-[11px] text-muted-foreground">{member.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.user_id === board.ownerId && (
                      <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 bg-muted text-muted-foreground border-border">
                        Owner
                      </Badge>
                    )}
                    {isOwner && member.user_id != board.ownerId && (
                      <button
                        onClick={() => {
                          deleteMember.mutate(member.board_member_id);
                        }}
                        className="text-[11px] text-muted-foreground hover:text-red-500 transition-colors"
                      >
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
            <>
              {/* Invite by Email */}
              <div className="p-6 rounded-lg bg-card border border-border">
                <h2 className="text-[13px] text-foreground/70 mb-4">Invite by Email</h2>
                <form onSubmit={handleInvite} className="mb-4">
                  <div className="flex gap-2 w-full">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="flex-1 min-w-0 px-3 py-2 text-[13px] bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring/70 focus:border-ring/70 text-foreground placeholder:text-muted-foreground"
                    />
                    <button
                      type="submit"
                      className="text-[12px] px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-700 dark:hover:bg-white transition-colors inline-flex items-center gap-2 shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Invite
                    </button>
                  </div>
                </form>

                {/* Pending Invites */}
                {invites.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground mb-2">Pending invites:</p>
                    {invites.map((email) => (
                      <div
                        key={email}
                        className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/50 border border-border"
                      >
                        <span className="text-[12px] text-foreground">{email}</span>
                        <button
                          onClick={() => removeInvite(email)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Invite Users from Platform */}
              <div className="p-6 rounded-lg bg-card border border-border">
                <h2 className="text-[13px] text-foreground/70 mb-4">Invite Users</h2>

                {/* Search */}
                <div className="mb-4 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-9 pr-3 py-2 text-[13px] bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring/70 focus:border-ring/70 text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                {/* User List */}
                {availableUsers && availableUsers.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredUsers && filteredUsers.length > 0 ? (
                      filteredUsers?.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                              {user.photo ? (
                                <img src={user.photo} alt={user.full_name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[10px] text-muted-foreground">{user.full_name.charAt(0)}</span>
                              )}
                            </div>
                            <div>
                              <div className="text-[12px] text-foreground">{user.full_name}</div>
                              <div className="text-[11px] text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleInviteUser(user.id)}
                            className="text-[11px] px-3 py-1 bg-muted text-foreground rounded hover:bg-secondary transition-colors"
                          >
                            Invite
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-[12px] text-muted-foreground text-center py-4">
                        No users found
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[12px] text-muted-foreground text-center py-4">
                    All users are already members of this board
                  </p>
                )}
              </div>
            </>
          )}

          {/* Danger Zone — owner only */}
          {isOwner && (
            <div className="p-6 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/10">
              <h2 className="text-[13px] text-red-600 dark:text-red-400 mb-1">Danger Zone</h2>
              <p className="text-[12px] text-muted-foreground mb-4">Deleting the board is permanent and cannot be undone.</p>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-[12px] px-4 py-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors"
                >
                  Delete board
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-muted-foreground">Are you sure?</span>
                  <button
                    onClick={() =>
                      deleteBoard.mutate(boardId, {
                        onSuccess: () => navigate("/boards"),
                      })
                    }
                    disabled={deleteBoard.isPending}
                    className="text-[12px] px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 transition-colors disabled:opacity-50"
                  >
                    {deleteBoard.isPending ? "Deleting…" : "Yes, delete"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-[12px] px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
    </div>
    </div>
    );
  }
