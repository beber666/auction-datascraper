import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

type SortColumn = 'numberOfBids' | 'timeRemaining' | null;
type SortDirection = 'asc' | 'desc';

interface AuctionTableHeaderProps {
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
}

export const AuctionTableHeader = ({ 
  sortColumn, 
  sortDirection, 
  onSort 
}: AuctionTableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[100px]">Image</TableHead>
        <TableHead>Product Name</TableHead>
        <TableHead>Current Price</TableHead>
        <TableHead 
          className="text-center cursor-pointer hover:bg-muted/50"
          onClick={() => onSort('numberOfBids')}
        >
          Bids {sortColumn === 'numberOfBids' && (sortDirection === 'asc' ? '↑' : '↓')}
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