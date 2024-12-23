import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function parseTimeRemaining(timeStr: string): number {
  // Convert to lowercase for easier matching
  const str = timeStr.toLowerCase();
  
  // Initialize variables for days and hours
  let days = 0;
  let hours = 0;
  let minutes = 0;

  // Match patterns for days in different languages
  const dayMatches = str.match(/(\d+)\s*(day|jour|día|tag)/);
  if (dayMatches) {
    days = parseInt(dayMatches[1]);
  }

  // Match patterns for hours in different languages
  const hourMatches = str.match(/(\d+)\s*(hour|heure|hora|stunde)/);
  if (hourMatches) {
    hours = parseInt(hourMatches[1]);
  }

  // Match patterns for minutes in different languages
  const minuteMatches = str.match(/(\d+)\s*(min|minute|minuto)/);
  if (minuteMatches) {
    minutes = parseInt(minuteMatches[1]);
  }

  // Convert everything to minutes
  return (days * 24 * 60) + (hours * 60) + minutes;
}

function formatTimeRemaining(minutes: number): string {
  if (minutes < 1) return "less than a minute";
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

async function sendTelegramMessage(botToken: string, chatId: string, message: string) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  await fetch(url, {
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
}

async function sendEmail(to: string, subject: string, html: string) {
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Auction Alerts <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting alert check...");
    
    // Get auctions that are being tracked
    const { data: auctions, error: auctionsError } = await supabase
      .from("auctions")
      .select(`
        *,
        auction_alerts(user_id),
        profiles!auctions_user_id_fkey(*)
      `)
      .neq("time_remaining", "Ended");

    if (auctionsError) throw auctionsError;

    console.log(`Processing ${auctions?.length || 0} active auctions`);

    for (const auction of auctions || []) {
      if (!auction.time_remaining) continue;

      // Parse the time remaining into minutes
      const minutesRemaining = parseTimeRemaining(auction.time_remaining);
      console.log(`Auction ${auction.id} has ${minutesRemaining} minutes remaining`);

      // Get alert preferences for users who have alerts for this auction
      const { data: preferences, error: preferencesError } = await supabase
        .from("alert_preferences")
        .select("*")
        .in(
          "user_id",
          auction.auction_alerts.map((alert: any) => alert.user_id)
        );

      if (preferencesError) throw preferencesError;

      for (const pref of preferences || []) {
        if (minutesRemaining <= pref.alert_minutes) {
          // Check if we've already sent this notification
          const { data: existingNotification } = await supabase
            .from("sent_notifications")
            .select("id")
            .eq("user_id", pref.user_id)
            .eq("auction_id", auction.id)
            .eq("alert_minutes", pref.alert_minutes)
            .maybeSingle();

          if (existingNotification) {
            console.log(`Notification already sent for auction ${auction.id} to user ${pref.user_id}`);
            continue;
          }

          const timeRemainingText = formatTimeRemaining(minutesRemaining);
          const message = `🔔 Auction Alert: "${auction.product_name}" is ending in ${timeRemainingText}!\nCurrent price: ${auction.current_price}\nCheck it out: ${auction.url}`;

          console.log(`Sending alert for auction ${auction.id} to user ${pref.user_id}`);

          // Send Telegram notification
          if (pref.enable_telegram && pref.telegram_token && pref.telegram_chat_id) {
            await sendTelegramMessage(
              pref.telegram_token,
              pref.telegram_chat_id,
              message
            );
          }

          // Send email notification
          if (pref.enable_email) {
            const { data: userData } = await supabase.auth.admin.getUserById(pref.user_id);
            if (userData?.user?.email) {
              await sendEmail(
                userData.user.email,
                "Auction Ending Soon!",
                message.replace("\n", "<br>")
              );
            }
          }

          // Record that we've sent this notification
          await supabase
            .from("sent_notifications")
            .insert({
              user_id: pref.user_id,
              auction_id: auction.id,
              alert_minutes: pref.alert_minutes,
            });
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-alerts function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);