import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api, customerApi } from '../utils/api';

// Types
export interface Address {
  id: string;
  name?: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
  isDefault: boolean;
  isShippingDefault: boolean;
  isBillingDefault: boolean;
  label?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  addedAt: string;
  movedToCartAt?: string;
  notes?: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number;
    isOnSale: boolean;
    inventory: number;
    images: Array<{ url: string }>;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    product: {
      id: string;
      name: string;
      slug: string;
      images: Array<{ url: string }>;
    };
  }>;
  shippingAddress: Address;
}

export interface OrderDetails extends Order {
  subtotalAmount: number;
  shippingAmount: number;
  taxAmount: number;
  discountAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  billingAddress?: Address;
  transactions: Array<{
    id: string;
    amount: number;
    status: string;
    type: string;
    provider: string;
    createdAt: string;
  }>;
}

// Account store state interface
interface AccountState {
  // State
  isLoading: boolean;
  error: string | null;
  addresses: Address[];
  wishlist: {
    items: WishlistItem[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      pageCount: number;
    };
  };
  orders: {
    items: Order[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      pageCount: number;
    };
  };
  
  // Address actions
  getAddresses: () => Promise<Address[]>;
  addAddress: (address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Address | null>;
  updateAddress: (addressId: string, address: Partial<Address>) => Promise<Address | null>;
  deleteAddress: (addressId: string) => Promise<boolean>;
  
  // Wishlist actions
  getWishlist: (page?: number, limit?: number) => Promise<{ items: WishlistItem[], pagination: any } | null>;
  addToWishlist: (productId: string, notes?: string) => Promise<WishlistItem | null>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
  
  // Order actions
  getOrders: (page?: number, limit?: number) => Promise<{ items: Order[], pagination: any } | null>;
  getOrderDetails: (orderId: string) => Promise<OrderDetails | null>;
  
  // Profile image upload
  uploadProfileImage: (file: File) => Promise<{ profileImageUrl: string } | null>;
  
  // Account deletion
  deleteAccount: () => Promise<boolean>;
  
  // Utils
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Create the account store
const useAccountStore = create<AccountState>()(
  (set, get) => ({
    // Initial state
    isLoading: false,
    error: null,
    addresses: [],
    wishlist: {
      items: [],
      pagination: {
        total: 0,
        page: 1,
        pageSize: 10,
        pageCount: 0
      }
    },
    orders: {
      items: [],
      pagination: {
        total: 0,
        page: 1,
        pageSize: 10,
        pageCount: 0
      }
    },
    
    // Address functions
    getAddresses: async () => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await api.get(customerApi.getAddresses);
        
        if (response.error) {
          set({ error: response.error, isLoading: false });
          return [];
        }
        
        const addresses = response.data || [];
        set({ addresses, isLoading: false });
        return addresses;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to fetch addresses';
        set({ error: errorMsg, isLoading: false });
        return [];
      }
    },
    
    addAddress: async (address) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await api.post(customerApi.addAddress, address);
        
        if (response.error) {
          set({ error: response.error, isLoading: false });
          return null;
        }
        
        // Update addresses in state
        const newAddress = response.data;
        const currentAddresses = [...get().addresses];
        set({ 
          addresses: [...currentAddresses, newAddress],
          isLoading: false 
        });
        
        return newAddress;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to add address';
        set({ error: errorMsg, isLoading: false });
        return null;
      }
    },
    
    updateAddress: async (addressId, address) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await api.put(customerApi.updateAddress(addressId), address);
        
        if (response.error) {
          set({ error: response.error, isLoading: false });
          return null;
        }
        
        // Update address in state
        const updatedAddress = response.data;
        const currentAddresses = [...get().addresses];
        const addressIndex = currentAddresses.findIndex(a => a.id === addressId);
        
        if (addressIndex >= 0) {
          currentAddresses[addressIndex] = updatedAddress;
          set({ addresses: currentAddresses });
        }
        
