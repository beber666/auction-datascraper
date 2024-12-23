// Move the existing currency converter code here, removing the Card wrapper
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const currencies = [
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "GBP", symbol: "£", name: "British Pound" },
];

export const CurrencyConverterTool = () => {
  const [amount, setAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState("JPY");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadUserPreferences = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("preferred_currency")
        .eq("id", session.user.id)
        .single();

      if (profile?.preferred_currency) {
        setToCurrency(profile.preferred_currency);
      }
    };

    loadUserPreferences();
  }, []);

  useEffect(() => {
    const convertCurrency = async () => {
      try {
        const response = await fetch(
          `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
        );
        const data = await response.json();

        if (data.rates && data.rates[toCurrency]) {
          const rate = data.rates[toCurrency];
          const converted = (parseFloat(amount) * rate).toFixed(2);
          const fromSymbol = currencies.find(c => c.code === fromCurrency)?.symbol || "";
          const toSymbol = currencies.find(c => c.code === toCurrency)?.symbol || "";
          setResult(`${fromSymbol}${amount} = ${toSymbol}${converted}`);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to convert currency. Please try again later.",
          variant: "destructive",
        });
      }
    };

    if (amount && !isNaN(parseFloat(amount))) {
      convertCurrency();
    }
  }, [amount, fromCurrency, toCurrency, toast]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          step="any"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>From</Label>
          <Select value={fromCurrency} onValueChange={setFromCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>To</Label>
          <Select value={toCurrency} onValueChange={setToCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {result && (
        <div className="mt-4 text-center text-lg font-semibold text-green-600">
          {result}
        </div>
      )}
    </div>
  );
};