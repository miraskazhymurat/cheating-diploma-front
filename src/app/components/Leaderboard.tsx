import { Trophy } from "lucide-react";
import { Employee } from "../data/mockData";

interface LeaderboardProps {
  employees: Employee[];
}

const medalColors = [
  "text-yellow-500",
  "text-zinc-400",
  "text-orange-600",
];

export function Leaderboard({ employees }: LeaderboardProps) {
  const topThree = [...employees]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <div className="space-y-2">
      {topThree.map((employee, index) => (
        <div
          key={employee.id}
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
        >
          <Trophy className={`w-3.5 h-3.5 ${medalColors[index]} shrink-0`} />
          <span className="text-[13px] text-foreground flex-1">{employee.name}</span>
          <span className="text-[12px] text-muted-foreground tabular-nums">{employee.score}</span>
        </div>
      ))}
    </div>
  );
}
