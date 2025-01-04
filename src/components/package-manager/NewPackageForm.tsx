import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PackageItemsTable } from "./PackageItemsTable";
import { usePackageItems } from "@/hooks/usePackageItems";
import { useAmountFormatter } from "@/hooks/useAmountFormatter";
import { PackageFormHeader } from "./PackageFormHeader";
import { PackageBalance } from "./PackageBalance";
import { PackageDetailsForm } from "./PackageDetailsForm";
import { usePackages } from "@/hooks/usePackages";
import { toast } from "sonner";

export const NewPackageForm = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(true);
  const [packageName, setPackageName] = useState("");
  const [sendDate, setSendDate] = useState<Date>();
  const [trackingNumber, setTrackingNumber] = useState("");
  const { createPackage } = usePackages();
  const [currentPackageId, setCurrentPackageId] = useState<string | null>(null);
  const { items, isLoading, addItem, updateItem, deleteItem } = usePackageItems(currentPackageId);
  const { formatAmount } = useAmountFormatter();

  const handleSave = async () => {
    if (!packageName) {
      toast.error("Package name is required");
      return;
    }

    try {
      const result = await createPackage.mutateAsync({
        name: packageName,
        send_date: sendDate?.toISOString() || null,
        tracking_number: trackingNumber || null,
        user_id: "", // This will be handled in the usePackages hook
      });
      
      setCurrentPackageId(result.id);
      setIsEditing(false);
      toast.success("Package created successfully");
    } catch (error) {
      console.error("Failed to create package:", error);
      toast.error("Failed to create package");
    }
  };

  const handleToggleEdit = () => {
    if (isEditing && !currentPackageId) {
      handleSave();
    } else {
      setIsEditing(!isEditing);
    }
  };

  const openTrackingUrl = () => {
    if (trackingNumber) {
      window.open(`https://parcelsapp.com/en/tracking/${trackingNumber}`, '_blank');
    }
  };

  const handleAddItem = async () => {
    if (!currentPackageId) {
      toast.error("Please save the package first");
      return;
    }
    
    try {
      await addItem.mutateAsync(currentPackageId);
    } catch (error) {
      console.error("Failed to add item:", error);
    }
  };

  const handleUpdateItem = async (itemId: string, field: string, value: string | number) => {
    try {
      await updateItem.mutateAsync({
        itemId,
        updates: { [field]: value },
      });
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem.mutateAsync(itemId);
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const calculateTotalResalePrice = () => {
    return items.reduce((total, item) => total + item.resale_price, 0);
  };

  const calculateTotalCost = () => {
    return items.reduce((total, item) => (
      total + item.proxy_fee + item.price + item.local_shipping_price + 
      item.international_shipping_share + item.customs_fee
    ), 0);
  };

  const calculateBalance = () => {
    const totalResale = calculateTotalResalePrice();
    const totalCost = calculateTotalCost();
    return totalResale - totalCost;
  };

  const balance = calculateBalance();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <PackageFormHeader 
        isEditing={isEditing}
        onToggleEdit={handleToggleEdit}
      />

      <PackageBalance 
        balance={balance}
        formatAmount={formatAmount}
      />

      <div className="space-y-6">
        <PackageDetailsForm
          packageName={packageName}
          setPackageName={setPackageName}
          sendDate={sendDate}
          setSendDate={setSendDate}
          trackingNumber={trackingNumber}
          setTrackingNumber={setTrackingNumber}
          isEditing={isEditing}
          openTrackingUrl={openTrackingUrl}
        />

        {currentPackageId && (
          <div className="border rounded-lg">
            <div className="overflow-x-auto">
              <PackageItemsTable
                items={items}
                onDeleteItem={handleDeleteItem}
                onUpdateItem={handleUpdateItem}
                formatAmount={formatAmount}
                isEditing={isEditing}
              />
            </div>
          </div>
        )}

        {isEditing && currentPackageId && (
          <Button className="w-full" onClick={handleAddItem}>+ Add Item</Button>
        )}
      </div>
    </div>
  );
};
