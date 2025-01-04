import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";

// Mock data for testing
const mockItems = [
  {
    id: 1,
    name: "Figurine Dragon Ball",
    productUrl: "https://zenmarket.jp/product123",
    platformId: "ZM123456",
    proxyFee: 300,
    price: 5000,
    localShippingPrice: 800,
    weight: 0.5,
    internationalShippingShare: 1200,
    customsFee: 500,
    totalPrice: 7800,
    resalePrice: 12000,
    resaleComment: "Bon état, édition limitée",
  },
  {
    id: 2,
    name: "Manga One Piece Vol.1",
    productUrl: "https://zenmarket.jp/product456",
    platformId: "ZM789012",
    proxyFee: 300,
    price: 800,
    localShippingPrice: 500,
    weight: 0.3,
    internationalShippingShare: 800,
    customsFee: 200,
    totalPrice: 2600,
    resalePrice: 4000,
    resaleComment: "Première édition",
  },
];

export const NewPackageForm = () => {
  const navigate = useNavigate();
  const [packageName, setPackageName] = useState("");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Nouveau Paquet</h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => navigate("/package-manager")}>
            Annuler
          </Button>
          <Button>Sauvegarder</Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="package-name">Nom du paquet</Label>
          <Input
            id="package-name"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            placeholder="Entrez le nom du paquet"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Lien produit</TableHead>
                <TableHead>ID plateforme</TableHead>
                <TableHead className="text-right">Frais proxy</TableHead>
                <TableHead className="text-right">Prix</TableHead>
                <TableHead className="text-right">Envoi local</TableHead>
                <TableHead className="text-right">Poids (kg)</TableHead>
                <TableHead className="text-right">Part envoi int.</TableHead>
                <TableHead className="text-right">Part douane</TableHead>
                <TableHead className="text-right">Prix total</TableHead>
                <TableHead className="text-right">Prix revente</TableHead>
                <TableHead>Commentaire</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    <a
                      href={item.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Voir
                    </a>
                  </TableCell>
                  <TableCell>{item.platformId}</TableCell>
                  <TableCell className="text-right">¥{item.proxyFee.toLocaleString()}</TableCell>
                  <TableCell className="text-right">¥{item.price.toLocaleString()}</TableCell>
                  <TableCell className="text-right">¥{item.localShippingPrice.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.weight}</TableCell>
                  <TableCell className="text-right">¥{item.internationalShippingShare.toLocaleString()}</TableCell>
                  <TableCell className="text-right">¥{item.customsFee.toLocaleString()}</TableCell>
                  <TableCell className="text-right">¥{item.totalPrice.toLocaleString()}</TableCell>
                  <TableCell className="text-right">¥{item.resalePrice.toLocaleString()}</TableCell>
                  <TableCell>{item.resaleComment}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Button className="w-full">+ Ajouter un article</Button>
      </div>
    </div>
  );
};