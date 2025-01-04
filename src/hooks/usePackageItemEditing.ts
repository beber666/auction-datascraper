import { useState, useEffect } from "react";
import { PackageItem } from "@/components/package-manager/types";

export const usePackageItemEditing = (item: PackageItem, isGlobalEditing: boolean) => {
  const [isRowEditing, setIsRowEditing] = useState(false);

  useEffect(() => {
    const isNewItem = !item.name && !item.product_url && !item.platform_id && 
                     item.proxy_fee === 0 && item.price === 0 && item.local_shipping_price === 0 &&
                     item.weight === 0 && item.international_shipping_share === 0 && item.customs_fee === 0 &&
                     item.resale_price === 0 && !item.resale_comment;

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