import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PackageItem {
  id: string;
  package_id: string;
  name: string;
  product_url: string | null;
  platform_id: string | null;
  proxy_fee: number;
  price: number;
  local_shipping_price: number;
  weight: number;
  international_shipping_share: number;
  customs_fee: number;
  resale_price: number;
  resale_comment: string | null;
}

export const usePackageItems = (packageId: string | null) => {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['packageItems', packageId],
    queryFn: async () => {
      if (!packageId) return [];

      const { data, error } = await supabase
        .from('package_items')
        .select('*')
        .eq('package_id', packageId)
        .order('created_at', { ascending: true });

      if (error) {
        toast.error("Failed to load package items");
        throw error;
      }

      return data as PackageItem[];
    },
    enabled: !!packageId,
  });

  const addItem = useMutation({
    mutationFn: async (packageId: string) => {
      const newItem = {
        package_id: packageId,
        name: "",
        product_url: "",
        platform_id: "",
        proxy_fee: 0,
        price: 0,
        local_shipping_price: 0,
        weight: 0,
        international_shipping_share: 0,
        customs_fee: 0,
        resale_price: 0,
        resale_comment: "",
      };

      const { data, error } = await supabase
        .from('package_items')
        .insert(newItem)
        .select()
        .single();

      if (error) {
        toast.error("Failed to add item");
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packageItems'] });
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({ itemId, updates }: { itemId: string, updates: Partial<PackageItem> }) => {
      const { error } = await supabase
        .from('package_items')
        .update(updates)
        .eq('id', itemId);

      if (error) {
        toast.error("Failed to update item");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packageItems'] });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('package_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        toast.error("Failed to delete item");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packageItems'] });
      toast.success("Item deleted successfully");
    },
  });

  return {
    items,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
  };
};