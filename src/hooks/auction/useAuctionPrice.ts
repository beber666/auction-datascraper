import { ScraperService } from "@/services/scraper";

export const useAuctionPrice = () => {
  const convertAuctionPrice = async (priceInJPY: number, currency: string) => {
    return await ScraperService.convertPrice(priceInJPY, currency);
  };

  return { convertAuctionPrice };
};