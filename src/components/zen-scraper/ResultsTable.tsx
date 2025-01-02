import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ScrapedItem } from "@/services/zenScraper";
import { useState } from "react";
import * as XLSX from 'xlsx';

interface ResultsTableProps {
  results: ScrapedItem[];
  filters: {
    hasPositiveBids: boolean;
    maxHoursRemaining: number | null;
    priceRange: [number, number];
  };
}

type SortConfig = {
  key: keyof ScrapedItem;
  direction: 'asc' | 'desc';
} | null;

export const ResultsTable = ({ results, filters }: ResultsTableProps) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const handleSort = (column: keyof ScrapedItem) => {
    if (sortConfig?.key === column) {
      setSortConfig({
        key: column,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      setSortConfig({ key: column, direction: 'asc' });
    }
  };

  const getSortedAndFilteredResults = () => {
    let filteredResults = [...results];

    // Apply filters
    if (filters.hasPositiveBids) {
      filteredResults = filteredResults.filter(item => 
        parseInt(item.bids.toString()) > 0
      );
    }

    if (filters.maxHoursRemaining) {
      filteredResults = filteredResults.filter(item => {
        const timeStr = item.timeRemaining.toLowerCase();
        if (timeStr.includes('hour')) {
          const hours = parseInt(timeStr);
          return hours <= filters.maxHoursRemaining;
        }
        return timeStr.includes('minute') || timeStr.includes('second');
      });
    }

    if (filters.priceRange) {
      filteredResults = filteredResults.filter(item => {
        const price = parseFloat(item.currentPrice.replace(/[^0-9.-]+/g, ""));
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      });
    }

    // Apply sorting
    if (sortConfig) {
      filteredResults.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        return 0;
      });
    }

    return filteredResults;
  };

  const handleExport = () => {
    const dataToExport = getSortedAndFilteredResults().map(item => ({
      Title: item.title,
      'Current Price': item.currentPrice,
      'Buyout Price': item.buyoutPrice || 'N/A',
      Bids: item.bids,
      Categories: item.categories.join(', '),
      'Time Remaining': item.timeRemaining,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Zen Market Items');
    const fileName = `zen-market-export-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const sortedAndFilteredResults = getSortedAndFilteredResults();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          Results ({sortedAndFilteredResults.length} items)
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
                onClick={() => handleSort('title')}
              >
                Title {sortConfig?.key === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('currentPrice')}
              >
                Price {sortConfig?.key === 'currentPrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('buyoutPrice')}
              >
                Buyout {sortConfig?.key === 'buyoutPrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('bids')}
              >
                Bids {sortConfig?.key === 'bids' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Categories</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('timeRemaining')}
              >
                Time Remaining {sortConfig?.key === 'timeRemaining' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredResults.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>{item.currentPrice}</TableCell>
                <TableCell>{item.buyoutPrice || 'N/A'}</TableCell>
                <TableCell>{item.bids}</TableCell>
                <TableCell>{item.categories.join(', ')}</TableCell>
                <TableCell>{item.timeRemaining}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};