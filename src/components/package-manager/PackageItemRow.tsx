import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { PackageItem } from "./types";
import { useState, useEffect } from "react";
import { PackageItemActions } from "./PackageItemActions";

interface PackageItemRowProps {
  item: PackageItem;
  onDelete: (id: number) => void;
  onUpdate: (id: number, field: keyof PackageItem, value: string | number) => void;
  formatAmount: (amount: number) => string;
  isEditing: boolean;
}

export const PackageItemRow = ({ 
  item, 
  onDelete, 
  onUpdate, 
  formatAmount, 
  isEditing 
}: PackageItemRowProps) => {
  const [isRowEditing, setIsRowEditing] = useState(false);

  useEffect(() => {
    const isNewItem = !item.name && !item.productUrl && !item.platformId && 
                     item.proxyFee === 0 && item.price === 0 && item.localShippingPrice === 0 &&
                     item.weight === 0 && item.internationalShippingShare === 0 && item.customsFee === 0 &&
                     item.resalePrice === 0 && !item.resaleComment;
    if (isNewItem && isEditing) {
      setIsRowEditing(true);
    }
  }, [item, isEditing]);

  useEffect(() => {
    if (!isEditing) {
      setIsRowEditing(false);
    }
  }, [isEditing]);

  const handleNumberChange = (field: keyof PackageItem, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onUpdate(item.id, field, numValue);
    }
  };

  const renderField = (field: keyof PackageItem, value: string | number, type: "text" | "number" = "text") => {
    if ((isRowEditing || isEditing) && isEditing) {
      return (
        <Input 
          type={type}
          value={value}
          min={type === "number" ? "0" : undefined}
          onChange={(e) => type === "number" 
            ? handleNumberChange(field, e.target.value)
            : onUpdate(item.id, field, e.target.value)
          }
          className={`w-full ${type === "number" ? "text-right" : ""}`}
        />
      );
    }
    
    if (field === 'weight') {
      return `${value}g`;
    }
    return type === "number" ? formatAmount(value as number) : value;
  };

  const totalPrice = item.proxyFee + item.price + item.localShippingPrice + 
                    item.internationalShippingShare + item.customsFee;

  return (
    <TableRow>
      <TableCell>{renderField('name', item.name)}</TableCell>
      <TableCell>{renderField('productUrl', item.productUrl)}</TableCell>
      <TableCell>{renderField('platformId', item.platformId)}</TableCell>
      <TableCell className="text-right">
        {renderField('proxyFee', item.proxyFee, "number")}
      </TableCell>
      <TableCell className="text-right">
        {renderField('price', item.price, "number")}
      </TableCell>
      <TableCell className="text-right">
        {renderField('localShippingPrice', item.localShippingPrice, "number")}
      </TableCell>
      <TableCell className="text-right">
        {renderField('weight', item.weight, "number")}
      </TableCell>
      <TableCell className="text-right">
        {renderField('internationalShippingShare', item.internationalShippingShare, "number")}
      </TableCell>
      <TableCell className="text-right">
        {renderField('customsFee', item.customsFee, "number")}
      </TableCell>
      <TableCell className="text-right">{formatAmount(totalPrice)}</TableCell>
      <TableCell className="text-right">
        {renderField('resalePrice', item.resalePrice, "number")}
      </TableCell>
      <TableCell>{renderField('resaleComment', item.resaleComment)}</TableCell>
      <TableCell>
        <PackageItemActions
          isEditing={isRowEditing && isEditing}
          onToggleEdit={() => isEditing && setIsRowEditing(!isRowEditing)}
          onDelete={() => isEditing && onDelete(item.id)}
        />
      </TableCell>
    </TableRow>
  );
};