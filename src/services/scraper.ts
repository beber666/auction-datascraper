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

import { supabase } from "@/integrations/supabase/client";

export class ScraperService {
  static async scrapeZenmarket(url: string): Promise<Partial<AuctionItem>> {
    const { data, error } = await supabase.functions.invoke('scrape-zenmarket', {
      body: { url }
    });

    if (error) {
      console.error('Scraping error:', error);
      throw new Error('Failed to scrape auction data');
    }

    return data;
  }

  static async translateText(text: string, targetLanguage: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('translate', {
      body: { text, targetLanguage }
    });

    if (error) {
      console.error('Translation error:', error);
      throw new Error('Failed to translate text');
    }

    return data.translatedText;
  }

  static async convertPrice(priceInJPY: number, targetCurrency: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('convert-currency', {
      body: { amount: priceInJPY, from: 'JPY', to: targetCurrency }
    });

    if (error) {
      console.error('Currency conversion error:', error);
      throw new Error('Failed to convert currency');
    }

    return data.convertedAmount;
  }
}