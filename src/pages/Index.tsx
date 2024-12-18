import { useState, useEffect } from "react";
import { AuctionItem, ScraperService } from "@/services/scraper";
import { UrlForm } from "@/components/UrlForm";
import { AuctionTable } from "@/components/AuctionTable";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const refreshAuctions = async () => {
    const updatedItems = await Promise.all(
      items.map(async (item) => {
        try {
          return await ScraperService.scrapeZenmarket(item.url);
        } catch (error) {
          console.error(`Failed to refresh auction ${item.url}:`, error);
          return item; // Keep the old item data if refresh fails
        }
      })
    );
    setItems(updatedItems);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (items.length > 0) {
        refreshAuctions();
        toast({
          title: "Refresh",
          description: "Auction data updated",
        });
      }
    }, 60000); // 60000ms = 1 minute

    return () => clearInterval(interval);
  }, [items]);

  const handleSubmit = async (url: string) => {
    setIsLoading(true);
    try {
      const item = await ScraperService.scrapeZenmarket(url);
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