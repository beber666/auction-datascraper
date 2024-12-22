import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuctionItem } from "@/services/scraper";

export const useAuctionQueries = () => {
  const [items, setItems] = useState<AuctionItem[]>([]);

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

  return {
    items,
    setItems,
    loadUserAuctions,
  };
};