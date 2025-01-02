import { ScraperService } from "@/services/scraper";

export const useAuctionTranslation = () => {
  const translateAuctionName = async (
    productName: string,
    userLanguage: string
  ) => {
    try {
      let translatedName = productName;
      if (userLanguage !== 'ja') {
        translatedName = await ScraperService.translateText(
          productName,
          userLanguage
        );
        console.log('Translation result:', {
          original: productName,
          translated: translatedName,
          language: userLanguage
        });
      }
      return translatedName;
    } catch (error) {
      console.error('Translation failed:', error);
      // Return original text if translation fails
      return productName;
    }
  };

  return { translateAuctionName };
};