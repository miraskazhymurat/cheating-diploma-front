import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { MessageCircle, X, Send, Users, Reply, Paperclip, FileText, Play, Pause, Music, Mic, Trash2, Video, ChevronsDown, BarChart2, Plus, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { useChatMessages, useSendMessage, useDeleteMessage, useCreatePoll, useVotePoll, useUnvotePoll } from "../../hooks/useChat";
import { useChatWebSocket } from "../../hooks/useChatWebSocket";
import { useAuth } from "../context/AuthContext";
import { useMe } from "../../hooks/useEmployee";
import type { ChatMessage, ChatReplyTo } from "../../api/chat";

function formatDuration(s: number) {
  if (!isFinite(s)) return "--:--";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function AudioPlayer({ src, isOwn }: { src: string; isOwn: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) { el.pause(); } else { el.play(); }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Number(e.target.value);
    setCurrent(el.currentTime);
  };

  const progress = duration > 0 ? (current / duration) * 100 : 0;

  const trackBg = isOwn
    ? `linear-gradient(to right, rgba(255,255,255,0.7) ${progress}%, rgba(255,255,255,0.2) ${progress}%)`
    : `linear-gradient(to right, rgb(113,113,122) ${progress}%, rgb(228,228,231) ${progress}%)`;

  const darkTrackBg = `linear-gradient(to right, rgb(161,161,170) ${progress}%, rgb(63,63,70) ${progress}%)`;

  return (
    <div className={`mt-2 flex items-center gap-2.5 px-3 py-2.5 rounded-xl w-[220px] ${
      isOwn ? "bg-zinc-800 dark:bg-zinc-200" : "bg-zinc-200 dark:bg-zinc-700"
    }`}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={() => setCurrent(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setCurrent(0); }}
      />

      <button
        onClick={toggle}
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
          isOwn
            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 hover:bg-white dark:hover:bg-zinc-700"
            : "bg-zinc-800 dark:bg-zinc-500 text-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-400"
        }`}
      >
        {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
      </button>

      <div className="flex-1 min-w-0">
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.1}
          value={current}
          onChange={seek}
          className="w-full h-1 rounded-full appearance-none cursor-pointer"
          style={{ background: trackBg }}
        />
        <div className={`flex justify-between mt-1 text-[9px] ${isOwn ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-500 dark:text-zinc-400"}`}>
          <span>{formatDuration(current)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>
    </div>
  );
}

interface BoardChatProps {
  boardId: number;
  boardName: string;
  memberCount: number;
  defaultOpen?: boolean;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  return isToday
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Avatar({ name, photo, size = 7 }: { name: string; photo?: string; size?: number }) {
  const cls = `w-${size} h-${size} rounded-full object-cover`;
  if (photo) return <img src={photo} alt={name} className={cls} />;
  return (
    <div className={`w-${size} h-${size} rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center`}>
      <span className="text-[10px] text-zinc-600 dark:text-zinc-300 font-medium">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

function ReplyBanner({ replyTo, onClear }: { replyTo: ChatReplyTo; onClear: () => void }) {
  return (
    <div className="flex items-start gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 shrink-0">
      <Reply className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-0.5">{replyTo.author.full_name}</p>
        <p className="text-[12px] text-zinc-600 dark:text-zinc-400 truncate">{replyTo.text}</p>
      </div>
      <button onClick={onClear} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function CircularVideoPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const circumference = 2 * Math.PI * 87;
  const progress = duration > 0 ? (current / duration) * 100 : 0;

  const toggle = () => {
    const el = videoRef.current;
    if (!el) return;
    playing ? el.pause() : el.play();
  };

  return (
    <div className="relative w-[160px] h-[160px]">
      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none text-zinc-300 dark:text-zinc-500" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r="87" fill="none" stroke="currentColor" strokeWidth="5" />
        <circle
          cx="90" cy="90" r="87" fill="none" strokeWidth="5"
          stroke="rgb(63 63 70)"
          className="dark:[stroke:white] transition-all duration-300"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress / 100)}
        />
      </svg>
      <div className="absolute inset-2 rounded-full overflow-hidden bg-zinc-900">
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-cover"
          playsInline
          onTimeUpdate={() => setCurrent(videoRef.current?.currentTime ?? 0)}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => { setPlaying(false); setCurrent(0); if (videoRef.current) videoRef.current.currentTime = 0; }}
        />
        <button
          onClick={toggle}
          className="absolute inset-0 flex items-center justify-center transition-colors"
          style={{ background: playing ? "transparent" : "rgba(0,0,0,0.3)" }}
        >
          {!playing && <Play className="w-9 h-9 text-white drop-shadow" fill="white" />}
        </button>
      </div>
      {duration > 0 && (
        <div className="absolute -bottom-5 left-0 right-0 flex justify-center">
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 tabular-nums">
            {formatDuration(playing ? current : duration)}
          </span>
        </div>
      )}
    </div>
  );
}

const audioExts = /\.(mp3|wav|ogg|oga|opus|m4a|aac|flac|weba|webm)$/i;
const isAudio = (mime: string, name: string) =>
  name.startsWith("voice-message") ||
  (!mime.startsWith("video/") && (mime.startsWith("audio/") || audioExts.test(name)));
const isVideo = (mime: string) => mime.startsWith("video/");
const isMediaBare = (mime: string, name: string) => isAudio(mime, name) || isVideo(mime) || mime.startsWith("image/");

function scrollToMessage(id: number) {
  const el = document.getElementById(`chat-msg-${id}`);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("chat-highlight");
  setTimeout(() => el.classList.remove("chat-highlight"), 1200);
}

function PollDisplay({
  poll,
  isOwn,
  currentEmployeeId,
  onVote,
  onUnvote,
  hasVoted,
}: {
  poll: NonNullable<import("../../api/chat").ChatMessage["poll"]>;
  isOwn: boolean;
  currentEmployeeId?: number;
  onVote: (optionId: number) => void;
  onUnvote: (optionId: number) => void;
  hasVoted: boolean;
}) {
  const [localVotedId, setLocalVotedId] = useState<number | null>(null);
  const [localUnvoted, setLocalUnvoted] = useState(false);
  const [showVoters, setShowVoters] = useState(false);
  const voted = (hasVoted || localVotedId !== null) && !localUnvoted;
  const totalVotes = poll.options.reduce((s, o) => s + o.vote_count, 0) + (localVotedId !== null && !hasVoted ? 1 : 0);

  // Determine which option the user voted for (for unvote request)
  const serverVotedOptionId = poll.options.find((o) =>
    (o.voters ?? []).some((v) => v.id === currentEmployeeId)
  )?.id ?? null;
  const activeVotedOptionId = localVotedId ?? serverVotedOptionId;

  const muted = "text-zinc-400 dark:text-zinc-500";
  const body = isOwn ? "text-zinc-100 dark:text-zinc-900" : "text-zinc-900 dark:text-zinc-100";
  const divider = isOwn ? "border-zinc-700 dark:border-zinc-300" : "border-zinc-200 dark:border-zinc-700";
  const optionBg = isOwn ? "bg-zinc-800 dark:bg-zinc-200" : "bg-zinc-200 dark:bg-zinc-700";
  const checkmarkCls = isOwn ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-600 dark:text-zinc-300";

  // Compute per-option vote data once, used by both unvoted and voted panels
  const optionData = poll.options.map((option) => {
    const serverVotedThis = (option.voters ?? []).some((v) => v.id === currentEmployeeId);
    const localVotedThis = localVotedId === option.id;
    const votedThis = (serverVotedThis || localVotedThis) && !localUnvoted;
    const count = option.vote_count + (localVotedThis && !hasVoted ? 1 : 0);
    const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
    return { option, votedThis, pct };
  });

  // Shared row layout so both panels are pixel-identical in height
  const OptionRow = ({
    option, votedThis, pct, showVoted, onClick, clickable,
  }: {
    option: typeof poll.options[0]; votedThis: boolean; pct: number;
    showVoted: boolean; onClick: () => void; clickable: boolean;
  }) => (
    <button
      key={option.id}
      onClick={onClick}
      className={`w-full text-left rounded-lg overflow-hidden relative ${
        clickable ? "cursor-pointer hover:opacity-80 active:opacity-60" : "cursor-default"
      }`}
    >
      {/* Background — always full width in unvoted, animated pct in voted */}
      <div
        className={`absolute inset-0 rounded-lg transition-[width] duration-700 ${
          showVoted && votedThis
            ? isOwn ? "bg-zinc-600 dark:bg-zinc-300" : "bg-zinc-400 dark:bg-zinc-500"
            : optionBg
        }`}
        style={{ width: showVoted ? `${Math.max(pct, 4)}%` : "100%" }}
      />
      {/* Content — identical structure in both panels so heights match */}
      <div className="relative flex items-center gap-1.5 px-2.5 py-1.5">
        <CheckCircle2 className={`w-3 h-3 shrink-0 ${checkmarkCls} ${showVoted && votedThis ? "" : "invisible"}`} />
        <span className={`text-[12px] truncate flex-1 ${body}`}>{option.text}</span>
        <span className={`text-[11px] shrink-0 tabular-nums ${muted} ${showVoted ? "" : "invisible"}`}>{pct}%</span>
      </div>
    </button>
  );

  return (
    <div className={`px-3 py-2.5 rounded-2xl min-w-[200px] max-w-[260px] ${
      isOwn ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-100 dark:bg-zinc-800"
    }`}>
      {/* Header */}
      <div className="flex items-start gap-1.5 mb-3">
        <BarChart2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${muted}`} />
        <p className={`text-[13px] font-medium leading-snug ${body}`}>{poll.question}</p>
      </div>

      {/* 3 panels stacked in the same grid cell — height = max of all three, never changes */}
      <div className="grid">
        {/* Panel 1: unvoted */}
        <div style={{ gridArea: "1/1" }} className={`space-y-1.5 ${voted || showVoters ? "invisible pointer-events-none" : ""}`}>
          {optionData.map(({ option, votedThis, pct }) => (
            <OptionRow
              key={option.id}
              option={option} votedThis={votedThis} pct={pct}
              showVoted={false} clickable={true}
              onClick={() => { setLocalUnvoted(false); setLocalVotedId(option.id); onVote(option.id); }}
            />
          ))}
          <p className={`text-[10px] mt-1 ${muted}`}>{totalVotes} {totalVotes === 1 ? "vote" : "votes"}</p>
        </div>

        {/* Panel 2: voted */}
        <div style={{ gridArea: "1/1" }} className={`space-y-1.5 ${!voted || showVoters ? "invisible pointer-events-none" : ""}`}>
          {optionData.map(({ option, votedThis, pct }) => (
            <OptionRow
              key={option.id}
              option={option} votedThis={votedThis} pct={pct}
              showVoted={true} clickable={votedThis}
              onClick={() => {
                if (votedThis && activeVotedOptionId !== null) {
                  setLocalUnvoted(true);
                  setLocalVotedId(null);
                  onUnvote(activeVotedOptionId);
                }
              }}
            />
          ))}
          <p className={`text-[10px] mt-1 ${muted}`}>{totalVotes} {totalVotes === 1 ? "vote" : "votes"} · voted</p>
        </div>

        {/* Panel 3: voters list */}
        <div style={{ gridArea: "1/1" }} className={`space-y-3 ${!showVoters ? "invisible pointer-events-none" : ""}`}>
          {poll.options.map((option) => {
            const voters = option.voters ?? [];
            if (voters.length === 0) return null;
            return (
              <div key={option.id}>
                <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1.5 truncate ${muted}`}>{option.text}</p>
                <div className="space-y-1.5">
                  {voters.map((voter) => (
                    <div key={voter.id} className="flex items-center gap-2">
                      <Avatar name={voter.full_name} photo={voter.photo || undefined} size={5} />
                      <span className={`text-[12px] truncate ${body}`}>
                        {voter.id === currentEmployeeId ? "You" : voter.full_name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {poll.options.every((o) => (o.voters ?? []).length === 0) && (
            <p className={`text-[11px] ${muted}`}>No votes yet.</p>
          )}
          <p className={`text-[10px] ${muted}`}>{totalVotes} {totalVotes === 1 ? "vote" : "votes"} total</p>
        </div>
      </div>

      {/* Toggle button */}
      {totalVotes > 0 && (
        <button
          onClick={() => setShowVoters((v) => !v)}
          className={`mt-2 pt-2 w-full text-left border-t text-[11px] cursor-pointer transition-opacity hover:opacity-70 ${divider} ${muted}`}
        >
          {showVoters ? "Back to poll" : "Show results"}
        </button>
      )}
    </div>
  );
}

function MessageBubble({
  msg,
  isOwn,
  isSameAuthor,
  onReply,
  onDelete,
  boardId,
  currentEmployeeId,
}: {
  msg: ChatMessage;
  isOwn: boolean;
  isSameAuthor: boolean;
  onReply: (msg: ChatMessage) => void;
  onDelete: (msgId: number) => void;
  boardId: number;
  currentEmployeeId?: number;
}) {
  const votePoll = useVotePoll(boardId);
  const unvotePoll = useUnvotePoll(boardId);
  const bareAtts = msg.attachments.filter((a) => isMediaBare(a.mime_type, a.file_name));
  const otherAtts = msg.attachments.filter((a) => !isMediaBare(a.mime_type, a.file_name));
  const hasBubble = !!msg.text || otherAtts.length > 0 || !!msg.reply_to;
  const hasVoted = !!msg.poll?.options.some((o) => (o.voters ?? []).some((v) => v.id === currentEmployeeId));
  const [actionsVisible, setActionsVisible] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => setActionsVisible(true), 450);
  };
  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  return (
    <div
      id={`chat-msg-${msg.id}`}
      className={`flex gap-2 group ${isOwn ? "flex-row-reverse" : ""} transition-colors duration-300`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
    >
      <div className="shrink-0 w-7 h-7 mt-0.5">
        {!isSameAuthor && (
          <Link to={`/profile/${msg.author.id}`} state={{ fromChat: true, boardId }} title={msg.author.full_name}>
            <Avatar name={msg.author.full_name} photo={msg.author.photo || undefined} />
          </Link>
        )}
      </div>

      <div className={`flex flex-col max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
        {!isSameAuthor && (
          <div className={`flex items-baseline gap-1.5 mb-1 ${isOwn ? "flex-row-reverse" : ""}`}>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              {isOwn ? "You" : msg.author.full_name}
            </span>
            <span className="text-[10px] text-zinc-300 dark:text-zinc-600">{formatTime(msg.created_at)}</span>
          </div>
        )}

        <div className={`flex items-end gap-1 ${isOwn ? "flex-row-reverse" : ""}`}>
          <div className="flex flex-col gap-1" onClick={() => actionsVisible && setActionsVisible(false)}>
            {/* Reply preview — click to jump to original message */}
            {msg.reply_to && (
              <button
                onClick={() => scrollToMessage(msg.reply_to!.id)}
                className="px-2 py-1.5 rounded-lg border-l-2 border-zinc-400 dark:border-zinc-500 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 transition-colors text-left w-full cursor-pointer"
              >
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-0.5">{msg.reply_to.author.full_name}</p>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2">{msg.reply_to.text}</p>
              </button>
            )}

            {/* Text + non-audio attachments bubble */}
            {hasBubble && (
              <div
                className={`px-3 py-2 rounded-2xl text-[13px] leading-relaxed break-words ${
                  isOwn
                    ? "bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-tr-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-sm"
                }`}
              >
                {msg.text}
                {otherAtts.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {otherAtts.map((att) => {
                      return (
                        <a
                          key={att.id}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] ${
                            isOwn
                              ? "bg-zinc-800 dark:bg-zinc-200 text-zinc-300 dark:text-zinc-700"
                              : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                          }`}
                        >
                          <FileText className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[140px]">{att.file_name}</span>
                          <span className="shrink-0 opacity-60">{formatFileSize(att.file_size)}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Poll */}
            {msg.poll && (
              <PollDisplay
                poll={msg.poll}
                isOwn={isOwn}
                currentEmployeeId={currentEmployeeId}
                onVote={(optionId) => votePoll.mutate(optionId)}
                onUnvote={(optionId) => unvotePoll.mutate(optionId)}
                hasVoted={hasVoted}
              />
            )}

            {/* Images, audio, video — rendered bare, no bubble wrapper */}
            {bareAtts.map((att) => {
              if (att.mime_type.startsWith("image/")) {
                return (
                  <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer">
                    <img src={att.url} alt={att.file_name} className="max-w-[220px] rounded-xl" />
                  </a>
                );
              }
              if (isAudio(att.mime_type, att.file_name)) {
                return <AudioPlayer key={att.id} src={att.url} isOwn={isOwn} />;
              }
              return att.file_name.startsWith("video-message")
                ? <CircularVideoPlayer key={att.id} src={att.url} />
                : <video key={att.id} src={att.url} controls className="rounded-xl" style={{ maxWidth: 220, maxHeight: 160 }} />;
            })}
          </div>

          {/* Action buttons — hover on desktop, long-press on mobile */}
          <div className={`flex flex-col items-center gap-0.5 transition-opacity shrink-0 mb-1 ${actionsVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
            <button
              onClick={() => { onReply(msg); setActionsVisible(false); }}
              className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              title="Reply"
            >
              <Reply className="w-3.5 h-3.5" />
            </button>
            {isOwn && (
              <button
                onClick={() => { onDelete(msg.id); setActionsVisible(false); }}
                className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {isSameAuthor && (
          <span className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-0.5 px-1">
            {formatTime(msg.created_at)}
          </span>
        )}
      </div>
    </div>
  );
}

export function BoardChat({ boardId, boardName, memberCount, defaultOpen = false }: BoardChatProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<ChatReplyTo | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [videoSeconds, setVideoSeconds] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // ── Drag & resize (desktop only) ─────────────────────────────────────────
  const [panelPos, setPanelPos] = useState<{ x: number; y: number } | null>(null);
  const [panelSize, setPanelSize] = useState({ w: 384, h: 520 });
  const dragData = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);
  const resizeData = useRef<{ sx: number; sy: number; sw: number; sh: number } | null>(null);

  const onDragStart = (e: React.MouseEvent) => {
    if (window.innerWidth < 640) return;
    e.preventDefault();
    const rect = panelRef.current!.getBoundingClientRect();
    const px = panelPos?.x ?? rect.left;
    const py = panelPos?.y ?? rect.top;
    dragData.current = { sx: e.clientX, sy: e.clientY, px, py };

    const onMove = (ev: MouseEvent) => {
      if (!dragData.current) return;
      const { sx, sy, px, py } = dragData.current;
      setPanelPos({
        x: Math.max(0, Math.min(window.innerWidth - panelSize.w, px + ev.clientX - sx)),
        y: Math.max(0, Math.min(window.innerHeight - 80, py + ev.clientY - sy)),
      });
    };
    const onUp = () => {
      dragData.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const onResizeStart = (e: React.MouseEvent) => {
    if (window.innerWidth < 640) return;
    e.preventDefault();
    e.stopPropagation();
    resizeData.current = { sx: e.clientX, sy: e.clientY, sw: panelSize.w, sh: panelSize.h };

    const onMove = (ev: MouseEvent) => {
      if (!resizeData.current) return;
      const { sx, sy, sw, sh } = resizeData.current;
      setPanelSize({
        w: Math.max(280, Math.min(window.innerWidth - 40, sw + ev.clientX - sx)),
        h: Math.max(320, Math.min(window.innerHeight - 80, sh + ev.clientY - sy)),
      });
    };
    const onUp = () => {
      resizeData.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const videoMrRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const videoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [showPollComposer, setShowPollComposer] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);

  const { user } = useAuth();
  const { data: currentEmployee } = useMe();
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessages(boardId);
  const sendMessage = useSendMessage(boardId);
  const deleteMessage = useDeleteMessage(boardId);
  const createPoll = useCreatePoll(boardId);

  useChatWebSocket(boardId);

  const messages = data?.pages.flatMap((page) => page) ?? [];
  const prevScrollHeightRef = useRef<number>(0);

  // Scroll to bottom when chat opens
  const prevIsOpenRef = useRef(false);
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "instant" }), 0);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  // Scroll to bottom when a new message arrives
  const newestMsgId = messages.length > 0
    ? Math.max(...messages.map((m) => m.id))
    : null;
  const prevNewestMsgIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (!isOpen) return;
    if (newestMsgId !== null && newestMsgId !== prevNewestMsgIdRef.current) {
      prevNewestMsgIdRef.current = newestMsgId;
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [newestMsgId, isOpen]);

  // Preserve scroll position when older messages are prepended
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    if (isFetchingNextPage) {
      prevScrollHeightRef.current = el.scrollHeight;
    } else if (prevScrollHeightRef.current > 0) {
      el.scrollTop += el.scrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = 0;
    }
  }, [isFetchingNextPage]);

  const handleMessagesScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distanceFromBottom > 120);
    if (el.scrollTop < 80 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (isVideoRecording && videoPreviewRef.current && videoStreamRef.current) {
      videoPreviewRef.current.srcObject = videoStreamRef.current;
      videoPreviewRef.current.play().catch(() => {});
    }
  }, [isVideoRecording]);

  const handleSend = () => {
    const trimmed = input.trim();
    if ((!trimmed && pendingFiles.length === 0) || sendMessage.isPending) return;
    sendMessage.mutate({
      text: trimmed,
      reply_to_id: replyTo?.id,
      files: pendingFiles.length > 0 ? pendingFiles : undefined,
    });
    setInput("");
    setReplyTo(null);
    setPendingFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReply = (msg: ChatMessage) => {
    setReplyTo({ id: msg.id, text: msg.text, author: msg.author });
    inputRef.current?.focus();
  };

  const handleCreatePoll = () => {
    const validOptions = pollOptions.map((o) => o.trim()).filter(Boolean);
    if (!pollQuestion.trim() || validOptions.length < 2) return;
    createPoll.mutate(
      { question: pollQuestion.trim(), options: validOptions },
      {
        onSuccess: () => {
          setShowPollComposer(false);
          setPollQuestion("");
          setPollOptions(["", ""]);
        },
      }
    );
  };

  const startRecording = async () => {
    setMicError(null);
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setMicError("Microphone requires HTTPS or localhost.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start();
      mediaRecorderRef.current = mr;
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } catch (err: unknown) {
      const name = err instanceof Error ? err.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setMicError("Microphone access denied. Allow it in browser settings.");
      } else {
        setMicError("Could not access microphone.");
      }
    }
  };

  const stopRecording = (send: boolean) => {
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    mr.onstop = () => {
      if (send && chunksRef.current.length > 0) {
        const mimeType = mr.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const ext = mimeType.includes("ogg") ? "ogg" : mimeType.includes("mp4") ? "m4a" : "webm";
        const file = new File([blob], `voice-message.${ext}`, { type: mimeType });
        sendMessage.mutate({ text: "", reply_to_id: replyTo?.id, files: [file] });
        if (send) setReplyTo(null);
      }
      mr.stream.getTracks().forEach((t) => t.stop());
    };
    mr.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current = null;
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const startVideoRecording = async () => {
    setMicError(null);
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setMicError("Camera requires HTTPS or localhost.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 400 }, height: { ideal: 400 } },
        audio: true,
      });
      videoStreamRef.current = stream;
      const mr = new MediaRecorder(stream);
      videoChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) videoChunksRef.current.push(e.data); };
      mr.start();
      videoMrRef.current = mr;
      setIsVideoRecording(true);
      setVideoSeconds(0);
      videoTimerRef.current = setInterval(() => setVideoSeconds((s) => s + 1), 1000);
    } catch (err: unknown) {
      const name = err instanceof Error ? err.name : "";
      setMicError(name === "NotAllowedError" ? "Camera access denied." : "Could not access camera.");
    }
  };

  const stopVideoRecording = (send: boolean) => {
    const mr = videoMrRef.current;
    if (!mr) return;
    mr.onstop = () => {
      if (send && videoChunksRef.current.length > 0) {
        const mimeType = mr.mimeType || "video/webm";
        const ext = mimeType.includes("mp4") ? "mp4" : "webm";
        const blob = new Blob(videoChunksRef.current, { type: mimeType });
        const file = new File([blob], `video-message.${ext}`, { type: mimeType });
        sendMessage.mutate({ text: "", reply_to_id: replyTo?.id, files: [file] });
        if (send) setReplyTo(null);
      }
      mr.stream.getTracks().forEach((t) => t.stop());
      videoStreamRef.current = null;
      if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
    };
    mr.stop();
    if (videoTimerRef.current) clearInterval(videoTimerRef.current);
    videoMrRef.current = null;
    setIsVideoRecording(false);
    setVideoSeconds(0);
  };

  const showMic = !input.trim() && pendingFiles.length === 0;

  return (
    <>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${
          isOpen ? "sm:flex hidden" : "flex"
        } ${
          isOpen
            ? "bg-zinc-700 dark:bg-zinc-600 text-white"
            : "bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:scale-105"
        }`}
        title="Board chat"
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>

      <div
        ref={panelRef}
        className={`fixed z-50 flex flex-col bg-white dark:bg-zinc-900 transition-[opacity,transform] duration-200
          inset-0 rounded-none
          sm:inset-auto sm:rounded-xl sm:shadow-2xl sm:border sm:border-zinc-200 sm:dark:border-zinc-800 sm:origin-bottom-right
          ${isOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
        style={
          window.innerWidth >= 640
            ? panelPos
              ? { left: panelPos.x, top: panelPos.y, width: panelSize.w, height: panelSize.h }
              : { bottom: 88, right: 24, width: panelSize.w, height: panelSize.h }
            : undefined
        }
      >
        {/* Header — drag handle on desktop */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0 sm:cursor-grab sm:active:cursor-grabbing select-none"
          onMouseDown={onDragStart}
        >
          <div>
            <p className="text-[13px] text-zinc-900 dark:text-zinc-100 font-medium leading-tight">{boardName}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Users className="w-3 h-3 text-zinc-400" />
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                {memberCount} {memberCount === 1 ? "member" : "members"}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>

        {/* Messages */}
        <div className="relative flex-1 min-h-0 flex flex-col">
          <div ref={messagesContainerRef} onScroll={handleMessagesScroll} className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
          {isLoading && (
            <p className="text-[12px] text-zinc-400 dark:text-zinc-600 text-center py-8">Loading messages…</p>
          )}
          {isFetchingNextPage && (
            <p className="text-[11px] text-zinc-400 dark:text-zinc-600 text-center py-2">Loading older messages…</p>
          )}
          {!isLoading && messages.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle className="w-8 h-8 text-zinc-200 dark:text-zinc-700 mx-auto mb-2" />
              <p className="text-[12px] text-zinc-400 dark:text-zinc-600">No messages yet.</p>
              <p className="text-[11px] text-zinc-300 dark:text-zinc-700 mt-0.5">Be the first to say something!</p>
            </div>
          )}
          {[...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((msg, idx, sorted) => {
            const isOwn = msg.author.id === currentEmployee?.id || msg.author.id === user?.id;
            const prevMsg = sorted[idx - 1];
            const isSameAuthor = !!prevMsg && prevMsg.author.id === msg.author.id;
            return (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isOwn={isOwn}
                isSameAuthor={isSameAuthor}
                onReply={handleReply}
                onDelete={(id) => deleteMessage.mutate(id)}
                boardId={boardId}
                currentEmployeeId={currentEmployee?.id}
              />
            );
          })}
          <div ref={bottomRef} />
          </div>
          {showScrollBtn && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-[11px] shadow-lg hover:opacity-90 transition-opacity pointer-events-auto"
            >
              <ChevronsDown className="w-3.5 h-3.5" />
              Latest
            </button>
          )}
        </div>

        {/* Poll composer */}
        {showPollComposer && (
          <div className="px-3 py-3 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 shrink-0 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <BarChart2 className="w-3 h-3" /> Create poll
              </span>
              <button onClick={() => setShowPollComposer(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              type="text"
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              placeholder="Question…"
              className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-[12px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
            />
            <div className="space-y-1.5">
              {pollOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => setPollOptions((prev) => prev.map((o, j) => j === i ? e.target.value : o))}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-[12px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                  />
                  {pollOptions.length > 2 && (
                    <button
                      onClick={() => setPollOptions((prev) => prev.filter((_, j) => j !== i))}
                      className="text-zinc-400 hover:text-red-400 transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <button
                onClick={() => setPollOptions((prev) => [...prev, ""])}
                disabled={pollOptions.length >= 6}
                className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 disabled:opacity-30 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add option
              </button>
              <button
                onClick={handleCreatePoll}
                disabled={!pollQuestion.trim() || pollOptions.filter((o) => o.trim()).length < 2 || createPoll.isPending}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-[11px] font-medium hover:bg-zinc-700 dark:hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {createPoll.isPending ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        )}

        {/* Reply banner */}
        {replyTo && <ReplyBanner replyTo={replyTo} onClear={() => setReplyTo(null)} />}

        {/* Pending files */}
        {pendingFiles.length > 0 && (
          <div className="px-3 pt-2 flex flex-wrap gap-1.5 shrink-0">
            {pendingFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-[11px] text-zinc-600 dark:text-zinc-400">
                <Paperclip className="w-3 h-3" />
                <span className="max-w-[100px] truncate">{f.name}</span>
                <button onClick={() => setPendingFiles((p) => p.filter((_, idx) => idx !== i))} className="text-zinc-400 hover:text-red-400">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Video recording circular preview */}
        {isVideoRecording && (
          <div className="flex flex-col items-center gap-3 py-5 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
            <div className="relative w-[160px] h-[160px]">
              <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-pulse" />
              <div className="absolute inset-1.5 rounded-full overflow-hidden bg-zinc-900">
                <video ref={videoPreviewRef} muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
              </div>
              <div className="absolute bottom-3 right-3 bg-black/60 rounded-full px-1.5 py-0.5">
                <span className="text-[9px] text-white tabular-nums">
                  {Math.floor(videoSeconds / 60)}:{String(videoSeconds % 60).padStart(2, "0")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <button onClick={() => stopVideoRecording(false)} className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => stopVideoRecording(true)}
                className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 flex items-center justify-center hover:bg-zinc-700 dark:hover:bg-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-3 py-3 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
          {isVideoRecording ? null : isRecording ? (
            <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5">
              {/* Cancel */}
              <button
                onClick={() => stopRecording(false)}
                className="p-1 text-zinc-400 hover:text-red-500 transition-colors shrink-0"
                title="Cancel"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Waveform bars + timer */}
              <div className="flex-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                <div className="flex items-end gap-[3px] h-5">
                  {[0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8, 0.4, 0.7, 1].map((h, i) => (
                    <span
                      key={i}
                      className="w-[3px] rounded-full bg-zinc-400 dark:bg-zinc-500 animate-pulse"
                      style={{
                        height: `${h * 100}%`,
                        animationDelay: `${i * 80}ms`,
                        animationDuration: `${600 + i * 50}ms`,
                      }}
                    />
                  ))}
                </div>
                <span className="text-[12px] text-zinc-500 dark:text-zinc-400 tabular-nums">
                  {Math.floor(recordingSeconds / 60)}:{String(recordingSeconds % 60).padStart(2, "0")}
                </span>
              </div>

              {/* Send */}
              <button
                onClick={() => stopRecording(true)}
                className="p-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-white transition-colors shrink-0"
                title="Send voice message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-end gap-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors shrink-0 mb-0.5"
                title="Attach file"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowPollComposer((v) => !v)}
                className={`p-1 transition-colors shrink-0 mb-0.5 ${showPollComposer ? "text-zinc-700 dark:text-zinc-200" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"}`}
                title="Create poll"
              >
                <BarChart2 className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => setPendingFiles((p) => [...p, ...Array.from(e.target.files ?? [])])}
              />
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message board members…"
                rows={1}
                className="flex-1 resize-none bg-transparent text-[13px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none max-h-24 leading-relaxed"
                style={{ scrollbarWidth: "none" }}
              />
              {showMic ? (
                <div className="flex items-center gap-0.5 shrink-0 mb-0.5">
                  <button
                    onClick={startRecording}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    title="Voice message"
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={startVideoRecording}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    title="Video message"
                  >
                    <Video className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={sendMessage.isPending}
                  className="p-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 mb-0.5"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
          {!isRecording && !isVideoRecording && (
            micError ? (
              <p className="text-[10px] text-red-500 mt-1.5 px-1">{micError}</p>
            ) : (
              <p className="text-[10px] text-zinc-300 dark:text-zinc-700 mt-1.5 px-1">
                Enter to send · Shift+Enter for new line
              </p>
            )
          )}
        </div>

        {/* Resize grip — desktop only */}
        <div
          onMouseDown={onResizeStart}
          className="hidden sm:block absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-10"
          style={{ touchAction: "none" }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" className="absolute bottom-1 right-1 text-zinc-300 dark:text-zinc-600">
            <path d="M11 1L1 11M11 6L6 11M11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </>
  );
}