        set({ isLoading: false });
        return updatedAddress;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to update address';
        set({ error: errorMsg, isLoading: false });
        return null;
      }
    },
    
    deleteAddress: async (addressId) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await api.delete(customerApi.deleteAddress(addressId));
        
        if (response.error) {
          set({ error: response.error, isLoading: false });
          return false;
        }
        
        // Remove address from state
        const currentAddresses = [...get().addresses];
        set({
          addresses: currentAddresses.filter(a => a.id !== addressId),
          isLoading: false
        });
        
        return true;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to delete address';
        set({ error: errorMsg, isLoading: false });
        return false;
      }
    },
    
    // Wishlist functions
    getWishlist: async (page = 1, limit = 10) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await api.get(`${customerApi.getWishlist}?page=${page}&limit=${limit}`);
        
        if (response.error) {
          set({ error: response.error, isLoading: false });
          return null;
        }
        
        set({ 
          wishlist: {
            items: response.data.items || [],
            pagination: response.data.pagination || {
              total: 0,
              page,
              pageSize: limit,
              pageCount: 0
            }
          },
          isLoading: false 
        });
        
        return response.data;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to fetch wishlist';
        set({ error: errorMsg, isLoading: false });
        return null;
      }
    },
    
    addToWishlist: async (productId, notes) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await api.post(customerApi.addToWishlist, { productId, notes });
        
        if (response.error) {
          set({ error: response.error, isLoading: false });
          return null;
        }
        
        // Update wishlist in state if items are loaded
        if (get().wishlist.items.length > 0) {
          const currentWishlist = {...get().wishlist};
          currentWishlist.items = [response.data, ...currentWishlist.items];
          currentWishlist.pagination.total += 1;
          set({ wishlist: currentWishlist });
        }
        
        set({ isLoading: false });
        return response.data;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to add item to wishlist';
        set({ error: errorMsg, isLoading: false });
        return null;
      }
    },
    
    removeFromWishlist: async (productId) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await api.delete(customerApi.removeFromWishlist(productId));
        
        if (response.error) {
          set({ error: response.error, isLoading: false });
          return false;
        }
        
        // Update wishlist in state
        const currentWishlist = {...get().wishlist};
        currentWishlist.items = currentWishlist.items.filter(item => item.productId !== productId);
        currentWishlist.pagination.total -= 1;
        
        set({ 
          wishlist: currentWishlist,
          isLoading: false 
        });
        
        return true;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to remove item from wishlist';
        set({ error: errorMsg, isLoading: false });
        return false;
      }
    },
    
    // Order functions
    getOrders: async (page = 1, limit = 10) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await api.get(`${customerApi.getOrders}?page=${page}&limit=${limit}`);
        
        if (response.error) {
          set({ error: response.error, isLoading: false });
          return null;
        }
        
        set({ 
          orders: {
            items: response.data.orders || [],
            pagination: response.data.pagination || {
              total: 0,
              page,
              pageSize: limit,
              pageCount: 0
            }
          },
          isLoading: false 
        });
        
        return response.data;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to fetch orders';
        set({ error: errorMsg, isLoading: false });
        return null;
      }
    },
    
    getOrderDetails: async (orderId) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await api.get(customerApi.getOrderDetails(orderId));
        
        if (response.error) {
          set({ error: response.error, isLoading: false });
          return null;
        }
        
        set({ isLoading: false });
        return response.data;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to fetch order details';
        set({ error: errorMsg, isLoading: false });
        return null;
      }
    },
    
    // Profile image upload
    uploadProfileImage: async (file) => {
      set({ isLoading: true, error: null });
      
      try {
        // Create FormData for image upload
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await api.uploadFile(customerApi.uploadProfileImage, formData);
        
        if (response.error) {
          set({ error: response.error, isLoading: false });
          return null;
        }
        
        set({ isLoading: false });
        return response.data;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to upload profile image';
        set({ error: errorMsg, isLoading: false });
        return null;
      }
    },
    
    // Account deletion
    deleteAccount: async () => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await api.delete(customerApi.deleteCustomerAccount);
        
        if (response.error) {
          set({ error: response.error, isLoading: false });
          return false;
        }
        
        set({ isLoading: false });
        return true;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to delete account';
        set({ error: errorMsg, isLoading: false });
        return false;
      }
    },
    
    // Utils
    setError: (error) => set({ error }),
    clearError: () => set({ error: null })
  })
);

export default useAccountStore;
