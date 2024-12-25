import { ArrowLeft, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { PackageForm } from "@/components/packages/PackageForm";

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
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6" />
            <div>
              <CardTitle>New Package</CardTitle>
              <CardDescription>
                Create a new package to track costs and margins
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PackageForm />
        </CardContent>
      </Card>
    </div>
  );
}