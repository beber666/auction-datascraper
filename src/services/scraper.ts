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

  static async scrapeZenmarket(url: string): Promise<AuctionItem> {
    try {
      console.log('Fetching URL:', url);
      
      const { data, error } = await supabase.functions.invoke('scrape-auction', {
        body: { url },
      });

      if (error) {
        console.error('Error scraping Zenmarket:', error);
        throw new Error('Failed to fetch auction data');
      }

      if (!data || !data.contents) {
        throw new Error("Failed to fetch page contents");
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'text/html');
      
      const productName = doc.querySelector('#itemTitle')?.textContent?.trim() || 'N/A';
      const priceText = doc.querySelector('#lblPriceY')?.textContent?.trim() || '0';
      const priceInJPY = parseInt(priceText.replace(/[^0-9]/g, ''));
      const numberOfBids = doc.querySelector('#bidNum')?.textContent?.trim() || '0';
      const timeRemaining = doc.querySelector('#lblTimeLeft')?.textContent?.trim() || 'N/A';
      
      let imageUrl = '';
      const imageSelectors = [
        '#imgPreview',
        '.item-image img',
        '.main-image img',
        '[data-testid="product-image"]',
        '.ProductImage__image img',
        '.auction-item-image img'
      ];

      for (const selector of imageSelectors) {
        const imgElement = doc.querySelector(selector);
        if (imgElement) {
          imageUrl = imgElement.getAttribute('src') || 
                    imgElement.getAttribute('data-src') || 
                    imgElement.getAttribute('data-original') || '';
          if (imageUrl) break;
        }
      }

      if (!imageUrl) {
        const allImages = doc.getElementsByTagName('img');
        for (const img of allImages) {
          const src = img.getAttribute('src') || '';
          if (src.includes('auction') || src.includes('item') || src.includes('product')) {
            imageUrl = src;
            break;
          }
        }
      }

      console.log('Found image URL:', imageUrl);

      const proxiedImageUrl = imageUrl ? 
        `https://yssapojsghmotbifhybq.supabase.co/functions/v1/proxy-image?url=${encodeURIComponent(imageUrl)}` : 
        '';

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
      throw new Error('Failed to fetch auction data');
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