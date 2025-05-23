import { useEffect } from "react";
import { UrlForm } from "@/components/UrlForm";
import { AuctionTable } from "@/components/AuctionTable";
import { FeedbackBox } from "@/components/FeedbackBox";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SettingsPanel } from "@/components/SettingsPanel";
import { useAuctions } from "@/hooks/useAuctions";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { BulkImportDialog } from "@/components/auction/BulkImportDialog";

const Index = () => {
  const navigate = useNavigate();
  const {
    autoRefresh,
    refreshInterval,
    currency,
    language,
    handleAutoRefreshChange,
    handleRefreshIntervalChange,
    handleCurrencyChange,
    handleLanguageChange,
    loadUserPreferences
  } = useUserPreferences();

  const {
    items,
    isLoading,
    handleSubmit,
    handleDelete,
    loadUserAuctions,
    refreshAuctions,
    refreshIntervalRef,
    handleBulkImport
  } = useAuctions(language, currency);

  // Initial load of user data
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      await loadUserPreferences();
      await loadUserAuctions();
    };
    checkUser();
  }, [navigate]);

  // Handle auto-refresh
  useEffect(() => {
    // Clear any existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }

    // Set up new interval if auto-refresh is enabled
    if (autoRefresh && refreshInterval > 0) {
      console.log('Setting up auto-refresh interval:', refreshInterval, 'minutes');
      refreshIntervalRef.current = setInterval(() => {
        console.log('Auto-refreshing auctions...');
        refreshAuctions();
      }, refreshInterval * 60 * 1000);
    }

    // Cleanup function
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [autoRefresh, refreshInterval, refreshAuctions]);

  // Initial refresh of time remaining
  useEffect(() => {
    if (items.length > 0) {
      console.log('Refreshing auctions on initial load');
      refreshAuctions();
    }
  }, [items.length]);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Zenmarket Auction Tracker
      </h1>
      <div className="max-w-3xl mx-auto space-y-8">
        <SettingsPanel
          autoRefresh={autoRefresh}
          refreshInterval={refreshInterval}
          currency={currency}
          language={language}
          onAutoRefreshChange={handleAutoRefreshChange}
          onRefreshIntervalChange={handleRefreshIntervalChange}
          onCurrencyChange={handleCurrencyChange}
          onLanguageChange={handleLanguageChange}
        />
        <div className="flex gap-4 items-start">
          <div className="flex-1">
            <UrlForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
          <BulkImportDialog onImport={handleBulkImport} isLoading={isLoading} />
        </div>
        {items.length > 0 ? (
          <AuctionTable items={items} onDelete={handleDelete} />
        ) : (
          <div className="text-center text-gray-500 mt-8">
            No auctions added yet. Add your first auction above!
          </div>
        )}
      </div>
      <FeedbackBox />
    </div>
  );
};

export default Index;