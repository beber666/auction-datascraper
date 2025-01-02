import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';

export interface ScrapedItem {
  title: string;
  url: string;
  bids: number;
  timeRemaining: string;
  categories: string[];
  currentPrice: string;
  buyoutPrice: string | null;
}

interface ScrapeResponse {
  items: ScrapedItem[];
  hasMorePages: boolean;
  totalPages: number;
}

export class ZenScraperService {
  static async scrapeCategory(
    url: string,
    page: number = 1
  ): Promise<ScrapeResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('scrape-zen-category', {
        body: { url, page }
      });

      if (error) {
        console.error('Error scraping category:', error);
        throw new Error('Failed to scrape category data');
      }

      return {
        items: data.items,
        hasMorePages: data.hasMorePages,
        totalPages: data.totalPages
      };
    } catch (error) {
      console.error('Error scraping category:', error);
      throw new Error('Failed to scrape category data');
    }
  }

  static exportToExcel(items: ScrapedItem[]): void {
    const worksheet = XLSX.utils.json_to_sheet(items.map(item => ({
      Title: item.title,
      URL: item.url,
      Bids: item.bids,
      'Time Remaining': item.timeRemaining,
      'Current Price': item.currentPrice,
      'Buyout Price': item.buyoutPrice || 'N/A',
      Categories: item.categories.join(', ')
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Zen Market Items');

    const fileName = `zen-market-export-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }
}