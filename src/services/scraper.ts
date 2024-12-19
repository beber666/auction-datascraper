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
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (!data.contents) {
        throw new Error("Failed to fetch page contents");
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'text/html');

      const productName = doc.querySelector('#itemTitle')?.textContent?.trim() || 'N/A';
      const priceText = doc.querySelector('#lblPriceY')?.textContent?.trim() || '0';
      const priceInJPY = parseInt(priceText.replace(/[^0-9]/g, ''));
      const numberOfBids = doc.querySelector('#bidNum')?.textContent?.trim() || '0';
      const timeRemaining = doc.querySelector('#lblTimeLeft')?.textContent?.trim() || 'N/A';

      console.log('Scraped item:', {
        productName,
        priceInJPY,
        numberOfBids,
        timeRemaining
      });

      return {
        id: Math.random().toString(36).substr(2, 9),
        url,
        productName,
        currentPrice: `¥${priceInJPY.toLocaleString()}`,
        priceInJPY,
        numberOfBids,
        timeRemaining,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error scraping Zenmarket:', error);
      throw new Error('Failed to scrape auction data');
    }
  }
}