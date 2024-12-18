import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";

interface UrlFormProps {
  onSubmit: (url: string) => Promise<void>;
  isLoading: boolean;
}

export const UrlForm = ({ onSubmit, isLoading }: UrlFormProps) => {
  const [url, setUrl] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.includes("zenmarket.jp")) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Zenmarket auction URL",
        variant: "destructive",
      });
      return;
    }
    await onSubmit(url);
    setUrl("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="url"
        placeholder="Enter Zenmarket auction URL..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1"
        required
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Loading..." : "Add Auction"}
      </Button>
    </form>
  );
};