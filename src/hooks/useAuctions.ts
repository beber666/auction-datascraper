import { useAuctionMutations } from "./useAuctionMutations";
import { useAuctionQueries } from "./useAuctionQueries";
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAuctions = (language: string, currency: string) => {
  const { items, setItems, loadUserAuctions } = useAuctionQueries();
  const { isLoading, handleSubmit: submitAuction, handleDelete: deleteAuction } = useAuctionMutations(language, currency);

  const refreshAuctions = useCallback(async () => {
    console.log('Starting auction refresh...');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const updatedItems = await Promise.all(
      items.map(async (item) => {
        try {
          const scrapedItem = await submitAuction(item.url, true);
          return scrapedItem || item;
        } catch (error) {
          console.error('Error refreshing auction:', error);
          return item;
        }
      })
    );

    setItems(updatedItems);
    console.log('Auction refresh completed');
  }, [items, submitAuction, setItems]);

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

  return {
    items,
    isLoading,
    handleSubmit,
    handleDelete,
    loadUserAuctions,
    refreshAuctions
  };
};