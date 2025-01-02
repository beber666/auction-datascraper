import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface FilterPanelProps {
  onFilterChange: (filters: {
    hasPositiveBids: boolean;
    maxHoursRemaining: number | null;
    priceRange: [number, number];
  }) => void;
  currency: string;
}

export const FilterPanel = ({ onFilterChange, currency }: FilterPanelProps) => {
  const [hasPositiveBids, setHasPositiveBids] = useState(false);
  const [maxHoursRemaining, setMaxHoursRemaining] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);

  const handlePositiveBidsChange = (checked: boolean) => {
    setHasPositiveBids(checked);
    onFilterChange({
      hasPositiveBids: checked,
      maxHoursRemaining,
      priceRange: [minPrice, maxPrice],
    });
  };

  const handleHoursChange = (value: number[]) => {
    const hours = value[0];
    setMaxHoursRemaining(hours);
    onFilterChange({
      hasPositiveBids,
      maxHoursRemaining: hours,
      priceRange: [minPrice, maxPrice],
    });
  };

  const handlePriceChange = (min: number, max: number) => {
    setMinPrice(min);
    setMaxPrice(max);
    onFilterChange({
      hasPositiveBids,
      maxHoursRemaining,
      priceRange: [min, max],
    });
  };

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow-sm mb-6">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>
      
      <div className="flex items-center space-x-4">
        <Switch
          id="positive-bids"
          checked={hasPositiveBids}
          onCheckedChange={handlePositiveBidsChange}
        />
        <Label htmlFor="positive-bids">Show only items with bids</Label>
      </div>

      <div className="space-y-2">
        <Label>End time within (hours)</Label>
        <Slider
          defaultValue={[24]}
          max={48}
          step={1}
          onValueChange={handleHoursChange}
        />
        <div className="text-sm text-muted-foreground">
          {maxHoursRemaining ? `${maxHoursRemaining} hours` : 'No limit'}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Price range ({currency})</Label>
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => handlePriceChange(Number(e.target.value), maxPrice)}
            className="w-24"
          />
          <span>to</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => handlePriceChange(minPrice, Number(e.target.value))}
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
};