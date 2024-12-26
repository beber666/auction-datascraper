import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useUserPreferences = () => {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(1);
  const [currency, setCurrency] = useState("EUR");
  const [language, setLanguage] = useState("en");
  const { toast } = useToast();

  // Load user preferences on mount
  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("No active session found");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("preferred_currency, preferred_language, auto_refresh, refresh_interval")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error loading preferences:", error);
        throw error;
      }

      if (profile) {
        console.log("Loaded preferences:", profile);
        setCurrency(profile.preferred_currency || "EUR");
        setLanguage(profile.preferred_language || "en");
        setAutoRefresh(profile.auto_refresh || false);
        setRefreshInterval(profile.refresh_interval || 1);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
      toast({
        title: "Error",
        description: "Failed to load user preferences",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", session.user.id);

      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in updateProfile:", error);
      throw error;
    }
  };

  const handleAutoRefreshChange = async (enabled: boolean) => {
    try {
      setAutoRefresh(enabled);
      await updateProfile({ auto_refresh: enabled });
    } catch (error) {
      console.error("Error updating auto refresh:", error);
      toast({
        title: "Error",
        description: "Failed to update auto refresh setting",
        variant: "destructive",
      });
    }
  };

  const handleRefreshIntervalChange = async (minutes: number) => {
    try {
      setRefreshInterval(minutes);
      await updateProfile({ refresh_interval: minutes });
    } catch (error) {
      console.error("Error updating refresh interval:", error);
      toast({
        title: "Error",
        description: "Failed to update refresh interval",
        variant: "destructive",
      });
    }
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    try {
      setCurrency(newCurrency);
      await updateProfile({ preferred_currency: newCurrency });
    } catch (error) {
      console.error("Error updating currency:", error);
      toast({
        title: "Error",
        description: "Failed to update currency preference",
        variant: "destructive",
      });
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    try {
      // First update local state
      setLanguage(newLanguage);
      
      // Then update in database
      await updateProfile({ preferred_language: newLanguage });
      
      // Show success message
      toast({
        title: "Language Updated",
        description: "The page will refresh to apply the changes.",
      });

      // Store the new language in localStorage for persistence across page reload
      localStorage.setItem('preferred_language', newLanguage);
      
      // Force refresh all auctions to retranslate names after a short delay
      // to ensure the database update completes
      setTimeout(() => {
        console.log('Reloading page to apply language change:', newLanguage);
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error updating language:", error);
      toast({
        title: "Error",
        description: "Failed to update language preference",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    autoRefresh,
    refreshInterval,
    currency,
    language,
    handleAutoRefreshChange,
    handleRefreshIntervalChange,
    handleCurrencyChange,
    handleLanguageChange,
    loadUserPreferences
  };
};