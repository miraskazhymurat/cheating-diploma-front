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
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-900/30 transition-colors"
        >
          <div className={`w-1.5 h-1.5 rounded-full ${workloadColors[employee.workload]} shrink-0`} />
          <span className="text-[13px] text-zinc-100 flex-1">{employee.name}</span>
          <span className="text-[11px] text-zinc-500">{workloadLabels[employee.workload]}</span>
        </div>
      ))}
    </div>
  );
}
