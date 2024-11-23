import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

export type IncidentFilter = "all" | "crime" | "emergency" | "hazard";

interface FilterControlsProps {
  filter: IncidentFilter;
  onFilterChange: (value: IncidentFilter) => void;
}

export function FilterControls({
  filter,
  onFilterChange,
}: FilterControlsProps) {
  return (
    <div className="absolute top-4 left-4 ml-24">
      <Select value={filter} onValueChange={onFilterChange}>
        <SelectTrigger className="w-[180px] bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <SelectValue placeholder="Filter incidents" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Incidents</SelectItem>
          <SelectItem value="crime">Crime</SelectItem>
          <SelectItem value="emergency">Emergency</SelectItem>
          <SelectItem value="hazard">Hazard</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
