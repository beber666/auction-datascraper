import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { PackageItem } from "./types";
import { PackageItemActions } from "./PackageItemActions";
import { usePackageItemEditing } from "@/hooks/usePackageItemEditing";

interface PackageItemRowProps {
  item: PackageItem;
  onDelete: (id: string) => void;
  onUpdate: (id: string, field: keyof PackageItem, value: string | number) => void;
  formatAmount: (amount: number) => string;
  isEditing: boolean;
}

export const PackageItemRow = ({ 
  item, 
  onDelete, 
  onUpdate, 
  formatAmount, 
  isEditing: isGlobalEditing 
}: PackageItemRowProps) => {
  const { isRowEditing, toggleEditing } = usePackageItemEditing(item, isGlobalEditing);

  const handleNumberChange = (field: keyof PackageItem, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onUpdate(item.id, field, numValue);
    }
  };

  const renderField = (field: keyof PackageItem, value: string | number, type: "text" | "number" = "text") => {
    const isEditable = isRowEditing || isGlobalEditing;
    
    if (isEditable) {
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

  const totalPrice = item.proxy_fee + item.price + item.local_shipping_price + 
                    item.international_shipping_share + item.customs_fee;

  return (
    <TableRow>
      <TableCell>{renderField('name', item.name)}</TableCell>
      <TableCell>{renderField('product_url', item.product_url || '')}</TableCell>
      <TableCell>{renderField('platform_id', item.platform_id || '')}</TableCell>
      <TableCell className="text-right">
        {renderField('proxy_fee', item.proxy_fee, "number")}
      </TableCell>
      <TableCell className="text-right">
        {renderField('price', item.price, "number")}
      </TableCell>
      <TableCell className="text-right">
        {renderField('local_shipping_price', item.local_shipping_price, "number")}
      </TableCell>
      <TableCell className="text-right">
        {renderField('weight', item.weight, "number")}
      </TableCell>
      <TableCell className="text-right">
        {renderField('international_shipping_share', item.international_shipping_share, "number")}
      </TableCell>
      <TableCell className="text-right">
        {renderField('customs_fee', item.customs_fee, "number")}
      </TableCell>
      <TableCell className="text-right">{formatAmount(totalPrice)}</TableCell>
      <TableCell className="text-right">
        {renderField('resale_price', item.resale_price, "number")}
      </TableCell>
      <TableCell>{renderField('resale_comment', item.resale_comment || '')}</TableCell>
      <TableCell>
        <PackageItemActions
          isEditing={isRowEditing}
          onToggleEdit={toggleEditing}
          onDelete={() => onDelete(item.id)}
        />
      </TableCell>
    </TableRow>
  );
};