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
  const [isEditing, setIsEditing] = useState(true);
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

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Package Details</h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => navigate("/package-manager")}>
            Cancel
          </Button>
          {isEditing ? (
            <Button onClick={() => setIsEditing(false)}>Save</Button>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
          )}
        </div>
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
              readOnly={!isEditing}
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
                readOnly={!isEditing}
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