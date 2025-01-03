import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrapedItem } from "@/services/zenScraper";

interface ResultsTableHeaderProps {
  sortColumn: keyof ScrapedItem | null;
  sortDirection: 'asc' | 'desc';
  onSort: (column: keyof ScrapedItem) => void;
}

export const ResultsTableHeader = ({ 
  sortColumn, 
  sortDirection, 
  onSort 
}: ResultsTableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Image</TableHead>
        <TableHead>Product Name</TableHead>
        <TableHead>Current Price</TableHead>
        <TableHead>Buyout Price</TableHead>
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
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};