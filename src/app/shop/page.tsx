'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import useProductStore from '@/store/useProductStore';
import ProductCard from '@/components/ui/ProductCard';

// Shadcn UI components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

// Icons
import { FilterIcon, SearchIcon, Sliders, SlidersHorizontal, ChevronRight, RefreshCw, Check, X } from 'lucide-react';

// Sample categories for filter (these would come from an API in a real app)
const categories = [
  { id: 'electronics', name: 'Electronics' },
  { id: 'fashion', name: 'Fashion' },
  { id: 'home-kitchen', name: 'Home & Kitchen' },
  { id: 'health-beauty', name: 'Health & Beauty' },
  { id: 'sports', name: 'Sports & Outdoors' },
  { id: 'books', name: 'Books & Media' },
  { id: 'toys-games', name: 'Toys & Games' },
  { id: 'jewelry', name: 'Jewelry' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Popularity' },
  { value: 'rating', label: 'Customer Rating' },
];

// Product Card animation variants
const productVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: 'easeOut'
    }
  }),
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

// Animation for the filters section
const filtersVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, delay: 0.2 }
  }
};

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get products from our store
  const {
    products,
    pagination,
    isLoadingProducts,
    filters,
    setFilters,
    searchProducts,
    getFeaturedProducts
  } = useProductStore();
  
  // Local filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [filterCount, setFilterCount] = useState(0);
  
  // Get current page from URL or default to 1
  const currentPage = Number(searchParams.get('page') || 1);

  // Calculate price range from products
  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map(p => p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      setPriceRange([minPrice, maxPrice]);
    }
  }, [products]);
  
  // Load products on initial mount
  useEffect(() => {
    // Get filter values from URL
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const sort = searchParams.get('sort') || 'newest';
    const page = Number(searchParams.get('page') || 1);
    
    // Set local state from URL
    setSearchQuery(query);
    if (category) {
      setActiveCategories(category.split(','));
    }
    if (minPrice && maxPrice) {
      setPriceRange([minPrice, maxPrice]);
    }
    setSortBy(sort);
    
    // Count active filters
    let count = 0;
    if (query) count++;
    if (category) count++;
    if (minPrice || maxPrice) count++;
    if (sort !== 'newest') count++;
    setFilterCount(count);
    
    // Search products with filters
    searchProducts({
      query,
      category: category || undefined,
      minPrice,
      maxPrice,
      sort: sort as any,
      page,
      limit: 12
    });
  }, [searchParams, searchProducts]);
  
  // Update URL when filters change
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (searchQuery) {
      params.set('query', searchQuery);
    }
    
    if (activeCategories.length > 0) {
      params.set('category', activeCategories.join(','));
    }
    
    if (priceRange[0] > 0) {
      params.set('minPrice', priceRange[0].toString());
    }
    
    if (priceRange[1] < 1000) {
      params.set('maxPrice', priceRange[1].toString());
    }
    
    params.set('sort', sortBy);
    params.set('page', '1'); // Reset to page 1 when filters change
    
    router.push(`/shop?${params.toString()}`);
  };
  
  // Handle pagination change
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/shop?${params.toString()}`);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setActiveCategories([]);
    setPriceRange([0, 1000]);
    setSortBy('newest');
    router.push('/shop');
  };

  // Reset a specific filter
  const resetFilter = (type: 'search' | 'category' | 'price' | 'sort') => {
    const params = new URLSearchParams(searchParams.toString());
    
    switch (type) {
      case 'search':
        params.delete('query');
        setSearchQuery('');
        break;
      case 'category':
        params.delete('category');
        setActiveCategories([]);
        break;
      case 'price':
        params.delete('minPrice');
        params.delete('maxPrice');
        setPriceRange([0, 1000]);
        break;
      case 'sort':
        params.set('sort', 'newest');
        setSortBy('newest');
        break;
    }
    
    router.push(`/shop?${params.toString()}`);
  };

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    setActiveCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Convert our Product model to ProductCard props
  const mapProductToCardProps = (product: any) => {
    // Calculate discount percentage if comparePrice exists
    const discountPercentage = product.comparePrice 
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) 
      : undefined;
    
    // Create badges
    const badges: string[] = [];
    if (product.isOnSale) badges.push('Sale');
    if (product.isFeatured) badges.push('Featured');
    if (product.condition !== 'NEW') badges.push(product.condition);
    
    return {
      id: product.id,
      title: product.name,
      price: product.price,
      originalPrice: product.comparePrice,
      discountPercentage,
      rating: product.avgRating || 0,
      image: product.images && product.images[0] ? product.images[0].url : '/placeholder-product.jpg',
      vendorName: product.vendor ? product.vendor.storeName : 'Unknown Vendor',
      category: product.categories && product.categories[0] 
        ? product.categories[0].category.name 
        : 'Uncategorized',
      badges
    };
  };

  // Render loading skeleton
  const renderSkeletons = () => {
    return Array(8).fill(0).map((_, i) => (
      <div key={`skeleton-${i}`} className="h-[350px] w-full">
        <Skeleton className="h-[200px] w-full rounded-t-lg" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
    ));
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Shop All Products</h1>
        <p className="text-muted-foreground">Discover our curated collection of premium products</p>
      </motion.div>
      
      {/* Search and filter controls - Mobile */}
      <div className="md:hidden flex flex-col gap-4 mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-9"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyFilters()}
          />
        </div>
        
        <div className="flex gap-3">
          <Select value={sortBy} onValueChange={value => {
            setSortBy(value);
            // Directly update URL for sorting changes
            const params = new URLSearchParams(searchParams.toString());
            params.set('sort', value);
            router.push(`/shop?${params.toString()}`);
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <FilterIcon className="h-4 w-4" />
                <span>Filters</span>
                {filterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                    {filterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[300px] sm:w-[400px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filter Products</SheetTitle>
                <SheetDescription>
                  Narrow down products by applying filters
                </SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-category-${category.id}`}
                          checked={activeCategories.includes(category.id)}
                          onCheckedChange={() => toggleCategory(category.id)}
                        />
                        <label
                          htmlFor={`mobile-category-${category.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-4">Price Range</h3>
                  <div className="px-2">
                    <Slider
                      defaultValue={[priceRange[0], priceRange[1]]}
                      max={1000}
                      step={10}
                      onValueChange={(value) => setPriceRange([value[0], value[1]])}
                      className="mb-6"
                    />
                    <div className="flex items-center justify-between">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={clearFilters}>Clear All</Button>
                <Button onClick={applyFilters}>Apply Filters</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Main content layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters - Desktop */}
        <motion.aside
          variants={filtersVariants}
          initial="hidden"
          animate="visible"
          className="hidden md:block space-y-6"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center justify-between">
                <span>Filters</span>
                {filterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={clearFilters}
                  >
                    Clear All
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-3 flex items-center justify-between">
                    Search
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => resetFilter('search')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </h3>
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && applyFilters()}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <Accordion type="multiple" className="w-full" defaultValue={["categories"]}>
                  <AccordionItem value="categories">
                    <AccordionTrigger className="py-2">
                      <div className="flex items-center justify-between w-full">
                        <span>Categories</span>
                        {activeCategories.length > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 mr-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              resetFilter('category');
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category.id}`}
                              checked={activeCategories.includes(category.id)}
                              onCheckedChange={() => toggleCategory(category.id)}
                            />
                            <label
                              htmlFor={`category-${category.id}`}
                              className="text-sm font-medium leading-none"
                            >
                              {category.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="price">
                    <AccordionTrigger className="py-2">
                      <div className="flex items-center justify-between w-full">
                        <span>Price Range</span>
                        {(priceRange[0] > 0 || priceRange[1] < 1000) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 mr-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              resetFilter('price');
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-2">
                        <Slider
                          value={[priceRange[0], priceRange[1]]}
                          max={1000}
                          step={10}
                          onValueChange={(value) => setPriceRange([value[0], value[1]])}
                          className="mb-6"
                        />
                        <div className="flex items-center justify-between">
                          <span>${priceRange[0]}</span>
                          <span>${priceRange[1]}</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-3 flex items-center justify-between">
                    Sort By
                    {sortBy !== 'newest' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => resetFilter('sort')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </h3>
                  <Select value={sortBy} onValueChange={value => {
                    setSortBy(value);
                    // Directly update URL for sorting changes
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('sort', value);
                    router.push(`/shop?${params.toString()}`);
                  }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="pt-4">
                <Button onClick={applyFilters} className="w-full">
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.aside>
        
        {/* Product grid */}
        <div className="md:col-span-3">
          {filterCount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 flex flex-wrap gap-2"
            >
              {searchQuery && (
                <Badge variant="outline" className="pl-2 pr-1 py-1 flex items-center gap-1">
                  Search: {searchQuery}
                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => resetFilter('search')}>
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {activeCategories.length > 0 && (
                <Badge variant="outline" className="pl-2 pr-1 py-1 flex items-center gap-1">
                  Categories: {activeCategories.length}
                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => resetFilter('category')}>
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {(priceRange[0] > 0 || priceRange[1] < 1000) && (
                <Badge variant="outline" className="pl-2 pr-1 py-1 flex items-center gap-1">
                  Price: ${priceRange[0]} - ${priceRange[1]}
                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => resetFilter('price')}>
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {sortBy !== 'newest' && (
                <Badge variant="outline" className="pl-2 pr-1 py-1 flex items-center gap-1">
                  Sort: {sortOptions.find(o => o.value === sortBy)?.label}
                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => resetFilter('sort')}>
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </motion.div>
          )}
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium">
              {isLoadingProducts ? (
                <Skeleton className="h-6 w-32" />
              ) : (
                <>Showing {products.length} products</>
              )}
            </h2>
            <div className="hidden md:block">
              <Select value={sortBy} onValueChange={value => {
                setSortBy(value);
                const params = new URLSearchParams(searchParams.toString());
                params.set('sort', value);
                router.push(`/shop?${params.toString()}`);
              }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Products grid with loading state */}
          {isLoadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderSkeletons()}
            </div>
          ) : products.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="text-center space-y-3">
                <h3 className="text-xl font-medium">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search term</p>
                <Button onClick={clearFilters} variant="outline" className="mt-4">
                  <RefreshCw className="mr-2 h-4 w-4" /> Clear all filters
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="wait">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    variants={productVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    custom={index}
                    layout
                  >
                    <ProductCard {...mapProductToCardProps(product)} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
          
          {/* Pagination */}
          {pagination.pages > 1 && !isLoadingProducts && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12"
            >
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) {
                          handlePageChange(currentPage - 1);
                        }
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {/* First page */}
                  {currentPage > 3 && (
                    <PaginationItem>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(1);
                        }}
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  {/* Ellipsis if needed */}
                  {currentPage > 4 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      // If 5 or fewer pages, show all pages
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      // If near the start, show first 5 pages
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.pages - 2) {
                      // If near the end, show last 5 pages
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      // Otherwise, show current page and 2 on each side
                      pageNum = currentPage - 2 + i;
                    }
                    
                    // Skip if out of range
                    if (pageNum <= 0 || pageNum > pagination.pages) return null;
                    
                    return (
                      <PaginationItem key={`page-${pageNum}`}>
                        <PaginationLink 
                          href="#" 
                          isActive={pageNum === currentPage}
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(pageNum);
                          }}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }).filter(Boolean)}
                  
                  {/* Ellipsis if needed */}
                  {currentPage < pagination.pages - 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  {/* Last page */}
                  {currentPage < pagination.pages - 2 && (
                    <PaginationItem>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(pagination.pages);
                        }}
                      >
                        {pagination.pages}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < pagination.pages) {
                          handlePageChange(currentPage + 1);
                        }
                      }}
                      className={currentPage === pagination.pages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
