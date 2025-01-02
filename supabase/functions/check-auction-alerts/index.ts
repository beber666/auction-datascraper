import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
    console.log("[check-auction-alerts] Démarrage de la vérification des alertes...")

    // Récupérer d'abord toutes les alertes actives avec les données d'enchères
    const { data: alerts, error: alertsError } = await supabase
      .from('auction_alerts')
      .select(`
        *,
        auctions (
          id,
          end_time,
          product_name,
          current_price,
          url
        )
      `)

    if (alertsError) {
      console.error("[check-auction-alerts] Erreur lors de la récupération des alertes:", alertsError)
      throw new Error(`Erreur lors de la récupération des alertes: ${alertsError.message}`)
    }

    console.log(`[check-auction-alerts] ${alerts.length} alertes trouvées à traiter`)

    for (const alert of alerts) {
      try {
        // Récupérer les préférences d'alerte pour l'utilisateur
        const { data: preferences, error: prefError } = await supabase
          .from('alert_preferences')
          .select('*')
          .eq('user_id', alert.user_id)
          .single()

        if (prefError) {
          console.error(`[check-auction-alerts] Erreur lors de la récupération des préférences pour l'utilisateur ${alert.user_id}:`, prefError)
          continue
        }

        const auction = alert.auctions

        if (!auction || !preferences) {
          console.log(`[check-auction-alerts] Alerte ${alert.id} ignorée: Données d'enchère ou préférences manquantes`)
          continue
        }

        console.log(`[check-auction-alerts] Traitement de l'enchère ${auction.id}:`, {
          productName: auction.product_name,
          endTime: auction.end_time,
          preferences: {
            enableTelegram: preferences.enable_telegram,
            enableEmail: preferences.enable_email,
            alertMinutes: preferences.alert_minutes
          }
        })

        if (!auction.end_time) {
          console.log(`[check-auction-alerts] Enchère ${auction.id} ignorée: Pas de date de fin`)
          continue
        }

        // Calculer le temps restant en minutes
        const now = new Date()
        const endTime = new Date(auction.end_time)
        const minutesRemaining = Math.floor((endTime.getTime() - now.getTime()) / (1000 * 60))

        console.log(`[check-auction-alerts] Enchère ${auction.id} - Minutes restantes: ${minutesRemaining}`)

        // Vérifier si nous devons envoyer une notification
        if (minutesRemaining === preferences.alert_minutes) {
          console.log(`[check-auction-alerts] Temps restant correspond aux préférences pour l'enchère ${auction.id}`)
          
          // Vérifier si nous avons déjà envoyé une notification pour ce temps
          const { data: existingNotif } = await supabase
            .from('sent_notifications')
            .select('*')
            .eq('auction_id', auction.id)
            .eq('user_id', alert.user_id)
            .eq('alert_minutes', preferences.alert_minutes)
            .single()

          if (existingNotif) {
            console.log(`[check-auction-alerts] Notification déjà envoyée pour l'enchère ${auction.id} à ${preferences.alert_minutes} minutes`)
            continue
          }

          const message = `🔔 Alerte Enchère!\n\n` +
            `${auction.product_name}\n` +
            `Prix actuel: ${auction.current_price}\n` +
            `Fin de l'enchère: ${new Date(auction.end_time).toLocaleString('fr-FR')}\n\n` +
            `Voir l'enchère: ${auction.url}`

          // Envoyer la notification Telegram si activée
          if (preferences.enable_telegram && preferences.telegram_token && preferences.telegram_chat_id) {
            console.log(`[check-auction-alerts] Envoi de la notification Telegram pour l'enchère ${auction.id}`)
            
            const telegramUrl = `https://api.telegram.org/bot${preferences.telegram_token}/sendMessage`
            const response = await fetch(telegramUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                chat_id: preferences.telegram_chat_id,
                text: message,
                parse_mode: 'HTML',
              }),
            })

            if (!response.ok) {
              const errorText = await response.text()
              console.error(`[check-auction-alerts] Erreur API Telegram pour l'enchère ${auction.id}:`, errorText)
              throw new Error(`Erreur API Telegram: ${errorText}`)
            }

            console.log(`[check-auction-alerts] Notification Telegram envoyée avec succès pour l'enchère ${auction.id}`)
          }

          // Envoyer l'email si activé
          if (preferences.enable_email) {
            console.log(`[check-auction-alerts] Envoi de l'email pour l'enchère ${auction.id}`)
            
            // Récupérer l'email de l'utilisateur
            const { data: userData } = await supabase.auth.admin.getUserById(alert.user_id)
            if (userData?.user?.email && RESEND_API_KEY) {
              try {
                const emailResponse = await fetch("https://api.resend.com/emails", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${RESEND_API_KEY}`,
                  },
                  body: JSON.stringify({
                    from: "Auction Alerts <onboarding@resend.dev>",
                    to: [userData.user.email],
                    subject: `🔔 Alerte: ${auction.product_name} se termine bientôt!`,
                    html: message.replace(/\n/g, '<br>'),
                  }),
                });

                if (!emailResponse.ok) {
                  const error = await emailResponse.text();
                  console.error(`[check-auction-alerts] Erreur lors de l'envoi de l'email pour l'enchère ${auction.id}:`, error);
                } else {
                  console.log(`[check-auction-alerts] Email envoyé avec succès pour l'enchère ${auction.id}`);
                }
              } catch (error) {
                console.error(`[check-auction-alerts] Erreur lors de l'envoi de l'email pour l'enchère ${auction.id}:`, error);
              }
            } else {
              console.log(`[check-auction-alerts] Email non envoyé pour l'enchère ${auction.id}: Email manquant ou RESEND_API_KEY non configurée`);
            }
          }

          // Enregistrer la notification envoyée
          const { error: notifError } = await supabase
            .from('sent_notifications')
            .insert({
              user_id: alert.user_id,
              auction_id: auction.id,
              alert_minutes: preferences.alert_minutes,
            })

          if (notifError) {
            console.error(`[check-auction-alerts] Erreur lors de l'enregistrement de la notification:`, notifError)
            throw new Error(`Erreur lors de l'enregistrement de la notification: ${notifError.message}`)
          }

          console.log(`[check-auction-alerts] Notification enregistrée avec succès pour l'enchère ${auction.id}`)
        }
      } catch (error) {
        console.error(`[check-auction-alerts] Erreur lors du traitement de l'alerte ${alert.id}:`, error)
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("[check-auction-alerts] Erreur dans la fonction check-auction-alerts:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})