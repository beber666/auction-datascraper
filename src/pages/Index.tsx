import { useState, useEffect } from "react";
import { AuctionItem, ScraperService } from "@/services/scraper";
import { UrlForm } from "@/components/UrlForm";
import { AuctionTable } from "@/components/AuctionTable";
import { useToast } from "@/components/ui/use-toast";
import { SettingsPanel } from "@/components/SettingsPanel";

const Index = () => {
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(1);
  const [currency, setCurrency] = useState("JPY");
  const { toast } = useToast();

  const refreshAuctions = async () => {
    const updatedItems = await Promise.all(
      items.map(async (item) => {
        try {
          const newItem = await ScraperService.scrapeZenmarket(item.url);
          newItem.currentPrice = await ScraperService.convertPrice(newItem.priceInJPY, currency);
          return newItem;
        } catch (error) {
          console.error(`Failed to refresh auction ${item.url}:`, error);
          return item;
        }
      })
    );
    setItems(updatedItems);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (items.length > 0 && autoRefresh) {
        refreshAuctions();
        toast({
          title: "Refresh",
          description: "Auction data updated",
        });
      }
    }, refreshInterval * 60000);

    return () => clearInterval(interval);
  }, [items, autoRefresh, refreshInterval, currency]);

  // Update prices when currency changes
  useEffect(() => {
    const updatePrices = async () => {
      const updatedItems = await Promise.all(
        items.map(async (item) => ({
          ...item,
          currentPrice: await ScraperService.convertPrice(item.priceInJPY, currency),
        }))
      );
      setItems(updatedItems);
    };

    if (items.length > 0) {
      updatePrices();
    }
  }, [currency]);

  const handleSubmit = async (url: string) => {
    setIsLoading(true);
    try {
      const item = await ScraperService.scrapeZenmarket(url);
      item.currentPrice = await ScraperService.convertPrice(item.priceInJPY, currency);
      setItems((prev) => [...prev, item]);
      toast({
        title: "Success",
        description: "Auction added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch auction data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
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
        <SettingsPanel
          autoRefresh={autoRefresh}
          refreshInterval={refreshInterval}
          currency={currency}
          onAutoRefreshChange={setAutoRefresh}
          onRefreshIntervalChange={setRefreshInterval}
          onCurrencyChange={setCurrency}
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
    </div>
  );
};

export default Index;