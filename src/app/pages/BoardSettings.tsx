import { useParams, Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Settings, ArrowLeft, UserPlus, X, Search, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
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
      <span className="block w-5 h-5 rounded border border-zinc-700" style={{ backgroundColor: color }} />
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
import { useBoardStatuses, useCreateStatus, useDeleteStatus, useReorderStatuses, useUpdateStatus } from "../../hooks/useStatuses";

export function BoardSettings() {
  const { boardId: boardIdParam } = useParams();
  const boardId = Number(boardIdParam);
  const { user } = useAuth();
  const sendInvite = useSendInvite();
  const deleteBoard = useDeleteBoard();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: board, isLoading: boardLoading, isError: boardError } = useBoard(boardId);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invites, setInvites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newStatusTitle, setNewStatusTitle] = useState("");

  const { data: statuses = [] } = useBoardStatuses(boardId);
  const createStatus = useCreateStatus(boardId);
  const deleteStatus = useDeleteStatus(boardId);
  const reorderStatuses = useReorderStatuses(boardId);
  const updateStatus = useUpdateStatus(boardId);
  const { data: boardMembers } = useBoardEmployees(boardId);
  const deleteMember = useDeleteMember(boardId);
  const { data: employees } = useAllEmployees();

  if (!board) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="flex items-center justify-center" style={{ height: "calc(100vh - 3.5rem)" }}>
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
      </div>
    );
  }

  const isOwner = board.ownerId == user?.id;
  const owner = employees?.find((e) => e.id === board.ownerId);

  // Get users not in the board
  const availableUsers = employees?.filter(
    (e) => !boardMembers?.some((bm) => bm.user_id === e.user_id)
  );

  // Filter available users by search query
  const filteredUsers = availableUsers?.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = (e: React.FormEvent) => {
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

          {/* Statuses */}
          <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
            <h2 className="text-[13px] text-zinc-300 mb-4">Statuses</h2>
            <div className="space-y-2 mb-4">
              {statuses.map((status, idx) => (
                <div
                  key={status.board_status_id}
                  className="flex items-center justify-between px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800"
                >
                  <div className="flex items-center gap-2">
                    <StatusColorPicker
                      initialColor={status.colour ?? "#6b7280"}
                      onSave={(color) => updateStatus.mutate({ boardStatusId: status.board_status_id, color })}
                    />
                    <span className="text-[13px] text-zinc-100">{status.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => {
                        const reordered = [...statuses];
                        [reordered[idx - 1], reordered[idx]] = [reordered[idx], reordered[idx - 1]];
                        reorderStatuses.mutate(
                          reordered.map((s, i) => ({ board_status_id: s.board_status_id, position: i + 1 }))
                        );
                      }}
                      className="p-1 text-zinc-500 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                      className="p-1 text-zinc-500 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteStatus.mutate(status.board_status_id)}
                      className="p-1 text-zinc-500 hover:text-red-400 transition-colors ml-1"
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
              className="flex gap-2"
            >
              <input
                type="text"
                value={newStatusTitle}
                onChange={(e) => setNewStatusTitle(e.target.value)}
                placeholder="New status name..."
                className="flex-1 px-3 py-2 text-[13px] bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
              />
              <button
                type="submit"
                disabled={!newStatusTitle.trim() || createStatus.isPending}
                className="text-[12px] px-4 py-2 bg-zinc-100 text-zinc-900 rounded-md hover:bg-white transition-colors inline-flex items-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </form>
          </div>

          {/* Members */}
          <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
            <h2 className="text-[13px] text-zinc-300 mb-4">Members ({boardMembers?.length})</h2>
            <div className="space-y-2">
              {boardMembers?.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                      <span className="text-[11px] text-zinc-300">
                        {member.full_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-[13px] text-zinc-100">{member.full_name}</div>
                      <div className="text-[11px] text-zinc-500">{member.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.user_id === board.ownerId && (
                      <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 bg-zinc-900 text-zinc-400 border-zinc-800">
                        Owner
                      </Badge>
                    )}
                    {isOwner && member.user_id != board.ownerId && (
                      <button 
                        onClick={() => {
                          deleteMember.mutate(member.board_member_id);
                        }}
                        className="text-[11px] text-zinc-500 hover:text-red-400 transition-colors"
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
              <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <h2 className="text-[13px] text-zinc-300 mb-4">Invite by Email</h2>
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

              {/* Invite Users from Platform */}
              <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <h2 className="text-[13px] text-zinc-300 mb-4">Invite Users</h2>
                
                {/* Search */}
                <div className="mb-4 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-9 pr-3 py-2 text-[13px] bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                  />
                </div>

                {/* User List */}
                {availableUsers && availableUsers.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredUsers && filteredUsers.length > 0 ? (
                      filteredUsers?.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-zinc-900/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center">
                              <span className="text-[10px] text-zinc-300">
                                {user.full_name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="text-[12px] text-zinc-100">{user.full_name}</div>
                              <div className="text-[11px] text-zinc-500">{user.email}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleInviteUser(user.id)}
                            className="text-[11px] px-3 py-1 bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 transition-colors"
                          >
                            Invite
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-[12px] text-zinc-500 text-center py-4">
                        No users found
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[12px] text-zinc-500 text-center py-4">
                    All users are already members of this board
                  </p>
                )}
              </div>
            </>
          )}

          {/* Danger Zone — owner only */}
          {isOwner && (
            <div className="p-6 rounded-lg border border-red-900/50 bg-red-950/10">
              <h2 className="text-[13px] text-red-400 mb-1">Danger Zone</h2>
              <p className="text-[12px] text-zinc-500 mb-4">Deleting the board is permanent and cannot be undone.</p>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-[12px] px-4 py-2 border border-red-800 text-red-400 rounded-md hover:bg-red-950/40 transition-colors"
                >
                  Delete board
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-zinc-400">Are you sure?</span>
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
                    className="text-[12px] px-4 py-2 text-zinc-400 hover:text-zinc-100 transition-colors"
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