import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuctionItem, ScraperService } from "@/services/scraper";

export const useAuctionMutations = (language: string, currency: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (url: string) => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const tempItem: AuctionItem = {
      id: Math.random().toString(36).substr(2, 9),
      url,
      productName: "Loading...",
      currentPrice: "...",
      priceInJPY: 0,
      numberOfBids: "...",
      timeRemaining: "...",
      lastUpdated: new Date(),
      isLoading: true,
      user_id: session.user.id
    };

    try {
      const item = await ScraperService.scrapeZenmarket(url);
      
      if (language !== "en") {
        item.productName = await ScraperService.translateText(
          item.productName, 
          language
        );
      }

      item.currentPrice = await ScraperService.convertPrice(
        item.priceInJPY, 
        currency
      );

      const { data: savedItem } = await supabase
        .from("auctions")
        .insert([{
          url: item.url,
          product_name: item.productName,
          current_price: item.currentPrice,
          price_in_jpy: item.priceInJPY,
          number_of_bids: item.numberOfBids,
          time_remaining: item.timeRemaining,
          last_updated: item.lastUpdated.toISOString(),
          user_id: session.user.id
        }])
        .select()
        .single();

      if (savedItem) {
        const mappedItem: AuctionItem = {
          id: savedItem.id,
          url: savedItem.url,
          productName: savedItem.product_name,
          currentPrice: savedItem.current_price,
          priceInJPY: savedItem.price_in_jpy,
          numberOfBids: savedItem.number_of_bids,
          timeRemaining: savedItem.time_remaining,
          lastUpdated: new Date(savedItem.last_updated),
          user_id: savedItem.user_id,
          created_at: savedItem.created_at
        };

        return mappedItem;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch auction data",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      const { error: auctionError } = await supabase
        .from("auctions")
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (auctionError) {
        throw new Error(`Failed to delete auction: ${auctionError.message}`);
      }

      toast({
        title: "Success",
        description: "Auction removed successfully",
      });
    } catch (error) {
      console.error("Error in deletion process:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove auction. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    isLoading,
    handleSubmit,
    handleDelete,
  };
};