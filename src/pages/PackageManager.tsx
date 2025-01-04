import { PackageTable } from "@/components/package-manager/PackageTable";
import { NewPackageForm } from "@/components/package-manager/NewPackageForm";
import { Button } from "@/components/ui/button";
import { PackagePlus } from "lucide-react";
import { useState } from "react";

const PackageManager = () => {
  const [isAddingPackage, setIsAddingPackage] = useState(false);

  if (isAddingPackage) {
    return <NewPackageForm />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Package Manager</h1>
        <Button onClick={() => setIsAddingPackage(true)}>
          <PackagePlus className="mr-2 h-4 w-4" />
          Nouveau Paquet
        </Button>
      </div>
      <PackageTable />
    </div>
  );
};

export default PackageManager;