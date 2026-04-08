import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { cartUpdateQuantity, cartDelete } from '../../../../redux/cart/actionCreator';

/**
 * Custom hook for cart operations
 * Handles increment, decrement, and delete operations
 * Can be reused across multiple wizard components
 */
export const useCartOperations = (cartData) => {
  const dispatch = useDispatch();

  /**
   * Increment product quantity
   */
  const incrementQuantity = useCallback(
    (productId, currentQuantity) => {
      const newQuantity = parseInt(currentQuantity, 10) + 1;
      dispatch(cartUpdateQuantity(productId, newQuantity, cartData));
    },
    [dispatch, cartData]
  );

  /**
   * Decrement product quantity (minimum 1)
   */
  const decrementQuantity = useCallback(
    (productId, currentQuantity) => {
      const newQuantity = parseInt(currentQuantity, 10) >= 2 ? parseInt(currentQuantity, 10) - 1 : 1;
      dispatch(cartUpdateQuantity(productId, newQuantity, cartData));
    },
    [dispatch, cartData]
  );

  /**
   * Delete product from cart
   */
  const deleteProduct = useCallback(
    (productId, onConfirm) => {
      if (onConfirm) {
        const confirmed = onConfirm();
        if (confirmed) {
          dispatch(cartDelete(productId, cartData));
        }
      } else {
        // Default confirmation dialog
        const confirmed = window.confirm('Are you sure to delete this product?');
        if (confirmed) {
          dispatch(cartDelete(productId, cartData));
        }
      }
    },
    [dispatch, cartData]
  );

  return {
    incrementQuantity,
    decrementQuantity,
    deleteProduct,
  };
};

