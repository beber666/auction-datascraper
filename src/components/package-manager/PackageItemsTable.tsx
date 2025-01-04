import { Table, TableBody } from "@/components/ui/table";
import { PackageItem } from "./types";
import { PackageItemRow } from "./PackageItemRow";
import { PackageTableHeader } from "./TableHeader";
import { TotalsRow } from "./TotalsRow";
import { usePackageTotals } from "@/hooks/usePackageTotals";

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
  const { calculateTotals } = usePackageTotals(items);
  const totals = calculateTotals();

  return (
    <Table>
      <PackageTableHeader />
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
        <TotalsRow totals={totals} formatAmount={formatAmount} />
      </TableBody>
    </Table>
  );
};