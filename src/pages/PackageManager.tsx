import { PackageTable } from "@/components/package-manager/PackageTable";
import { Button } from "@/components/ui/button";
import { PackagePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PackageManager = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Package Manager</h2>
          <Button onClick={() => navigate('/package-manager/new')}>
            <PackagePlus className="mr-2 h-4 w-4" />
            Nouveau Paquet
          </Button>
        </div>
        <div className="border rounded-md bg-background">
          <PackageTable />
        </div>
      </div>
    </div>
  );
};

export default PackageManager;