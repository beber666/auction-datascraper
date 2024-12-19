import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AuctionItem } from "@/services/scraper";
import { ExternalLink, Trash2, Loader2, Bell, BellOff } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuctionTableProps {
  items: AuctionItem[];
  onDelete: (id: string) => void;
}

export const AuctionTable = ({ items, onDelete }: AuctionTableProps) => {
  const [alertedAuctions, setAlertedAuctions] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAlertedAuctions = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('auction_alerts')
        .select('auction_id')
        .eq('user_id', session.user.id);

      if (data) {
        setAlertedAuctions(data.map(alert => alert.auction_id));
      }
    };

    fetchAlertedAuctions();
  }, []);

  const toggleAlert = async (auctionId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to set alerts",
        variant: "destructive",
      });
      return;
    }

    if (alertedAuctions.includes(auctionId)) {
      // Remove alert
      const { error } = await supabase
        .from('auction_alerts')
        .delete()
        .eq('auction_id', auctionId)
        .eq('user_id', session.user.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to remove alert",
          variant: "destructive",
        });
        return;
      }

      setAlertedAuctions(prev => prev.filter(id => id !== auctionId));
      toast({
        title: "Success",
        description: "Alert removed successfully",
      });
    } else {
      // Add alert
      const { error } = await supabase
        .from('auction_alerts')
        .insert({
          auction_id: auctionId,
          user_id: session.user.id,
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to set alert",
          variant: "destructive",
        });
        return;
      }

      setAlertedAuctions(prev => [...prev, auctionId]);
      toast({
        title: "Success",
        description: "Alert set successfully",
      });
    }
  };

  return (
    <div className="rounded-md border w-full max-w-[1200px] mx-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Current Price</TableHead>
            <TableHead className="text-center">Bids</TableHead>
            <TableHead>Time Remaining</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className={item.isLoading ? "opacity-60" : ""}>
              <TableCell className="font-medium">
                {item.isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </div>
                ) : (
                  item.productName
                )}
              </TableCell>
              <TableCell className="text-green-600 font-semibold">
                {item.currentPrice}
              </TableCell>
              <TableCell className="text-center">{item.numberOfBids}</TableCell>
              <TableCell className="text-blue-600">{item.timeRemaining}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleAlert(item.id)}
                >
                  {alertedAuctions.includes(item.id) ? (
                    <BellOff className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(item.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};