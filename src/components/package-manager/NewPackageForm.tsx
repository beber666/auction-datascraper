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
import { CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TrackingEvent {
  time: string;
  event: string;
}

export const NewPackageForm = () => {
  const navigate = useNavigate();
  const [packageName, setPackageName] = useState("");
  const [sendDate, setSendDate] = useState<Date>();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingInfo, setTrackingInfo] = useState<TrackingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { items, handleDeleteItem, handleUpdateItem } = usePackageItems([]);
  const { formatAmount } = useAmountFormatter();
  const { toast } = useToast();

  const handleTrackingLookup = async () => {
    if (!trackingNumber) {
      toast({
        title: "Error",
        description: "Please enter a tracking number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-17track', {
        body: { trackingNumber },
      });

      if (error) throw error;

      if (data.success && data.trackingInfo) {
        setTrackingInfo(data.trackingInfo);
      } else {
        throw new Error('Failed to fetch tracking information');
      }
    } catch (error) {
      console.error('Error fetching tracking info:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tracking information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
          <Button>Save</Button>
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
                    !sendDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {sendDate ? format(sendDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={sendDate}
                  onSelect={setSendDate}
                  initialFocus
                />
              </PopoverContent>
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
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleTrackingLookup}
                disabled={isLoading}
              >
                <Search className="h-4 w-4" />
              </Button>
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
            />
          </div>
        </div>

        <Button className="w-full">+ Add Item</Button>

        {trackingInfo.length > 0 && (
          <div className="border rounded-lg p-4 mt-4">
            <h3 className="text-lg font-semibold mb-4">Tracking Information</h3>
            <div className="space-y-4">
              {trackingInfo.map((event, index) => (
                <div key={index} className="flex gap-4 text-sm">
                  <span className="text-gray-500 min-w-[180px]">{event.time}</span>
                  <span>{event.event}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};