import { TableCell, TableRow } from "@/components/ui/table";
import { PackageItemTotals } from "./types";

interface TotalsRowProps {
  totals: PackageItemTotals;
  formatAmount: (amount: number) => string;
}

export const TotalsRow = ({ totals, formatAmount }: TotalsRowProps) => {
  return (
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
  );
};