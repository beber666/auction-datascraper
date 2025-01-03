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
  isLoading?: boolean;
}

export class ScraperService {
  static async scrapeZenmarket(url: string): Promise<AuctionItem> {
    try {
      console.log('Scraping URL:', url);
      const { data, error } = await supabase.functions.invoke('scrape-zenmarket', {
        body: { url }
      });

      if (error) {
        console.error('Scraping error:', error);
        throw error;
      }
      if (!data) {
        console.error('No data returned from scraper');
        throw new Error('No data returned from scraper');
      }

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
        imageUrl: imageUrl,
        isLoading: false
      };
    } catch (error) {
      console.error('Error scraping auction:', error);
      throw new Error('Failed to scrape auction data');
    }
  }

  static async convertPrice(priceInJPY: number, targetCurrency: string): Promise<string> {
    try {
      console.log('Converting price:', priceInJPY, 'to', targetCurrency);
      const { data, error } = await supabase.functions.invoke('get-exchange-rates', {
        body: { amount: priceInJPY, from: 'JPY', to: targetCurrency }
      });

      if (error) {
        console.error('Price conversion error:', error);
        throw error;
      }
      if (!data) {
        console.error('No exchange rate data returned');
        throw new Error('No exchange rate data returned');
      }

      return data.convertedAmount.toFixed(2) + ' ' + targetCurrency;
    } catch (error) {
      console.error('Error converting price:', error);
      return priceInJPY + ' JPY'; // Fallback to JPY if conversion fails
    }
  }
}