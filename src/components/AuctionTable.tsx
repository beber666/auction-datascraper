import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AuctionItem } from "@/services/scraper";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuctionRow } from "./auction/AuctionRow";

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

    // Get user's alert preferences
    const { data: alertPref } = await supabase
      .from('alert_preferences')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (!alertPref) {
      toast({
        title: "Error",
        description: "Alert preferences not found",
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
      try {
        const { error: insertError } = await supabase
          .from('auction_alerts')
          .insert({
            auction_id: auctionId,
            user_id: session.user.id,
          });

        if (insertError) {
          throw insertError;
        }

        setAlertedAuctions(prev => [...prev, auctionId]);
        toast({
          title: "Success",
          description: "Alert set successfully",
        });
      } catch (error) {
        console.error('Error setting alert:', error);
        toast({
          title: "Error",
          description: "Failed to set alert",
          variant: "destructive",
        });
      }
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
            <AuctionRow
              key={item.id}
              item={item}
              isAlerted={alertedAuctions.includes(item.id)}
              onToggleAlert={toggleAlert}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};