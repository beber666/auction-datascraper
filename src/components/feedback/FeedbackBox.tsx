import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FeedbackForm } from "./FeedbackForm";

export const FeedbackBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Error",
        description: "Please enter your feedback",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No session found");
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", session.user.id)
        .single();

      const { error } = await supabase.functions.invoke('send-feedback', {
        body: {
          feedback,
          user: {
            name: profile?.first_name 
              ? `${profile.first_name} ${profile.last_name || ''}`
              : 'Anonymous User',
            email: session.user.email,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Thank you for your feedback!",
      });
      
      setFeedback("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error sending feedback:", error);
      toast({
        title: "Error",
        description: "Failed to send feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <FeedbackForm
          feedback={feedback}
          isSubmitting={isSubmitting}
          onFeedbackChange={setFeedback}
          onSubmit={handleSubmit}
          onCancel={() => setIsOpen(false)}
        />
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full shadow-lg"
        >
          Feedback
        </Button>
      )}
    </div>
  );
};