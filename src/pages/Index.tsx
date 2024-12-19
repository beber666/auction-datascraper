import { useState, useEffect } from "react";
import { AuctionItem } from "@/services/scraper";
import { UrlForm } from "@/components/UrlForm";
import { AuctionTable } from "@/components/AuctionTable";
import { useToast } from "@/hooks/use-toast";
import { FeedbackBox } from "@/components/FeedbackBox";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SettingsPanel } from "@/components/SettingsPanel";
import { AuctionManager } from "@/components/AuctionManager";

const Index = () => {
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5);
  const [currency, setCurrency] = useState("EUR");
  const [language, setLanguage] = useState("en");
  const { toast } = useToast();
  const navigate = useNavigate();

  const { isLoading, handleSubmit, refreshAuctions } = AuctionManager({
    items,
    setItems,
    autoRefresh,
    refreshInterval,
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("preferred_currency, preferred_language")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setCurrency(profile.preferred_currency || "EUR");
        setLanguage(profile.preferred_language || "en");
      }

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
          imageUrl: auction.image_url,
          user_id: auction.user_id,
          created_at: auction.created_at
        }));
        setItems(mappedAuctions);
      }
    };
    checkUser();
  }, [navigate]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (autoRefresh && refreshInterval > 0) {
      intervalId = setInterval(refreshAuctions, refreshInterval * 60 * 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, refreshInterval, refreshAuctions]);

  const handleDelete = async (id: string) => {
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

  const handleAutoRefreshChange = (enabled: boolean) => {
    setAutoRefresh(enabled);
    if (enabled) {
      toast({
        title: "Auto-refresh enabled",
        description: `Auctions will refresh every ${refreshInterval} minutes`,
      });
    }
  };

  const handleRefreshIntervalChange = (minutes: number) => {
    setRefreshInterval(minutes);
    if (autoRefresh) {
      toast({
        title: "Refresh interval updated",
        description: `Auctions will now refresh every ${minutes} minutes`,
      });
    }
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    setCurrency(newCurrency);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase
        .from("profiles")
        .update({ preferred_currency: newCurrency })
        .eq("id", session.user.id);
      
      await refreshAuctions();
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase
        .from("profiles")
        .update({ preferred_language: newLanguage })
        .eq("id", session.user.id);
      
      await refreshAuctions();
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Zenmarket Auction Tracker
      </h1>
      <div className="max-w-3xl mx-auto space-y-8">
        <SettingsPanel
          autoRefresh={autoRefresh}
          refreshInterval={refreshInterval}
          currency={currency}
          language={language}
          onAutoRefreshChange={handleAutoRefreshChange}
          onRefreshIntervalChange={handleRefreshIntervalChange}
          onCurrencyChange={handleCurrencyChange}
          onLanguageChange={handleLanguageChange}
        />
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