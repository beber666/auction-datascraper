import { useState } from "react";
import { PackageItem } from "@/components/package-manager/types";

export const usePackageItems = (initialItems: PackageItem[]) => {
  const [items, setItems] = useState<PackageItem[]>(initialItems);

  const handleAddItem = () => {
    const newItem: PackageItem = {
      id: Date.now(), // Using timestamp as a simple unique id
      name: "",
      productUrl: "",
      platformId: "",
      proxyFee: 0,
      price: 0,
      localShippingPrice: 0,
      weight: 0,
      internationalShippingShare: 0,
      customsFee: 0,
      totalPrice: 0,
      resalePrice: 0,
      resaleComment: "",
    };
    setItems([...items, newItem]);
  };

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
    handleAddItem,
    handleDeleteItem,
    handleUpdateItem,
  };
};