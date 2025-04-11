import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ScrapeFormProps {
  onScrapeStart: (url: string) => Promise<void>;
  isLoading: boolean;
  currentPage: number;
}

export const ScrapeForm = ({ onScrapeStart, isLoading, currentPage }: ScrapeFormProps) => {
  const [url, setUrl] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.includes('zenmarket.jp')) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Zenmarket category URL",
        variant: "destructive",
      });
      return;
    }
    await onScrapeStart(url);
  };

  return (
    <Card className="p-6 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="url" className="text-sm font-medium">
            Category URL
          </label>
          <Input
            id="url"
            type="url"
            placeholder="https://zenmarket.jp/en/yahoo.aspx?c=2084229142"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full"
            required
          />
        </div>
        
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Scraping page {currentPage}...</span>
            </div>
          ) : (
            "Start Scraping"
          )}
        </Button>
      </form>
    </Card>
  );
};