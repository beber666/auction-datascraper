import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Package, ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";

interface PackageItem {
  id: string;
  name: string;
  total_items_cost: number;
  shipping_cost: number;
  customs_fees: number;
  other_costs: number;
  selling_price: number | null;
  total_price: number | null;
  margin: number | null;
}

export function PackageList() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    const { data: packageData, error } = await supabase
      .from("packages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading packages:", error);
      return;
    }

    setPackages(packageData);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6" />
          Package Manager
        </h1>
        <Button onClick={() => navigate("/packages/new")}>
          <ListPlus className="w-4 h-4 mr-2" />
          New Package
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Package Name</TableHead>
              <TableHead>Items Cost</TableHead>
              <TableHead>Total Costs</TableHead>
              <TableHead>Selling Price</TableHead>
              <TableHead className="text-right">Margin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((pkg) => (
              <TableRow
                key={pkg.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/packages/${pkg.id}`)}
              >
                <TableCell className="font-medium">{pkg.name}</TableCell>
                <TableCell>¥{pkg.total_items_cost.toLocaleString()}</TableCell>
                <TableCell>¥{pkg.total_price?.toLocaleString() || 0}</TableCell>
                <TableCell>
                  {pkg.selling_price
                    ? `¥${pkg.selling_price.toLocaleString()}`
                    : "-"}
                </TableCell>
                <TableCell
                  className={`text-right ${
                    pkg.margin
                      ? pkg.margin > 0
                        ? "text-green-600"
                        : "text-red-600"
                      : ""
                  }`}
                >
                  {pkg.margin ? `¥${pkg.margin.toLocaleString()}` : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}