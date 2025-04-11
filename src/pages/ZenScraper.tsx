
import { useState, useRef } from 'react';
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
  
  // Use useRef instead of useState for the stop flag to ensure immediate access
  const shouldStopScrapingRef = useRef(false);

  const handleSort = (column: keyof ScrapedItem) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleStopScraping = () => {
    // Set the flag using the ref for immediate effect
    shouldStopScrapingRef.current = true;
    
    toast({
      title: "Stopping scraper",
      description: "The scraper will stop after the current page completes",
    });
    
    // Also immediately set loading to false to prevent new scrapes
    setIsLoading(false);
  };

  const handleScrapeNextPage = async (url: string) => {
    // Immediately check if we should stop
    if (!url || shouldStopScrapingRef.current) {
      shouldStopScrapingRef.current = false; // Reset the flag
      setIsLoading(false);
      return;
    }
    
    try {
      const { items, hasMorePages: morePages, nextPageUrl: newNextPageUrl } = 
        await ZenScraperService.scrapeNextPage(url);
      
      // Check again if stopping was requested during the API call
      if (shouldStopScrapingRef.current) {
        shouldStopScrapingRef.current = false; // Reset the flag
        setIsLoading(false);
        toast({
          title: "Scraping stopped",
          description: `Completed ${scrapedPages} pages before stopping`,
        });
        return;
      }
      
      setResults(prevResults => [...prevResults, ...items]);
      setFilteredResults(prevResults => [...prevResults, ...items]);
      setScrapedPages(prev => prev + 1);
      setNextPageUrl(newNextPageUrl);
      setHasMorePages(morePages);

      toast({
        title: "Page scraped successfully",
        description: `Added ${items.length} new items from page ${scrapedPages + 1}`,
      });

      // Check if we should stop scraping
      if (shouldStopScrapingRef.current) {
        shouldStopScrapingRef.current = false; // Reset the flag
        setIsLoading(false);
        toast({
          title: "Scraping stopped",
          description: `Completed ${scrapedPages + 1} pages before stopping`,
        });
        return;
      }

      // Only continue if we're still in loading state (not stopped)
      if (isLoading && morePages && newNextPageUrl) {
        // Use setTimeout instead to ensure the stop flag can be checked
        setTimeout(() => {
          // Check again before starting the next page
          if (!shouldStopScrapingRef.current && isLoading) {
            handleScrapeNextPage(newNextPageUrl);
          } else {
            shouldStopScrapingRef.current = false; // Reset the flag
            setIsLoading(false);
          }
        }, 2000); // 2 second delay between pages
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Scraping error:', error);
      toast({
        title: "Error",
        description: "Failed to scrape the next page",
        variant: "destructive",
      });
      shouldStopScrapingRef.current = false; // Reset the flag
      setIsLoading(false);
    }
  };

  const handleInitialScrape = async (url: string) => {
    // Reset the stop flag when starting a new scrape
    shouldStopScrapingRef.current = false;
    
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
      
      // Check if stopping was requested during the API call
      if (shouldStopScrapingRef.current) {
        shouldStopScrapingRef.current = false; // Reset the flag
        setIsLoading(false);
        return;
      }
      
      setResults(items);
      setFilteredResults(items);
      setScrapedPages(1);
      setNextPageUrl(newNextPageUrl);
      setHasMorePages(morePages);

      toast({
        title: "First page scraped",
        description: `Found ${items.length} items on the first page`,
      });

      // Check if we should stop scraping
      if (shouldStopScrapingRef.current) {
        shouldStopScrapingRef.current = false; // Reset the flag
        setIsLoading(false);
        return;
      }

      // Only continue if we're still in loading state (not stopped)
      if (isLoading && morePages && newNextPageUrl) {
        setTimeout(() => {
          // Check again before starting the next page
          if (!shouldStopScrapingRef.current && isLoading) {
            handleScrapeNextPage(newNextPageUrl);
          } else {
            shouldStopScrapingRef.current = false; // Reset the flag
            setIsLoading(false);
          }
        }, 2000); // 2 second delay before starting next page
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Scraping error:', error);
      toast({
        title: "Error",
        description: "Failed to scrape the category",
        variant: "destructive",
      });
      shouldStopScrapingRef.current = false; // Reset the flag
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Zen Market Category Scraper</h1>
      
      <ScrapeForm 
        onScrapeStart={handleInitialScrape}
        onScrapeStop={handleStopScraping}
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
