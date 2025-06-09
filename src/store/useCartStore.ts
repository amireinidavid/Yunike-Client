import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartApi } from '@/utils/api';
import axios from 'axios';
import { API_BASE_URL } from '@/utils/api';

// Check if code is running in browser
const isBrowser = typeof window !== 'undefined';

// Helper functions for localStorage that work in SSR
const getFromStorage = (key: string): string | null => {
  if (!isBrowser) return null;
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return null;
  }
};

const setToStorage = (key: string, value: string): void => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.error(`Error setting ${key} in localStorage:`, err);
  }
};

const removeFromStorage = (key: string): void => {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`Error removing ${key} from localStorage:`, err);
  }
};

// Define cart item type based on the API response
interface CartItem {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  price: number;
  totalPrice: number;
  product: {
    name: string;
    price: number;
    comparePrice?: number | null;
    images: Array<{ url: string; isMain: boolean }>;
    vendor?: {
      id: string;
      storeName: string;
      slug: string;
    };
  };
  variant?: {
    name: string | null;
    price: number | null;
    options: Record<string, string>;
  } | null;
}

// Define cart type based on the API response
interface Cart {
  id: string;
  userId?: string | null;
  sessionId?: string | null;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  couponId?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date | null;
}

// Define cart store state
interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  cartInitialized: boolean;
  isInitializing: boolean;
  lastInitAttempt: number;
  
  // Methods
  initializeCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity: number, variantId?: string) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (couponCode: string) => Promise<boolean>;
  removeCoupon: () => Promise<void>;
  validateCart: () => Promise<{ valid: boolean; message?: string; invalidItems?: any[] }>;
  
  // Helper functions
  getItemCount: () => number;
  getCartId: () => string | null;
  getSessionId: () => string | null;
  setError: (error: string | null) => void;
  reset: () => void;
}

// Create cart API instance
const cartApiInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

