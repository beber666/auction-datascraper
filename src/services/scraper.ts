export interface AuctionItem {
  id: string;
  url: string;
  productName: string;
  currentPrice: string;
  priceInJPY: number;
  numberOfBids: string;
  timeRemaining: string;
  lastUpdated: Date;
  imageUrl?: string;
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

  private static getProxiedImageUrl(originalUrl: string): string {
    if (!originalUrl) return '';
    // Using the hardcoded Supabase project URL since it's public anyway
    const proxyUrl = `https://yssapojsghmotbifhybq.supabase.co/functions/v1/proxy-image`;
    return `${proxyUrl}?url=${encodeURIComponent(originalUrl)}`;
  }

  static async scrapeZenmarket(url: string): Promise<AuctionItem> {
    try {
      console.log('Fetching URL:', url);
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
      
      // Enhanced image extraction
      let imageUrl = '';
      const imgElement = doc.querySelector('#imgPreview');
      
      if (imgElement) {
        imageUrl = imgElement.getAttribute('src') || '';
        if (imageUrl && !imageUrl.startsWith('http')) {
          const baseUrl = new URL(url).origin;
          imageUrl = new URL(imageUrl, baseUrl).toString();
        }
      } else {
        const alternativeImg = doc.querySelector('.item-image img') || 
                             doc.querySelector('.main-image img') ||
                             doc.querySelector('[data-testid="product-image"]');
        if (alternativeImg) {
          imageUrl = alternativeImg.getAttribute('src') || '';
        }
      }

      // Proxy the image URL through our Edge Function
      const proxiedImageUrl = this.getProxiedImageUrl(imageUrl);

      const item: AuctionItem = {
        id: Math.random().toString(36).substr(2, 9),
        url,
        productName,
        currentPrice: `¥${priceInJPY.toLocaleString()}`,
        priceInJPY,
        numberOfBids,
        timeRemaining,
        lastUpdated: new Date(),
        imageUrl: proxiedImageUrl,
      };

      console.log('Scraped item:', item);
      return item;
    } catch (error) {
      console.error('Error scraping Zenmarket:', error);
      throw new Error('Failed to scrape auction data');
    }
  }

  static async translateText(text: string, targetLang: string): Promise<string> {
    if (!text || targetLang === 'en') return text;
    
    try {
      console.log(`Translating text to ${targetLang}:`, text);
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
      );

      if (!response.ok) {
        console.error('Translation failed:', await response.text());
        return text;
      }

      const data = await response.json();
      const translatedText = data[0][0][0];
      console.log('Translated text:', translatedText);
      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }

  static async convertPrice(priceInJPY: number, targetCurrency: string): Promise<string> {
    if (!priceInJPY || targetCurrency === 'JPY') {
      return `¥${priceInJPY.toLocaleString()}`;
    }

    try {
      const rates = await this.fetchExchangeRates();
      if (!rates || !rates.rates[targetCurrency]) {
        return `¥${priceInJPY.toLocaleString()}`;
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
      console.error('Price conversion error:', error);
      return `¥${priceInJPY.toLocaleString()}`;
    }
  }
}