import { X, ExternalLink, ChevronDown, ChevronUp, Eye, EyeOff, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useImportNotionV2 } from "../../hooks/useBoards";

interface NotionImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PARSE_STEPS = [
  "Connecting to Notion workspace…",
  "Authenticating integration token…",
  "Reading database schema…",
  "Scanning pages and entries…",
  "Parsing task properties…",
  "Converting to board format…",
  "Building your board…",
  "Almost done…",
];

// Each step duration in ms — total ~8 s of animation
const STEP_DURATIONS = [900, 1000, 1100, 1200, 1100, 900, 1000, 800];

const NOTION_ICON = (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
  </svg>
);

function Particle({ delay, duration }: { delay: number; duration: number }) {
  return (
    <motion.div
      className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-400"
      initial={{ left: "10%", opacity: 0, scale: 0.5 }}
      animate={{
        left: ["10%", "88%"],
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1, 1, 0.5],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay: 0.2,
        ease: "easeInOut",
      }}
    />
  );
}

function ParsingAnimation({ stepIndex, done }: { stepIndex: number; done: boolean }) {
  const progress = done ? 100 : Math.min(((stepIndex + 1) / PARSE_STEPS.length) * 100, 95);
  const visibleSteps = done ? PARSE_STEPS.length : stepIndex + 1;

  return (
    <div className="flex flex-col items-center gap-8 py-8 px-6">
      {/* Pipeline visualizer */}
      <div className="w-full flex items-center gap-4">
        <motion.div
          className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2.5 shadow-sm shrink-0"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {NOTION_ICON}
        </motion.div>

        {/* Animated pipe */}
        <div className="flex-1 relative h-6">
          <div className="absolute top-1/2 -translate-y-1/2 w-full h-px bg-zinc-200 dark:bg-zinc-700 rounded-full" />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 h-px bg-zinc-400 dark:bg-zinc-400 rounded-full origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress / 100 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ width: "100%" }}
          />
          <Particle delay={0} duration={1.4} />
          <Particle delay={0.5} duration={1.6} />
          <Particle delay={1.0} duration={1.3} />
          <Particle delay={1.5} duration={1.5} />
        </div>

        <motion.div
          className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2.5 shadow-sm shrink-0 flex items-center justify-center"
          animate={done ? { scale: [1, 1.12, 1] } : {}}
          transition={{ duration: 0.5, repeat: done ? 2 : 0 }}
        >
          <svg className="w-full h-full text-zinc-600 dark:text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className="w-full space-y-1.5">
        <div className="flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500">
          <span>{done ? "Complete" : "Importing"}</span>
          <motion.span
            key={Math.round(progress)}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {Math.round(progress)}%
          </motion.span>
        </div>
        <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-zinc-700 dark:bg-zinc-300 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Step log */}
      <div className="w-full space-y-2">
        <AnimatePresence initial={false}>
          {PARSE_STEPS.slice(0, visibleSteps).map((step, i) => {
            const isDone = done || i < stepIndex;
            const isCurrent = !done && i === stepIndex;
            return (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -12, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex items-center gap-2.5"
              >
                {isDone ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0"
                  >
                    <Check className="w-2.5 h-2.5 text-zinc-600 dark:text-zinc-300" />
                  </motion.div>
                ) : isCurrent ? (
                  <motion.div
                    className="w-4 h-4 rounded-full border-2 border-zinc-400 dark:border-zinc-500 border-t-transparent shrink-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                ) : null}
                <span
                  className={`text-[12px] font-mono ${
                    isCurrent
                      ? "text-zinc-800 dark:text-zinc-200"
                      : "text-zinc-400 dark:text-zinc-500"
                  }`}
                >
                  {step}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function NotionImportModal({ isOpen, onClose }: NotionImportModalProps) {
  const [databaseId, setDatabaseId] = useState("");
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(true);

  // Animation state — independent from API state
  const [isAnimating, setIsAnimating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [animationDone, setAnimationDone] = useState(false);

  // API result buffered until animation finishes
  const apiResultRef = useRef<{ ok: boolean; error?: unknown } | null>(null);
  const importNotion = useImportNotionV2();

  // Run through all steps at a fixed pace whenever isAnimating turns on
  useEffect(() => {
    if (!isAnimating) return;

    let idx = 0;
    setStepIndex(0);
    setAnimationDone(false);

    const tick = () => {
      idx += 1;
      if (idx < PARSE_STEPS.length) {
        setStepIndex(idx);
        timer = setTimeout(tick, STEP_DURATIONS[idx]);
      } else {
        // All steps shown — mark animation done, then check if API already resolved
        setAnimationDone(true);
      }
    };

    let timer = setTimeout(tick, STEP_DURATIONS[0]);
    return () => clearTimeout(timer);
  }, [isAnimating]);

  // Once animation finishes, resolve whatever the API returned
  useEffect(() => {
    if (!animationDone) return;
    const result = apiResultRef.current;
    if (!result) return; // API still in flight — wait for it below

    if (result.ok) {
      // Small pause so user sees 100 %
      const t = setTimeout(() => {
        setIsAnimating(false);
        setAnimationDone(false);
        apiResultRef.current = null;
        setDatabaseId("");
        setToken("");
        onClose();
      }, 600);
      return () => clearTimeout(t);
    } else {
      // Error — stop animation, let react-query's global toast show it
      setIsAnimating(false);
      setAnimationDone(false);
      apiResultRef.current = null;
    }
  }, [animationDone, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!databaseId.trim() || !token.trim()) return;

    apiResultRef.current = null;
    setIsAnimating(true);

    try {
      await importNotion.mutateAsync({
        database_id: databaseId.trim(),
        token: token.trim(),
      });
      apiResultRef.current = { ok: true };
    } catch (err) {
      apiResultRef.current = { ok: false, error: err };
    }

    // If animation already finished while API was in-flight, trigger resolution
    // by toggling animationDone — the effect above will pick it up
    setAnimationDone((prev) => {
      if (prev) {
        // re-fire the effect by flipping and immediately resetting via a microtask
        setTimeout(() => setAnimationDone(true), 0);
        return false;
      }
      return prev;
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={isAnimating ? undefined : onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg w-full max-w-lg shadow-2xl flex flex-col"
          style={{ maxHeight: "90vh" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 text-zinc-900 dark:text-zinc-100">{NOTION_ICON}</div>
              <h2 className="text-[15px] text-zinc-900 dark:text-zinc-100">
                {isAnimating ? "Importing your database…" : "Import from Notion"}
              </h2>
            </div>
            {!isAnimating && (
              <button
                onClick={onClose}
                className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Body */}
          <AnimatePresence mode="wait">
            {isAnimating ? (
              <motion.div
                key="parsing"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="flex-1"
              >
                <ParsingAnimation stepIndex={stepIndex} done={animationDone} />
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="overflow-y-auto flex-1"
              >
                {/* Tutorial */}
                <div className="px-6 pt-5">
                  <button
                    type="button"
                    onClick={() => setTutorialOpen((v) => !v)}
                    className="w-full flex items-center justify-between text-[12px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors mb-1"
                  >
                    <span className="font-medium uppercase tracking-wide text-[10px]">How to get your credentials</span>
                    {tutorialOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <AnimatePresence initial={false}>
                    {tutorialOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-md bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 p-4 space-y-4 mb-5">
                          <div>
                            <p className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                              Step 1 — Create a Notion integration & get your token
                            </p>
                            <ol className="space-y-1 text-[11px] text-zinc-500 dark:text-zinc-400 list-decimal list-inside">
                              <li>Go to <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-zinc-700 dark:text-zinc-300 underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100">notion.so/my-integrations</a></li>
                              <li>Click <span className="font-medium text-zinc-600 dark:text-zinc-300">+ New integration</span></li>
                              <li>Give it a name and click <span className="font-medium text-zinc-600 dark:text-zinc-300">Submit</span></li>
                              <li>Copy the <span className="font-medium text-zinc-600 dark:text-zinc-300">Internal Integration Token</span> (starts with <code className="bg-zinc-200 dark:bg-zinc-700 px-1 rounded text-[10px]">secret_</code>)</li>
                            </ol>
                          </div>

                          <div>
                            <p className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                              Step 2 — Get your Database ID
                            </p>
                            <ol className="space-y-1 text-[11px] text-zinc-500 dark:text-zinc-400 list-decimal list-inside">
                              <li>Open the Notion database you want to import</li>
                              <li>Click <span className="font-medium text-zinc-600 dark:text-zinc-300">Share</span> → <span className="font-medium text-zinc-600 dark:text-zinc-300">Invite</span> your integration</li>
                              <li>Copy the page URL — the Database ID is the 32-character string before <code className="bg-zinc-200 dark:bg-zinc-700 px-1 rounded text-[10px]">?v=</code></li>
                            </ol>
                            <div className="mt-2 px-2.5 py-2 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono break-all">
                                notion.so/workspace/<span className="text-zinc-700 dark:text-zinc-200 font-semibold">8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d</span>?v=…
                              </p>
                            </div>
                          </div>

                          <a
                            href="https://developers.notion.com/docs/getting-started"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Full Notion API documentation
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Form */}
                <form id="notion-form" onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
                  <div>
                    <label htmlFor="notion-token" className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-2">
                      Integration token <span className="text-zinc-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="notion-token"
                        type={showToken ? "text" : "password"}
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full px-3 py-2 pr-9 text-[13px] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken((v) => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                      >
                        {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="notion-db-id" className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-2">
                      Database ID <span className="text-zinc-400">*</span>
                    </label>
                    <input
                      id="notion-db-id"
                      type="text"
                      value={databaseId}
                      onChange={(e) => setDatabaseId(e.target.value)}
                      placeholder="8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d"
                      className="w-full px-3 py-2 text-[13px] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 font-mono"
                      required
                    />
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          {!isAnimating && (
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="text-[12px] px-4 py-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="notion-form"
                disabled={!databaseId.trim() || !token.trim()}
                className="text-[12px] px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-700 dark:hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import database
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
