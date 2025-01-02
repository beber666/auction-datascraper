import { ScrapedItem } from "@/services/zenScraper";

export const parseTimeToHours = (timeStr: string): number => {
  const dayMatch = timeStr.match(/(\d+)\s*(?:day|jour|día|tag)/i);
  const hourMatch = timeStr.match(/(\d+)\s*(?:hour|heure|hora|stunde)/i);
  const minuteMatch = timeStr.match(/(\d+)\s*(?:min|minute|minuto)/i);

  let totalHours = 0;
  if (dayMatch) totalHours += parseInt(dayMatch[1]) * 24;
  if (hourMatch) totalHours += parseInt(hourMatch[1]);
  if (minuteMatch) totalHours += parseInt(minuteMatch[1]) / 60;

  return totalHours;
};

export const parsePriceValue = (priceStr: string): number => {
  // Remove currency symbols and non-numeric characters except dots
  const numericValue = priceStr.replace(/[^0-9.]/g, '');
  return parseFloat(numericValue) || 0;
};

export const filterByBids = (items: ScrapedItem[], showOnlyWithBids: boolean): ScrapedItem[] => {
  if (!showOnlyWithBids) return items;
  
  return items.filter((item) => {
    if (!item.bids) return false;
    const numericBids = typeof item.bids === 'string' 
      ? parseInt(item.bids, 10) 
      : item.bids;
    return numericBids > 0;
  });
};

export const filterByTime = (items: ScrapedItem[], maxHoursRemaining: string): ScrapedItem[] => {
  if (!maxHoursRemaining) return items;
  
  const maxHours = parseFloat(maxHoursRemaining);
  if (isNaN(maxHours)) return items;
  
  return items.filter((item) => {
    const hours = parseTimeToHours(item.timeRemaining);
    return hours <= maxHours;
  });
};

export const filterByPrice = (
  items: ScrapedItem[], 
  priceRange: { min: number | null; max: number | null }
): ScrapedItem[] => {
  return items.filter((item) => {
    const price = parsePriceValue(item.currentPrice);
    
    if (priceRange.min !== null && price < priceRange.min) {
      return false;
    }
    
    if (priceRange.max !== null && price > priceRange.max) {
      return false;
    }
    
    return true;
  });
};