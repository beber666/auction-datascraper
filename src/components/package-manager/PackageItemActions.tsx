import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";

interface PackageItemActionsProps {
  isEditing: boolean;
  onToggleEdit: () => void;
  onDelete: () => void;
}

export const PackageItemActions = ({ isEditing, onToggleEdit, onDelete }: PackageItemActionsProps) => {
  return (
    <div className="flex gap-2 justify-end">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleEdit}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};