import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useMyGamificationStats } from "./useGamification";

const LEVEL_NAMES: Record<number, string> = {
  1: "Novice",
  2: "Contributor",
  3: "Performer",
  4: "Expert",
  5: "Elite",
  6: "Legend",
};

// Polls the user's gamification stats and fires a toast when the level increases.
// Mount this once in a high-level layout component.
export function useLevelUpNotifier() {
  const { data: stats } = useMyGamificationStats();
  const prevLevelRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stats) return;
    const currentLevel = stats.current_level;

    if (prevLevelRef.current !== null && currentLevel > prevLevelRef.current) {
      const name = LEVEL_NAMES[currentLevel] ?? `Level ${currentLevel}`;
      toast.success(`Level up! You reached ${name} 🎉`, {
        description: `You're now level ${currentLevel}`,
        duration: 5000,
      });
    }

    prevLevelRef.current = currentLevel;
  }, [stats?.current_level]);
}
