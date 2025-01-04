import { PackageTable } from "@/components/package-manager/PackageTable";
import { NewPackageForm } from "@/components/package-manager/NewPackageForm";
import { Button } from "@/components/ui/button";
import { PackagePlus } from "lucide-react";
import { useState } from "react";

const PackageManager = () => {
  const [isAddingPackage, setIsAddingPackage] = useState(false);

  if (isAddingPackage) {
    return (
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-4 py-6">
          <NewPackageForm />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full overflow-y-auto px-4 py-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Package Manager</h1>
            <Button onClick={() => setIsAddingPackage(true)}>
              <PackagePlus className="mr-2 h-4 w-4" />
              Nouveau Paquet
            </Button>
          </div>
          <div className="overflow-x-auto">
            <PackageTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageManager;