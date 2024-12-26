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

interface NotificationPayload {
  auction_id: string;
  user_id: string;
  alert_minutes: number;
}

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
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

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
    console.log('Received request:', req.method);
    const payload = await req.json();
    console.log('Received payload:', payload);

    // Validate required fields
    const { auction_id, user_id, alert_minutes } = payload as NotificationPayload;
    
    if (!auction_id || !user_id || alert_minutes === undefined) {
      console.error('Missing required fields in payload:', payload);
      throw new Error('Missing required fields: auction_id, user_id, or alert_minutes');
    }

    console.log('Processing notification for:', { auction_id, user_id, alert_minutes });

    // Get auction details
    const { data: auction, error: auctionError } = await supabase
      .from("auctions")
      .select("*")
      .eq("id", auction_id)
      .maybeSingle();

    if (auctionError || !auction) {
      console.error("Error fetching auction:", auctionError);
      throw new Error("Auction not found");
    }

    // Get user's alert preferences
    const { data: alertPref, error: prefError } = await supabase
      .from("alert_preferences")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    if (prefError || !alertPref) {
      console.error("Error fetching alert preferences:", prefError);
      throw new Error("Alert preferences not found");
    }

    const message = `🔔 Auction Alert: "${auction.product_name}" is ending in ${alert_minutes} minutes!\nCurrent price: ${auction.current_price}\nCheck it out: ${auction.url}`;

    // Send notifications based on user preferences
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

    if (alertPref.enable_email) {
      const { data: userData } = await supabase.auth.admin.getUserById(user_id);
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
        user_id,
        auction_id,
        alert_minutes,
      });

    if (insertError) {
      console.error('Error recording sent notification:', insertError);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-alerts function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Failed to process notification"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);