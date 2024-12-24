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
          // Use handleUpdate instead of submitAuction for existing auctions
          const updatedItem = await handleUpdate(item);
          return updatedItem || item;
        } catch (error) {
          console.error('Error refreshing auction:', error);
          return item;
        }
      })
    );

    setItems(updatedItems);
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
    refreshIntervalRef
  };
};