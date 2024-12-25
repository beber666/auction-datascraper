import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Packages() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Package Manager</h1>
        <Button onClick={() => navigate("/packages/new")}>
          <Plus className="w-4 h-4 mr-2" />
          Add Package
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Package Name</TableHead>
              <TableHead>Purchase Price</TableHead>
              <TableHead>Total Costs</TableHead>
              <TableHead>Selling Price</TableHead>
              <TableHead className="text-right">Margin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* We'll populate this with real data later */}
            <TableRow>
              <TableCell className="font-medium">Example Package</TableCell>
              <TableCell>¥5000</TableCell>
              <TableCell>¥7500</TableCell>
              <TableCell>¥12000</TableCell>
              <TableCell className="text-right text-green-600">¥4500</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}