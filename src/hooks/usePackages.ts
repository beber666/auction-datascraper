import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Package {
  id: string;
  name: string;
  send_date: string | null;
  tracking_number: string | null;
  total_items_cost: number;
  total_resale_price: number;
  user_id: string;
}

export const usePackages = () => {
  const queryClient = useQueryClient();

  const { data: packages, isLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Failed to load packages");
        throw error;
      }

      return data as Package[];
    },
  });

  const createPackage = useMutation({
    mutationFn: async (newPackage: Omit<Package, 'id' | 'total_items_cost' | 'total_resale_price'>) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const packageData = {
        ...newPackage,
        user_id: userData.user.id,
      };

      const { data, error } = await supabase
        .from('packages')
        .insert(packageData)
        .select()
        .single();

      if (error) {
        toast.error("Failed to create package");
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success("Package created successfully");
    },
  });

  const deletePackage = useMutation({
    mutationFn: async (packageId: string) => {
      // Supprimer d'abord les items associés
      const { error: itemsError } = await supabase
        .from('package_items')
        .delete()
        .eq('package_id', packageId);

      if (itemsError) {
        toast.error("Failed to delete package items");
        throw itemsError;
      }

      // Puis supprimer le package
      const { error: packageError } = await supabase
        .from('packages')
        .delete()
        .eq('id', packageId);

      if (packageError) {
        toast.error("Failed to delete package");
        throw packageError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
  });

  return {
    packages,
    isLoading,
    createPackage,
    deletePackage,
  };
};