// Create cart store with persistence
const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      isLoading: false,
      error: null,
      cartInitialized: false,
      isInitializing: false,
      lastInitAttempt: 0,
      
      // Initialize cart or get existing one
      initializeCart: async () => {
        try {
          const state = get();
          
          // Debounce initialization attempts - prevent multiple back-to-back calls
          const now = Date.now();
          const minTimeBetweenInits = 2000; // 2 seconds
          
          // If we're already initializing, don't start another initialization
          if (state.isInitializing) {
            console.log("Cart initialization already in progress, skipping duplicate request");
            return;
          }
          
          // If we've tried to initialize recently, skip this attempt
          if (now - state.lastInitAttempt < minTimeBetweenInits) {
            console.log("Skipping cart initialization - too soon after last attempt");
            return;
          }
          
          // If we already have a cart and it's initialized without errors, just return it
          if (state.cartInitialized && state.cart && !state.error) {
            console.log("Cart already initialized, using existing cart", state.cart.id);
            return;
          }
          
          // Mark that we're starting initialization and update timestamp
          set({ 
            isLoading: true, 
            error: null, 
            isInitializing: true,
            lastInitAttempt: now
          });
          
          // Check for session ID in localStorage (for guest carts)
          const sessionId = getFromStorage('cartSessionId');
          
          console.log("Initializing cart, session ID exists:", !!sessionId);
          
          // If we have initialization errors, clear the saved session ID
          if (state.error && sessionId) {
            console.log("Clearing problematic session ID due to previous errors");
            removeFromStorage('cartSessionId');
          }
          
          try {
            // Create a new cart or get existing one
            const response = await cartApiInstance.post(
              cartApi.INITIALIZE, 
              sessionId && !state.error ? { sessionId } : {}
            );
            
            if (response.data && response.data.success) {
              const cartData = response.data.data;
              
              console.log("Cart initialized successfully:", cartData.id);
              
              // Save session ID for guest users
              if (cartData.sessionId) {
                setToStorage('cartSessionId', cartData.sessionId);
              }
              
              set({
                cart: cartData,
                isLoading: false,
                isInitializing: false,
                cartInitialized: true,
                error: null
              });
            } else {
              throw new Error('Failed to initialize cart');
            }
          } catch (error) {
            console.error('Cart API error:', error);
            throw error;
          }
        } catch (error) {
          console.error('Cart initialization error:', error);
          
          // Don't clear sessionId on first error - only after repeated failures
          const failCount = getFromStorage('cartInitFailCount') || '0';
          const attempts = parseInt(failCount, 10) + 1;
          
          if (attempts >= 3) {
            // Clear any problematic session ID after multiple failures
            removeFromStorage('cartSessionId');
            removeFromStorage('cartInitFailCount');
            console.log("Cleared problematic session ID after multiple failed attempts");
          } else {
            // Track failed attempts
            setToStorage('cartInitFailCount', attempts.toString());
          }
          
          set({
            isLoading: false,
            isInitializing: false,
            error: error instanceof Error ? error.message : 'Unknown error initializing cart'
          });
        }
      },
      
      // Fetch current cart
      fetchCart: async () => {
        try {
          const state = get();
          
          // If cart isn't initialized yet, initialize it first
          if (!state.cartInitialized) {
            await state.initializeCart();
            // If initialization failed, don't continue
            if (get().error) return;
          }
          
          // Need a cart ID or session ID to fetch a cart
          const cartId = state.getCartId();
          const sessionId = state.getSessionId();
          
          if (!cartId && !sessionId) {
            console.log("No cart ID or session ID to fetch cart with");
            // If we have no cart ID or session ID, we need to initialize a new cart
            await state.initializeCart();
            return;
          }
          
          set({ isLoading: true, error: null });
          
          try {
            // Use cart ID as the primary method to fetch cart
            if (cartId) {
              console.log("Fetching cart by ID:", cartId);
              try {
                const response = await cartApiInstance.get(cartApi.GET_CART(cartId));
                
                if (response.data && response.data.success) {
                  const cartData = response.data.data;
                  
                  // Save session ID if available
                  if (cartData.sessionId) {
                    setToStorage('cartSessionId', cartData.sessionId);
                  }
                  
                  set({
                    cart: cartData,
                    isLoading: false,
                    error: null,
                    cartInitialized: true
                  });
                  return;
                }
              } catch (err) {
                console.error('Error fetching cart by ID:', err);
                // If this fails with a permission error, the cart might be invalid
                // Clear the cart and initialize a new one
                if ((err as any).response?.status === 403 || 
                    (err as any).response?.data?.message?.includes("permission")) {
                  console.log("Permission error, reinitializing cart");
                  removeFromStorage('cartSessionId');
                  await state.initializeCart();
                  return;
                }
              }
            }
            
            // If no cart ID or the fetch failed, try session ID
            if (sessionId) {
              console.log("Fetching cart by session ID:", sessionId);
              try {
                const response = await cartApiInstance.get(cartApi.GET_GUEST_CART(sessionId));
                
                if (response.data && response.data.success) {
                  const cartData = response.data.data;
                  
                  set({
                    cart: cartData,
                    isLoading: false,
                    error: null,
                    cartInitialized: true
                  });
                  return;
                }
              } catch (err) {
                console.error('Error fetching cart by session ID:', err);
              }
            }
            
            // If we reached here, all methods failed - initialize a new cart
            console.log("All fetch methods failed, initializing new cart");
            removeFromStorage('cartSessionId');
            await state.initializeCart();
          } catch (error) {
            console.error('Cart API error:', error);
            // Fall back to initializing a new cart
            await state.initializeCart();
          }
        } catch (error) {
          console.error('Fetch cart error:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error fetching cart'
          });
        }
      },
      
      // Add item to cart
      addItem: async (productId: string, quantity: number, variantId?: string) => {
        try {
          const state = get();
          
          if (!state.cartInitialized) {
            await state.initializeCart();
            // If initialization failed, don't continue
            if (get().error) {
              throw new Error('Could not initialize cart');
            }
          }
          
          const cartId = state.getCartId();
          
          if (!cartId) {
            throw new Error('No cart available');
          }
          
          set({ isLoading: true, error: null });
          
          const data = {
            productId,
            quantity,
            ...(variantId ? { variantId } : {})
          };
          
          // Include session ID for all carts
          const sessionId = getFromStorage('cartSessionId');
          if (sessionId) {
            Object.assign(data, { sessionId });
          }
          
          const response = await cartApiInstance.post(cartApi.ADD_ITEM(cartId), data);
          
          if (response.data && response.data.success) {
            set({
              cart: response.data.data,
              isLoading: false,
              error: null
            });
          } else {
            throw new Error(response.data?.message || 'Failed to add item to cart');
          }
        } catch (error) {
          console.error('Add item error:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error adding item to cart'
          });
        }
      },
      
      // Update item quantity
      updateItemQuantity: async (itemId: string, quantity: number) => {
        try {
          const state = get();
          
          if (!state.cart) {
            throw new Error('No cart available');
          }
          
          const cartId = state.getCartId();
          
          if (!cartId) {
            throw new Error('No cart ID available');
          }
          
          set({ isLoading: true, error: null });
          
          // If quantity is 0, remove the item instead
          if (quantity <= 0) {
            await state.removeItem(itemId);
            return;
          }
          
          const data = { quantity };
          
          // Include session ID for all carts
          const sessionId = getFromStorage('cartSessionId');
          if (sessionId) {
            Object.assign(data, { sessionId });
          }
          
          const response = await cartApiInstance.put(cartApi.UPDATE_ITEM(cartId, itemId), data);
          
          if (response.data && response.data.success) {
            set({
              cart: response.data.data,
              isLoading: false,
              error: null
            });
          } else {
            throw new Error(response.data?.message || 'Failed to update item quantity');
          }
        } catch (error) {
          console.error('Update item error:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error updating item'
          });
        }
      },
      
      // Remove item from cart
      removeItem: async (itemId: string) => {
        try {
          const state = get();
          
          if (!state.cart) {
            throw new Error('No cart available');
          }
          
          const cartId = state.getCartId();
          
          if (!cartId) {
            throw new Error('No cart ID available');
          }
          
          set({ isLoading: true, error: null });
          
          const response = await cartApiInstance.delete(cartApi.REMOVE_ITEM(cartId, itemId));
          
          if (response.data && response.data.success) {
            set({
              cart: response.data.data,
              isLoading: false,
              error: null
            });
          } else {
            throw new Error(response.data?.message || 'Failed to remove item from cart');
          }
        } catch (error) {
          console.error('Remove item error:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error removing item'
          });
        }
      },
      
      // Clear cart (remove all items)
      clearCart: async () => {
        try {
          const state = get();
          
          if (!state.cart) {
            return;
          }
          
          const cartId = state.getCartId();
          
          if (!cartId) {
            throw new Error('No cart ID available');
          }
          
          set({ isLoading: true, error: null });
          
          const response = await cartApiInstance.post(cartApi.CLEAR_CART(cartId));
          
          if (response.data && response.data.success) {
            // The server returns a minimal object after clearing the cart
            // Instead of storing this as our cart, reinitialize to get a fresh cart
            set({ isLoading: false, error: null });
            
            // Short delay to ensure cart is properly cleared on the server
            setTimeout(async () => {
              try {
                // Re-fetch the cart to get a proper cart object
                await get().fetchCart();
              } catch (error) {
                console.error("Failed to refresh cart after clearing:", error);
              }
            }, 500);
          } else {
            throw new Error(response.data?.message || 'Failed to clear cart');
          }
        } catch (error) {
          console.error('Clear cart error:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error clearing cart'
          });
        }
      },
      
      // Apply coupon to cart
      applyCoupon: async (couponCode: string) => {
        try {
          const state = get();
          
          if (!state.cart) {
            throw new Error('No cart available');
          }
          
          const cartId = state.getCartId();
          
          if (!cartId) {
            throw new Error('No cart ID available');
          }
          
          set({ isLoading: true, error: null });
          
          const response = await cartApiInstance.post(cartApi.APPLY_COUPON(cartId), { 
            couponCode 
          });
          
          if (response.data && response.data.success) {
            set({
              cart: response.data.data,
              isLoading: false,
              error: null
            });
            return true;
          } else {
            const errorMessage = response.data?.message || 'Failed to apply coupon';
            set({
              isLoading: false,
              error: errorMessage
            });
            return false;
          }
        } catch (error) {
          console.error('Apply coupon error:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error applying coupon'
          });
          return false;
        }
      },
      
      // Remove coupon from cart
      removeCoupon: async () => {
        try {
          const state = get();
          
          if (!state.cart) {
            throw new Error('No cart available');
          }
          
          const cartId = state.getCartId();
          
          if (!cartId) {
            throw new Error('No cart ID available');
          }
          
          set({ isLoading: true, error: null });
          
          const response = await cartApiInstance.delete(cartApi.REMOVE_COUPON(cartId));
          
          if (response.data && response.data.success) {
            set({
              cart: response.data.data,
              isLoading: false,
              error: null
            });
          } else {
            throw new Error(response.data?.message || 'Failed to remove coupon');
          }
        } catch (error) {
          console.error('Remove coupon error:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error removing coupon'
          });
        }
      },
      
      // Validate cart before checkout
      validateCart: async () => {
        try {
          const state = get();
          
          if (!state.cart) {
            throw new Error('No cart available');
          }
          
          const cartId = state.getCartId();
          
          if (!cartId) {
            throw new Error('No cart ID available');
          }
          
          set({ isLoading: true, error: null });
          
          const response = await cartApiInstance.get(cartApi.VALIDATE_CART(cartId));
          
          set({ isLoading: false });
          
          if (response.data && response.data.success) {
            return {
              valid: true,
              ...response.data.data
            };
          } else {
            return {
              valid: false,
              message: response.data?.message || 'Cart validation failed',
              invalidItems: response.data?.data?.invalidItems || []
            };
          }
        } catch (error) {
          console.error('Validate cart error:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error validating cart'
          });
          return {
            valid: false,
            message: error instanceof Error ? error.message : 'Unknown error validating cart'
          };
        }
      },
      
      // Helper function to get total number of items in cart
      getItemCount: () => {
        const state = get();
        if (!state.cart?.items) return 0;
        
        return state.cart.items.reduce((total, item) => total + item.quantity, 0);
      },
      
      // Helper function to get cart ID
      getCartId: () => {
        const state = get();
        return state.cart?.id || null;
      },
      
      // Helper function to get session ID
      getSessionId: () => {
        const state = get();
        return state.cart?.sessionId || getFromStorage('cartSessionId');
      },
      
      // Set error message
      setError: (error: string | null) => {
        set({ error });
      },
      
      // Reset cart store
      reset: () => {
        // Clear storage first
        removeFromStorage('cartSessionId');
        removeFromStorage('cartInitFailCount');
        console.log("Cart reset: cleared session ID from storage");
        
        // Then reset state
        set({
          cart: null,
          isLoading: false,
          error: null,
          cartInitialized: false,
          isInitializing: false,
          lastInitAttempt: 0
        });
        
        // Try to initialize new cart after reset with a slight delay
        setTimeout(async () => {
          try {
            const { initializeCart } = get();
            await initializeCart();
            console.log("Cart reset: initialized new cart");
          } catch (error) {
            console.error("Failed to initialize cart after reset:", error);
          }
        }, 500);
      }
    }),
    {
      name: 'cart-storage',
      // Only persist these fields
      partialize: (state) => ({
        cart: state.cart,
        cartInitialized: state.cartInitialized
      }),
      // Use synchronous storage for better persistence
      storage: {
        getItem: (name) => {
          try {
            if (!isBrowser) return null;
            const str = localStorage.getItem(name);
            if (!str) return null;
            return JSON.parse(str);
          } catch (err) {
            console.error("Failed to load cart from storage:", err);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            if (!isBrowser) return;
            localStorage.setItem(name, JSON.stringify(value));
          } catch (err) {
            console.error("Failed to save cart to storage:", err);
          }
        },
        removeItem: (name) => {
          try {
            if (!isBrowser) return;
            localStorage.removeItem(name);
          } catch (err) {
            console.error("Failed to remove cart from storage:", err);
          }
        },
      }
    }
  )
);

export default useCartStore;
