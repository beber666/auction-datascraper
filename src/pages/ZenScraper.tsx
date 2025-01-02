import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { ZenScraperService, ScrapedItem } from '@/services/zenScraper';

export default function ZenScraper() {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ScrapedItem[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.includes('zenmarket.jp')) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Zenmarket category URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setResults([]);

    try {
      const items = await ZenScraperService.scrapeCategory(url, setProgress);
      setResults(items);
      
      if (items.length > 0) {
        ZenScraperService.exportToExcel(items);
        toast({
          title: "Success",
          description: `Exported ${items.length} items to Excel`,
        });
      } else {
        toast({
          title: "No items found",
          description: "The category page returned no items",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Scraping error:', error);
      toast({
        title: "Error",
        description: "Failed to scrape the category page",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Zen Market Category Scraper</h1>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">
              Category URL
            </label>
            <Input
              id="url"
              type="url"
              placeholder="https://zenmarket.jp/en/yahoo.aspx?c=2084229142"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
          {isLoading && (
            <Progress value={progress} className="w-full" />
          )}
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Scraping..." : "Start Scraping"}
          </Button>
        </form>

        {results.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Results Preview</h2>
            <div className="overflow-auto max-h-96">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Title</th>
                    <th className="text-left p-2">Price</th>
                    <th className="text-left p-2">Buyout</th>
                    <th className="text-left p-2">Bids</th>
                    <th className="text-left p-2">Categories</th>
                    <th className="text-left p-2">Time Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{item.title}</td>
                      <td className="p-2">{item.currentPrice}</td>
                      <td className="p-2">{item.buyoutPrice || 'N/A'}</td>
                      <td className="p-2">{item.bids}</td>
                      <td className="p-2">{item.categories.join(', ')}</td>
                      <td className="p-2">{item.timeRemaining}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}