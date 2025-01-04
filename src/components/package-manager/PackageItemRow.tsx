import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { PackageItem } from "./types";

interface PackageItemRowProps {
  item: PackageItem;
  onDelete: (id: number) => void;
  onUpdate: (id: number, field: keyof PackageItem, value: string | number) => void;
  formatAmount: (amount: number) => string;
}

export const PackageItemRow = ({ item, onDelete, onUpdate, formatAmount }: PackageItemRowProps) => {
  const calculateTotalPrice = (item: PackageItem) => {
    return item.proxyFee + item.price + item.localShippingPrice + 
           item.internationalShippingShare + item.customsFee;
  };

  const handleNumberChange = (field: keyof PackageItem, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numValue)) {
      onUpdate(item.id, field, numValue);
    }
  };

  return (
    <TableRow>
      <TableCell>
        <Input 
          value={item.name}
          onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
          className="w-full"
        />
      </TableCell>
      <TableCell>
        <Input 
          value={item.productUrl}
          onChange={(e) => onUpdate(item.id, 'productUrl', e.target.value)}
          className="w-full"
        />
      </TableCell>
      <TableCell>
        <Input 
          value={item.platformId}
          onChange={(e) => onUpdate(item.id, 'platformId', e.target.value)}
          className="w-full"
        />
      </TableCell>
      <TableCell className="text-right">
        <Input 
          type="number"
          value={item.proxyFee}
          onChange={(e) => handleNumberChange('proxyFee', e.target.value)}
          className="w-full text-right"
        />
      </TableCell>
      <TableCell className="text-right">
        <Input 
          type="number"
          value={item.price}
          onChange={(e) => handleNumberChange('price', e.target.value)}
          className="w-full text-right"
        />
      </TableCell>
      <TableCell className="text-right">
        <Input 
          type="number"
          value={item.localShippingPrice}
          onChange={(e) => handleNumberChange('localShippingPrice', e.target.value)}
          className="w-full text-right"
        />
      </TableCell>
      <TableCell className="text-right">
        <Input 
          type="number"
          value={item.weight}
          onChange={(e) => handleNumberChange('weight', e.target.value)}
          className="w-full text-right"
        />
      </TableCell>
      <TableCell className="text-right">
        <Input 
          type="number"
          value={item.internationalShippingShare}
          onChange={(e) => handleNumberChange('internationalShippingShare', e.target.value)}
          className="w-full text-right"
        />
      </TableCell>
      <TableCell className="text-right">
        <Input 
          type="number"
          value={item.customsFee}
          onChange={(e) => handleNumberChange('customsFee', e.target.value)}
          className="w-full text-right"
        />
      </TableCell>
      <TableCell className="text-right">{formatAmount(calculateTotalPrice(item))}</TableCell>
      <TableCell className="text-right">
        <Input 
          type="number"
          value={item.resalePrice}
          onChange={(e) => handleNumberChange('resalePrice', e.target.value)}
          className="w-full text-right"
        />
      </TableCell>
      <TableCell>
        <Input 
          value={item.resaleComment}
          onChange={(e) => onUpdate(item.id, 'resaleComment', e.target.value)}
          className="w-full"
        />
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(item.id)}
          className="text-destructive hover:text-destructive/90"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};