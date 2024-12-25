import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function NewPackage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    try {
      const { error } = await supabase.from('packages').insert({
        name: formData.get('name'),
        link: formData.get('link'),
        zen_id: formData.get('zen_id'),
        purchase_price: Number(formData.get('purchasePrice')) || 0,
        shipping_cost: Number(formData.get('shippingCost')) || 0,
        local_shipping_price: Number(formData.get('localShippingPrice')) || 0,
        international_shipping: Number(formData.get('internationalShipping')) || 0,
        weight_kg: Number(formData.get('weight')) || 0,
        customs_fees: Number(formData.get('customsFees')) || 0,
        customs_percentage: Number(formData.get('customsPercentage')) || 0,
        other_costs: Number(formData.get('otherCosts')) || 0,
        selling_price: Number(formData.get('sellingPrice')) || 0,
        notes: formData.get('notes'),
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Package created successfully",
      });
      
      navigate("/packages");
    } catch (error) {
      console.error('Error creating package:', error);
      toast({
        title: "Error",
        description: "Failed to create package. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate("/packages")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Packages
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6" />
            <div>
              <CardTitle>New Package</CardTitle>
              <CardDescription>
                Add details about your package to track costs and margins
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Package Name</Label>
                <Input id="name" name="name" placeholder="Enter package name" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="link">Zen Market Link</Label>
                  <Input id="link" name="link" placeholder="Paste Zen Market URL" />
                </div>
                <div>
                  <Label htmlFor="zen_id">Zen Market ID</Label>
                  <Input id="zen_id" name="zen_id" placeholder="Enter Zen Market ID" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchasePrice">Purchase Price (¥)</Label>
                  <Input
                    id="purchasePrice"
                    name="purchasePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter purchase price"
                  />
                </div>
                <div>
                  <Label htmlFor="shippingCost">Domestic Shipping (¥)</Label>
                  <Input
                    id="shippingCost"
                    name="shippingCost"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter domestic shipping cost"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="localShippingPrice">Local Shipping (¥)</Label>
                  <Input
                    id="localShippingPrice"
                    name="localShippingPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter local shipping cost"
                  />
                </div>
                <div>
                  <Label htmlFor="internationalShipping">International Shipping (¥)</Label>
                  <Input
                    id="internationalShipping"
                    name="internationalShipping"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter international shipping cost"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter weight in kg"
                  />
                </div>
                <div>
                  <Label htmlFor="customsFees">Customs Fees (¥)</Label>
                  <Input
                    id="customsFees"
                    name="customsFees"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter customs fees"
                  />
                </div>
                <div>
                  <Label htmlFor="customsPercentage">Customs Rate (%)</Label>
                  <Input
                    id="customsPercentage"
                    name="customsPercentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="Enter customs rate"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="otherCosts">Other Costs (¥)</Label>
                  <Input
                    id="otherCosts"
                    name="otherCosts"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter other costs"
                  />
                </div>
                <div>
                  <Label htmlFor="sellingPrice">Selling Price (¥)</Label>
                  <Input
                    id="sellingPrice"
                    name="sellingPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter selling price"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Add any additional notes about the package"
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Create Package
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}