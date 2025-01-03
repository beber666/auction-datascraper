import { Bell, BellOff, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuctionActionsProps {
  id: string;
  url: string;
  isAlerted: boolean;
  onToggleAlert: (id: string) => void;
  onDelete: (id: string) => void;
}

export const AuctionActions = ({
  id,
  url,
  isAlerted,
  onToggleAlert,
  onDelete,
}: AuctionActionsProps) => {
  return (
    <div className="space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onToggleAlert(id)}
      >
        {isAlerted ? (
          <BellOff className="h-4 w-4 text-blue-500" />
        ) : (
          <Bell className="h-4 w-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => window.open(url, '_blank')}
      >
        <ExternalLink className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(id)}
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
};