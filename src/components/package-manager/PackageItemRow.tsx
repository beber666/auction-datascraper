import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Trash2, Edit } from "lucide-react";
import { PackageItem } from "./types";
import { useState } from "react";

interface PackageItemRowProps {
  item: PackageItem;
  onDelete: (id: number) => void;
  onUpdate: (id: number, field: keyof PackageItem, value: string | number) => void;
  formatAmount: (amount: number) => string;
}

export const PackageItemRow = ({ item, onDelete, onUpdate, formatAmount }: PackageItemRowProps) => {
  const [isEditing, setIsEditing] = useState(false);

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

  const renderEditableField = (
    field: keyof PackageItem,
    value: string | number,
    type: "text" | "number" = "text"
  ) => {
    if (isEditing) {
      return (
        <Input 
          type={type}
          value={value}
          onChange={(e) => type === "number" 
            ? handleNumberChange(field, e.target.value)
            : onUpdate(item.id, field, e.target.value)
          }
          className={`w-full ${type === "number" ? "text-right" : ""}`}
        />
      );
    }
    return type === "number" ? formatAmount(value as number) : value;
  };

  return (
    <TableRow>
      <TableCell>
        {renderEditableField('name', item.name)}
      </TableCell>
      <TableCell>
        {renderEditableField('productUrl', item.productUrl)}
      </TableCell>
      <TableCell>
        {renderEditableField('platformId', item.platformId)}
      </TableCell>
      <TableCell className="text-right">
        {renderEditableField('proxyFee', item.proxyFee, "number")}
      </TableCell>
      <TableCell className="text-right">
        {renderEditableField('price', item.price, "number")}
      </TableCell>
      <TableCell className="text-right">
        {renderEditableField('localShippingPrice', item.localShippingPrice, "number")}
      </TableCell>
      <TableCell className="text-right">
        {renderEditableField('weight', item.weight, "number")}
      </TableCell>
      <TableCell className="text-right">
        {renderEditableField('internationalShippingShare', item.internationalShippingShare, "number")}
      </TableCell>
      <TableCell className="text-right">
        {renderEditableField('customsFee', item.customsFee, "number")}
      </TableCell>
      <TableCell className="text-right">{formatAmount(calculateTotalPrice(item))}</TableCell>
      <TableCell className="text-right">
        {renderEditableField('resalePrice', item.resalePrice, "number")}
      </TableCell>
      <TableCell>
        {renderEditableField('resaleComment', item.resaleComment)}
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(!isEditing)}
            className={`${isEditing ? 'text-primary' : 'text-muted-foreground'} hover:text-primary`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(item.id)}
            className="text-destructive hover:text-destructive/90"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};