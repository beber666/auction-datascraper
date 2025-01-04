import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePackages } from "@/hooks/usePackages";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { format } from "date-fns";

export const PackageTable = () => {
  const { packages, isLoading } = usePackages();
  const { currency } = useUserPreferences();

  const currencySymbols: Record<string, string> = {
    JPY: "¥",
    EUR: "€",
    USD: "$",
    GBP: "£",
  };

  const formatAmount = (amount: number) => {
    const exchangeRates: Record<string, number> = {
      JPY: 1,
      EUR: 0.0062,
      USD: 0.0067,
      GBP: 0.0053,
    };

    const convertedAmount = amount * exchangeRates[currency];
    const symbol = currencySymbols[currency];

    return `${symbol}${convertedAmount.toLocaleString(undefined, {
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2,
    })}`;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">Package Name</TableHead>
          <TableHead className="w-[150px]">Send Date</TableHead>
          <TableHead className="w-[150px]">Tracking</TableHead>
          <TableHead className="w-[200px] text-right">Total Amount ({currencySymbols[currency]})</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {packages?.map((pkg) => (
          <TableRow key={pkg.id}>
            <TableCell className="font-medium">{pkg.name}</TableCell>
            <TableCell>
              {pkg.send_date ? format(new Date(pkg.send_date), 'PPP') : 'Not set'}
            </TableCell>
            <TableCell>
              {pkg.tracking_number || <span className="text-muted-foreground">Not shipped yet</span>}
            </TableCell>
            <TableCell className="text-right">
              {formatAmount(pkg.total_items_cost)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};