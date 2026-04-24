import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  Mic, MicOff, Video, VideoOff, ScreenShare, ScreenShareOff,
  Users, MessageSquare, PhoneOff, X, Send, LayoutGrid,
} from "lucide-react";
import { useBoardEmployees, useMe } from "../../hooks/useEmployee";
import { useBoard } from "../../hooks/useBoards";
import { useChatMessages, useSendMessage } from "../../hooks/useChat";

function useDuration() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

type Sidebar = "chat" | "participants" | null;

interface ParticipantTileProps {
  name: string;
  photo?: string;
  isSelf?: boolean;
  micOn: boolean;
  camOn: boolean;
}

function ParticipantTile({ name, photo, isSelf, micOn, camOn }: ParticipantTileProps) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="relative rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden aspect-video">
      {camOn && photo ? (
        <img src={photo} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-zinc-700 flex items-center justify-center">
            {photo ? (
              <img src={photo} alt={name} className="w-full h-full object-cover rounded-full" />
            ) : (
              <span className="text-[18px] text-zinc-300">{initials}</span>
            )}
          </div>
        </div>
      )}
      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
        <span className="text-[11px] text-white/90 truncate">
          {isSelf ? `${name} (you)` : name}
        </span>
        {!micOn && (
          <span className="ml-2 shrink-0 w-5 h-5 rounded-full bg-red-500/90 flex items-center justify-center">
            <MicOff className="w-3 h-3 text-white" />
          </span>
        )}
      </div>
    </div>
  );
}

