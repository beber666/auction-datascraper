import { useState } from 'react';
import { ScrapedItem } from "@/services/zenScraper";
import { parseTimeToHours, parsePriceValue } from "../filters/FilterUtils";

export const useTableData = (results: ScrapedItem[]) => {
  const [translatedResults] = useState<ScrapedItem[]>([]);

  const getSortedResults = (
    sortColumn: keyof ScrapedItem | null,
    sortDirection: 'asc' | 'desc'
  ) => {
    const itemsToSort = results;
    
    if (!sortColumn) return itemsToSort;

    return [...itemsToSort].sort((a, b) => {
      if (sortColumn === 'timeRemaining') {
        const timeA = parseTimeToHours(a.timeRemaining);
        const timeB = parseTimeToHours(b.timeRemaining);
        return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
      }
      
      if (sortColumn === 'currentPrice') {
        const priceA = parsePriceValue(a.currentPrice);
        const priceB = parsePriceValue(b.currentPrice);
        return sortDirection === 'asc' ? priceA - priceB : priceB - priceA;
      }

      if (sortColumn === 'bids') {
        const bidsA = typeof a.bids === 'string' ? parseInt(a.bids) || 0 : a.bids || 0;
        const bidsB = typeof b.bids === 'string' ? parseInt(b.bids) || 0 : b.bids || 0;
        return sortDirection === 'asc' ? bidsA - bidsB : bidsB - bidsA;
      }

      const valA = String(a[sortColumn]);
      const valB = String(b[sortColumn]);
      return sortDirection === 'asc' 
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });
  };

  return {
    translatedResults,
    getSortedResults
  };
};