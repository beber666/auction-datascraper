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
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NewPackage() {
  const navigate = useNavigate();

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
          <CardTitle>New Package</CardTitle>
          <CardDescription>
            Add details about your package to track costs and margins
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Package Name</Label>
                <Input id="name" placeholder="Enter package name" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchasePrice">Purchase Price (¥)</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    placeholder="Enter purchase price"
                  />
                </div>
                <div>
                  <Label htmlFor="shippingCost">Shipping Cost (¥)</Label>
                  <Input
                    id="shippingCost"
                    type="number"
                    placeholder="Enter shipping cost"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customsFees">Customs Fees (¥)</Label>
                  <Input
                    id="customsFees"
                    type="number"
                    placeholder="Enter customs fees"
                  />
                </div>
                <div>
                  <Label htmlFor="otherCosts">Other Costs (¥)</Label>
                  <Input
                    id="otherCosts"
                    type="number"
                    placeholder="Enter other costs"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="sellingPrice">Selling Price (¥)</Label>
                <Input
                    id="sellingPrice"
                    type="number"
                    placeholder="Enter selling price"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Add any additional notes about the package"
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