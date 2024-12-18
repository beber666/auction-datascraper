export interface AuctionItem {
  id: string;
  url: string;
  productName: string;
  currentPrice: string;
  numberOfBids: string;
  timeRemaining: string;
  lastUpdated: Date;
}

export class ScraperService {
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
      const currentPrice = doc.querySelector('#lblPriceY')?.textContent?.trim() || 'N/A';
      const numberOfBids = doc.querySelector('#bidNum')?.textContent?.trim() || '0';
      const timeRemaining = doc.querySelector('#lblTimeLeft')?.textContent?.trim() || 'N/A';

      return {
        id: Math.random().toString(36).substr(2, 9),
        url,
        productName,
        currentPrice,
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