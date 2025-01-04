import { PackageTable } from "@/components/package-manager/PackageTable";
import { NewPackageForm } from "@/components/package-manager/NewPackageForm";
import { Button } from "@/components/ui/button";
import { PackagePlus } from "lucide-react";
import { useState } from "react";

const PackageManager = () => {
  const [isAddingPackage, setIsAddingPackage] = useState(false);

  if (isAddingPackage) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <NewPackageForm />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Package Manager</h2>
          <Button onClick={() => setIsAddingPackage(true)}>
            <PackagePlus className="mr-2 h-4 w-4" />
            Nouveau Paquet
          </Button>
        </div>
        <div className="relative">
          <div className="overflow-auto rounded-md border bg-background">
            <PackageTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageManager;