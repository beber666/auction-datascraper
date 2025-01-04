import { useUserPreferences } from "./useUserPreferences";

const currencySymbols: Record<string, string> = {
  JPY: "¥",
  EUR: "€",
  USD: "$",
  GBP: "£",
};

export const useAmountFormatter = () => {
  const { currency } = useUserPreferences();

  const formatAmount = (amount: number) => {
    const exchangeRates: Record<string, number> = {
      JPY: 1,
      EUR: 0.0062,
      USD: 0.0067,
      GBP: 0.0053,
    };

    const convertedAmount = amount * exchangeRates[currency];
    const symbol = currencySymbols[currency];

    return `${symbol}${convertedAmount.toLocaleString(undefined, {
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2,
    })}`;
  };

  return { formatAmount };
};