import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuctionAlerts = () => {
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

  return {
    alertedAuctions,
    toggleAlert
  };
};