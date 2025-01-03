import { useState, useEffect } from 'react';
import { AuctionItem } from '@/services/scraper';
import { parseTimeToHours } from '@/components/zen-scraper/filters/FilterUtils';
import { supabase } from '@/integrations/supabase/client';

type SortColumn = 'numberOfBids' | 'timeRemaining' | null;
type SortDirection = 'asc' | 'desc';

export const useAuctionSort = (items: AuctionItem[]) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Load initial sort preferences
  useEffect(() => {
    const loadSortPreferences = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('sort_column, sort_direction')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setSortColumn(profile.sort_column as SortColumn);
        setSortDirection(profile.sort_direction as SortDirection || 'asc');
      }
    };

    loadSortPreferences();
  }, []);

  // Save sort preferences when they change
  const saveSortPreferences = async (column: SortColumn, direction: SortDirection) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase
      .from('profiles')
      .update({
        sort_column: column,
        sort_direction: direction
      })
      .eq('id', session.user.id);
  };

  const handleSort = async (column: SortColumn) => {
    let newDirection: SortDirection = 'asc';
    
    if (sortColumn === column) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }

    await saveSortPreferences(column, newDirection);
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