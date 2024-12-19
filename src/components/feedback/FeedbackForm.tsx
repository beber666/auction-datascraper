import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface FeedbackFormProps {
  feedback: string;
  isSubmitting: boolean;
  onFeedbackChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const FeedbackForm = ({
  feedback,
  isSubmitting,
  onFeedbackChange,
  onSubmit,
  onCancel,
}: FeedbackFormProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg w-80">
      <h3 className="font-semibold mb-2">Send Feedback</h3>
      <Textarea
        value={feedback}
        onChange={(e) => onFeedbackChange(e.target.value)}
        placeholder="What features would you like to see?"
        className="mb-4"
      />
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          Send
        </Button>
      </div>
    </div>
  );
};