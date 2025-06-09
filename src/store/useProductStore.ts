import { create } from 'zustand';
import { api, productApi } from '@/utils/api';

// Define types based on the schema
export interface ProductImage {
  id: string;
  url: string;
  isMain: boolean;
  thumbnailUrl?: string;
  altText?: string;
  position: number;
}

export interface ProductVariant {
  id: string;
  name?: string;
  options: any[];
  price?: number;
  comparePrice?: number;
  inventory: number;
  sku?: string;
  imageUrls: string[];
  isDefault: boolean;
}

export interface ProductSpecification {
  id: string;
  name: string;
  value: string;
  unit?: string;
  group?: string;
}

export interface Vendor {
  id: string;
  storeName: string;
  slug: string;
  logo?: string;
  avgRating?: number;
  totalRatings: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  images: ProductImage[];
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  inventory: number;
  sku?: string;
  isPublished: boolean;
  isDigital: boolean;
  hasVariants: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  condition: 'NEW' | 'USED' | 'REFURBISHED' | 'COLLECTIBLE';
  avgRating?: number;
  totalRatings: number;
  images: ProductImage[];
  variants: ProductVariant[];
  specifications: ProductSpecification[];
  vendor: Vendor;
  viewCount: number;
  categories?: { category: Category }[];
}

export interface ProductsResponse {
  items: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductSearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  vendorId?: string;
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular' | 'rating';
  page?: number;
  limit?: number;
}

// Define product store state and methods
interface ProductState {
  // Current product
  product: Product | null;
  relatedProducts: Product[];
  isLoadingProduct: boolean;
  productError: string | null;
  
  // Product listings
  products: Product[];
  featuredProducts: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  isLoadingProducts: boolean;
  productsError: string | null;
  
  // Filters
  filters: ProductSearchFilters;
  
  // Actions
  getProduct: (idOrSlug: string) => Promise<Product | null>;
  getRelatedProducts: (productId: string, limit?: number) => Promise<Product[]>;
  searchProducts: (filters: ProductSearchFilters) => Promise<ProductsResponse>;
  getFeaturedProducts: (limit?: number) => Promise<Product[]>;
  getVendorProducts: (vendorIdOrSlug: string, filters?: Partial<ProductSearchFilters>) => Promise<ProductsResponse>;
  setFilters: (filters: Partial<ProductSearchFilters>) => void;
  clearProduct: () => void;
  clearProductList: () => void;
  reset: () => void;
}

