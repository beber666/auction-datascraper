export interface PackageItem {
  id: number;
  name: string;
  productUrl: string;
  platformId: string;
  proxyFee: number;
  price: number;
  localShippingPrice: number;
  weight: number;
  internationalShippingShare: number;
  customsFee: number;
  totalPrice: number;
  resalePrice: number;
  resaleComment: string;
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