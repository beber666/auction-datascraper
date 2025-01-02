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
      let baseUrl = url;
      // Remove any existing page parameter
      baseUrl = baseUrl.replace(/&p=\d+/, '');
      
      let hasNext = true;
      let pageNum = 1;
      const seenUrls = new Set<string>();
      const allResults: ScrapedItem[] = [];

      while (hasNext) {
        setCurrentPage(pageNum);
        const currentPageUrl = pageNum === 1 ? baseUrl : `${baseUrl}&p=${pageNum}`;
        console.log('Scraping URL:', currentPageUrl);
        
        const { items, hasMorePages: more, totalPages: pages } = await ZenScraperService.scrapeCategory(currentPageUrl, pageNum);
        console.log(`Page ${pageNum}: Found ${items.length} items, hasMore: ${more}, total pages: ${pages}`);
        
        // Filter out duplicates based on URL
        const uniqueItems = items.filter(item => {
          if (seenUrls.has(item.url)) {
            return false;
          }
          seenUrls.add(item.url);
          return true;
        });

        // Add new unique items to our accumulated results
        allResults.push(...uniqueItems);
        
        // Update both results and filtered results with the complete set
        setResults([...allResults]);
        setFilteredResults([...allResults]);
        
        setHasMorePages(more);
        setTotalPages(pages);
        setScrapedPages(pageNum);

        hasNext = more;
        if (hasNext) {
          pageNum++;
          // Add a small delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      toast({
        title: "Success",
        description: `Scraped ${seenUrls.size} unique items from ${pageNum} pages`,
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