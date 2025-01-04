import { Button } from "@/components/ui/button";

interface PackageFormHeaderProps {
  isEditing: boolean;
  onToggleEdit: () => void;
}

export const PackageFormHeader = ({ isEditing, onToggleEdit }: PackageFormHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-2">
      <h2 className="text-2xl font-bold">Package Details</h2>
      <div>
        <Button onClick={onToggleEdit}>
          {isEditing ? 'Save' : 'Edit Package'}
        </Button>
      </div>
    </div>
  );
};