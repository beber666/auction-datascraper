import { Button } from "@/components/ui/button";
import { TableCell, TableRow as UITableRow } from "@/components/ui/table";
import { ScrapedItem } from "@/services/zenScraper";
import { ExternalLink, PlusCircle } from "lucide-react";

interface TableRowProps {
  item: ScrapedItem;
  onAddToTracker: (item: ScrapedItem) => void;
}

export const TableRow = ({ item, onAddToTracker }: TableRowProps) => {
  return (
    <UITableRow>
      <TableCell>
        {item.imageUrl && (
          <img 
            src={item.imageUrl} 
            alt={item.title}
            className="w-[100px] h-[80px] object-cover rounded-md"
          />
        )}
      </TableCell>
      <TableCell className="font-medium">
        <a 
          href={item.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          {item.title}
          <ExternalLink className="h-4 w-4" />
        </a>
      </TableCell>
      <TableCell>{item.currentPrice}</TableCell>
      <TableCell>{item.buyoutPrice || 'N/A'}</TableCell>
      <TableCell>{item.bids || '0'}</TableCell>
      <TableCell>{item.timeRemaining}</TableCell>
      <TableCell>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onAddToTracker(item)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add to Tracker
        </Button>
      </TableCell>
    </UITableRow>
  );
};