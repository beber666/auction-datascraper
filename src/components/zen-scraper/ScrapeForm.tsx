
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

interface ScrapeFormProps {
  onScrapeStart: (url: string, maxPages: number | null) => Promise<void>;
  isLoading: boolean;
  currentPage: number;
}

interface ScrapeFormValues {
  url: string;
  maxPages: string;
}

export const ScrapeForm = ({ onScrapeStart, isLoading, currentPage }: ScrapeFormProps) => {
  const { toast } = useToast();
  const form = useForm<ScrapeFormValues>({
    defaultValues: {
      url: '',
      maxPages: ''
    }
  });

  const handleSubmit = async (values: ScrapeFormValues) => {
    if (!values.url.includes('zenmarket.jp')) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Zenmarket category URL",
        variant: "destructive",
      });
      return;
    }

    // Properly parse the maxPages value
    let maxPages: number | null = null;
    if (values.maxPages && values.maxPages.trim() !== '') {
      const parsedValue = parseInt(values.maxPages);
      if (!isNaN(parsedValue) && parsedValue > 0) {
        maxPages = parsedValue;
      } else {
        toast({
          title: "Invalid Max Pages",
          description: "Please enter a valid positive number for Max Pages",
          variant: "destructive",
        });
        return;
      }
    }

    console.log('Starting scrape with max pages:', maxPages);
    await onScrapeStart(values.url, maxPages);
  };

  return (
    <Card className="p-6 mb-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category URL</FormLabel>
                <FormControl>
                  <Input 
                    type="url" 
                    placeholder="https://zenmarket.jp/en/yahoo.aspx?c=2084229142" 
                    required
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="maxPages"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Pages (optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1"
                    placeholder="Leave empty to scrape all pages"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Limit the number of pages to scrape
                </FormDescription>
              </FormItem>
            )}
          />
          
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
      </Form>
    </Card>
  );
};
