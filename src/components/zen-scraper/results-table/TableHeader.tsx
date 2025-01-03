import {
  TableHead,
  TableHeader as UITableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrapedItem } from "@/services/zenScraper";

interface ResultsTableHeaderProps {
  sortColumn: keyof ScrapedItem | null;
  sortDirection: 'asc' | 'desc';
  onSort: (column: keyof ScrapedItem) => void;
}

export const ResultsTableHeader = ({ sortColumn, sortDirection, onSort }: ResultsTableHeaderProps) => {
  return (
    <UITableHeader>
      <TableRow>
        <TableHead>Image</TableHead>
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
        <TableHead 
          className="cursor-pointer hover:bg-muted/50"
          onClick={() => onSort('timeRemaining')}
        >
          Time Remaining {sortColumn === 'timeRemaining' && (sortDirection === 'asc' ? '↑' : '↓')}
        </TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </UITableHeader>
  );
};