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
    setResults([]);
    setFilteredResults([]);
    setCurrentPage(1);
    setScrapedPages(0);
    setTotalPages(0);

    try {
      // Ensure we're using the /en/ version of the URL for the first page
      let baseUrl = url;
      if (!baseUrl.includes('/en/')) {
        baseUrl = baseUrl.replace('zenmarket.jp/', 'zenmarket.jp/en/');
      }

      // Remove any existing page parameter
      baseUrl = baseUrl.replace(/[?&]p=\d+/, '');

      console.log('Starting scrape with base URL:', baseUrl);
      
      let pageNum = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        setCurrentPage(pageNum);
        
        // For page 1, use the /en/ URL
        // For other pages, remove /en/ and add p=X parameter before other parameters
        let currentPageUrl;
        if (pageNum === 1) {
          currentPageUrl = baseUrl;
        } else {
          const urlWithoutEn = baseUrl.replace('/en/', '/');
          const [basePart, queryPart] = urlWithoutEn.split('?');
          currentPageUrl = `${basePart}?p=${pageNum}${queryPart ? `&${queryPart}` : ''}`;
        }

        console.log('-------------------');
        console.log(`Scraping page ${pageNum}`);
        console.log('URL:', currentPageUrl);
        
        const { items, hasMorePages: more, totalPages: pages } = await ZenScraperService.scrapeCategory(currentPageUrl, pageNum);
        
        console.log(`Raw items from page ${pageNum}:`);
        items.forEach((item, index) => {
          console.log(`Item ${index + 1}:`);
          console.log('- Title:', item.title);
          console.log('- URL:', item.url);
          console.log('- Price:', item.currentPrice);
          console.log('- Time:', item.timeRemaining);
          console.log('---');
        });
        
        setResults(prevResults => [...prevResults, ...items]);
        setFilteredResults(prevResults => [...prevResults, ...items]);
        setTotalPages(pages);
        setScrapedPages(pageNum);

        toast({
          title: `Page ${pageNum} scraped`,
          description: `Added ${items.length} items`,
        });

        hasMorePages = more && pageNum < pages;
        if (hasMorePages) {
          pageNum++;
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      toast({
        title: "Scraping completed",
        description: `Found ${results.length} items across ${pageNum} pages`,
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