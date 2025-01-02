import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
    console.log("[check-auction-alerts] Démarrage de la vérification des alertes...")

    // Récupérer toutes les alertes actives avec les préférences utilisateur
    const { data: alerts, error: alertsError } = await supabase
      .from('auction_alerts')
      .select(`
        *,
        auctions (
          id,
          time_remaining,
          product_name,
          current_price,
          url
        ),
        alert_preferences!alert_preferences_user_id_fkey (
          enable_telegram,
          telegram_token,
          telegram_chat_id,
          alert_minutes
        )
      `)

    if (alertsError) {
      console.error("[check-auction-alerts] Erreur lors de la récupération des alertes:", alertsError)
      throw new Error(`Erreur lors de la récupération des alertes: ${alertsError.message}`)
    }

    console.log(`[check-auction-alerts] ${alerts.length} alertes trouvées à traiter`)

    for (const alert of alerts) {
      try {
        const auction = alert.auctions
        const preferences = alert.alert_preferences

        if (!auction || !preferences) {
          console.log(`[check-auction-alerts] Alerte ${alert.id} ignorée: Données d'enchère ou préférences manquantes`)
          continue
        }

        console.log(`[check-auction-alerts] Traitement de l'enchère ${auction.id}:`, {
          productName: auction.product_name,
          timeRemaining: auction.time_remaining,
          preferences: {
            enableTelegram: preferences.enable_telegram,
            alertMinutes: preferences.alert_minutes
          }
        })

        // Analyser le temps restant
        const timeStr = auction.time_remaining
        if (!timeStr) {
          console.log(`[check-auction-alerts] Enchère ${auction.id} ignorée: Pas de données de temps restant`)
          continue
        }

        // Convertir le temps restant en minutes
        let totalMinutes = 0
        const days = timeStr.match(/(\d+)\s*(day|jour|día|tag)/)
        const hours = timeStr.match(/(\d+)\s*(hour|heure|hora|stunde)/)
        const minutes = timeStr.match(/(\d+)\s*(min|minute|minuto)/)

        if (days) totalMinutes += parseInt(days[1]) * 24 * 60
        if (hours) totalMinutes += parseInt(hours[1]) * 60
        if (minutes) totalMinutes += parseInt(minutes[1])

        console.log(`[check-auction-alerts] Enchère ${auction.id} - Temps restant calculé: ${totalMinutes} minutes`)

        // Vérifier si nous devons envoyer une notification
        if (totalMinutes === preferences.alert_minutes) {
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

          // Envoyer la notification Telegram si activée
          if (preferences.enable_telegram && preferences.telegram_token && preferences.telegram_chat_id) {
            console.log(`[check-auction-alerts] Envoi de la notification Telegram pour l'enchère ${auction.id}`)
            
            const message = `🔔 Alerte Enchère!\n\n` +
              `${auction.product_name}\n` +
              `Prix actuel: ${auction.current_price}\n` +
              `Temps restant: ${auction.time_remaining}\n\n` +
              `Voir l'enchère: ${auction.url}`

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
          } else {
            console.log(`[check-auction-alerts] Notifications Telegram non activées pour l'utilisateur ${alert.user_id}`)
          }
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