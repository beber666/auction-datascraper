import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { PackageItem, PackageItemTotals } from "./types";
import { PackageItemRow } from "./PackageItemRow";

interface PackageItemsTableProps {
  items: PackageItem[];
  onDeleteItem: (id: number) => void;
  onUpdateItem: (id: number, field: keyof PackageItem, value: string | number) => void;
  formatAmount: (amount: number) => string;
}

export const PackageItemsTable = ({ 
  items, 
  onDeleteItem, 
  onUpdateItem,
  formatAmount 
}: PackageItemsTableProps) => {
  const calculateTotals = (items: PackageItem[]): PackageItemTotals => {
    return items.reduce((acc, item) => ({
      proxyFee: acc.proxyFee + item.proxyFee,
      price: acc.price + item.price,
      localShippingPrice: acc.localShippingPrice + item.localShippingPrice,
      weight: acc.weight + item.weight,
      internationalShippingShare: acc.internationalShippingShare + item.internationalShippingShare,
      customsFee: acc.customsFee + item.customsFee,
      totalPrice: acc.totalPrice + (
        item.proxyFee + 
        item.price + 
        item.localShippingPrice + 
        item.internationalShippingShare + 
        item.customsFee
      ),
      resalePrice: acc.resalePrice + item.resalePrice,
    }), {
      proxyFee: 0,
      price: 0,
      localShippingPrice: 0,
      weight: 0,
      internationalShippingShare: 0,
      customsFee: 0,
      totalPrice: 0,
      resalePrice: 0,
    });
  };

  const totals = calculateTotals(items);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Name</TableHead>
          <TableHead className="w-[100px]">Product Link</TableHead>
          <TableHead className="w-[120px]">Platform ID</TableHead>
          <TableHead className="text-right w-[100px]">Proxy Fee</TableHead>
          <TableHead className="text-right w-[100px]">Price</TableHead>
          <TableHead className="text-right w-[100px]">Local Shipping</TableHead>
          <TableHead className="text-right w-[100px]">Weight (kg)</TableHead>
          <TableHead className="text-right w-[100px]">Int. Shipping</TableHead>
          <TableHead className="text-right w-[100px]">Customs Fee</TableHead>
          <TableHead className="text-right w-[100px]">Total Price</TableHead>
          <TableHead className="text-right w-[100px]">Resale Price</TableHead>
          <TableHead className="w-[200px]">Comment</TableHead>
          <TableHead className="w-[50px]"></TableHead>
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
          />
        ))}
      </TableBody>
      <TableFooter>
        <TableRow className="font-medium">
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">{formatAmount(totals.proxyFee)}</TableCell>
          <TableCell className="text-right">{formatAmount(totals.price)}</TableCell>
          <TableCell className="text-right">{formatAmount(totals.localShippingPrice)}</TableCell>
          <TableCell className="text-right">{totals.weight.toFixed(2)}</TableCell>
          <TableCell className="text-right">{formatAmount(totals.internationalShippingShare)}</TableCell>
          <TableCell className="text-right">{formatAmount(totals.customsFee)}</TableCell>
          <TableCell className="text-right">{formatAmount(totals.totalPrice)}</TableCell>
          <TableCell className="text-right">{formatAmount(totals.resalePrice)}</TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};