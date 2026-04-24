import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Users } from "lucide-react";
import { useChatMessages, useSendMessage } from "../../hooks/useChat";
import { useAuth } from "../context/AuthContext";

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
  if (isToday) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function BoardChat({ boardId, boardName, memberCount }: BoardChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { user } = useAuth();
  const { data: messages = [], isLoading } = useChatMessages(boardId);
  const sendMessage = useSendMessage(boardId);

  // Scroll to bottom whenever messages change or panel opens
  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || sendMessage.isPending) return;
    setInput("");
    sendMessage.mutate(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating trigger button — hidden on mobile when panel is open (close button inside panel handles it) */}
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

      {/* Chat panel
          Mobile  : full screen (inset-0, rounded-none)
          Desktop : floating bottom-right panel                */}
      <div
        className={`fixed z-50 flex flex-col bg-white dark:bg-zinc-900 transition-all duration-200
          inset-0 rounded-none
          sm:inset-auto sm:bottom-22 sm:right-6 sm:w-96 sm:rounded-xl sm:shadow-2xl sm:border sm:border-zinc-200 sm:dark:border-zinc-800 sm:origin-bottom-right sm:max-h-[70vh]
          ${isOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
      >
        {/* Panel header */}
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

        {/* Messages area */}
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

          {messages.map((msg, idx) => {
            const isOwn = String(msg.user_id) === String(user?.id);
            const prevMsg = messages[idx - 1];
            const isSameAuthor = prevMsg && prevMsg.user_id === msg.user_id;

            return (
              <div key={msg.id} className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
                {/* Avatar — only show for first message in a group */}
                <div className="shrink-0 w-7 h-7 mt-0.5">
                  {!isSameAuthor && (
                    <>
                      {msg.author_photo ? (
                        <img
                          src={msg.author_photo}
                          alt={msg.author_name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                          <span className="text-[10px] text-zinc-600 dark:text-zinc-300 font-medium">
                            {msg.author_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className={`flex flex-col max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
                  {/* Name + time — only for first in group */}
                  {!isSameAuthor && (
                    <div className={`flex items-baseline gap-1.5 mb-1 ${isOwn ? "flex-row-reverse" : ""}`}>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                        {isOwn ? "You" : msg.author_name}
                      </span>
                      <span className="text-[10px] text-zinc-300 dark:text-zinc-600">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`px-3 py-2 rounded-2xl text-[13px] leading-relaxed break-words ${
                      isOwn
                        ? "bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-tr-sm"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Timestamp for grouped messages */}
                  {isSameAuthor && (
                    <span className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-0.5 px-1">
                      {formatTime(msg.created_at)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="px-3 py-3 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-end gap-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2">
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
            <button
              onClick={handleSend}
              disabled={!input.trim() || sendMessage.isPending}
              className="p-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 mb-0.5"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[10px] text-zinc-300 dark:text-zinc-700 mt-1.5 px-1">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  );
}
