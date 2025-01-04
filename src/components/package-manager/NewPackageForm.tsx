import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserPreferences } from "@/hooks/useUserPreferences";

// Mock data for testing
const mockItems = [
  {
    id: 1,
    name: "Dragon Ball Figure",
    productUrl: "https://zenmarket.jp/product123",
    platformId: "ZM123456",
    proxyFee: 300,
    price: 5000,
    localShippingPrice: 800,
    weight: 0.5,
    internationalShippingShare: 1200,
    customsFee: 500,
    totalPrice: 7800,
    resalePrice: 12000,
    resaleComment: "Good condition, limited edition",
  },
  {
    id: 2,
    name: "One Piece Manga Vol.1",
    productUrl: "https://zenmarket.jp/product456",
    platformId: "ZM789012",
    proxyFee: 300,
    price: 800,
    localShippingPrice: 500,
    weight: 0.3,
    internationalShippingShare: 800,
    customsFee: 200,
    totalPrice: 2600,
    resalePrice: 4000,
    resaleComment: "First edition",
  },
];

const currencySymbols: Record<string, string> = {
  JPY: "¥",
  EUR: "€",
  USD: "$",
  GBP: "£",
};

export const NewPackageForm = () => {
  const navigate = useNavigate();
  const [packageName, setPackageName] = useState("");
  const { currency, loadUserPreferences } = useUserPreferences();

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

  // Calculate totals
  const totals = mockItems.reduce((acc, item) => {
    return {
      proxyFee: acc.proxyFee + item.proxyFee,
      price: acc.price + item.price,
      localShippingPrice: acc.localShippingPrice + item.localShippingPrice,
      weight: acc.weight + item.weight,
      internationalShippingShare: acc.internationalShippingShare + item.internationalShippingShare,
      customsFee: acc.customsFee + item.customsFee,
      totalPrice: acc.totalPrice + item.totalPrice,
      resalePrice: acc.resalePrice + item.resalePrice,
    };
  }, {
    proxyFee: 0,
    price: 0,
    localShippingPrice: 0,
    weight: 0,
    internationalShippingShare: 0,
    customsFee: 0,
    totalPrice: 0,
    resalePrice: 0,
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Package Details</h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => navigate("/package-manager")}>
            Cancel
          </Button>
          <Button>Save</Button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="package-name">Package Name</Label>
          <Input
            id="package-name"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            placeholder="Enter package name"
            className="max-w-md"
          />
        </div>

        <div className="border rounded-lg">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead className="w-[100px]">Product Link</TableHead>
                  <TableHead className="w-[120px]">Platform ID</TableHead>
                  <TableHead className="text-right w-[100px]">Proxy Fee</TableHead>
                  <TableHead className="text-right w-[100px]">Price</TableHead>
                  <TableHead className="text-right w-[100px]">Local Shipping</TableHead>
                  <TableHead className="text-right w-[100px]">Weight (kg)</TableHead>
                  <TableHead className="text-right w-[100px]">Int. Shipping</TableHead>
                  <TableHead className="text-right w-[100px]">Customs Fee</TableHead>
                  <TableHead className="text-right w-[100px]">Total Price</TableHead>
                  <TableHead className="text-right w-[100px]">Resale Price</TableHead>
                  <TableHead className="w-[200px]">Comment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <a
                        href={item.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View
                      </a>
                    </TableCell>
                    <TableCell>{item.platformId}</TableCell>
                    <TableCell className="text-right">{formatAmount(item.proxyFee)}</TableCell>
                    <TableCell className="text-right">{formatAmount(item.price)}</TableCell>
                    <TableCell className="text-right">{formatAmount(item.localShippingPrice)}</TableCell>
                    <TableCell className="text-right">{item.weight}</TableCell>
                    <TableCell className="text-right">{formatAmount(item.internationalShippingShare)}</TableCell>
                    <TableCell className="text-right">{formatAmount(item.customsFee)}</TableCell>
                    <TableCell className="text-right">{formatAmount(item.totalPrice)}</TableCell>
                    <TableCell className="text-right">{formatAmount(item.resalePrice)}</TableCell>
                    <TableCell>{item.resaleComment}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="font-medium">
                  <TableCell colSpan={3}>Total</TableCell>
                  <TableCell className="text-right">{formatAmount(totals.proxyFee)}</TableCell>
                  <TableCell className="text-right">{formatAmount(totals.price)}</TableCell>
                  <TableCell className="text-right">{formatAmount(totals.localShippingPrice)}</TableCell>
                  <TableCell className="text-right">{totals.weight.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{formatAmount(totals.internationalShippingShare)}</TableCell>
                  <TableCell className="text-right">{formatAmount(totals.customsFee)}</TableCell>
                  <TableCell className="text-right">{formatAmount(totals.totalPrice)}</TableCell>
                  <TableCell className="text-right">{formatAmount(totals.resalePrice)}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>

        <Button className="w-full">+ Add Item</Button>
      </div>
    </div>
  );
};