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

export class ScraperService {
  static async scrapeZenmarket(url: string): Promise<AuctionItem> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('scrape-zenmarket', {
        body: { url }
      });

      if (error) throw error;
      if (!data) throw new Error('No data returned from scraper');

      const imageUrl = data.image_url || null;
      console.log('Scraped image URL:', imageUrl);

      return {
        id: '',  // will be set by database
        url: url,
        productName: data.title,
        currentPrice: await this.convertPrice(data.price, 'EUR'),
        priceInJPY: data.price,
        numberOfBids: data.bids.toString(),
        timeRemaining: data.timeRemaining,
        lastUpdated: new Date(),
        user_id: '',  // will be set by database
        created_at: new Date().toISOString(),
        imageUrl: imageUrl
      };
    } catch (error) {
      console.error('Error scraping auction:', error);
      throw new Error('Failed to scrape auction data');
    }
  }
}
