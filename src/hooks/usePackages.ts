import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Package {
  id: string;
  name: string;
  send_date: string | null;
  tracking_number: string | null;
  total_items_cost: number;
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
    mutationFn: async (newPackage: Omit<Package, 'id' | 'total_items_cost'>) => {
      const { data, error } = await supabase
        .from('packages')
        .insert(newPackage)
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

  return {
    packages,
    isLoading,
    createPackage,
  };
};