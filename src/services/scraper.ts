import { supabase } from "@/integrations/supabase/client";

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
}

export interface ScrapedItem {
  url: string;
  productName: string;
  priceInJPY: number;
  numberOfBids: string;
  timeRemaining: string;
  imageUrl?: string;
}

export class ScraperService {
  static async scrapeZenmarket(url: string): Promise<ScrapedItem> {
    try {
      const { data, error } = await supabase.functions.invoke('scrape-zenmarket', {
        body: { url }
      });

      if (error) {
        console.error('Error scraping Zenmarket:', error);
        throw new Error('Failed to scrape auction data');
      }

      if (!data) {
        throw new Error('No data returned from scraper');
      }

      return {
        url,
        productName: data.productName || 'Unknown Product',
        priceInJPY: data.priceInJPY || 0,
        numberOfBids: data.numberOfBids || '0',
        timeRemaining: data.timeRemaining || 'Unknown',
        imageUrl: data.imageUrl
      };
    } catch (error) {
      console.error('Error in scrapeZenmarket:', error);
      throw new Error('Failed to scrape auction data');
    }
  }
}