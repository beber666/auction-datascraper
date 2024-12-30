import { AuctionItem } from "@/services/scraper";
import { TableCell, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { AuctionActions } from "./AuctionActions";

interface AuctionRowProps {
  item: AuctionItem;
  isAlerted: boolean;
  onToggleAlert: (id: string) => void;
  onDelete: (id: string) => void;
}

export const AuctionRow = ({
  item,
  isAlerted,
  onToggleAlert,
  onDelete,
}: AuctionRowProps) => {
  return (
    <TableRow className={item.isLoading ? "opacity-60" : ""}>
      <TableCell className="font-medium">
        {item.isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : (
          item.productName
        )}
      </TableCell>
      <TableCell className="text-green-600 font-semibold">
        {item.currentPrice}
      </TableCell>
      <TableCell className="text-center">{item.numberOfBids}</TableCell>
      <TableCell className="text-blue-600">{item.timeRemaining}</TableCell>
      <TableCell className="text-right">
        <AuctionActions
          id={item.id}
          url={item.url}
          isAlerted={isAlerted}
          onToggleAlert={onToggleAlert}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
};