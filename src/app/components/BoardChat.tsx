import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Users, Reply, Paperclip, FileText, Play, Pause, Music, Mic, Trash2 } from "lucide-react";
import { useChatMessages, useSendMessage } from "../../hooks/useChat";
import { useAuth } from "../context/AuthContext";
import type { ChatMessage, ChatReplyTo } from "../../api/chat";

function formatDuration(s: number) {
  if (!isFinite(s)) return "--:--";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function AudioPlayer({ src, fileName, isOwn }: { src: string; fileName: string; isOwn: boolean }) {
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
        <div className="flex items-center gap-1 mb-1.5">
          <Music className={`w-2.5 h-2.5 shrink-0 ${isOwn ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-500 dark:text-zinc-400"}`} />
          <span className={`text-[10px] truncate ${isOwn ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-500 dark:text-zinc-400"}`}>
            {fileName}
          </span>
        </div>
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

const audioExts = /\.(mp3|wav|ogg|oga|opus|m4a|aac|flac|weba|webm)$/i;
const isAudio = (mime: string, name: string) => mime.startsWith("audio/") || audioExts.test(name);
const isVideo = (mime: string) => mime.startsWith("video/");
const isMediaBare = (mime: string, name: string) => isAudio(mime, name) || isVideo(mime);

function MessageBubble({
  msg,
  isOwn,
  isSameAuthor,
  onReply,
}: {
  msg: ChatMessage;
  isOwn: boolean;
  isSameAuthor: boolean;
  onReply: (msg: ChatMessage) => void;
}) {
  const bareAtts = msg.attachments.filter((a) => isMediaBare(a.mime_type, a.file_name));
  const otherAtts = msg.attachments.filter((a) => !isMediaBare(a.mime_type, a.file_name));
  const hasBubble = !!msg.text || otherAtts.length > 0 || !!msg.reply_to;

  return (
    <div className={`flex gap-2 group ${isOwn ? "flex-row-reverse" : ""}`}>
      <div className="shrink-0 w-7 h-7 mt-0.5">
        {!isSameAuthor && <Avatar name={msg.author.full_name} photo={msg.author.photo || undefined} />}
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
          <div className="flex flex-col gap-1">
            {/* Reply preview */}
            {msg.reply_to && (
              <div className="px-2 py-1.5 rounded-lg border-l-2 border-zinc-400 dark:border-zinc-500 bg-zinc-100 dark:bg-zinc-800/80">
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-0.5">{msg.reply_to.author.full_name}</p>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2">{msg.reply_to.text}</p>
              </div>
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
                      if (att.mime_type.startsWith("image/")) {
                        return (
                          <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer">
                            <img src={att.url} alt={att.file_name} className="max-w-[200px] rounded-lg mt-1" />
                          </a>
                        );
                      }
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

            {/* Audio/video — rendered bare, no bubble wrapper */}
            {bareAtts.map((att) =>
              isAudio(att.mime_type, att.file_name) ? (
                <AudioPlayer key={att.id} src={att.url} fileName={att.file_name} isOwn={isOwn} />
              ) : (
                <video key={att.id} src={att.url} controls className="rounded-xl mt-1" style={{ maxWidth: 220, maxHeight: 160 }} />
              )
            )}
          </div>

          {/* Reply button */}
          <button
            onClick={() => onReply(msg)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 shrink-0 mb-1"
            title="Reply"
          >
            <Reply className="w-3.5 h-3.5" />
          </button>
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

export function BoardChat({ boardId, boardName, memberCount }: BoardChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<ChatReplyTo | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { user } = useAuth();
  const { data: messages = [], isLoading } = useChatMessages(boardId);
  const sendMessage = useSendMessage(boardId);

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

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
        className={`fixed z-50 flex flex-col bg-white dark:bg-zinc-900 transition-all duration-200
          inset-0 rounded-none
          sm:inset-auto sm:bottom-22 sm:right-6 sm:w-96 sm:rounded-xl sm:shadow-2xl sm:border sm:border-zinc-200 sm:dark:border-zinc-800 sm:origin-bottom-right sm:max-h-[70vh]
          ${isOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
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
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
          {isLoading && (
            <p className="text-[12px] text-zinc-400 dark:text-zinc-600 text-center py-8">Loading messages…</p>
          )}
          {!isLoading && messages.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle className="w-8 h-8 text-zinc-200 dark:text-zinc-700 mx-auto mb-2" />
              <p className="text-[12px] text-zinc-400 dark:text-zinc-600">No messages yet.</p>
              <p className="text-[11px] text-zinc-300 dark:text-zinc-700 mt-0.5">Be the first to say something!</p>
            </div>
          )}
          {[...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((msg, idx, sorted) => {
            const isOwn = msg.author.id === user?.id;
            const prevMsg = sorted[idx - 1];
            const isSameAuthor = !!prevMsg && prevMsg.author.id === msg.author.id;
            return (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isOwn={isOwn}
                isSameAuthor={isSameAuthor}
                onReply={handleReply}
              />
            );
          })}
          <div ref={bottomRef} />
        </div>

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

        {/* Input */}
        <div className="px-3 py-3 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
          {isRecording ? (
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
                <button
                  onClick={startRecording}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shrink-0 mb-0.5"
                  title="Record voice message"
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
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
          {!isRecording && (
            micError ? (
              <p className="text-[10px] text-red-500 mt-1.5 px-1">{micError}</p>
            ) : (
              <p className="text-[10px] text-zinc-300 dark:text-zinc-700 mt-1.5 px-1">
                Enter to send · Shift+Enter for new line
              </p>
            )
          )}
        </div>
      </div>
    </>
  );
}
