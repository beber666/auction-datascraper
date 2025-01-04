import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PackageFormHeaderProps {
  isEditing: boolean;
  onToggleEdit: () => void;
}

export const PackageFormHeader = ({ isEditing, onToggleEdit }: PackageFormHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to packages list
        </Button>
        <h2 className="text-2xl font-bold">Package Details</h2>
      </div>
      <div>
        <Button onClick={onToggleEdit}>
          {isEditing ? 'Save' : 'Edit Package'}
        </Button>
      </div>
    </div>
  );
};