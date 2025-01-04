import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const PackageTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Product URL</TableHead>
        <TableHead>Platform ID</TableHead>
        <TableHead className="text-right">Proxy Fee</TableHead>
        <TableHead className="text-right">Price</TableHead>
        <TableHead className="text-right">Local Shipping</TableHead>
        <TableHead className="text-right">Weight (g)</TableHead>
        <TableHead className="text-right">Int'l Shipping Share</TableHead>
        <TableHead className="text-right">Customs Fee</TableHead>
        <TableHead className="text-right">Total Price</TableHead>
        <TableHead className="text-right">Resale Price</TableHead>
        <TableHead>Resale Comment</TableHead>
        <TableHead className="w-[100px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};