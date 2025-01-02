import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuctionTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const translateAuctionName = useCallback(async (text: string, targetLang: string) => {
    if (!text) return text;
    
    try {
      setIsTranslating(true);
      console.log('Translating text:', { text, targetLang });

      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: { text, targetLang }
      });

      if (error) {
        console.error('Translation error:', error);
        toast({
          title: 'Translation Error',
          description: 'Failed to translate auction name. Using original text.',
          variant: 'destructive',
        });
        return text;
      }

      console.log('Translation response:', data);
      return data?.translatedText || text;
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: 'Translation Error',
        description: 'Failed to translate auction name. Using original text.',
        variant: 'destructive',
      });
      return text;
    } finally {
      setIsTranslating(false);
    }
  }, [toast]);

  return {
    translateAuctionName,
    isTranslating
  };
};