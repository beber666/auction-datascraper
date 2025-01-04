export interface PackageItem {
  id: string;
  package_id: string;
  name: string;
  product_url: string | null;
  platform_id: string | null;
  proxy_fee: number;
  price: number;
  local_shipping_price: number;
  weight: number;
  international_shipping_share: number;
  customs_fee: number;
  resale_price: number;
  resale_comment: string | null;
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