
import { Button } from "@/components/ui/button";
import { Download, SquareX } from "lucide-react";

interface TableActionsProps {
  resultsCount: number;
  pagesCount: number;
  onExport: () => void;
  isLoading: boolean;
  onStopScraping?: () => void;
}

export const TableActions = ({ 
  resultsCount, 
  pagesCount, 
  onExport, 
  isLoading, 
  onStopScraping 
}: TableActionsProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold">
          Results ({resultsCount} items from {pagesCount} {pagesCount === 1 ? 'page' : 'pages'})
        </h2>
        {isLoading && onStopScraping && (
          <Button 
            variant="destructive" 
            onClick={onStopScraping}
            className="flex items-center gap-2"
          >
            <SquareX className="h-4 w-4" />
            <span>Stop Scraping</span>
          </Button>
        )}
      </div>
      <Button onClick={onExport} variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Export to Excel
      </Button>
    </div>
  );
};
