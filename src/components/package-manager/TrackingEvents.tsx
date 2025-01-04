import { Clock, MapPin, Package, Truck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface TrackingEvent {
  date: string;
  time: string;
  status: string;
  location: string;
  carrier: string;
}

interface TrackingEventsProps {
  events: TrackingEvent[];
}

export const TrackingEvents = ({ events }: TrackingEventsProps) => {
  if (!events?.length) return null;

  return (
    <div className="mt-6 border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Package className="h-5 w-5" />
        Tracking History
      </h3>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="flex gap-4 relative">
              <div className="w-32 flex-shrink-0 text-sm text-muted-foreground">
                <div className="font-medium">{event.date}</div>
                <div>{event.time}</div>
              </div>
              <div className="w-2 flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                {index !== events.length - 1 && (
                  <div className="w-0.5 h-full bg-border mx-auto mt-1" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="font-medium">{event.status}</div>
                {event.location && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </div>
                )}
                {event.carrier && (
                  <div className="text-sm text-muted-foreground mt-1">
                    <Truck className="h-3 w-3 inline mr-1" />
                    {event.carrier}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};