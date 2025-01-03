import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const AuctionTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Nom du produit</TableHead>
        <TableHead>Prix actuel</TableHead>
        <TableHead className="text-center">Enchères</TableHead>
        <TableHead>Temps restant</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};