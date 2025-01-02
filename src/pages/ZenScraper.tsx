import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { ZenScraperService, ScrapedItem } from '@/services/zenScraper';
import { ScrapeForm } from '@/components/zen-scraper/ScrapeForm';
import { ResultsFilter } from '@/components/zen-scraper/ResultsFilter';
import { ResultsTable } from '@/components/zen-scraper/ResultsTable';

export default function ZenScraper() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ScrapedItem[]>([]);
  const [filteredResults, setFilteredResults] = useState<ScrapedItem[]>([]);
  const [scrapedPages, setScrapedPages] = useState(0);
  const [sortColumn, setSortColumn] = useState<keyof ScrapedItem | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [hasMorePages, setHasMorePages] = useState(false);

  const handleSort = (column: keyof ScrapedItem) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleScrapeNextPage = async (url: string) => {
    if (!url) return;
    
    setIsLoading(true);
    try {
      const { items, hasMorePages: morePages, nextPageUrl: newNextPageUrl } = 
        await ZenScraperService.scrapeNextPage(url);
      
      setResults(prevResults => [...prevResults, ...items]);
      setFilteredResults(prevResults => [...prevResults, ...items]);
      setScrapedPages(prev => prev + 1);
      setNextPageUrl(newNextPageUrl);
      setHasMorePages(morePages);

      toast({
        title: "Page scraped successfully",
        description: `Added ${items.length} new items from page ${scrapedPages + 1}`,
      });

      // Automatically scrape next page if available
      if (morePages && newNextPageUrl) {
        // Add a small delay to avoid overwhelming the server
        setTimeout(() => {
          handleScrapeNextPage(newNextPageUrl);
        }, 2000); // 2 second delay between pages
      }
    } catch (error) {
      console.error('Scraping error:', error);
      toast({
        title: "Error",
        description: "Failed to scrape the next page",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitialScrape = async (url: string) => {
    setIsLoading(true);
    setResults([]);
    setFilteredResults([]);
    setScrapedPages(0);
    setNextPageUrl(null);
    setHasMorePages(false);

    try {
      // Ensure we're using the /en/ version of the URL for the first page
      let scrapingUrl = url;
      if (!scrapingUrl.includes('/en/')) {
        scrapingUrl = scrapingUrl.replace('zenmarket.jp/', 'zenmarket.jp/en/');
      }

      const { items, hasMorePages: morePages, nextPageUrl: newNextPageUrl } = 
        await ZenScraperService.scrapeNextPage(scrapingUrl);
      
      setResults(items);
      setFilteredResults(items);
      setScrapedPages(1);
      setNextPageUrl(newNextPageUrl);
      setHasMorePages(morePages);

      toast({
        title: "First page scraped",
        description: `Found ${items.length} items on the first page`,
      });

      // Automatically start scraping next pages if available
      if (morePages && newNextPageUrl) {
        setTimeout(() => {
          handleScrapeNextPage(newNextPageUrl);
        }, 2000); // 2 second delay before starting next page
      }
    } catch (error) {
      console.error('Scraping error:', error);
      toast({
        title: "Error",
        description: "Failed to scrape the category",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Zen Market Category Scraper</h1>
      
      <ScrapeForm 
        onScrapeStart={handleInitialScrape}
        isLoading={isLoading}
        currentPage={scrapedPages}
      />

      {results.length > 0 && (
        <>
          <ResultsFilter 
            results={results}
            onFilterChange={setFilteredResults}
          />
          
          <ResultsTable 
            results={filteredResults}
            scrapedPages={scrapedPages}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </>
      )}
    </div>
  );
}