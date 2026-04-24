import { Employee } from "../data/mockData";

interface TeamWorkloadProps {
  employees: Employee[];
}

const workloadColors = {
  low: "bg-zinc-700",
  normal: "bg-blue-500",
  high: "bg-orange-500",
};

const workloadLabels = {
  low: "Low",
  normal: "Normal",
  high: "High",
};

export function TeamWorkload({ employees }: TeamWorkloadProps) {
  return (
    <div className="space-y-2">
      {employees.map((employee) => (
        <div
          key={employee.id}
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
        >
          <div className={`w-1.5 h-1.5 rounded-full ${workloadColors[employee.workload]} shrink-0`} />
          <span className="text-[13px] text-foreground flex-1">{employee.name}</span>
          <span className="text-[11px] text-muted-foreground">{workloadLabels[employee.workload]}</span>
        </div>
      ))}
    </div>
  );
}
