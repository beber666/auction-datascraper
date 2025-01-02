import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PriceRange {
  min: number | null;
  max: number | null;
}

interface PriceFilterProps {
  priceRange: PriceRange;
  onPriceChange: (type: 'min' | 'max', value: string) => void;
}

export const PriceFilter = ({ priceRange, onPriceChange }: PriceFilterProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="min-price">Min Price</Label>
        <Input
          id="min-price"
          type="number"
          value={priceRange.min ?? ''}
          onChange={(e) => onPriceChange('min', e.target.value)}
          placeholder="Min price"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="max-price">Max Price</Label>
        <Input
          id="max-price"
          type="number"
          value={priceRange.max ?? ''}
          onChange={(e) => onPriceChange('max', e.target.value)}
          placeholder="Max price"
        />
      </div>
    </div>
  );
};