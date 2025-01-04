import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PackageItemsTable } from "./PackageItemsTable";
import { usePackageItems } from "@/hooks/usePackageItems";
import { useAmountFormatter } from "@/hooks/useAmountFormatter";
import { PackageFormHeader } from "./PackageFormHeader";
import { PackageBalance } from "./PackageBalance";
import { PackageDetailsForm } from "./PackageDetailsForm";

export const NewPackageForm = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [packageName, setPackageName] = useState("");
  const [sendDate, setSendDate] = useState<Date>();
  const [trackingNumber, setTrackingNumber] = useState("");
  const { items, handleAddItem, handleDeleteItem, handleUpdateItem } = usePackageItems([]);
  const { formatAmount } = useAmountFormatter();

  const openTrackingUrl = () => {
    if (trackingNumber) {
      window.open(`https://parcelsapp.com/en/tracking/${trackingNumber}`, '_blank');
    }
  };

  const calculateTotalResalePrice = () => {
    return items.reduce((total, item) => total + item.resalePrice, 0);
  };

  const calculateTotalCost = () => {
    return items.reduce((total, item) => (
      total + item.proxyFee + item.price + item.localShippingPrice + 
      item.internationalShippingShare + item.customsFee
    ), 0);
  };

  const calculateBalance = () => {
    const totalResale = calculateTotalResalePrice();
    const totalCost = calculateTotalCost();
    return totalResale - totalCost;
  };

  const balance = calculateBalance();

  return (
    <div className="container mx-auto py-6">
      <PackageFormHeader 
        isEditing={isEditing}
        onToggleEdit={() => setIsEditing(!isEditing)}
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

        {isEditing && (
          <Button className="w-full" onClick={handleAddItem}>+ Add Item</Button>
        )}
      </div>
    </div>
  );
};