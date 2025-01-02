import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrapedItem } from "@/services/zenScraper";
import { useEffect, useState } from "react";

interface ResultsFilterProps {
  results: ScrapedItem[];
  onFilterChange: (filtered: ScrapedItem[]) => void;
}

export const ResultsFilter = ({ results, onFilterChange }: ResultsFilterProps) => {
  const [showOnlyWithBids, setShowOnlyWithBids] = useState(false);
  const [maxHoursRemaining, setMaxHoursRemaining] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min: number | null; max: number | null }>({
    min: null,
    max: null,
  });

  const parseTimeToHours = (timeStr: string): number | null => {
    const dayMatch = timeStr.match(/(\d+)\s*(?:day|jour|día|tag)/i);
    const hourMatch = timeStr.match(/(\d+)\s*(?:hour|heure|hora|stunde)/i);
    const minuteMatch = timeStr.match(/(\d+)\s*(?:min|minute|minuto)/i);

    let totalHours = 0;
    if (dayMatch) totalHours += parseInt(dayMatch[1]) * 24;
    if (hourMatch) totalHours += parseInt(hourMatch[1]);
    if (minuteMatch) totalHours += parseInt(minuteMatch[1]) / 60;

    return totalHours || null;
  };

  const parsePriceValue = (priceStr: string): number => {
    const numericValue = priceStr.replace(/[^0-9.]/g, "");
    return parseFloat(numericValue) || 0;
  };

  useEffect(() => {
    let filteredResults = [...results];

    // Filter by bids
    if (showOnlyWithBids) {
      filteredResults = filteredResults.filter((item) => {
        // Convert bids to number safely, treating null, undefined, or empty string as 0
        const bidsCount = item.bids ? parseInt(item.bids.toString()) : 0;
        return bidsCount > 0;
      });
    }

    // Filter by time remaining
    if (maxHoursRemaining !== '') {
      const maxHours = parseFloat(maxHoursRemaining);
      if (!isNaN(maxHours)) {
        filteredResults = filteredResults.filter((item) => {
          const hours = parseTimeToHours(item.timeRemaining);
          return hours !== null && hours <= maxHours;
        });
      }
    }

    // Filter by price range
    if (priceRange.min !== null || priceRange.max !== null) {
      filteredResults = filteredResults.filter((item) => {
        const price = parsePriceValue(item.currentPrice);
        const min = priceRange.min ?? 0;
        const max = priceRange.max ?? Infinity;
        return price >= min && price <= max;
      });
    }

    onFilterChange(filteredResults);
  }, [results, showOnlyWithBids, maxHoursRemaining, priceRange, onFilterChange]);

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setPriceRange(prev => ({
      ...prev,
      [type]: numValue
    }));
  };

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow-sm mb-6">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>
      
      <div className="flex items-center space-x-4">
        <Switch
          id="bids-filter"
          checked={showOnlyWithBids}
          onCheckedChange={setShowOnlyWithBids}
        />
        <Label htmlFor="bids-filter">Show only items with bids</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="max-hours">Maximum hours remaining</Label>
        <Input
          id="max-hours"
          type="number"
          value={maxHoursRemaining}
          onChange={(e) => setMaxHoursRemaining(e.target.value)}
          placeholder="Enter maximum hours"
          min="0"
          step="0.5"
          className="w-[60%]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="min-price">Min Price</Label>
          <Input
            id="min-price"
            type="number"
            value={priceRange.min ?? ''}
            onChange={(e) => handlePriceChange('min', e.target.value)}
            placeholder="Min price"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max-price">Max Price</Label>
          <Input
            id="max-price"
            type="number"
            value={priceRange.max ?? ''}
            onChange={(e) => handlePriceChange('max', e.target.value)}
            placeholder="Max price"
          />
        </div>
      </div>
    </div>
  );
};