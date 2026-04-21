import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { TaskStatus } from "../data/mockData";

export interface ActiveFilter {
  type: "status" | "assignee";
  value: string;
}

interface FilterPanelProps {
  availableStatuses: TaskStatus[];
  availableAssignees: string[];
  activeFilters: ActiveFilter[];
  onAddFilter: (filter: ActiveFilter) => void;
  onRemoveFilter: (filter: ActiveFilter) => void;
  onClearAll: () => void;
}

const statusLabels: Record<TaskStatus, string> = {
  todo: "Todo",
  "in-progress": "In Progress",
  done: "Done",
};

export function FilterPanel({
  availableStatuses,
  availableAssignees,
  activeFilters,
  onAddFilter,
  onRemoveFilter,
  onClearAll,
}: FilterPanelProps) {
  const [openDropdown, setOpenDropdown] = useState<"type" | "value" | null>(null);
  const [selectedFilterType, setSelectedFilterType] = useState<"status" | "assignee" | null>(null);

  const handleFilterTypeSelect = (type: "status" | "assignee") => {
    setSelectedFilterType(type);
    setOpenDropdown("value");
  };

  const handleFilterValueSelect = (value: string) => {
    if (selectedFilterType) {
      const newFilter: ActiveFilter = {
        type: selectedFilterType,
        value,
      };
      // Check if filter already exists
      const exists = activeFilters.some(
        (f) => f.type === newFilter.type && f.value === newFilter.value
      );
      if (!exists) {
        onAddFilter(newFilter);
      }
    }
    setOpenDropdown(null);
    setSelectedFilterType(null);
  };

  const getFilterOptions = () => {
    if (selectedFilterType === "status") {
      return availableStatuses.map((status) => ({
        label: statusLabels[status],
        value: status,
      }));
    } else if (selectedFilterType === "assignee") {
      return availableAssignees.map((assignee) => ({
        label: assignee,
        value: assignee,
      }));
    }
    return [];
  };

  const getFilterTypeLabel = (type: "status" | "assignee") => {
    return type === "status" ? "Status" : "Assignee";
  };

  return (
    <div className="space-y-4">
      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {activeFilters.map((filter) => (
            <div
              key={`${filter.type}-${filter.value}`}
              className="text-[11px] px-2 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-2"
            >
              <span>
                {getFilterTypeLabel(filter.type)}: {filter.type === "status" ? statusLabels[filter.value as TaskStatus] : filter.value}
              </span>
              <button
                onClick={() => onRemoveFilter(filter)}
                className="hover:text-zinc-100 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {activeFilters.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-[11px] px-2 py-1 text-zinc-400 hover:text-zinc-300 border border-zinc-700 rounded transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Add Filter Dropdown */}
      <div className="relative w-full">
        <button
          onClick={() => setOpenDropdown(openDropdown === "type" ? null : "type")}
          className="w-full text-left text-[12px] px-3 py-2 rounded-md bg-zinc-900/50 border border-zinc-800 text-zinc-300 hover:border-zinc-700 transition-colors flex items-center justify-between"
        >
          <span>+ Add Filter</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${
              openDropdown === "type" ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Filter Type Dropdown */}
        {openDropdown === "type" && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg z-10">
            <button
              onClick={() => handleFilterTypeSelect("status")}
              className="w-full text-left text-[12px] px-3 py-2 hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-b-0"
            >
              Filter by Status
            </button>
            <button
              onClick={() => handleFilterTypeSelect("assignee")}
              className="w-full text-left text-[12px] px-3 py-2 hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-b-0"
            >
              Filter by Assignee
            </button>
          </div>
        )}

        {/* Filter Value Dropdown */}
        {openDropdown === "value" && selectedFilterType && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
            {getFilterOptions().map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterValueSelect(option.value)}
                className="w-full text-left text-[12px] px-3 py-2 hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-b-0"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
