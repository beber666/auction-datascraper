import { PackageTable } from "@/components/package-manager/PackageTable";
import { Button } from "@/components/ui/button";
import { PackagePlus } from "lucide-react";

const PackageManager = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Package Manager</h1>
        <Button>
          <PackagePlus className="mr-2 h-4 w-4" />
          New Package
        </Button>
      </div>
      <PackageTable />
    </div>
  );
};

export default PackageManager;