function ControlBtn({
  active, danger, onClick, title, children,
}: {
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
        danger
          ? "bg-red-600 hover:bg-red-500 text-white"
          : active
          ? "bg-zinc-700 hover:bg-zinc-600 text-white"
          : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export function Meeting() {
  const { boardId: boardIdParam } = useParams();
  const boardId = Number(boardIdParam);
  const navigate = useNavigate();

  const { data: board } = useBoard(boardId);
  const { data: me } = useMe();
  const { data: employees = [] } = useBoardEmployees(boardId);
  const { data: messages = [] } = useChatMessages(boardId);
  const sendMessage = useSendMessage(boardId);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenOn, setScreenOn] = useState(false);
  const [sidebar, setSidebar] = useState<Sidebar>(null);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const duration = useDuration();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleSidebar = (tab: Sidebar) =>
    setSidebar((prev) => (prev === tab ? null : tab));

  const handleSend = () => {
    if (!chatInput.trim()) return;
    sendMessage.mutate(chatInput.trim(), { onSuccess: () => setChatInput("") });
  };

  const otherMembers = employees.filter((e) => e.user_id !== me?.user_id);

  const allTiles = [
    { key: "me", name: me?.full_name ?? "You", photo: me?.photo, isSelf: true, micOn, camOn },
    ...otherMembers.map((e) => ({
      key: String(e.user_id),
      name: e.full_name,
      photo: e.photo,
      isSelf: false,
      micOn: true,
      camOn: false,
    })),
  ];

  const gridCols =
    allTiles.length === 1 ? "grid-cols-1 max-w-lg mx-auto"
    : allTiles.length === 2 ? "grid-cols-2"
    : allTiles.length <= 4 ? "grid-cols-2"
    : "grid-cols-3";

  return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col z-50">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/60 shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/boards" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-zinc-100 flex items-center justify-center">
              <LayoutGrid className="w-3.5 h-3.5 text-zinc-900" />
            </div>
          </Link>
          <span className="text-[13px] text-zinc-300 hidden sm:block">
            {board?.name ?? "Meeting"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[12px] text-zinc-400 font-mono">{duration}</span>
        </div>
        <div className="w-24" />
      </div>

      {/* Main */}
      <div className="flex flex-1 min-h-0">
        {/* Video area */}
        <div className="flex-1 flex flex-col min-w-0 p-4 gap-4">
          <div className={`grid ${gridCols} gap-3 flex-1 content-center`}>
            {allTiles.map((tile) => (
              <ParticipantTile key={tile.key} {...tile} />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 pb-1 shrink-0">
            <ControlBtn active={micOn} onClick={() => setMicOn((v) => !v)} title={micOn ? "Mute mic" : "Unmute mic"}>
              {micOn ? <Mic className="w-4.5 h-4.5" /> : <MicOff className="w-4.5 h-4.5" />}
            </ControlBtn>

            <ControlBtn active={camOn} onClick={() => setCamOn((v) => !v)} title={camOn ? "Turn off camera" : "Turn on camera"}>
              {camOn ? <Video className="w-4.5 h-4.5" /> : <VideoOff className="w-4.5 h-4.5" />}
            </ControlBtn>

            <ControlBtn active={screenOn} onClick={() => setScreenOn((v) => !v)} title={screenOn ? "Stop sharing" : "Share screen"}>
              {screenOn ? <ScreenShareOff className="w-4.5 h-4.5" /> : <ScreenShare className="w-4.5 h-4.5" />}
            </ControlBtn>

            <div className="w-px h-6 bg-zinc-700 mx-1" />

            <ControlBtn active={sidebar === "participants"} onClick={() => toggleSidebar("participants")} title="Participants">
              <Users className="w-4.5 h-4.5" />
            </ControlBtn>

            <ControlBtn active={sidebar === "chat"} onClick={() => toggleSidebar("chat")} title="Chat">
              <MessageSquare className="w-4.5 h-4.5" />
            </ControlBtn>

            <div className="w-px h-6 bg-zinc-700 mx-1" />

            <ControlBtn danger onClick={() => navigate(`/board/${boardId}`)} title="Leave call">
              <PhoneOff className="w-4.5 h-4.5" />
            </ControlBtn>
          </div>
        </div>

        {/* Sidebar */}
        {sidebar && (
          <div className="w-72 shrink-0 border-l border-zinc-800 flex flex-col bg-zinc-900">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <span className="text-[12px] text-zinc-300">
                {sidebar === "chat" ? "Chat" : `Participants (${allTiles.length})`}
              </span>
              <button
                onClick={() => setSidebar(null)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {sidebar === "participants" ? (
              <div className="flex-1 overflow-y-auto py-2">
                {allTiles.map((tile) => (
                  <div key={tile.key} className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
                      {tile.photo ? (
                        <img src={tile.photo} alt={tile.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[11px] text-zinc-300">
                          {tile.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-[12px] text-zinc-300 flex-1 truncate">
                      {tile.isSelf ? `${tile.name} (you)` : tile.name}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {tile.micOn
                        ? <Mic className="w-3 h-3 text-zinc-500" />
                        : <MicOff className="w-3 h-3 text-red-400" />
                      }
                      {tile.camOn
                        ? <Video className="w-3 h-3 text-zinc-500" />
                        : <VideoOff className="w-3 h-3 text-zinc-600" />
                      }
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto py-3 px-3 space-y-3">
                  {messages.length === 0 && (
                    <p className="text-[12px] text-zinc-600 text-center py-6">No messages yet</p>
                  )}
                  {messages.map((msg) => {
                    const isMine = msg.author_name === me?.full_name;
                    return (
                      <div key={msg.id} className={`flex flex-col gap-0.5 ${isMine ? "items-end" : "items-start"}`}>
                        {!isMine && (
                          <span className="text-[10px] text-zinc-500 px-1">{msg.author_name}</span>
                        )}
                        <div className={`max-w-[85%] px-3 py-2 rounded-xl text-[12px] leading-relaxed ${
                          isMine
                            ? "bg-zinc-700 text-zinc-100 rounded-tr-sm"
                            : "bg-zinc-800 text-zinc-300 rounded-tl-sm"
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
                <div className="px-3 pb-3 pt-2 border-t border-zinc-800">
                  <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2">
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      placeholder="Message…"
                      className="flex-1 min-w-0 bg-transparent text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!chatInput.trim()}
                      className="text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-40"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
