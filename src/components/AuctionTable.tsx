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
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

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
        title: "Erreur",
        description: "Vous devez être connecté pour définir des alertes",
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
        title: "Erreur",
        description: "Préférences d'alerte non trouvées",
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
          title: "Erreur",
          description: "Impossible de supprimer l'alerte",
          variant: "destructive",
        });
        return;
      }

      setAlertedAuctions(prev => prev.filter(id => id !== auctionId));
      toast({
        title: "Succès",
        description: "Alerte supprimée avec succès",
      });
    } else {
      // Add alert without triggering immediate notification
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
          title: "Succès",
          description: "Alerte définie avec succès",
        });
      } catch (error) {
        console.error('Error setting alert:', error);
        toast({
          title: "Erreur",
          description: "Impossible de définir l'alerte",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteAll = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      // Delete all auctions in a single query
      const { error } = await supabase
        .from('auctions')
        .delete()
        .eq('user_id', session.user.id);

      if (error) throw error;

      // Clear alerts associated with deleted auctions
      const { error: alertError } = await supabase
        .from('auction_alerts')
        .delete()
        .eq('user_id', session.user.id);

      if (alertError) {
        console.error('Error clearing auction alerts:', alertError);
      }

      // Update local state by clearing all items
      items.forEach(item => onDelete(item.id));
      
      toast({
        title: "Succès",
        description: "Toutes les enchères ont été supprimées",
      });
    } catch (error) {
      console.error('Error deleting all auctions:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression des enchères",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="rounded-md border w-full max-w-[1200px] mx-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom du produit</TableHead>
            <TableHead>Prix actuel</TableHead>
            <TableHead className="text-center">Enchères</TableHead>
            <TableHead>Temps restant</TableHead>
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
      {items.length > 0 && (
        <div className="p-4 flex justify-end border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer toutes les enchères
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action supprimera définitivement toutes vos enchères suivies.
                  Cette action ne peut pas être annulée.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAll}>
                  Supprimer tout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
};