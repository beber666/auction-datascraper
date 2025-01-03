import { AuctionItem } from "@/services/scraper";
import { TableCell, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { AuctionActions } from "@/components/AuctionActions";

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
  console.log("Full item data:", item);
  console.log("Image URL for item:", item.id, item.imageUrl);

  return (
    <TableRow className={item.isLoading ? "opacity-60" : ""}>
      <TableCell className="w-[100px]">
        {item.imageUrl && (
          <img 
            src={item.imageUrl}
            alt={item.productName}
            className="w-[100px] h-[80px] object-cover rounded-md"
            onError={(e) => {
              console.error("Error loading image:", item.imageUrl);
              e.currentTarget.style.display = 'none';
            }}
            onLoad={() => console.log("Image loaded successfully:", item.imageUrl)}
          />
        )}
      </TableCell>
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