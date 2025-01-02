import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface BidsFilterProps {
  showOnlyWithBids: boolean;
  onBidsFilterChange: (value: boolean) => void;
}

export const BidsFilter = ({ showOnlyWithBids, onBidsFilterChange }: BidsFilterProps) => {
  return (
    <div className="flex items-center space-x-4">
      <Switch
        id="bids-filter"
        checked={showOnlyWithBids}
        onCheckedChange={onBidsFilterChange}
      />
      <Label htmlFor="bids-filter">Show only items with bids</Label>
    </div>
  );
};