// Create product store
const useProductStore = create<ProductState>((set, get) => ({
  // Initial state
  product: null,
  relatedProducts: [],
  isLoadingProduct: false,
  productError: null,
  
  products: [],
  featuredProducts: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  isLoadingProducts: false,
  productsError: null,
  
  filters: {
    page: 1,
    limit: 20,
    sort: 'newest',
  },
  
  // Actions
  getProduct: async (idOrSlug: string) => {
    set({ isLoadingProduct: true, productError: null });
    
    try {
      // Determine if this is an ID or slug
      const isSlug = !idOrSlug.includes('-') && idOrSlug.length < 24;
      const endpoint = isSlug ? productApi.getProductBySlug(idOrSlug) : productApi.getProduct(idOrSlug);
      
      const response = await api.get(endpoint);
      
      if (response.success && response.data) {
        set({ product: response.data, isLoadingProduct: false });
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to load product');
      }
    } catch (error: any) {
      set({ 
        productError: error.message || 'Error fetching product',
        isLoadingProduct: false
      });
      return null;
    }
  },
  
  getRelatedProducts: async (productId: string, limit = 8) => {
    set({ isLoadingProduct: true });
    
    try {
      const response = await api.get(`${productApi.getRelatedProducts(productId)}?limit=${limit}`);
      
      if (response.success && response.data) {
        set({ relatedProducts: response.data, isLoadingProduct: false });
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to load related products');
      }
    } catch (error: any) {
      set({ 
        productError: error.message || 'Error fetching related products',
        isLoadingProduct: false
      });
      return [];
    }
  },
  
  searchProducts: async (filters: ProductSearchFilters) => {
    set({ isLoadingProducts: true, productsError: null, filters: { ...get().filters, ...filters } });
    
    try {
      // Build query string
      const queryParams = new URLSearchParams();
      if (filters.query) queryParams.append('query', filters.query);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
      if (filters.vendorId) queryParams.append('vendorId', filters.vendorId);
      if (filters.sort) queryParams.append('sort', filters.sort);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      
      const response = await api.get(`${productApi.getAllProducts}?${queryParams.toString()}`);
      
      if (response.success) {
        const result = {
          items: response.data,
          pagination: response.pagination || {
            page: filters.page || 1,
            limit: filters.limit || 20,
            total: response.data?.length || 0,
            pages: 1
          }
        };
        
        set({ 
          products: result.items,
          pagination: result.pagination,
          isLoadingProducts: false
        });
        
        return result;
      } else {
        throw new Error(response.message || 'Failed to search products');
      }
    } catch (error: any) {
      set({ 
        productsError: error.message || 'Error searching products',
        isLoadingProducts: false
      });
      return { items: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
    }
  },
  
  getFeaturedProducts: async (limit = 8) => {
    set({ isLoadingProducts: true, productsError: null });
    
    try {
      const response = await api.get(`${productApi.getFeaturedProducts}?limit=${limit}`);
      
      if (response.success && response.data) {
        set({ 
          featuredProducts: response.data,
          isLoadingProducts: false
        });
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to load featured products');
      }
    } catch (error: any) {
      set({ 
        productsError: error.message || 'Error fetching featured products',
        isLoadingProducts: false
      });
      return [];
    }
  },
  
  getVendorProducts: async (vendorIdOrSlug: string, filters = {}) => {
    set({ isLoadingProducts: true, productsError: null });
    
    try {
      // Determine if this is an ID or slug
      const isSlug = !vendorIdOrSlug.includes('-') && vendorIdOrSlug.length < 24;
      
      // Build the endpoint
      let endpoint = isSlug 
        ? productApi.getVendorProductsBySlug(vendorIdOrSlug) 
        : productApi.getVendorProducts(vendorIdOrSlug);
      
      // Add query params
      const queryParams = new URLSearchParams();
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.sort) queryParams.append('sort', filters.sort);
      
      const response = await api.get(`${endpoint}?${queryParams.toString()}`);
      
      if (response.success) {
        const result = {
          items: response.data,
          pagination: response.pagination || {
            page: filters.page || 1,
            limit: filters.limit || 20,
            total: response.data?.length || 0,
            pages: 1
          }
        };
        
        set({ 
          products: result.items,
          pagination: result.pagination,
          isLoadingProducts: false
        });
        
        return result;
      } else {
        throw new Error(response.message || 'Failed to load vendor products');
      }
    } catch (error: any) {
      set({ 
        productsError: error.message || 'Error fetching vendor products',
        isLoadingProducts: false
      });
      return { items: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
    }
  },
  
  setFilters: (filters: Partial<ProductSearchFilters>) => {
    set({ filters: { ...get().filters, ...filters } });
  },
  
  clearProduct: () => {
    set({ product: null, relatedProducts: [], productError: null });
  },
  
  clearProductList: () => {
    set({ 
      products: [], 
      pagination: { page: 1, limit: 20, total: 0, pages: 0 },
      productsError: null
    });
  },
  
  reset: () => {
    set({
      product: null,
      relatedProducts: [],
      isLoadingProduct: false,
      productError: null,
      products: [],
      featuredProducts: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 0 },
      isLoadingProducts: false,
      productsError: null,
      filters: { page: 1, limit: 20, sort: 'newest' }
    });
  }
}));

export default useProductStore;
