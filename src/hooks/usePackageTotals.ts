import { PackageItem, PackageItemTotals } from "@/components/package-manager/types";

export const usePackageTotals = (items: PackageItem[]) => {
  const calculateTotals = (): PackageItemTotals => {
    return items.reduce(
      (acc, item) => ({
        proxyFee: acc.proxyFee + item.proxy_fee,
        price: acc.price + item.price,
        localShippingPrice: acc.localShippingPrice + item.local_shipping_price,
        weight: acc.weight + item.weight,
        internationalShippingShare: acc.internationalShippingShare + item.international_shipping_share,
        customsFee: acc.customsFee + item.customs_fee,
        totalPrice: acc.totalPrice + (
          item.proxy_fee + item.price + item.local_shipping_price + 
          item.international_shipping_share + item.customs_fee
        ),
        resalePrice: acc.resalePrice + item.resale_price,
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