import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuctionItem, ScraperService } from "@/services/scraper";
import { useAuctionTranslation } from "./auction/useAuctionTranslation";
import { useAuctionPrice } from "./auction/useAuctionPrice";
import { useAuctionTime } from "./auction/useAuctionTime";

export const useAuctionMutations = (language: string, currency: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { translateAuctionName } = useAuctionTranslation();
  const { convertAuctionPrice } = useAuctionPrice();
  const { parseTimeRemaining } = useAuctionTime();

  const handleSubmit = async (url: string) => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please provide a valid URL",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferred_language')
        .eq('id', session.user.id)
        .maybeSingle();

      const userLanguage = profile?.preferred_language || language || 'en';
      console.log('User language preference:', userLanguage);

      const scrapedItem = await ScraperService.scrapeZenmarket(url);
      console.log('Scraped item:', {
        productName: scrapedItem.productName,
        language: userLanguage
      });

      const endTime = parseTimeRemaining(scrapedItem.timeRemaining);
      console.log('Calculated end time:', endTime);

      const translatedName = await translateAuctionName(
        scrapedItem.productName,
        userLanguage
      );

      const convertedPrice = await convertAuctionPrice(
        scrapedItem.priceInJPY,
        currency
      );

      const { data: savedItem, error } = await supabase
        .from("auctions")
        .insert([{
          url: scrapedItem.url,
          product_name: translatedName,
          current_price: convertedPrice,
          price_in_jpy: scrapedItem.priceInJPY,
          number_of_bids: scrapedItem.numberOfBids,
          time_remaining: scrapedItem.timeRemaining,
          last_updated: new Date().toISOString(),
          user_id: session.user.id,
          image_url: scrapedItem.imageUrl,
          end_time: endTime?.toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      return savedItem ? {
        id: savedItem.id,
        url: savedItem.url,
        productName: savedItem.product_name,
        currentPrice: savedItem.current_price,
        priceInJPY: savedItem.price_in_jpy,
        numberOfBids: savedItem.number_of_bids,
        timeRemaining: savedItem.time_remaining,
        lastUpdated: new Date(savedItem.last_updated),
        user_id: savedItem.user_id,
        created_at: savedItem.created_at,
        imageUrl: savedItem.image_url
      } : null;

    } catch (error) {
      console.error("Error adding auction:", error);
      toast({
        title: "Error",
        description: "Failed to fetch auction data",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (item: AuctionItem) => {
    if (!item?.url) {
      console.error("Invalid item URL");
      return null;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    try {
      const scrapedItem = await ScraperService.scrapeZenmarket(item.url);
      const endTime = parseTimeRemaining(scrapedItem.timeRemaining);
      const convertedPrice = await convertAuctionPrice(
        scrapedItem.priceInJPY,
        currency
      );

      const { data: updatedItem, error } = await supabase
        .from("auctions")
        .update({
          current_price: convertedPrice,
          price_in_jpy: scrapedItem.priceInJPY,
          number_of_bids: scrapedItem.numberOfBids,
          time_remaining: scrapedItem.timeRemaining,
          last_updated: new Date().toISOString(),
          end_time: endTime?.toISOString(),
          image_url: scrapedItem.imageUrl
        })
        .eq('id', item.id)
        .select()
        .single();

      if (error) throw error;

      return updatedItem ? {
        ...item,
        currentPrice: updatedItem.current_price,
        priceInJPY: updatedItem.price_in_jpy,
        numberOfBids: updatedItem.number_of_bids,
        timeRemaining: updatedItem.time_remaining,
        lastUpdated: new Date(updatedItem.last_updated),
        imageUrl: updatedItem.image_url
      } : item;

    } catch (error) {
      console.error("Error updating auction:", error);
      return item;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from("auctions")
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;

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
    handleUpdate,
  };
};