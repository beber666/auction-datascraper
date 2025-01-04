import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useEffect } from "react";

// Mock data structure updated to include items with their total prices
const mockPackages = [
  {
    id: 1,
    name: "Summer Collection 2024",
    itemCount: 3,
    sendDate: "2024-03-15",
    tracking: "JP123456789",
    items: [
      { totalPrice: 5000 },
      { totalPrice: 7000 },
      { totalPrice: 3000 },
    ],
  },
  {
    id: 2,
    name: "Anime Figures Lot",
    itemCount: 5,
    sendDate: "2024-03-20",
    tracking: "JP987654321",
    items: [
      { totalPrice: 8000 },
      { totalPrice: 6000 },
      { totalPrice: 4000 },
      { totalPrice: 3500 },
      { totalPrice: 3500 },
    ],
  },
  {
    id: 3,
    name: "Collectibles Bundle",
    itemCount: 2,
    sendDate: "2024-03-25",
    tracking: null,
    items: [
      { totalPrice: 5000 },
      { totalPrice: 3000 },
    ],
  },
];

const currencySymbols: Record<string, string> = {
  JPY: "¥",
  EUR: "€",
  USD: "$",
  GBP: "£",
};

export const PackageTable = () => {
  const { currency, loadUserPreferences } = useUserPreferences();

  useEffect(() => {
    loadUserPreferences();
  }, []);

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

  const calculatePackageTotal = (items: { totalPrice: number }[]) => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">Package Name</TableHead>
          <TableHead className="w-[100px] text-center">Items</TableHead>
          <TableHead className="w-[150px]">Send Date</TableHead>
          <TableHead className="w-[150px]">Tracking</TableHead>
          <TableHead className="w-[200px] text-right">Total Amount ({currencySymbols[currency]})</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockPackages.map((pkg) => (
          <TableRow key={pkg.id}>
            <TableCell className="font-medium">{pkg.name}</TableCell>
            <TableCell className="text-center">{pkg.itemCount}</TableCell>
            <TableCell>{pkg.sendDate}</TableCell>
            <TableCell>
              {pkg.tracking || <span className="text-muted-foreground">Not shipped yet</span>}
            </TableCell>
            <TableCell className="text-right">
              {formatAmount(calculatePackageTotal(pkg.items))}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};