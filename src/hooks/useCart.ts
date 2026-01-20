import { useStore } from '../store/useStore';

/**
 * Custom hook for cart operations
 * Provides cart state and methods
 */
export const useCart = () => {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    completePurchase,
  } = useStore();

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    completePurchase,
    itemCount: getTotalItems(),
    totalPrice: getTotalPrice(),
  };
};
