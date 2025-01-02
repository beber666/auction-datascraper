import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function sendTelegramMessage(botToken: string, chatId: string, message: string) {
  console.log('Envoi du message Telegram:', { chatId, message });
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Erreur API Telegram:', error);
    throw new Error(`Erreur API Telegram: ${error}`);
  }

  const result = await response.json();
  console.log('Réponse API Telegram:', result);
  return result;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Démarrage de la vérification des alertes d'enchères");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Récupérer toutes les alertes actives avec les préférences et les enchères
    const { data: alerts, error: alertsError } = await supabase
      .from('auction_alerts')
      .select(`
        *,
        auctions (*),
        alert_preferences:alert_preferences!inner(*)
      `)
      .eq('alert_preferences.enable_telegram', true)
      .not('alert_preferences.telegram_token', 'is', null)
      .not('alert_preferences.telegram_chat_id', 'is', null);

    if (alertsError) {
      console.error("Erreur lors de la récupération des alertes:", alertsError);
      throw alertsError;
    }

    console.log(`Nombre d'alertes trouvées: ${alerts?.length || 0}`);

    if (!alerts || alerts.length === 0) {
      return new Response(
        JSON.stringify({ message: "Aucune alerte à traiter" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date();
    const processedAlerts = [];

    for (const alert of alerts) {
      try {
        const auction = alert.auctions;
        const preferences = alert.alert_preferences;

        if (!auction.end_time) {
          console.log(`Pas de end_time pour l'enchère ${auction.id}, ignorée`);
          continue;
        }

        const endTime = new Date(auction.end_time);
        const minutesRemaining = (endTime.getTime() - now.getTime()) / (1000 * 60);

        console.log(`Enchère ${auction.id}: ${minutesRemaining} minutes restantes, alerte configurée pour ${preferences.alert_minutes} minutes`);

        // Vérifier si c'est le moment d'envoyer l'alerte
        if (minutesRemaining <= preferences.alert_minutes && minutesRemaining > 0) {
          // Vérifier si une notification a déjà été envoyée
          const { data: existingNotif } = await supabase
            .from('sent_notifications')
            .select('*')
            .eq('auction_id', auction.id)
            .eq('user_id', alert.user_id)
            .eq('alert_minutes', preferences.alert_minutes)
            .maybeSingle();

          if (!existingNotif) {
            console.log(`Envoi de notification pour l'enchère ${auction.id}`);
            
            const message = `🔔 Alerte Enchère: "${auction.product_name}" se termine dans ${Math.round(minutesRemaining)} minutes!\nPrix actuel: ${auction.current_price}\nVoir l'enchère: ${auction.url}`;

            // Envoyer la notification Telegram
            await sendTelegramMessage(
              preferences.telegram_token,
              preferences.telegram_chat_id,
              message
            );

            // Enregistrer la notification envoyée
            const { error: notifError } = await supabase
              .from('sent_notifications')
              .insert({
                user_id: alert.user_id,
                auction_id: auction.id,
                alert_minutes: preferences.alert_minutes
              });

            if (notifError) {
              console.error("Erreur lors de l'enregistrement de la notification:", notifError);
            }

            processedAlerts.push(auction.id);
          } else {
            console.log(`Notification déjà envoyée pour l'enchère ${auction.id}`);
          }
        }
      } catch (error) {
        console.error(`Erreur lors du traitement de l'alerte ${alert.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedAlerts.length,
        alerts: processedAlerts 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erreur dans la fonction check-auction-alerts:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
};

serve(handler);