import { ScrapedItem } from "@/services/zenScraper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, PlusCircle } from "lucide-react";
import { ZenScraperService } from "@/services/zenScraper";
import { parseTimeToHours } from "./filters/FilterUtils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuctionTranslation } from "@/hooks/auction/useAuctionTranslation";
import { useEffect, useState } from "react";

interface ResultsTableProps {
  results: ScrapedItem[];
  scrapedPages: number;
  sortColumn: keyof ScrapedItem | null;
  sortDirection: 'asc' | 'desc';
  onSort: (column: keyof ScrapedItem) => void;
}

export const ResultsTable = ({ 
  results, 
  scrapedPages, 
  sortColumn, 
  sortDirection, 
  onSort 
}: ResultsTableProps) => {
  const { toast } = useToast();
  const { translateAuctionName } = useAuctionTranslation();
  const [translatedResults, setTranslatedResults] = useState<ScrapedItem[]>([]);

  useEffect(() => {
    const translateTitles = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('preferred_language')
        .eq('id', session.user.id)
        .maybeSingle();

      const userLanguage = profile?.preferred_language || 'en';

      const translatedItems = await Promise.all(
        results.map(async (item) => {
          const translatedTitle = await translateAuctionName(item.title, userLanguage);
          return { ...item, title: translatedTitle };
        })
      );

      setTranslatedResults(translatedItems);
    };

    translateTitles();
  }, [results]);

  const handleExport = () => {
    ZenScraperService.exportToExcel(translatedResults.length > 0 ? translatedResults : results);
  };

  const handleAddToTracker = async (item: ScrapedItem) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour ajouter une enchère",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert number_of_bids to string and ensure it's a single object, not an array
      const { error } = await supabase
        .from("auctions")
        .insert({
          url: item.url,
          product_name: item.title,
          current_price: item.currentPrice,
          number_of_bids: item.bids.toString(), // Convert to string
          time_remaining: item.timeRemaining,
          user_id: session.user.id,
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "L'enchère a été ajoutée au tracker",
      });
    } catch (error) {
      console.error('Error adding auction:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'enchère au tracker",
        variant: "destructive",
      });
    }
  };

  const getSortedResults = () => {
    if (!sortColumn) return translatedResults.length > 0 ? translatedResults : results;

    return [...(translatedResults.length > 0 ? translatedResults : results)].sort((a, b) => {
      if (sortColumn === 'timeRemaining') {
        const timeA = parseTimeToHours(a.timeRemaining);
        const timeB = parseTimeToHours(b.timeRemaining);
        return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
      }
      
      if (sortColumn === 'currentPrice') {
        const priceA = parseFloat(a.currentPrice.replace(/[^0-9.]/g, '')) || 0;
        const priceB = parseFloat(b.currentPrice.replace(/[^0-9.]/g, '')) || 0;
        return sortDirection === 'asc' ? priceA - priceB : priceB - priceA;
      }

      if (sortColumn === 'bids') {
        const bidsA = typeof a.bids === 'string' ? parseInt(a.bids) || 0 : a.bids || 0;
        const bidsB = typeof b.bids === 'string' ? parseInt(b.bids) || 0 : b.bids || 0;
        return sortDirection === 'asc' ? bidsA - bidsB : bidsB - bidsA;
      }

      const valA = String(a[sortColumn]);
      const valB = String(b[sortColumn]);
      return sortDirection === 'asc' 
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });
  };

  const sortedResults = getSortedResults();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          Results ({results.length} items from {scrapedPages} {scrapedPages === 1 ? 'page' : 'pages'})
        </h2>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export to Excel
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSort('title')}
              >
                Title {sortColumn === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSort('currentPrice')}
              >
                Price {sortColumn === 'currentPrice' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSort('buyoutPrice')}
              >
                Buyout {sortColumn === 'buyoutPrice' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSort('bids')}
              >
                Bids {sortColumn === 'bids' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Categories</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSort('timeRemaining')}
              >
                Time Remaining {sortColumn === 'timeRemaining' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedResults.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    {item.title}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </TableCell>
                <TableCell>{item.currentPrice}</TableCell>
                <TableCell>{item.buyoutPrice || 'N/A'}</TableCell>
                <TableCell>{item.bids || '0'}</TableCell>
                <TableCell>{item.categories.join(', ')}</TableCell>
                <TableCell>{item.timeRemaining}</TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAddToTracker(item)}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add to Tracker
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};