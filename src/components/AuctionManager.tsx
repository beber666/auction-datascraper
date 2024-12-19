import { useState, useCallback } from "react";
import { AuctionItem, ScraperService } from "@/services/scraper";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuctionManagerProps {
  items: AuctionItem[];
  setItems: (items: AuctionItem[]) => void;
  autoRefresh: boolean;
  refreshInterval: number;
}

export const AuctionManager = ({ items, setItems, autoRefresh, refreshInterval }: AuctionManagerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const refreshAuctions = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("preferred_currency, preferred_language")
      .eq("id", session.user.id)
      .single();

    const updatedItems = await Promise.all(
      items.map(async (item) => {
        if (item.isLoading) return item;
        try {
          const newItem = await ScraperService.scrapeZenmarket(item.url);
          newItem.currentPrice = await ScraperService.convertPrice(
            newItem.priceInJPY, 
            profile?.preferred_currency || "EUR"
          );
          if (profile?.preferred_language !== "en") {
            newItem.productName = await ScraperService.translateText(
              newItem.productName, 
              profile?.preferred_language || "en"
            );
          }
          return {
            ...item,
            ...newItem,
            id: item.id,
            user_id: item.user_id,
            created_at: item.created_at
          };
        } catch (error) {
          console.error(`Failed to refresh auction ${item.url}:`, error);
          return item;
        }
      })
    );
    setItems(updatedItems);

    // Update items in database
    for (const item of updatedItems) {
      await supabase
        .from("auctions")
        .update({
          product_name: item.productName,
          current_price: item.currentPrice,
          price_in_jpy: item.priceInJPY,
          number_of_bids: item.numberOfBids,
          time_remaining: item.timeRemaining,
          last_updated: item.lastUpdated.toISOString(),
          image_url: item.imageUrl,
        })
        .eq("id", item.id);
    }

    toast({
      title: "Success",
      description: "Auctions refreshed successfully",
    });
  }, [items, setItems, toast]);

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

    setItems([...items, tempItem]);
    setIsLoading(false);

    try {
      const item = await ScraperService.scrapeZenmarket(url);
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("preferred_currency, preferred_language")
        .eq("id", session.user.id)
        .single();

      item.currentPrice = await ScraperService.convertPrice(
        item.priceInJPY, 
        profile?.preferred_currency || "EUR"
      );

      if (profile?.preferred_language !== "en") {
        item.productName = await ScraperService.translateText(
          item.productName, 
          profile?.preferred_language || "en"
        );
      }

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
          user_id: session.user.id,
          image_url: item.imageUrl
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
          imageUrl: savedItem.image_url,
          user_id: savedItem.user_id,
          created_at: savedItem.created_at
        };

        setItems(items.map(i => 
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
      setItems(items.filter(i => i.id !== tempItem.id));
    }
  };

  return { isLoading, handleSubmit, refreshAuctions };
};