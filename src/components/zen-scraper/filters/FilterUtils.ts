import { ScrapedItem } from "@/services/zenScraper";

export const parseTimeToHours = (timeStr: string): number | null => {
  const dayMatch = timeStr.match(/(\d+)\s*(?:day|jour|día|tag)/i);
  const hourMatch = timeStr.match(/(\d+)\s*(?:hour|heure|hora|stunde)/i);
  const minuteMatch = timeStr.match(/(\d+)\s*(?:min|minute|minuto)/i);

  let totalHours = 0;
  if (dayMatch) totalHours += parseInt(dayMatch[1]) * 24;
  if (hourMatch) totalHours += parseInt(hourMatch[1]);
  if (minuteMatch) totalHours += parseInt(minuteMatch[1]) / 60;

  return totalHours || null;
};

export const parsePriceValue = (priceStr: string): number => {
  const numericValue = priceStr.replace(/[^0-9.]/g, "");
  return parseFloat(numericValue) || 0;
};

export const filterByBids = (items: ScrapedItem[], showOnlyWithBids: boolean): ScrapedItem[] => {
  if (!showOnlyWithBids) return items;
  
  return items.filter((item) => {
    const bidsValue = item.bids;
    if (typeof bidsValue === 'number') {
      return bidsValue > 0;
    }
    if (typeof bidsValue === 'string') {
      const numericBids = parseInt(bidsValue, 10);
      return !isNaN(numericBids) && numericBids > 0;
    }
    return false;
  });
};

export const filterByTime = (items: ScrapedItem[], maxHoursRemaining: string): ScrapedItem[] => {
  if (maxHoursRemaining === '') return items;
  
  const maxHours = parseFloat(maxHoursRemaining);
  if (isNaN(maxHours)) return items;
  
  return items.filter((item) => {
    const hours = parseTimeToHours(item.timeRemaining);
    return hours !== null && hours <= maxHours;
  });
};

export const filterByPrice = (
  items: ScrapedItem[], 
  priceRange: { min: number | null; max: number | null }
): ScrapedItem[] => {
  if (priceRange.min === null && priceRange.max === null) return items;
  
  return items.filter((item) => {
    const price = parsePriceValue(item.currentPrice);
    const min = priceRange.min ?? 0;
    const max = priceRange.max ?? Infinity;
    return price >= min && price <= max;
  });
};