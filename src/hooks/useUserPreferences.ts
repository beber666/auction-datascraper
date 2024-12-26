import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useUserPreferences = () => {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(1);
  const [currency, setCurrency] = useState("EUR");
  const [language, setLanguage] = useState("en");
  const { toast } = useToast();

  const loadUserPreferences = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("preferred_currency, preferred_language, auto_refresh, refresh_interval")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;

      if (profile) {
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

  const handleAutoRefreshChange = async (enabled: boolean) => {
    try {
      setAutoRefresh(enabled);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const { error } = await supabase
        .from("profiles")
        .update({ auto_refresh: enabled })
        .eq("id", session.user.id);

      if (error) throw error;
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const { error } = await supabase
        .from("profiles")
        .update({ refresh_interval: minutes })
        .eq("id", session.user.id);

      if (error) throw error;
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const { error } = await supabase
        .from("profiles")
        .update({ preferred_currency: newCurrency })
        .eq("id", session.user.id);

      if (error) throw error;
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
      setLanguage(newLanguage);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const { error } = await supabase
        .from("profiles")
        .update({ preferred_language: newLanguage })
        .eq("id", session.user.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating language:", error);
      toast({
        title: "Error",
        description: "Failed to update language preference",
        variant: "destructive",
      });
      throw error; // Re-throw to handle in the UI
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