import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface TableActionsProps {
  resultsCount: number;
  pagesCount: number;
  onExport: () => void;
}

export const TableActions = ({ resultsCount, pagesCount, onExport }: TableActionsProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold">
        Results ({resultsCount} items from {pagesCount} {pagesCount === 1 ? 'page' : 'pages'})
      </h2>
      <Button onClick={onExport} variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Export to Excel
      </Button>
    </div>
  );
};