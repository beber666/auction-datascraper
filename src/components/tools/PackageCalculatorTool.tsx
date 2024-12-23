import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export const PackageCalculatorTool = () => {
  const [totalPrice, setTotalPrice] = useState("");
  const [weights, setWeights] = useState("");
  const [results, setResults] = useState<number[]>([]);
  const { toast } = useToast();

  const calculatePrices = () => {
    try {
      const price = parseFloat(totalPrice);
      
      // Clean and parse the weights input
      // Split by newlines and commas, clean up whitespace, filter empty strings
      const weightArray = weights
        .split(/[\n,]/)
        .map(w => w.trim())
        .filter(w => w !== "")
        .filter(w => !isNaN(parseFloat(w))) // Only keep valid numbers
        .map(w => parseFloat(w));

      if (weightArray.length === 0) {
        throw new Error("Please enter at least one weight");
      }

      const totalWeight = weightArray.reduce((sum, weight) => sum + weight, 0);

      if (isNaN(price)) {
        throw new Error("Please enter a valid total price");
      }

      const shares = weightArray.map((weight) =>
        Number((weight / totalWeight * price).toFixed(2))
      );

      setResults(shares);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Invalid input",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="total-price">Total Price</Label>
        <Input
          id="total-price"
          type="number"
          value={totalPrice}
          onChange={(e) => setTotalPrice(e.target.value)}
          placeholder="Enter total price"
        />
      </div>

      <div>
        <Label htmlFor="weights">Package Weights</Label>
        <Textarea
          id="weights"
          value={weights}
          onChange={(e) => setWeights(e.target.value)}
          placeholder="Enter weights (separated by commas or new lines)&#10;Example:&#10;10&#10;10&#10;20"
          className="min-h-[120px]"
        />
      </div>

      <Button onClick={calculatePrices}>Calculate</Button>

      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="font-semibold">Results:</h3>
          <ul className="list-disc pl-5">
            {results.map((price, index) => (
              <li key={index}>
                Package {index + 1}: {price.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};