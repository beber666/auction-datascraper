import { useState } from "react";
import { PackageItem } from "@/components/package-manager/types";

export const usePackageItems = (initialItems: PackageItem[]) => {
  const [items, setItems] = useState<PackageItem[]>(initialItems);

  const handleDeleteItem = (itemId: number) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleUpdateItem = (itemId: number, field: keyof PackageItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === itemId 
        ? { ...item, [field]: value }
        : item
    ));
  };

  return {
    items,
    handleDeleteItem,
    handleUpdateItem,
  };
};