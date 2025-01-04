import { NewPackageForm } from "@/components/package-manager/NewPackageForm";
import { useParams } from "react-router-dom";

const PackageDetails = () => {
  const { id } = useParams();
  
  return (
    <div className="w-full">
      <NewPackageForm currentPackageId={id || null} />
    </div>
  );
};

export default PackageDetails;