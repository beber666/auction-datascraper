import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { ZenScraperService, ScrapedItem } from '@/services/zenScraper';
import { ScrapeForm } from '@/components/zen-scraper/ScrapeForm';
import { ResultsFilter } from '@/components/zen-scraper/ResultsFilter';
import { ResultsTable } from '@/components/zen-scraper/ResultsTable';

export default function ZenScraper() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [results, setResults] = useState<ScrapedItem[]>([]);
  const [filteredResults, setFilteredResults] = useState<ScrapedItem[]>([]);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [scrapedPages, setScrapedPages] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
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

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });

  const handleScrape = async (url: string) => {
    setIsLoading(true);
    // Reset all states at the start of a new scraping session
    setResults([]);
    setFilteredResults([]);
    setHasMorePages(false);
    setTotalPages(0);
    setCurrentPage(1);
    setScrapedPages(0);

    try {
      let currentPageUrl = url;
      let hasNext = true;
      let pageNum = 1;
      let accumulatedResults: ScrapedItem[] = [];

      while (hasNext) {
        setCurrentPage(pageNum);
        
        const { items, hasMorePages: more, totalPages: pages } = await ZenScraperService.scrapeCategory(currentPageUrl, pageNum);
        
        // Accumulate results
        accumulatedResults = [...accumulatedResults, ...items];
        setResults(accumulatedResults);
        setFilteredResults(accumulatedResults);
        setHasMorePages(more);
        setTotalPages(pages);
        setScrapedPages(pageNum);

        hasNext = more;
        if (hasNext) {
          pageNum++;
          currentPageUrl = `${url}&p=${pageNum}`;
          // Add a small delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      toast({
        title: "Success",
        description: `Scraped ${accumulatedResults.length} items from ${pageNum} pages`,
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
      
      <ScrapeForm 
        onScrapeStart={handleScrape}
        isLoading={isLoading}
        currentPage={currentPage}
      />

      {results.length > 0 && (
        <>
          <ResultsFilter 
            results={results}
            onFilterChange={setFilteredResults}
          />
          
          <ResultsTable 
            results={sortedResults}
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