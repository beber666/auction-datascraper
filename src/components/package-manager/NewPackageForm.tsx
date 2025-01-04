import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PackageItemsTable } from "./PackageItemsTable";
import { usePackageItems } from "@/hooks/usePackageItems";
import { useAmountFormatter } from "@/hooks/useAmountFormatter";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export const NewPackageForm = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [packageName, setPackageName] = useState("");
  const [sendDate, setSendDate] = useState<Date>();
  const [trackingNumber, setTrackingNumber] = useState("");
  const { items, handleAddItem, handleDeleteItem, handleUpdateItem } = usePackageItems([]);
  const { formatAmount } = useAmountFormatter();

  const openTrackingUrl = () => {
    if (trackingNumber) {
      window.open(`https://parcelsapp.com/en/tracking/${trackingNumber}`, '_blank');
    }
  };

  const calculateTotalResalePrice = () => {
    return items.reduce((total, item) => total + item.resalePrice, 0);
  };

  const calculateTotalCost = () => {
    return items.reduce((total, item) => (
      total + item.proxyFee + item.price + item.localShippingPrice + 
      item.internationalShippingShare + item.customsFee
    ), 0);
  };

  const calculateBalance = () => {
    const totalResale = calculateTotalResalePrice();
    const totalCost = calculateTotalCost();
    return totalResale - totalCost;
  };

  const balance = calculateBalance();
  const isProfit = balance >= 0;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold">Package Details</h2>
        <div>
          {isEditing ? (
            <Button onClick={() => setIsEditing(false)}>Save</Button>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit Package</Button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm font-medium">
          Balance: <span className={cn(
            "font-bold",
            isProfit ? "text-green-600" : "text-red-600"
          )}>
            {formatAmount(balance)}
          </span>
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="package-name">Package Name</Label>
            <Input
              id="package-name"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              placeholder="Enter package name"
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-100" : ""}
            />
          </div>

          <div>
            <Label>Send Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !sendDate && "text-muted-foreground",
                    !isEditing && "bg-gray-100 cursor-not-allowed"
                  )}
                  disabled={!isEditing}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {sendDate ? format(sendDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              {isEditing && (
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={sendDate}
                    onSelect={setSendDate}
                    initialFocus
                  />
                </PopoverContent>
              )}
            </Popover>
          </div>

          <div>
            <Label htmlFor="tracking-number">Tracking Number</Label>
            <div className="flex gap-2">
              <Input
                id="tracking-number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-100" : ""}
              />
              {trackingNumber && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={openTrackingUrl}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="border rounded-lg">
          <div className="overflow-x-auto">
            <PackageItemsTable
              items={items}
              onDeleteItem={handleDeleteItem}
              onUpdateItem={handleUpdateItem}
              formatAmount={formatAmount}
              isEditing={isEditing}
            />
          </div>
        </div>

        {isEditing && (
          <Button className="w-full" onClick={handleAddItem}>+ Add Item</Button>
        )}
      </div>
    </div>
  );
};