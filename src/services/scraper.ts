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
    if (targetLang === 'en') return text;
    
    try {
      const encodedText = encodeURIComponent(text);
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodedText}`
      );

      if (!response.ok) {
        console.error('Translation failed:', await response.text());
        return text;
      }

      const data = await response.json();
      return data[0][0][0];
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
      const response = await fetch('https://yssapojsghmotbifhybq.supabase.co/functions/v1/scrape-zenmarket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to scrape auction data: ${error}`);
      }

      const data = await response.json();
      
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