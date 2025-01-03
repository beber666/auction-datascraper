import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DeleteAllButtonProps {
  onDeleteAll: (ids: string[]) => void;
  itemIds: string[];
}

export const DeleteAllButton = ({ onDeleteAll, itemIds }: DeleteAllButtonProps) => {
  const { toast } = useToast();

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

      // Update local state
      onDeleteAll(itemIds);
      
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
  );
};