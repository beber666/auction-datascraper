import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ZenScraperService, ScrapedItem } from '@/services/zenScraper';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, Loader2 } from "lucide-react";

export default function ZenScraper() {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [results, setResults] = useState<ScrapedItem[]>([]);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [scrapedPages, setScrapedPages] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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
    setResults([]);
    setHasMorePages(false);
    setTotalPages(0);
    setCurrentPage(1);
    setScrapedPages(0);

    try {
      let currentPageUrl = url;
      let hasNext = true;
      let pageNum = 1;

      while (hasNext && pageNum <= 5) { // Limit to 5 pages to prevent timeouts
        setCurrentPage(pageNum);
        
        const { items, hasMorePages: more, totalPages: pages } = await ZenScraperService.scrapeCategory(currentPageUrl, pageNum);
        
        setResults(prev => [...prev, ...items]);
        setHasMorePages(more);
        setTotalPages(pages);
        setScrapedPages(pageNum);

        if (items.length > 0 && pageNum === pages) {
          ZenScraperService.exportToExcel(results);
          toast({
            title: "Success",
            description: `Exported ${results.length} items from ${pageNum} pages to Excel`,
          });
        }

        hasNext = more && pageNum < 5;
        if (hasNext) {
          pageNum++;
          currentPageUrl = `${url}&p=${pageNum}`;
          // Add a delay between requests
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
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
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Scraping page {currentPage}...</span>
              </div>
            ) : (
              "Start Scraping"
            )}
          </Button>
        </form>

        {hasMorePages && scrapedPages > 0 && (
          <Alert className="mt-4">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Due to performance limitations, only {scrapedPages} {scrapedPages === 1 ? 'page was' : 'pages were'} scraped. The category has {totalPages} pages available.
            </AlertDescription>
          </Alert>
        )}

        {results.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">
              Results Preview ({results.length} items from {scrapedPages} {scrapedPages === 1 ? 'page' : 'pages'})
            </h2>
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