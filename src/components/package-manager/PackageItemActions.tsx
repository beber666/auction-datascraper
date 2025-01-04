import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface PackageItemActionsProps {
  isEditing: boolean;
  onToggleEdit: () => void;
  onDelete: () => void;
}

export const PackageItemActions = ({ isEditing, onToggleEdit, onDelete }: PackageItemActionsProps) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleEdit}
        className={`${isEditing ? 'text-primary' : 'text-muted-foreground'} hover:text-primary`}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="text-destructive hover:text-destructive/90"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};