import { PackageTable } from "@/components/package-manager/PackageTable";
import { NewPackageForm } from "@/components/package-manager/NewPackageForm";
import { Button } from "@/components/ui/button";
import { PackagePlus } from "lucide-react";
import { useState } from "react";

const PackageManager = () => {
  const [isAddingPackage, setIsAddingPackage] = useState(false);

  if (isAddingPackage) {
    return (
      <div className="flex-1 overflow-x-auto">
        <NewPackageForm />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-auto">
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Package Manager</h2>
          <Button onClick={() => setIsAddingPackage(true)}>
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