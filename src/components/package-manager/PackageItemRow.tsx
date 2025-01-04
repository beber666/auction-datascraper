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

export const PackageItemRow = ({ item, onDelete, onUpdate, formatAmount, isEditing }: PackageItemRowProps) => {
  const [isRowEditing, setIsRowEditing] = useState(false);

  // Set isRowEditing to true if this is a new item (all fields empty)
  useEffect(() => {
    const isNewItem = !item.name && !item.productUrl && !item.platformId && 
                     item.proxyFee === 0 && item.price === 0 && item.localShippingPrice === 0 &&
                     item.weight === 0 && item.internationalShippingShare === 0 && item.customsFee === 0 &&
                     item.resalePrice === 0 && !item.resaleComment;
    if (isNewItem && isEditing) {
      setIsRowEditing(true);
    }
  }, [item, isEditing]);

  // Reset row editing state when global editing state changes
  useEffect(() => {
    if (!isEditing) {
      setIsRowEditing(false);
    }
  }, [isEditing]);

  const calculateTotalPrice = (item: PackageItem) => {
    return item.proxyFee + item.price + item.localShippingPrice + 
           item.internationalShippingShare + item.customsFee;
  };

  const handleNumberChange = (field: keyof PackageItem, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onUpdate(item.id, field, numValue);
    }
  };

  const renderEditableField = (
    field: keyof PackageItem,
    value: string | number,
    type: "text" | "number" = "text",
    isTotal: boolean = false
  ) => {
    // Si c'est un total, on ne rend jamais le champ éditable
    if (isTotal) {
      return type === "number" ? formatAmount(value as number) : value;
    }

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
    // Special handling for weight field
    if (field === 'weight') {
      return `${value}g`;
    }
    return type === "number" ? formatAmount(value as number) : value;
  };

  return (
    <TableRow>
      <TableCell>{renderEditableField('name', item.name)}</TableCell>
      <TableCell>{renderEditableField('productUrl', item.productUrl)}</TableCell>
      <TableCell>{renderEditableField('platformId', item.platformId)}</TableCell>
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
      <TableCell className="text-right">{renderEditableField('totalPrice', calculateTotalPrice(item), "number", true)}</TableCell>
      <TableCell className="text-right">
        {renderEditableField('resalePrice', item.resalePrice, "number")}
      </TableCell>
      <TableCell>{renderEditableField('resaleComment', item.resaleComment)}</TableCell>
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