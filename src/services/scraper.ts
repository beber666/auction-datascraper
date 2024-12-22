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
    if (
      !this.exchangeRates ||
      !this.lastRatesFetch ||
      Date.now() - this.lastRatesFetch.getTime() > 3600000
    ) {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/JPY');
      this.exchangeRates = await response.json();
      this.lastRatesFetch = new Date();
    }
    return this.exchangeRates;
  }

  static async translateText(text: string, targetLang: string): Promise<string> {
    try {
      console.log('Translation request:', {
        text,
        targetLang,
        textLength: text.length,
        hasJapanese: /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(text)
      });

      // Skip translation if target language is Japanese or if text is empty
      if (targetLang === 'ja' || !text.trim()) return text;

      const encodedText = encodeURIComponent(text);
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=${targetLang}&dt=t&q=${encodedText}`
      );

      if (!response.ok) {
        console.error('Translation API error:', await response.text());
        return text;
      }

      const data = await response.json();
      console.log('Translation API response:', JSON.stringify(data));

      if (!data || !data[0] || !data[0][0] || !data[0][0][0]) {
        console.error('Unexpected translation response format:', data);
        return text;
      }

      const translatedText = data[0][0][0];
      console.log('Translation result:', {
        original: text,
        translated: translatedText,
        targetLang
      });

      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }

  static async convertPrice(priceInJPY: number, targetCurrency: string): Promise<string> {
    const rates = await this.fetchExchangeRates();
    if (!rates || !rates.rates[targetCurrency]) {
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