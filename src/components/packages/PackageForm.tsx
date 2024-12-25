import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PackageFormFields } from "./PackageFormFields";
import { packageFormSchema, type PackageFormValues } from "./package-form-schema";
import { useUser } from "@supabase/auth-helpers-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffect } from "react";

export function PackageForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useUser();
  
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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      toast({
        title: "Authentication required",
        description: "Please log in to create packages",
        variant: "destructive",
      });
    }
  }, [user, navigate, toast]);

  const onSubmit = async (values: PackageFormValues) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create packages",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("packages").insert({
        name: values.name,
        shipping_cost: values.shipping_cost,
        customs_fees: values.customs_fees,
        customs_percentage: values.customs_percentage,
        other_costs: values.other_costs,
        selling_price: values.selling_price,
        international_shipping: values.international_shipping,
        notes: values.notes,
        user_id: user.id,
      });

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

  // If not authenticated, show a loading state
  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          Checking authentication...
        </AlertDescription>
      </Alert>
    );
  }

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