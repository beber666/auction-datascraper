import { Input } from "@/components/ui/input";

interface NameFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const NameFilter = ({ searchTerm, onSearchChange }: NameFilterProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor="name-filter" className="text-sm font-medium">
        Filtrer par nom
      </label>
      <Input
        id="name-filter"
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Rechercher dans les titres..."
        className="max-w-sm"
      />
    </div>
  );
};