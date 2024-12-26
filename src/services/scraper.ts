export interface AuctionItem {
  id: string;
  url: string;
  productName: string;
  currentPrice: string;
  priceInJPY: number;
  numberOfBids: string;
  timeRemaining: string;
  lastUpdated: Date;
  user_id: string;
  created_at: string;
  imageUrl?: string;
  isLoading?: boolean;
  endTime?: Date | null;
}
