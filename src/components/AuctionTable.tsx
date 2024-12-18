import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AuctionItem } from "@/services/scraper";
import { ExternalLink, Trash2 } from "lucide-react";
import { Button } from "./ui/button";

interface AuctionTableProps {
  items: AuctionItem[];
  onDelete: (id: string) => void;
}

export const AuctionTable = ({ items, onDelete }: AuctionTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Current Price</TableHead>
            <TableHead className="text-center">Bids</TableHead>
            <TableHead>Time Remaining</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.productName}</TableCell>
              <TableCell className="text-green-600 font-semibold">
                {item.currentPrice}
              </TableCell>
              <TableCell className="text-center">{item.numberOfBids}</TableCell>
              <TableCell className="text-blue-600">{item.timeRemaining}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(item.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};