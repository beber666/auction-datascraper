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

export class ScraperService {
  static async scrapeZenmarket(url: string): Promise<Partial<AuctionItem>> {
    const response = await fetch('/api/scrape-zenmarket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error('Failed to scrape auction data');
    }

    return response.json();
  }

  static async translateText(text: string, targetLanguage: string): Promise<string> {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, targetLanguage }),
    });

    if (!response.ok) {
      throw new Error('Failed to translate text');
    }

    const data = await response.json();
    return data.translatedText;
  }

  static async convertPrice(priceInJPY: number, targetCurrency: string): Promise<string> {
    const response = await fetch('/api/convert-currency', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: priceInJPY, from: 'JPY', to: targetCurrency }),
    });

    if (!response.ok) {
      throw new Error('Failed to convert currency');
    }

    const data = await response.json();
    return data.convertedAmount;
  }
}