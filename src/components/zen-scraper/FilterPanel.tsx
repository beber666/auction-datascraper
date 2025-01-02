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
  const [maxHoursRemaining, setMaxHoursRemaining] = useState<number>(24);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);

  const handlePositiveBidsChange = (checked: boolean) => {
    setHasPositiveBids(checked);
    onFilterChange({
      hasPositiveBids: checked,
      maxHoursRemaining,
      priceRange: [minPrice, maxPrice],
    });
  };

  const handleHoursChange = (value: number) => {
    setMaxHoursRemaining(value);
    onFilterChange({
      hasPositiveBids,
      maxHoursRemaining: value,
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
    <div className="space-y-6 p-4 bg-white rounded-lg shadow mb-6">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>
      
      <div className="flex items-center space-x-4">
        <Switch
          id="positive-bids"
          checked={hasPositiveBids}
          onCheckedChange={handlePositiveBidsChange}
        />
        <Label htmlFor="positive-bids">Show only items with bids</Label>
      </div>

      <div className="space-y-2">
        <Label>End time within (hours): {maxHoursRemaining}</Label>
        <Slider
          value={[maxHoursRemaining]}
          onValueChange={(values) => handleHoursChange(values[0])}
          max={72}
          min={1}
          step={1}
        />
      </div>

      <div className="space-y-2">
        <Label>Price range ({currency})</Label>
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            value={minPrice}
            onChange={(e) => handlePriceChange(Number(e.target.value), maxPrice)}
            placeholder="Min"
            className="w-24"
          />
          <span>to</span>
          <Input
            type="number"
            value={maxPrice}
            onChange={(e) => handlePriceChange(minPrice, Number(e.target.value))}
            placeholder="Max"
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
};