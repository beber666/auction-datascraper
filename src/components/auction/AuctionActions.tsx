import { Button } from "@/components/ui/button";
import { Bell, Trash2 } from "lucide-react";

interface AuctionActionsProps {
  id: string;
  url: string;
  isAlerted: boolean;
  onToggleAlert: (id: string) => void;
  onDelete: (id: string) => void;
}

export const AuctionActions = ({
  id,
  isAlerted,
  onToggleAlert,
  onDelete,
}: AuctionActionsProps) => {
  return (
    <div className="flex items-center gap-2 justify-end">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onToggleAlert(id)}
        className={isAlerted ? "text-yellow-500" : ""}
      >
        <Bell className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(id)}
        className="text-red-500"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};