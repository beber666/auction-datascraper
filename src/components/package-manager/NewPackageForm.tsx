import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PackageItemsTable } from "./PackageItemsTable";
import { usePackageItems } from "@/hooks/usePackageItems";
import { useAmountFormatter } from "@/hooks/useAmountFormatter";

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

export const NewPackageForm = () => {
  const navigate = useNavigate();
  const [packageName, setPackageName] = useState("");
  const { items, handleDeleteItem, handleUpdateItem } = usePackageItems(mockItems);
  const { formatAmount } = useAmountFormatter();

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
            <PackageItemsTable
              items={items}
              onDeleteItem={handleDeleteItem}
              onUpdateItem={handleUpdateItem}
              formatAmount={formatAmount}
            />
          </div>
        </div>

        <Button className="w-full">+ Add Item</Button>
      </div>
    </div>
  );
};