import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PackageFormFields } from "./PackageFormFields";
import { packageFormSchema, type PackageFormValues } from "./package-form-schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffect, useState } from "react";

export function PackageForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
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

  // Check authentication status on mount and when it changes
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Current session:", session);
      
      if (!session?.user) {
        console.log("No session found, redirecting to login");
        navigate("/login");
        return;
      }
      
      setUserId(session.user.id);
      setIsLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        console.log("Auth state changed: no session, redirecting to login");
        navigate("/login");
        return;
      }
      setUserId(session.user.id);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const onSubmit = async (values: PackageFormValues) => {
    if (!userId) {
      console.log("No user ID found when submitting");
      toast({
        title: "Error",
        description: "You must be logged in to create packages",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Creating package for user:", userId);
      const { error } = await supabase.from("packages").insert({
        name: values.name,
        shipping_cost: values.shipping_cost,
        customs_fees: values.customs_fees,
        customs_percentage: values.customs_percentage,
        other_costs: values.other_costs,
        selling_price: values.selling_price,
        international_shipping: values.international_shipping,
        notes: values.notes,
        user_id: userId,
      });

      if (error) {
        console.error("Error creating package:", error);
        throw error;
      }

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

  if (isLoading) {
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