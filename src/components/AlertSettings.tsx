import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AlertPreferences {
  alert_minutes: number;
  telegram_token: string | null;
  telegram_chat_id: string | null;
  enable_telegram: boolean;
  enable_email: boolean;
  enable_browser: boolean;
}

export const AlertSettings = () => {
  const [preferences, setPreferences] = useState<AlertPreferences>({
    alert_minutes: 2,
    telegram_token: null,
    telegram_chat_id: null,
    enable_telegram: false,
    enable_email: false,
    enable_browser: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchPreferences = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('alert_preferences')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load alert preferences",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setPreferences(data);
      } else {
        // Create default preferences
        const { error: insertError } = await supabase
          .from('alert_preferences')
          .insert({
            user_id: session.user.id,
            ...preferences,
          });

        if (insertError) {
          toast({
            title: "Error",
            description: "Failed to create alert preferences",
            variant: "destructive",
          });
        }
      }
    };

    fetchPreferences();
  }, []);

  const updatePreferences = async (updates: Partial<AlertPreferences>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);

    const { error } = await supabase
      .from('alert_preferences')
      .update(newPreferences)
      .eq('user_id', session.user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update alert preferences",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Alert preferences updated successfully",
    });
  };

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-lg font-semibold">Alert Settings</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Alert Time</Label>
            <div className="text-sm text-muted-foreground">
              Minutes before auction ends
            </div>
          </div>
          <Input
            type="number"
            value={preferences.alert_minutes}
            onChange={(e) => updatePreferences({ alert_minutes: parseInt(e.target.value) })}
            className="w-20"
            min={1}
            max={60}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={preferences.enable_browser}
              onCheckedChange={(checked) => updatePreferences({ enable_browser: checked })}
            />
            <Label>Browser Notifications</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={preferences.enable_email}
              onCheckedChange={(checked) => updatePreferences({ enable_email: checked })}
            />
            <Label>Email Notifications</Label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={preferences.enable_telegram}
                onCheckedChange={(checked) => updatePreferences({ enable_telegram: checked })}
              />
              <Label>Telegram Notifications</Label>
            </div>
            
            {preferences.enable_telegram && (
              <div className="space-y-4 pl-6">
                <div className="space-y-2">
                  <Label>Telegram Bot Token</Label>
                  <Input
                    type="text"
                    value={preferences.telegram_token || ''}
                    onChange={(e) => updatePreferences({ telegram_token: e.target.value })}
                    placeholder="Enter your Telegram bot token"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telegram Chat ID</Label>
                  <Input
                    type="text"
                    value={preferences.telegram_chat_id || ''}
                    onChange={(e) => updatePreferences({ telegram_chat_id: e.target.value })}
                    placeholder="Enter your Telegram chat ID"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};