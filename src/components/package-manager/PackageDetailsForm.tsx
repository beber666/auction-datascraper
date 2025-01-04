import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PackageDetailsFormProps {
  packageName: string;
  setPackageName: (name: string) => void;
  sendDate: Date | undefined;
  setSendDate: (date: Date | undefined) => void;
  trackingNumber: string;
  setTrackingNumber: (number: string) => void;
  isEditing: boolean;
  openTrackingUrl: () => void;
}

export const PackageDetailsForm = ({
  packageName,
  setPackageName,
  sendDate,
  setSendDate,
  trackingNumber,
  setTrackingNumber,
  isEditing,
  openTrackingUrl
}: PackageDetailsFormProps) => {
  return (
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
  );
};