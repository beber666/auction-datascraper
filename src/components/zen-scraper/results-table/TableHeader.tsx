import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrapedItem } from "@/services/zenScraper";

interface TableHeaderProps {
  sortColumn: keyof ScrapedItem | null;
  sortDirection: 'asc' | 'desc';
  onSort: (column: keyof ScrapedItem) => void;
}

export const TableHeader = ({ sortColumn, sortDirection, onSort }: TableHeaderProps) => {
  return (
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
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};