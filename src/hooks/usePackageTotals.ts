import { PackageItem, PackageItemTotals } from "@/components/package-manager/types";

export const usePackageTotals = (items: PackageItem[]) => {
  const calculateTotals = (): PackageItemTotals => {
    return items.reduce(
      (acc, item) => ({
        proxyFee: acc.proxyFee + item.proxyFee,
        price: acc.price + item.price,
        localShippingPrice: acc.localShippingPrice + item.localShippingPrice,
        weight: acc.weight + item.weight,
        internationalShippingShare: acc.internationalShippingShare + item.internationalShippingShare,
        customsFee: acc.customsFee + item.customsFee,
        totalPrice: acc.totalPrice + (
          item.proxyFee + item.price + item.localShippingPrice + 
          item.internationalShippingShare + item.customsFee
        ),
        resalePrice: acc.resalePrice + item.resalePrice,
      }),
      {
        proxyFee: 0,
        price: 0,
        localShippingPrice: 0,
        weight: 0,
        internationalShippingShare: 0,
        customsFee: 0,
        totalPrice: 0,
        resalePrice: 0,
      }
    );
  };

  return { calculateTotals };
};