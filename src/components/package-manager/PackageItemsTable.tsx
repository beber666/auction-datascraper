import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
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
  const calculateTotals = () => {
    return items.reduce(
      (acc, item) => ({
        proxyFee: acc.proxyFee + item.proxyFee,
        price: acc.price + item.price,
        localShippingPrice: acc.localShippingPrice + item.localShippingPrice,
        weight: acc.weight + item.weight,
        internationalShippingShare: acc.internationalShippingShare + item.internationalShippingShare,
        customsFee: acc.customsFee + item.customsFee,
        totalPrice: acc.totalPrice + (item.proxyFee + item.price + item.localShippingPrice + 
                                    item.internationalShippingShare + item.customsFee),
        resalePrice: acc.resalePrice + item.resalePrice,
      }),
      {
        proxyFee: 0,
        price: 0,
        localShippingPrice: 0,
        weight: 0,
        internationalShippingShare: 0,
        customsFee: 0,
        totalPrice: 0,
        resalePrice: 0,
      }
    );
  };

  const totals = calculateTotals();

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
        <TableRow className="font-bold bg-muted/50">
          <TableCell colSpan={3}>Totals</TableCell>
          <TableCell className="text-right">{formatAmount(totals.proxyFee)}</TableCell>
          <TableCell className="text-right">{formatAmount(totals.price)}</TableCell>
          <TableCell className="text-right">{formatAmount(totals.localShippingPrice)}</TableCell>
          <TableCell className="text-right">{totals.weight}g</TableCell>
          <TableCell className="text-right">{formatAmount(totals.internationalShippingShare)}</TableCell>
          <TableCell className="text-right">{formatAmount(totals.customsFee)}</TableCell>
          <TableCell className="text-right">{formatAmount(totals.totalPrice)}</TableCell>
          <TableCell className="text-right">{formatAmount(totals.resalePrice)}</TableCell>
          <TableCell colSpan={2}></TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};