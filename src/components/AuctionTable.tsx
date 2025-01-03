import { Table, TableBody } from "@/components/ui/table";
import { AuctionItem } from "@/services/scraper";
import { AuctionRow } from "./auction/AuctionRow";
import { AuctionTableHeader } from "./auction/AuctionTableHeader";
import { DeleteAllButton } from "./auction/DeleteAllButton";
import { useAuctionAlerts } from "@/hooks/useAuctionAlerts";
import { useAuctionSort } from "@/hooks/useAuctionSort";

interface AuctionTableProps {
  items: AuctionItem[];
  onDelete: (id: string) => void;
}

export const AuctionTable = ({ items, onDelete }: AuctionTableProps) => {
  const { alertedAuctions, toggleAlert } = useAuctionAlerts();
  const { sortColumn, sortDirection, handleSort, getSortedItems } = useAuctionSort(items);

  const handleDeleteAll = (ids: string[]) => {
    ids.forEach(id => onDelete(id));
  };

  const sortedItems = getSortedItems();

  return (
    <div className="rounded-md border w-full max-w-[1200px] mx-auto">
      <Table>
        <AuctionTableHeader 
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
        <TableBody>
          {sortedItems.map((item) => (
            <AuctionRow
              key={item.id}
              item={item}
              isAlerted={alertedAuctions.includes(item.id)}
              onToggleAlert={toggleAlert}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
      {items.length > 0 && (
        <div className="p-4 flex justify-end border-t">
          <DeleteAllButton
            onDeleteAll={handleDeleteAll}
            itemIds={items.map(item => item.id)}
          />
        </div>
      )}
    </div>
  );
};