import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Import } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface BulkImportDialogProps {
  onImport: (urls: string[]) => Promise<void>;
  isLoading: boolean;
}

export const BulkImportDialog = ({ onImport, isLoading }: BulkImportDialogProps) => {
  const [urls, setUrls] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    const urlList = urls
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (urlList.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer au moins une URL",
        variant: "destructive",
      });
      return;
    }

    const invalidUrls = urlList.filter((url) => !url.includes("zenmarket.jp"));
    if (invalidUrls.length > 0) {
      toast({
        title: "URLs invalides détectées",
        description: "Toutes les URLs doivent être des enchères Zenmarket",
        variant: "destructive",
      });
      return;
    }

    try {
      await onImport(urlList);
      setUrls("");
      setOpen(false);
      toast({
        title: "Succès",
        description: `${urlList.length} enchères ont été importées avec succès`,
      });
    } catch (error) {
      console.error("Error importing auctions:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'import",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Import className="h-4 w-4" />
          Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Import en masse d'enchères</DialogTitle>
          <DialogDescription>
            Collez vos URLs d'enchères Zenmarket (une par ligne)
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="https://zenmarket.jp/auction.aspx?itemCode=xxx&#10;https://zenmarket.jp/auction.aspx?itemCode=yyy"
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            className="min-h-[200px]"
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleImport}
            disabled={isLoading}
          >
            {isLoading ? "Import en cours..." : "Importer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};