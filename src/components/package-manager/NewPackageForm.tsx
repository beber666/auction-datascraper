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
import { CalendarIcon, ExternalLink, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const NewPackageForm = () => {
  const navigate = useNavigate();
  const [packageName, setPackageName] = useState("");
  const [sendDate, setSendDate] = useState<Date>();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState<string>("");
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
      const { data, error } = await supabase.functions.invoke('scrape-parcelsapp', {
        body: { trackingNumber },
      });

      console.log('Response from scrape-parcelsapp:', { data, error });

      if (error) throw error;

      if (data.success) {
        setTrackingUrl(data.trackingUrl);
        console.log('HTML content length:', data.html.length);
        toast({
          title: "Success",
          description: "Tracking information found",
        });
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

  const openTrackingUrl = () => {
    if (trackingUrl) {
      window.open(trackingUrl, '_blank');
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
              {trackingUrl && (
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
            />
          </div>
        </div>

        <Button className="w-full">+ Add Item</Button>
      </div>
    </div>
  );
};