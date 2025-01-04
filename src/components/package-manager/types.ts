export interface PackageItem {
  id: string;
  name: string;
  productUrl: string | null;
  platformId: string | null;
  proxyFee: number;
  price: number;
  localShippingPrice: number;
  weight: number;
  internationalShippingShare: number;
  customsFee: number;
  resalePrice: number;
  resaleComment: string | null;
}

export interface PackageItemTotals {
  proxyFee: number;
  price: number;
  localShippingPrice: number;
  weight: number;
  internationalShippingShare: number;
  customsFee: number;
  totalPrice: number;
  resalePrice: number;
}