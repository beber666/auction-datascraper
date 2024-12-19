import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
  try {
    // Get auctions that are about to end
    const { data: auctions, error: auctionsError } = await supabase
      .from("auctions")
      .select(`
        *,
        auction_alerts(user_id),
        profiles!auctions_user_id_fkey(*)
      `)
      .neq("time_remaining", "Ended");

    if (auctionsError) throw auctionsError;

    for (const auction of auctions) {
      // Parse time remaining and check if it's within alert threshold
      const timeStr = auction.time_remaining;
      if (!timeStr) continue;

      const minutes = parseInt(timeStr);
      if (isNaN(minutes)) continue;

      // Get alert preferences for users who have alerts for this auction
      const { data: preferences, error: preferencesError } = await supabase
        .from("alert_preferences")
        .select("*")
        .in(
          "user_id",
          auction.auction_alerts.map((alert: any) => alert.user_id)
        );

      if (preferencesError) throw preferencesError;

      for (const pref of preferences) {
        if (minutes <= pref.alert_minutes) {
          const message = `🔔 Auction Alert: "${auction.product_name}" is ending in ${minutes} minutes!\nCurrent price: ${auction.current_price}\nCheck it out: ${auction.url}`;

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
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

serve(handler);