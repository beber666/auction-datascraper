import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PackageFormFields } from "./PackageFormFields";
import { packageFormSchema, type PackageFormValues } from "./package-form-schema";
import { useAuth } from "@supabase/auth-helpers-react";

export function PackageForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = useAuth();
  
  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      name: "",
      shipping_cost: 0,
      customs_fees: 0,
      customs_percentage: 0,
      other_costs: 0,
      selling_price: 0,
      international_shipping: 0,
      notes: "",
    },
  });

  const onSubmit = async (values: PackageFormValues) => {
    try {
      if (!auth?.user?.id) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase.from("packages").insert([
        {
          ...values,
          user_id: auth.user.id,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Package created successfully",
      });
      
      navigate("/packages");
    } catch (error) {
      console.error("Error creating package:", error);
      toast({
        title: "Error",
        description: "Failed to create package. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <PackageFormFields form={form} />
        
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/packages")}
          >
            Cancel
          </Button>
          <Button type="submit">Create Package</Button>
        </div>
      </form>
    </Form>
  );
}