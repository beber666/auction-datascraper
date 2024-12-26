import { supabase } from "@/integrations/supabase/client";

export interface NotificationPayload {
  auction_id: string;
  user_id: string;
  alert_minutes: number;
}

export const sendNotification = async (payload: NotificationPayload) => {
  try {
    console.log('Sending notification with payload:', payload);
    
    const { error } = await supabase.functions.invoke('send-alerts', {
      body: {
        auction_id: payload.auction_id,
        user_id: payload.user_id,
        alert_minutes: payload.alert_minutes
      }
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