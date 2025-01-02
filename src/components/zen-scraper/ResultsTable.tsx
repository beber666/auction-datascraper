import { ScrapedItem } from "@/services/zenScraper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ZenScraperService } from "@/services/zenScraper";

interface ResultsTableProps {
  results: ScrapedItem[];
  scrapedPages: number;
  sortColumn: keyof ScrapedItem | null;
  sortDirection: 'asc' | 'desc';
  onSort: (column: keyof ScrapedItem) => void;
}

export const ResultsTable = ({ 
  results, 
  scrapedPages, 
  sortColumn, 
  sortDirection, 
  onSort 
}: ResultsTableProps) => {
  const handleExport = () => {
    ZenScraperService.exportToExcel(results);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          Results ({results.length} items from {scrapedPages} {scrapedPages === 1 ? 'page' : 'pages'})
        </h2>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export to Excel
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSort('title')}
              >
                Title {sortColumn === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSort('currentPrice')}
              >
                Price {sortColumn === 'currentPrice' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSort('buyoutPrice')}
              >
                Buyout {sortColumn === 'buyoutPrice' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSort('bids')}
              >
                Bids {sortColumn === 'bids' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Categories</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSort('timeRemaining')}
              >
                Time Remaining {sortColumn === 'timeRemaining' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>{item.currentPrice}</TableCell>
                <TableCell>{item.buyoutPrice || 'N/A'}</TableCell>
                <TableCell>{item.bids || '0'}</TableCell>
                <TableCell>{item.categories.join(', ')}</TableCell>
                <TableCell>{item.timeRemaining}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};