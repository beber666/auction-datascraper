import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuctionItem, ScraperService } from "@/services/scraper";

export const useAuctionMutations = (language: string, currency: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const parseTimeRemaining = (timeStr: string): Date | null => {
    const str = timeStr.toLowerCase();
    let totalMinutes = 0;
    
    // Match patterns for days
    const dayMatches = str.match(/(\d+)\s*(day|jour|día|tag)/);
    if (dayMatches) {
      totalMinutes += parseInt(dayMatches[1]) * 24 * 60;
    }

    // Match patterns for hours
    const hourMatches = str.match(/(\d+)\s*(hour|heure|hora|stunde)/);
    if (hourMatches) {
      totalMinutes += parseInt(hourMatches[1]) * 60;
    }

    // Match patterns for minutes
    const minuteMatches = str.match(/(\d+)\s*(min|minute|minuto)/);
    if (minuteMatches) {
      totalMinutes += parseInt(minuteMatches[1]);
    }

    if (totalMinutes === 0) return null;

    const endTime = new Date();
    endTime.setMinutes(endTime.getMinutes() + totalMinutes);
    return endTime;
  };

  const handleSubmit = async (url: string) => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('preferred_language')
      .eq('id', session.user.id)
      .single();

    const userLanguage = profile?.preferred_language || language || 'en';
    console.log('User language preference:', userLanguage);

    try {
      // First, scrape the initial data
      const scrapedItem = await ScraperService.scrapeZenmarket(url);
      console.log('Scraped item:', {
        productName: scrapedItem.productName,
        language: userLanguage
      });

      // Parse end time from time remaining
      const endTime = parseTimeRemaining(scrapedItem.timeRemaining);
      console.log('Calculated end time:', endTime);

      // Translate the product name
      let translatedName = scrapedItem.productName;
      if (userLanguage !== 'ja') {
        translatedName = await ScraperService.translateText(
          scrapedItem.productName,
          userLanguage
        );
        console.log('Translation result:', {
          original: scrapedItem.productName,
          translated: translatedName
        });
      }

      // Convert the price to the selected currency
      const convertedPrice = await ScraperService.convertPrice(
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
          created_at: savedItem.created_at,
          imageUrl: savedItem.image_url
        };

        return mappedItem;
      }
    } catch (error) {
      console.error("Error adding auction:", error);
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
  };
};