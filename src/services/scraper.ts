export interface AuctionItem {
  id: string;
  url: string;
  productName: string;
  currentPrice: string;
  priceInJPY: number;
  numberOfBids: string;
  timeRemaining: string;
  lastUpdated: Date;
  isLoading?: boolean;
  user_id?: string;
  created_at?: string;
  imageUrl?: string | null;
}

interface ExchangeRates {
  rates: {
    [key: string]: number;
  };
}

export class ScraperService {
  private static exchangeRates: ExchangeRates | null = null;
  private static lastRatesFetch: Date | null = null;

  private static async fetchExchangeRates() {
    try {
      if (
        !this.exchangeRates ||
        !this.lastRatesFetch ||
        Date.now() - this.lastRatesFetch.getTime() > 3600000
      ) {
        console.log('Fetching fresh exchange rates...');
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase.functions.invoke('get-exchange-rates');
        
        if (error) {
          console.error('Error fetching exchange rates:', error);
          throw error;
        }
        
        if (!data || !data.rates) {
          throw new Error('Invalid exchange rate data received');
        }
        
        this.exchangeRates = data;
        this.lastRatesFetch = new Date();
        console.log('Exchange rates updated successfully');
      }
      return this.exchangeRates;
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      throw error;
    }
  }

  static async translateText(text: string, targetLang: string): Promise<string> {
    try {
      // Log the incoming translation request
      console.log('Starting translation:', {
        originalText: text,
        targetLanguage: targetLang,
        targetLanguageType: typeof targetLang
      });

      // Skip translation if target language is Japanese or text is empty
      if (targetLang === 'ja' || !text.trim()) {
        console.log('Skipping translation - Japanese target or empty text');
        return text;
      }

      // Check if text contains Japanese characters
      const hasJapanese = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(text);
      if (!hasJapanese) {
        console.log('Text does not contain Japanese characters, skipping translation');
        return text;
      }

      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: { 
          text,
          targetLang: targetLang.toLowerCase() === 'en' ? 'en-US' : targetLang.toLowerCase() 
        }
      });

      if (error) {
        console.error('Translation API error:', error);
        return text;
      }

      if (!data?.translatedText) {
        console.error('Invalid translation response format:', data);
        return text;
      }

      return data.translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }

  static async convertPrice(priceInJPY: number, targetCurrency: string): Promise<string> {
    try {
      const rates = await this.fetchExchangeRates();
      if (!rates || !rates.rates[targetCurrency]) {
        console.warn(`No rate found for ${targetCurrency}, falling back to JPY`);
        return `${priceInJPY} ¥`;
      }

      const convertedPrice = priceInJPY * rates.rates[targetCurrency];
      const currencySymbols: { [key: string]: string } = {
        JPY: '¥',
        EUR: '€',
        USD: '$',
        GBP: '£'
      };

      return `${currencySymbols[targetCurrency]}${convertedPrice.toFixed(2)}`;
    } catch (error) {
      console.error('Price conversion failed:', error);
      return `${priceInJPY} ¥`;
    }
  }

  static async scrapeZenmarket(url: string): Promise<AuctionItem> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
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
        id: Math.random().toString(36).substr(2, 9),
        url: data.url,
        productName: data.productName,
        currentPrice: data.currentPrice,
        priceInJPY: data.priceInJPY,
        numberOfBids: data.numberOfBids,
        timeRemaining: data.timeRemaining,
        lastUpdated: new Date(data.lastUpdated),
        imageUrl: data.imageUrl
      };
    } catch (error) {
      console.error('Error scraping Zenmarket:', error);
      throw new Error('Failed to scrape auction data');
    }
  }
}
