import { supabase } from "@/integrations/supabase/client";
import { AuctionItem, ScraperService } from "@/services/scraper";
import { parseTimeRemaining } from "./utils/timeUtils";

export const useAuctionUpdate = (currency: string) => {
  const handleUpdate = async (item: AuctionItem) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    try {
      // Scrape fresh data
      const scrapedItem = await ScraperService.scrapeZenmarket(item.url);
      
      // Parse end time from time remaining
      const endTime = parseTimeRemaining(scrapedItem.timeRemaining);

      // Convert the price to the selected currency
      const convertedPrice = await ScraperService.convertPrice(
        scrapedItem.priceInJPY, 
        currency
      );

      // Update the auction in the database
      const { data: updatedItem, error } = await supabase
        .from("auctions")
        .update({
          current_price: convertedPrice,
          price_in_jpy: scrapedItem.priceInJPY,
          number_of_bids: scrapedItem.numberOfBids,
          time_remaining: scrapedItem.timeRemaining,
          last_updated: new Date().toISOString(),
          end_time: endTime?.toISOString()
        })
        .eq('id', item.id)
        .select()
        .maybeSingle();

      if (error) throw error;

      if (updatedItem) {
        return {
          ...item,
          currentPrice: updatedItem.current_price,
          priceInJPY: updatedItem.price_in_jpy,
          numberOfBids: updatedItem.number_of_bids,
          timeRemaining: updatedItem.time_remaining,
          lastUpdated: new Date(updatedItem.last_updated),
          endTime: updatedItem.end_time ? new Date(updatedItem.end_time) : null
        };
      }

      return item;
    } catch (error) {
      console.error("Error updating auction:", error);
      return item;
    }
  };

  return {
    handleUpdate,
  };
};