import { supabase } from "@/integrations/supabase/client";

export interface NotificationPayload {
  auction_id: string;
  user_id: string;
  alert_minutes: number;
}

export const sendNotification = async (payload: NotificationPayload) => {
  try {
    const { error } = await supabase.functions.invoke('send-alerts', {
      body: payload
    });

    if (error) {
      console.error('Error sending notification:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw error;
  }
};