import { useState, useEffect } from "react";
import { PackageItem } from "@/components/package-manager/types";

export const usePackageItemEditing = (item: PackageItem, isGlobalEditing: boolean) => {
  const [isRowEditing, setIsRowEditing] = useState(false);

  useEffect(() => {
    const isNewItem = !item.name && !item.productUrl && !item.platformId && 
                     item.proxyFee === 0 && item.price === 0 && item.localShippingPrice === 0 &&
                     item.weight === 0 && item.internationalShippingShare === 0 && item.customsFee === 0 &&
                     item.resalePrice === 0 && !item.resaleComment;

    if (isNewItem && isGlobalEditing) {
      setIsRowEditing(true);
    }
  }, [item, isGlobalEditing]);

  useEffect(() => {
    if (isGlobalEditing) {
      setIsRowEditing(true);
    } else {
      setIsRowEditing(false);
    }
  }, [isGlobalEditing]);

  const toggleEditing = () => setIsRowEditing(!isRowEditing);

  return {
    isRowEditing,
    toggleEditing
  };
};