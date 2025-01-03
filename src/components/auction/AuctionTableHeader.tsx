import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const AuctionTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[100px]">Image</TableHead>
        <TableHead>Product Name</TableHead>
        <TableHead>Current Price</TableHead>
        <TableHead className="text-center">Bids</TableHead>
        <TableHead>Time Remaining</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};