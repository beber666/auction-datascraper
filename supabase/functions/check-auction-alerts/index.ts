import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.cron("check-auction-alerts", "* * * * *", async () => {
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
  console.log("Starting auction alerts check...")

  try {
    // Get all active alerts with user preferences
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
      throw new Error(`Error fetching alerts: ${alertsError.message}`)
    }

    console.log(`Found ${alerts.length} alerts to process`)

    for (const alert of alerts) {
      try {
        const auction = alert.auctions
        const preferences = alert.alert_preferences

        if (!auction || !preferences) {
          console.log(`Skipping alert ${alert.id}: Missing auction or preferences data`)
          continue
        }

        // Parse time remaining (format: "1 day 2 hours" or "2 hours 30 minutes")
        const timeStr = auction.time_remaining
        if (!timeStr) {
          console.log(`Skipping auction ${auction.id}: No time remaining data`)
          continue
        }

        // Convert time remaining to minutes
        let totalMinutes = 0
        const days = timeStr.match(/(\d+)\s*day/)
        const hours = timeStr.match(/(\d+)\s*hour/)
        const minutes = timeStr.match(/(\d+)\s*minute/)

        if (days) totalMinutes += parseInt(days[1]) * 24 * 60
        if (hours) totalMinutes += parseInt(hours[1]) * 60
        if (minutes) totalMinutes += parseInt(minutes[1])

        console.log(`Auction ${auction.id} has ${totalMinutes} minutes remaining`)

        // Check if we should send notification
        if (totalMinutes === preferences.alert_minutes) {
          // Check if we've already sent a notification for this time
          const { data: existingNotif } = await supabase
            .from('sent_notifications')
            .select('*')
            .eq('auction_id', auction.id)
            .eq('user_id', alert.user_id)
            .eq('alert_minutes', preferences.alert_minutes)
            .single()

          if (existingNotif) {
            console.log(`Notification already sent for auction ${auction.id} at ${preferences.alert_minutes} minutes`)
            continue
          }

          // Send Telegram notification if enabled
          if (preferences.enable_telegram && preferences.telegram_token && preferences.telegram_chat_id) {
            console.log(`Sending Telegram notification for auction ${auction.id}`)
            
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
              throw new Error(`Telegram API error: ${errorText}`)
            }

            // Record the sent notification
            const { error: notifError } = await supabase
              .from('sent_notifications')
              .insert({
                user_id: alert.user_id,
                auction_id: auction.id,
                alert_minutes: preferences.alert_minutes,
              })

            if (notifError) {
              throw new Error(`Error recording notification: ${notifError.message}`)
            }

            console.log(`Successfully sent and recorded notification for auction ${auction.id}`)
          } else {
            console.log(`Telegram notifications not enabled for user ${alert.user_id}`)
          }
        }
      } catch (error) {
        console.error(`Error processing alert ${alert.id}:`, error)
      }
    }
  } catch (error) {
    console.error("Error in check-auction-alerts function:", error)
  }
})