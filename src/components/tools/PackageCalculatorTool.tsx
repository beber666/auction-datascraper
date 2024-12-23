import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const PackageCalculatorTool = () => {
  const [totalPrice, setTotalPrice] = useState("");
  const [weights, setWeights] = useState("");
  const [results, setResults] = useState<number[]>([]);
  const { toast } = useToast();

  const calculatePrices = () => {
    try {
      const price = parseFloat(totalPrice);
      const weightArray = weights.split(",").map((w) => parseFloat(w.trim()));
      const totalWeight = weightArray.reduce((sum, weight) => sum + weight, 0);

      if (isNaN(price) || weightArray.some(isNaN)) {
        throw new Error("Please enter valid numbers");
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
        <Label htmlFor="weights">Package Weights (comma-separated)</Label>
        <Input
          id="weights"
          value={weights}
          onChange={(e) => setWeights(e.target.value)}
          placeholder="e.g., 1.5, 2.3, 0.8"
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