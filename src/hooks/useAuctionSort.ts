import { useState } from 'react';
import { AuctionItem } from '@/services/scraper';
import { parseTimeToHours } from '@/components/zen-scraper/filters/FilterUtils';

type SortColumn = 'numberOfBids' | 'timeRemaining' | null;
type SortDirection = 'asc' | 'desc';

export const useAuctionSort = (items: AuctionItem[]) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortedItems = () => {
    if (!sortColumn) return items;

    return [...items].sort((a, b) => {
      if (sortColumn === 'timeRemaining') {
        const timeA = parseTimeToHours(a.timeRemaining);
        const timeB = parseTimeToHours(b.timeRemaining);
        return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
      }
      
      if (sortColumn === 'numberOfBids') {
        const bidsA = parseInt(a.numberOfBids) || 0;
        const bidsB = parseInt(b.numberOfBids) || 0;
        return sortDirection === 'asc' ? bidsA - bidsB : bidsB - bidsA;
      }

      return 0;
    });
  };

  return {
    sortColumn,
    sortDirection,
    handleSort,
    getSortedItems,
  };
};