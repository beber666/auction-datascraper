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

async function sendTelegramMessage(botToken: string, chatId: string, message: string) {
  console.log('Sending Telegram message:', { chatId, message });
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
    console.error('Telegram API error:', error);
    throw new Error(`Telegram API error: ${error}`);
  }

  const result = await response.json();
  console.log('Telegram API response:', result);
  return result;
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
    
    const now = new Date();
    
    // Get auctions that are about to end and have alerts set up
    const { data: auctionsToNotify, error: auctionsError } = await supabase
      .from("auctions")
      .select(`
        *,
        auction_alerts(user_id),
        alert_preferences!inner(*)
      `)
      .not('end_time', 'is', null)
      .gt('end_time', now.toISOString())
      .order('end_time', { ascending: true });

    if (auctionsError) {
      console.error('Error fetching auctions:', auctionsError);
      throw auctionsError;
    }

    console.log(`Processing ${auctionsToNotify?.length || 0} upcoming auctions`);

    for (const auction of auctionsToNotify || []) {
      const endTime = new Date(auction.end_time);
      const minutesUntilEnd = Math.floor((endTime.getTime() - now.getTime()) / (1000 * 60));

      console.log(`Auction ${auction.id} ends in ${minutesUntilEnd} minutes`);

      // Process each alert preference
      for (const alertPref of auction.alert_preferences) {
        // Check if it's time to send the alert (within 1 minute of the alert time)
        if (Math.abs(minutesUntilEnd - alertPref.alert_minutes) <= 1) {
          console.log(`Checking notification for auction ${auction.id} and user ${alertPref.user_id}`);
          
          // Check if we've already sent this notification
          const { data: existingNotification } = await supabase
            .from("sent_notifications")
            .select("id")
            .eq("user_id", alertPref.user_id)
            .eq("auction_id", auction.id)
            .eq("alert_minutes", alertPref.alert_minutes)
            .maybeSingle();

          if (existingNotification) {
            console.log(`Notification already sent for auction ${auction.id} to user ${alertPref.user_id}`);
            continue;
          }

          const message = `🔔 Auction Alert: "${auction.product_name}" is ending in ${alertPref.alert_minutes} minutes!\nCurrent price: ${auction.current_price}\nCheck it out: ${auction.url}`;

          console.log(`Sending alert for auction ${auction.id} to user ${alertPref.user_id}`);

          // Send Telegram notification
          if (alertPref.enable_telegram && alertPref.telegram_token && alertPref.telegram_chat_id) {
            try {
              await sendTelegramMessage(
                alertPref.telegram_token,
                alertPref.telegram_chat_id,
                message
              );
              console.log('Telegram notification sent successfully');
            } catch (error) {
              console.error('Failed to send Telegram notification:', error);
            }
          }

          // Send email notification
          if (alertPref.enable_email) {
            const { data: userData } = await supabase.auth.admin.getUserById(alertPref.user_id);
            if (userData?.user?.email) {
              try {
                await sendEmail(
                  userData.user.email,
                  "Auction Ending Soon!",
                  message.replace("\n", "<br>")
                );
                console.log('Email notification sent successfully');
              } catch (error) {
                console.error('Failed to send email notification:', error);
              }
            }
          }

          // Record that we've sent this notification
          const { error: insertError } = await supabase
            .from("sent_notifications")
            .insert({
              user_id: alertPref.user_id,
              auction_id: auction.id,
              alert_minutes: alertPref.alert_minutes,
            });

          if (insertError) {
            console.error('Error recording sent notification:', insertError);
          }
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