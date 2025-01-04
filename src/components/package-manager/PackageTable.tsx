import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data for testing
const mockPackages = [
  {
    id: 1,
    name: "Summer Collection 2024",
    itemCount: 3,
    sendDate: "2024-03-15",
    tracking: "JP123456789",
    totalAmount: 15000,
  },
  {
    id: 2,
    name: "Anime Figures Lot",
    itemCount: 5,
    sendDate: "2024-03-20",
    tracking: "JP987654321",
    totalAmount: 25000,
  },
  {
    id: 3,
    name: "Collectibles Bundle",
    itemCount: 2,
    sendDate: "2024-03-25",
    tracking: null,
    totalAmount: 8000,
  },
];

export const PackageTable = () => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Package Name</TableHead>
            <TableHead className="text-center">Items</TableHead>
            <TableHead>Send Date</TableHead>
            <TableHead>Tracking</TableHead>
            <TableHead className="text-right">Total Amount (¥)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockPackages.map((pkg) => (
            <TableRow key={pkg.id}>
              <TableCell className="font-medium">{pkg.name}</TableCell>
              <TableCell className="text-center">{pkg.itemCount}</TableCell>
              <TableCell>{pkg.sendDate}</TableCell>
              <TableCell>
                {pkg.tracking || <span className="text-muted-foreground">Not shipped yet</span>}
              </TableCell>
              <TableCell className="text-right">
                {pkg.totalAmount.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};