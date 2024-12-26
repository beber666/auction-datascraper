import { ScraperService } from "@/services/scraper";

export const useAuctionTranslation = () => {
  const translateAuctionName = async (
    productName: string,
    userLanguage: string
  ) => {
    let translatedName = productName;
    if (userLanguage !== 'ja') {
      translatedName = await ScraperService.translateText(
        productName,
        userLanguage
      );
      console.log('Translation result:', {
        original: productName,
        translated: translatedName
      });
    }
    return translatedName;
  };

  return { translateAuctionName };
};