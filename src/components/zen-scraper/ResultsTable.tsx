import { Table, TableBody } from "@/components/ui/table";
import { ScrapedItem, ZenScraperService } from "@/services/zenScraper";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ResultsTableHeader } from "./results-table/TableHeader";
import { TableRow } from "./results-table/TableRow";
import { TableActions } from "./results-table/TableActions";
import { useTableData } from "./results-table/useTableData";

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
  const { translatedResults, getSortedResults } = useTableData(results);

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
      const { error } = await supabase
        .from("auctions")
        .insert({
          url: item.url,
          product_name: item.title,
          current_price: item.currentPrice,
          number_of_bids: item.bids.toString(),
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

  const sortedResults = getSortedResults(sortColumn, sortDirection);

  return (
    <div className="space-y-4">
      <TableActions 
        resultsCount={results.length}
        pagesCount={scrapedPages}
        onExport={handleExport}
      />

      <div className="border rounded-lg">
        <Table>
          <ResultsTableHeader 
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={onSort}
          />
          <TableBody>
            {sortedResults.map((item, index) => (
              <TableRow 
                key={index}
                item={item}
                onAddToTracker={handleAddToTracker}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};