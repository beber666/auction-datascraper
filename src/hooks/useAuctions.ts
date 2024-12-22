import { useAuctionMutations } from "./useAuctionMutations";
import { useAuctionQueries } from "./useAuctionQueries";

export const useAuctions = (language: string, currency: string) => {
  const { items, setItems, loadUserAuctions } = useAuctionQueries();
  const { isLoading, handleSubmit: submitAuction, handleDelete: deleteAuction } = useAuctionMutations(language, currency);

  const handleSubmit = async (url: string) => {
    try {
      const newItem = await submitAuction(url);
      if (newItem) {
        setItems(prev => [...prev, newItem]);
      }
    } catch (error) {
      // Error is already handled in useAuctionMutations
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAuction(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      // Error is already handled in useAuctionMutations
    }
  };

  return {
    items,
    isLoading,
    handleSubmit,
    handleDelete,
    loadUserAuctions
  };
};