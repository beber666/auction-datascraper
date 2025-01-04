import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PackageItem } from "./types";
import { PackageItemRow } from "./PackageItemRow";

interface PackageItemsTableProps {
  items: PackageItem[];
  onDeleteItem: (id: number) => void;
  onUpdateItem: (id: number, field: keyof PackageItem, value: string | number) => void;
  formatAmount: (amount: number) => string;
  isEditing: boolean;
}

export const PackageItemsTable = ({
  items,
  onDeleteItem,
  onUpdateItem,
  formatAmount,
  isEditing,
}: PackageItemsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Product URL</TableHead>
          <TableHead>Platform ID</TableHead>
          <TableHead className="text-right">Proxy Fee</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Local Shipping</TableHead>
          <TableHead className="text-right">Weight (g)</TableHead>
          <TableHead className="text-right">Int'l Shipping Share</TableHead>
          <TableHead className="text-right">Customs Fee</TableHead>
          <TableHead className="text-right">Total Price</TableHead>
          <TableHead className="text-right">Resale Price</TableHead>
          <TableHead>Resale Comment</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <PackageItemRow
            key={item.id}
            item={item}
            onDelete={onDeleteItem}
            onUpdate={onUpdateItem}
            formatAmount={formatAmount}
            isEditing={isEditing}
          />
        ))}
      </TableBody>
    </Table>
  );
};