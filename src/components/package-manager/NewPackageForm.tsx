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
import { useUserPreferences } from "@/hooks/useUserPreferences";

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

const currencySymbols: Record<string, string> = {
  JPY: "¥",
  EUR: "€",
  USD: "$",
  GBP: "£",
};

export const NewPackageForm = () => {
  const navigate = useNavigate();
  const [packageName, setPackageName] = useState("");
  const { currency, loadUserPreferences } = useUserPreferences();

  const formatAmount = (amount: number) => {
    const exchangeRates: Record<string, number> = {
      JPY: 1,
      EUR: 0.0062,
      USD: 0.0067,
      GBP: 0.0053,
    };

    const convertedAmount = amount * exchangeRates[currency];
    const symbol = currencySymbols[currency];

    return `${symbol}${convertedAmount.toLocaleString(undefined, {
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2,
    })}`;
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Nouveau Paquet</h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => navigate("/package-manager")}>
            Annuler
          </Button>
          <Button>Sauvegarder</Button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="package-name">Nom du paquet</Label>
          <Input
            id="package-name"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            placeholder="Entrez le nom du paquet"
            className="max-w-md"
          />
        </div>

        <div className="border rounded-lg">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Nom</TableHead>
                      <TableHead className="w-[100px]">Lien produit</TableHead>
                      <TableHead className="w-[120px]">ID plateforme</TableHead>
                      <TableHead className="text-right w-[100px]">Frais proxy</TableHead>
                      <TableHead className="text-right w-[100px]">Prix</TableHead>
                      <TableHead className="text-right w-[100px]">Envoi local</TableHead>
                      <TableHead className="text-right w-[100px]">Poids (kg)</TableHead>
                      <TableHead className="text-right w-[100px]">Part envoi int.</TableHead>
                      <TableHead className="text-right w-[100px]">Part douane</TableHead>
                      <TableHead className="text-right w-[100px]">Prix total</TableHead>
                      <TableHead className="text-right w-[100px]">Prix revente</TableHead>
                      <TableHead className="w-[200px]">Commentaire</TableHead>
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
                        <TableCell className="text-right">{formatAmount(item.proxyFee)}</TableCell>
                        <TableCell className="text-right">{formatAmount(item.price)}</TableCell>
                        <TableCell className="text-right">{formatAmount(item.localShippingPrice)}</TableCell>
                        <TableCell className="text-right">{item.weight}</TableCell>
                        <TableCell className="text-right">{formatAmount(item.internationalShippingShare)}</TableCell>
                        <TableCell className="text-right">{formatAmount(item.customsFee)}</TableCell>
                        <TableCell className="text-right">{formatAmount(item.totalPrice)}</TableCell>
                        <TableCell className="text-right">{formatAmount(item.resalePrice)}</TableCell>
                        <TableCell>{item.resaleComment}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>

        <Button className="w-full">+ Ajouter un article</Button>
      </div>
    </div>
  );
};