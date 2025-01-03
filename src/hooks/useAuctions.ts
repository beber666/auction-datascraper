import { useAuctionMutations } from "./useAuctionMutations";
import { useAuctionQueries } from "./useAuctionQueries";
import { useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAuctions = (language: string, currency: string) => {
  const { items, setItems, loadUserAuctions } = useAuctionQueries();
  const { isLoading, handleSubmit: submitAuction, handleDelete: deleteAuction, handleUpdate } = useAuctionMutations(language, currency);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const refreshAuctions = useCallback(async () => {
    console.log('Starting auction refresh...');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // First, load the latest state from the database
    await loadUserAuctions();

    // Then update each auction's data
    const updatedItems = await Promise.all(
      items.map(async (item) => {
        try {
          // Check if the auction still exists before updating
          const { data: existingAuction } = await supabase
            .from('auctions')
            .select('id')
            .eq('id', item.id)
            .maybeSingle();

          if (!existingAuction) {
            console.log(`Auction ${item.id} no longer exists, skipping update`);
            return null;
          }

          const updatedItem = await handleUpdate(item);
          return updatedItem || item;
        } catch (error) {
          console.error('Error refreshing auction:', error);
          return item;
        }
      })
    );

    // Filter out null values (deleted auctions) and update state
    const filteredItems = updatedItems.filter(item => item !== null);
    setItems(filteredItems);
    console.log('Auction refresh completed');
  }, [items, handleUpdate, setItems, loadUserAuctions]);

  const handleSubmit = async (url: string) => {
    try {
      const newItem = await submitAuction(url);
      if (newItem) {
        setItems(prev => [...prev, newItem]);
      }
    } catch (error) {
      // Error is already handled in useAuctionMutations
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAuction(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      // Error is already handled in useAuctionMutations
    }
  };

  const handleBulkImport = async (urls: string[]) => {
    const newItems = [];
    for (const url of urls) {
      try {
        const newItem = await submitAuction(url);
        if (newItem) {
          newItems.push(newItem);
        }
      } catch (error) {
        console.error(`Error importing auction ${url}:`, error);
      }
    }
    setItems(prev => [...prev, ...newItems]);
  };

  // Cleanup function to clear the interval
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, []);

  return {
    items,
    isLoading,
    handleSubmit,
    handleDelete,
    loadUserAuctions,
    refreshAuctions,
    refreshIntervalRef,
    handleBulkImport
  };
};