import { useAuctionSubmit } from "./auction/useAuctionSubmit";
import { useAuctionUpdate } from "./auction/useAuctionUpdate";
import { useAuctionDelete } from "./auction/useAuctionDelete";

export const useAuctionMutations = (language: string, currency: string) => {
  const { isLoading, handleSubmit } = useAuctionSubmit(language, currency);
  const { handleUpdate } = useAuctionUpdate(currency);
  const { handleDelete } = useAuctionDelete();

  return {
    isLoading,
    handleSubmit,
    handleDelete,
    handleUpdate,
  };
};