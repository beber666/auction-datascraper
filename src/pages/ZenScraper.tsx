import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ZenScraperService, ScrapedItem } from '@/services/zenScraper';
import { Loader2 } from "lucide-react";
import { FilterPanel } from '@/components/zen-scraper/FilterPanel';
import { ResultsTable } from '@/components/zen-scraper/ResultsTable';

export default function ZenScraper() {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ScrapedItem[]>([]);
  const [filters, setFilters] = useState({
    hasPositiveBids: false,
    maxHoursRemaining: null as number | null,
    priceRange: [0, 1000] as [number, number],
  });

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

    try {
      let currentPageUrl = url;
      let hasNext = true;
      let pageNum = 1;

      while (hasNext) {
        const { items, hasMorePages } = await ZenScraperService.scrapeCategory(currentPageUrl, pageNum);
        setResults(prev => [...prev, ...items]);
        hasNext = hasMorePages;
        if (hasNext) {
          pageNum++;
          currentPageUrl = `${url}&p=${pageNum}`;
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      toast({
        title: "Success",
        description: `Scraping completed successfully`,
      });
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
      
      <Card className="p-6 mb-6">
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
                <span>Scraping page...</span>
              </div>
            ) : (
              "Start Scraping"
            )}
          </Button>
        </form>
      </Card>

      {results.length > 0 && (
        <>
          <FilterPanel
            onFilterChange={setFilters}
            currency="EUR"
          />
          <ResultsTable
            results={results}
            filters={filters}
          />
        </>
      )}
    </div>
  );
}