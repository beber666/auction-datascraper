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

  const handleSort = (column: keyof ScrapedItem) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleScrape = async (url: string) => {
    setIsLoading(true);
    setResults([]);
    setFilteredResults([]);
    setScrapedPages(0);

    try {
      // Ensure we're using the /en/ version of the URL
      let scrapingUrl = url;
      if (!scrapingUrl.includes('/en/')) {
        scrapingUrl = scrapingUrl.replace('zenmarket.jp/', 'zenmarket.jp/en/');
      }

      console.log('Starting scrape with URL:', scrapingUrl);
      
      const { items, totalPages } = await ZenScraperService.scrapeCategory(scrapingUrl);
      
      console.log(`Found ${items.length} items on page 1 of ${totalPages}`);
      
      setResults(items);
      setFilteredResults(items);
      setScrapedPages(1);

      toast({
        title: "Page scraped successfully",
        description: `Found ${items.length} items`,
      });
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
        onScrapeStart={handleScrape}
        isLoading={isLoading}
        currentPage={1}
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