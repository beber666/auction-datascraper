import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserPreferences = () => {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(1);
  const [currency, setCurrency] = useState("EUR");
  const [language, setLanguage] = useState("en");

  const loadUserPreferences = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("preferred_currency, preferred_language, auto_refresh, refresh_interval")
      .eq("id", session.user.id)
      .single();

    if (profile) {
      setCurrency(profile.preferred_currency);
      setLanguage(profile.preferred_language);
      setAutoRefresh(profile.auto_refresh || false);
      setRefreshInterval(profile.refresh_interval || 1);
    }
  };

  const handleAutoRefreshChange = async (enabled: boolean) => {
    setAutoRefresh(enabled);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase
        .from("profiles")
        .update({ auto_refresh: enabled })
        .eq("id", session.user.id);
    }
  };

  const handleRefreshIntervalChange = async (minutes: number) => {
    setRefreshInterval(minutes);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase
        .from("profiles")
        .update({ refresh_interval: minutes })
        .eq("id", session.user.id);
    }
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    setCurrency(newCurrency);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase
        .from("profiles")
        .update({ preferred_currency: newCurrency })
        .eq("id", session.user.id);
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase
        .from("profiles")
        .update({ preferred_language: newLanguage })
        .eq("id", session.user.id);
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