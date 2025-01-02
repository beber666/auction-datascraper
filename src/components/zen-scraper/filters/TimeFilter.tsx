import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TimeFilterProps {
  maxHoursRemaining: string;
  onTimeFilterChange: (value: string) => void;
}

export const TimeFilter = ({ maxHoursRemaining, onTimeFilterChange }: TimeFilterProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="max-hours">Maximum hours remaining</Label>
      <Input
        id="max-hours"
        type="number"
        value={maxHoursRemaining}
        onChange={(e) => onTimeFilterChange(e.target.value)}
        placeholder="Enter maximum hours"
        min="0"
        step="0.5"
        className="w-[60%]"
      />
    </div>
  );
};