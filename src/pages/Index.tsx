import { useState, useEffect } from "react";
import { AuctionItem, ScraperService } from "@/services/scraper";
import { UrlForm } from "@/components/UrlForm";
import { AuctionTable } from "@/components/AuctionTable";
import { useToast } from "@/hooks/use-toast";
import { FeedbackBox } from "@/components/FeedbackBox";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      // Load user preferences
      const { data: profile } = await supabase
        .from("profiles")
        .select("preferred_currency, preferred_language")
        .eq("id", session.user.id)
        .single();

      // Load existing auctions
      const { data: auctions } = await supabase
        .from("auctions")
        .select("*")
        .eq("user_id", session.user.id);

      if (auctions) {
        setItems(auctions);
      }
    };
    checkUser();
  }, [navigate]);

  const refreshAuctions = async () => {
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
          return newItem;
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
        .update(item)
        .eq("id", item.id);
    }
  };

  const handleSubmit = async (url: string) => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Create a temporary item with loading state
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
      
      // Get user preferences
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

      // Save to database
      const { data: savedItem } = await supabase
        .from("auctions")
        .insert([{ ...item, user_id: session.user.id }])
        .select()
        .single();

      if (savedItem) {
        setItems(prev => prev.map(i => 
          i.id === tempItem.id ? savedItem : i
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
      // Remove the temporary item if scraping failed
      setItems(prev => prev.filter(i => i.id !== tempItem.id));
    }
  };

  const handleDelete = async (id: string) => {
    // Delete from database
    await supabase
      .from("auctions")
      .delete()
      .eq("id", id);

    setItems((prev) => prev.filter((item) => item.id !== id));
    toast({
      title: "Success",
      description: "Auction removed successfully",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Zenmarket Auction Tracker
      </h1>
      <div className="max-w-3xl mx-auto space-y-8">
        <UrlForm onSubmit={handleSubmit} isLoading={isLoading} />
        {items.length > 0 ? (
          <AuctionTable items={items} onDelete={handleDelete} />
        ) : (
          <div className="text-center text-gray-500 mt-8">
            No auctions added yet. Add your first auction above!
          </div>
        )}
      </div>
      <FeedbackBox />
    </div>
  );
};

export default Index;