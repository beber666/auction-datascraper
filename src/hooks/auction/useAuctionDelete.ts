import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuctionDelete = () => {
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from("auctions")
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Auction removed successfully",
      });
    } catch (error) {
      console.error("Error in deletion process:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove auction. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    handleDelete,
  };
};