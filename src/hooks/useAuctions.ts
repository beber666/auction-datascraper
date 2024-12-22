import { useState } from "react";
import { AuctionItem, ScraperService } from "@/services/scraper";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuctions = (language: string, currency: string) => {
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadUserAuctions = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: auctions } = await supabase
      .from("auctions")
      .select("*")
      .eq("user_id", session.user.id);

    if (auctions) {
      const mappedAuctions: AuctionItem[] = auctions.map(auction => ({
        id: auction.id,
        url: auction.url,
        productName: auction.product_name,
        currentPrice: auction.current_price,
        priceInJPY: auction.price_in_jpy,
        numberOfBids: auction.number_of_bids,
        timeRemaining: auction.time_remaining,
        lastUpdated: new Date(auction.last_updated),
        user_id: auction.user_id,
        created_at: auction.created_at
      }));
      setItems(mappedAuctions);
    }
  };

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

    setItems(prev => [...prev, tempItem]);
    setIsLoading(false);

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

        setItems(prev => prev.map(i => 
          i.id === tempItem.id ? mappedItem : i
        ));

        toast({
          title: "Success",
          description: "Auction added successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch auction data",
        variant: "destructive",
      });
      setItems(prev => prev.filter(i => i.id !== tempItem.id));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      // Delete the auction (related records will be deleted automatically due to CASCADE)
      const { error: auctionError } = await supabase
        .from("auctions")
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (auctionError) {
        throw new Error(`Failed to delete auction: ${auctionError.message}`);
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
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
    }
  };

  return {
    items,
    isLoading,
    handleSubmit,
    handleDelete,
    loadUserAuctions
  };
};