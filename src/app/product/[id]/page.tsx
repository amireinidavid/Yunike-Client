"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, ShoppingCart, Heart, Share2, ChevronRight, ArrowLeft, 
  Plus, Minus, Truck, Shield, Award, CircleCheck, MessageSquare,
  CheckCircle2, HelpCircle, Clock, Eye, AlertCircle, X, Lock, MapPin, Zap,
  ChevronDown,
  Store,
  ChevronLeft,
  Package,
  FileText,
  ShieldCheck,
  ThumbsUp
} from "lucide-react";

// Import Shadcn components
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Import store
import useProductStore, { Product } from "@/store/useProductStore";
import useCartStore from "@/store/useCartStore";

// Add the missing freeShipping property to Product type interface extension
interface ExtendedProduct extends Product {
  freeShipping?: boolean;
}

const ProductPage = () => {
  const params = useParams();
  const productId = params.id as string;
  
  // Get product state and actions from the store
  const { 
    product, 
    relatedProducts, 
    isLoadingProduct, 
    productError,
    getProduct, 
    getRelatedProducts,
    clearProduct
  } = useProductStore();
  
  // Get cart state and actions from the store
  const {
    initializeCart,
    addItem,
    fetchCart,
    isLoading: isCartLoading,
    cart,
    cartInitialized
  } = useCartStore();
  
  // Local state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]); // Mock data
  
  // Check if current product/variant is in cart
  const getProductInCartQuantity = () => {
    if (!cart?.items?.length || !product) return 0;
    
    const cartItem = cart.items.find(item => {
      if (selectedVariant) {
        // Check for specific variant
        return item.productId === product.id && item.variantId === selectedVariant;
      } else {
        // Check for product without variant
        return item.productId === product.id && (!item.variantId || item.variantId === null);
      }
    });
    
    return cartItem ? cartItem.quantity : 0;
  };
  
  // Use state to track cart quantities so it updates when cart changes
  const [productInCartQuantity, setProductInCartQuantity] = useState(0);
  const [isProductInCart, setIsProductInCart] = useState(false);
  
  // Update cart quantities when cart or selected variant changes
  useEffect(() => {
    // Wait until both product and cart are loaded
    if (product && cart && Array.isArray(cart.items)) {
      console.log("Cart updated, checking quantities", cart);
      const quantity = getProductInCartQuantity();
      console.log("Product in cart quantity:", quantity, "for", product.id, "variant:", selectedVariant);
      setProductInCartQuantity(quantity);
      setIsProductInCart(quantity > 0);
    }
  }, [cart, selectedVariant, product, cartInitialized]);
  
  // Fetch product data on mount
  useEffect(() => {
    const fetchProductData = async () => {
      const fetchedProduct = await getProduct(productId);
      if (fetchedProduct?.id) {
        getRelatedProducts(fetchedProduct.id);
        // Set default variant if product has variants
        if (fetchedProduct.hasVariants && fetchedProduct.variants.length > 0) {
          const defaultVariant = fetchedProduct.variants.find(v => v.isDefault);
          setSelectedVariant(defaultVariant?.id || fetchedProduct.variants[0].id);
        }
      }
    };
    fetchProductData();
    
    // Clean up on unmount
    return () => {
      clearProduct();
    };
  }, [productId, getProduct, getRelatedProducts, clearProduct]);
  
  // Initialize cart in a separate effect to ensure it runs independently
  useEffect(() => {
    const loadCart = async () => {
      try {
        if (!cartInitialized) {
          // Only initialize once if not already initialized
          await initializeCart();
          // Then fetch the cart to ensure we have the latest data
          await fetchCart();
        }
      } catch (error) {
        console.error("Failed to load cart:", error);
      }
    };
    
    loadCart();
    
    // Fetch cart again on focus or visibility change to ensure we have the latest data
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Just fetch cart, don't try to re-initialize
        fetchCart();
      }
    };
    
    const handleFocus = () => {
      // Just fetch cart, don't try to re-initialize
      fetchCart();
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [initializeCart, fetchCart, cartInitialized]);

  // Set recently viewed after relatedProducts are fetched
  useEffect(() => {
    if (relatedProducts.length > 0) {
      setRecentlyViewed(relatedProducts.slice(0, 3));
    }
  }, [relatedProducts]);
  
  // Handle quantity changes
  const increaseQuantity = () => {
    if (product && quantity < product.inventory) {
      setQuantity(prev => prev + 1);
    }
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  // Handle variant selection
  const handleVariantChange = (variantId: string) => {
    setSelectedVariant(variantId);
  };
  
    // Add to cart function using the cart store
  const addToCart = async () => {
    if (!product) return;
    
    try {
      await addItem(product.id, quantity, selectedVariant || undefined);
      toast.success(`${quantity} x ${product.name} added to your cart`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add item to cart");
    }
  };
  
  // Loading state
  if (isLoadingProduct) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (productError || !product) {
    return (
      <div className="container mx-auto py-24 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-8">{productError || "The product you're looking for doesn't exist or has been removed."}</p>
        <Button asChild>
          <Link href="/shop">
            <ArrowLeft className="mr-2" />
            Back to Shop
          </Link>
        </Button>
      </div>
    );
  }
  
  // Type cast product to ExtendedProduct to avoid type errors
  const productExtended = product as ExtendedProduct;
  
  // Get the current variant if selected
  const currentVariant = selectedVariant 
    ? product.variants.find(v => v.id === selectedVariant) 
    : null;
  
  // Determine the price to display
  const displayPrice = currentVariant?.price || product.price;
  const displayComparePrice = currentVariant?.comparePrice || product.comparePrice;
  
  // Calculate discount percentage if on sale
  const discountPercentage = displayComparePrice 
    ? Math.round(((displayComparePrice - displayPrice) / displayComparePrice) * 100) 
    : 0;

  // Mock key features for display
  const keyFeatures = [
    "Premium quality materials",
    "Designed for maximum comfort",
    "Durable construction",
    "Easy to maintain",
    "Versatile usage"
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-12 px-4 relative"
    >
      {/* Floating Quick Purchase Button - Appears on scroll */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, type: "spring" }}
        className="fixed bottom-8 right-8 z-50 lg:hidden"
      >
        {isProductInCart && !product.hasVariants ? (
          <div className="rounded-full h-16 w-16 shadow-lg bg-green-500 text-white flex items-center justify-center font-bold">
            {productInCartQuantity}
          </div>
        ) : (
          <Button 
            size="lg" 
            className="rounded-full h-16 w-16 shadow-lg bg-gradient-to-r from-primary to-primary/80 p-0"
            onClick={addToCart}
            disabled={isProductInCart && !product.hasVariants}
          >
            <ShoppingCart className="h-6 w-6" />
          </Button>
        )}
      </motion.div>

      {/* Flash Sale Banner - If product is on sale */}
      {product.isOnSale && (
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white p-3 rounded-lg mb-6 shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="bg-white text-red-600 text-xs font-bold px-2 py-1 rounded-full">FLASH SALE</span>
              <span className="font-bold">{discountPercentage}% OFF</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span>Limited time offer</span>
              <span className="bg-white/20 px-2 py-1 rounded font-mono">12h : 45m : 30s</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Breadcrumb */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 text-sm text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap pb-2"
      >
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3 flex-shrink-0" />
        <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
        <ChevronRight className="h-3 w-3 flex-shrink-0" />
        {product.categories && product.categories[0] && (
          <>
            <Link href={`/shop?category=${product.categories[0].category.id}`} className="hover:text-primary transition-colors">
              {product.categories[0].category.name}
            </Link>
            <ChevronRight className="h-3 w-3 flex-shrink-0" />
          </>
        )}
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images - Enhanced with zoom effect and better gallery */}
        <div className="space-y-4">
          <div className="relative bg-gradient-to-br from-background to-muted/30 rounded-xl overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImageIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="relative aspect-square rounded-lg overflow-hidden"
              >
                {product.images && product.images.length > 0 ? (
                  <div className="group relative w-full h-full">
                    <Image 
                      src={product.images[activeImageIndex].url}
                      alt={product.images[activeImageIndex].altText || product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain transform transition-transform duration-500 group-hover:scale-110"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No image available
                  </div>
                )}
                
                {/* Sale badge */}
                {product.isOnSale && (
                  <motion.div 
                    initial={{ rotate: -15, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="absolute top-4 left-4 z-10"
                  >
                    <Badge variant="destructive" className="text-sm px-3 py-1 shadow-lg font-bold">
                      {discountPercentage}% OFF
                    </Badge>
                  </motion.div>
                )}

                {/* Quick actions */}
                <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                  <Button variant="secondary" size="icon" className="rounded-full h-10 w-10 bg-background/80 backdrop-blur-sm shadow-lg">
                    <Heart className="h-5 w-5 text-red-500" />
                  </Button>
                  <Button variant="secondary" size="icon" className="rounded-full h-10 w-10 bg-background/80 backdrop-blur-sm shadow-lg">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Thumbnail gallery - Enhanced with proper spacing and hover effects */}
          {product.images && product.images.length > 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-3 overflow-x-auto py-2 px-1"
            >
              {product.images.map((image, index) => (
                <motion.div
                  key={image.id}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveImageIndex(index)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setActiveImageIndex(index); }}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200 ${
                    activeImageIndex === index 
                      ? "ring-2 ring-primary ring-offset-2 shadow-md" 
                      : "ring-1 ring-border opacity-70 hover:opacity-100"
                  } cursor-pointer`}
                  aria-label={`Show image ${index + 1}`}
                >
                  <Image
                    src={image.thumbnailUrl || image.url}
                    alt={image.altText || `Product image ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
        
        {/* Product Details - Enhanced with better typography and spacing */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Official store badge and ratings */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/vendor/${product.vendor.slug}`} className="flex items-center gap-2">
                {product.vendor.logo ? (
                  <div className="relative w-6 h-6 rounded-full overflow-hidden border border-primary/20">
                    <Image
                      src={product.vendor.logo}
                      alt={product.vendor.storeName}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <span className="text-sm font-medium">{product.vendor.storeName}</span>
              </Link>
              <Badge variant="outline" className="bg-primary/5 text-xs border-primary/20">
                Official Store
              </Badge>
            </div>
            
            {product.avgRating && (
              <div className="flex items-center gap-1">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${
                        i < Math.floor(product.avgRating || 0) 
                          ? "fill-yellow-400 text-yellow-400"
                          : i < Math.ceil(product.avgRating || 0) 
                            ? "fill-yellow-400/50 text-yellow-400" 
                            : "text-gray-300 dark:text-gray-600"
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{product.avgRating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({product.totalRatings || 0})</span>
                <Button variant="link" size="sm" className="text-xs p-0 h-auto">
                  Reviews
                </Button>
              </div>
            )}
          </div>
          
          {/* Product title */}
          <h1 className="text-3xl font-bold leading-tight">{product.name}</h1>
          
          {/* Price section with animations */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-primary/5 rounded-lg p-4 border border-primary/10"
          >
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-primary">${displayPrice.toFixed(2)}</span>
              {displayComparePrice && (
                <div className="flex flex-col">
                  <span className="text-lg text-muted-foreground line-through">${displayComparePrice.toFixed(2)}</span>
                  <span className="text-xs text-green-600 font-medium">Save ${(displayComparePrice - displayPrice).toFixed(2)}</span>
                </div>
              )}
            </div>
            
            {/* Stock status */}
            <div className="mt-3 flex items-center gap-2">
              {product.inventory > 10 ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                  <CircleCheck className="mr-1 h-3 w-3" /> In Stock
                </Badge>
              ) : product.inventory > 0 ? (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                  <AlertCircle className="mr-1 h-3 w-3" /> Low Stock: {product.inventory} left
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                  <X className="mr-1 h-3 w-3" /> Out of Stock
                </Badge>
              )}
              
              {productExtended.freeShipping && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                  <Truck className="mr-1 h-3 w-3" /> Free Shipping
                </Badge>
              )}
            </div>
          </motion.div>
          
          {/* Short description */}
          {product.shortDescription && (
            <p className="text-muted-foreground leading-relaxed">{product.shortDescription}</p>
          )}
          
          <Separator className="my-4" />
          
          {/* Variants selection - Enhanced with better styling */}
          {product.hasVariants && product.variants.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">OPTIONS</h3>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((variant) => (
                  <motion.div
                    key={variant.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant={selectedVariant === variant.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleVariantChange(variant.id)}
                      className={`${selectedVariant === variant.id 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "hover:bg-primary/5"} ${
                          cart?.items?.some(item => item.productId === product.id && item.variantId === variant.id)
                          ? "bg-green-100 border-green-300 dark:bg-green-900/20 dark:border-green-700"
                          : ""
                        }`}
                    >
                      {variant.name || `Option ${variant.id.slice(0, 4)}`}
                      {cart?.items?.some(item => item.productId === product.id && item.variantId === variant.id) &&
                        ` (${cart.items.find(item => item.productId === product.id && item.variantId === variant.id)?.quantity})`}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity selector and Add to cart */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 pt-2"
          >
            <div className="flex items-center border rounded-md h-12 bg-background">
              <Button
                variant="ghost"
                size="icon"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className="rounded-none"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="w-12 text-center font-medium">{quantity}</div>
              <Button
                variant="ghost"
                size="icon"
                onClick={increaseQuantity}
                disabled={product.inventory <= quantity}
                className="rounded-none"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <Button 
              className="h-12 flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md shadow-primary/10" 
              disabled={product.inventory === 0 || (isProductInCart && !product.hasVariants)}
              onClick={addToCart}
            >
              <ShoppingCart className="mr-2" /> 
              {isProductInCart 
                ? `Added to Cart (${productInCartQuantity})` 
                : "Add to Cart"}
            </Button>
            
            <Button variant="outline" size="icon" className="h-12 w-12 border-primary/20 hover:bg-primary/5">
              <Heart className="h-5 w-5 text-red-500" />
            </Button>
            
            <Button variant="outline" size="icon" className="h-12 w-12 border-primary/20 hover:bg-primary/5">
              <Share2 className="h-5 w-5" />
            </Button>
          </motion.div>
          
          {/* Delivery options */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-muted/50 rounded-lg p-4"
          >
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Truck className="h-4 w-4" /> Delivery Options
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <div className="h-5 w-5 mt-0.5 flex items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Standard Delivery</p>
                  <p className="text-muted-foreground">Free shipping for orders over $50</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="h-5 w-5 mt-0.5 flex items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Express Delivery</p>
                  <p className="text-muted-foreground">Get it in 24 hours (order before 2pm)</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Product features */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span>Free shipping over $50</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span>30-day return policy</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Award className="h-4 w-4 text-muted-foreground" />
              <span>{product.condition === 'NEW' ? 'Brand new' : product.condition}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CircleCheck className="h-4 w-4 text-muted-foreground" />
              <span>Authentic product</span>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Main content and sticky sidebar */}
      <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content - 2/3 width on desktop */}
        <div className="lg:col-span-2 space-y-20">
          {/* Description Section */}
          <section className="scroll-m-20" id="description">
            <h2 className="text-3xl font-bold mb-6">Product Description</h2>
            {product.description ? (
              <div className="prose prose-slate dark:prose-invert max-w-none">
                {product.description}
              </div>
            ) : (
              <p className="text-muted-foreground">No description available for this product.</p>
            )}
          </section>
          
          {/* Specifications Section */}
          {product.specifications.length > 0 && (
            <section className="scroll-m-20" id="specifications">
              <div className="bg-muted/50 rounded-xl p-8">
                <h2 className="text-3xl font-bold mb-8">Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Group specifications by their group property */}
                  {Array.from(
                    new Set(product.specifications.map(spec => spec.group || 'General'))
                  ).map(group => (
                    <motion.div 
                      key={group} 
                      className="space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                    >
                      <h3 className="font-medium text-lg">{group}</h3>
                      <div className="space-y-2 bg-background rounded-lg p-4">
                        {product.specifications
                          .filter(spec => (spec.group || 'General') === group)
                          .map(spec => (
                            <div key={spec.id} className="grid grid-cols-2 py-2 border-b last:border-0">
                              <span className="text-muted-foreground">{spec.name}</span>
                              <span>
                                {spec.value}
                                {spec.unit && ` ${spec.unit}`}
                              </span>
                            </div>
                          ))
                        }
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}
          
          {/* Reviews Section */}
          <section className="scroll-m-20" id="reviews">
            <div className="bg-gradient-to-b from-background to-muted/30 rounded-xl p-8">
              <h2 className="text-3xl font-bold mb-8">Customer Reviews</h2>
              
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Review summary */}
                <div className="w-full md:w-1/3 text-center p-6 bg-background rounded-xl shadow-sm">
                  <h3 className="text-lg font-medium mb-2">Review Summary</h3>
                  <p className="text-muted-foreground mb-4">
                    Based on {product.totalRatings} {product.totalRatings === 1 ? 'review' : 'reviews'}
                  </p>
                  {product.avgRating ? (
                    <div className="flex flex-col items-center gap-2 mb-6">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-8 w-8 ${
                              i < Math.floor(product.avgRating || 0) 
                                ? "fill-yellow-400 text-yellow-400"
                                : i < Math.ceil(product.avgRating || 0) 
                                  ? "fill-yellow-400/50 text-yellow-400" 
                                  : "text-muted-foreground"
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-3xl font-bold">{product.avgRating.toFixed(1)}/5</span>
                    </div>
                  ) : (
                    <p className="text-muted-foreground mb-6">No ratings yet</p>
                  )}
                  <Button className="w-full">Write a Review</Button>
                </div>
                
                {/* Review list - just a placeholder for now */}
                <div className="w-full md:w-2/3 space-y-6">
                  {product.totalRatings > 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Reviews would be displayed here</p>
                    </div>
                  ) : (
                    <div className="text-center bg-background rounded-xl p-12">
                      <h3 className="text-lg font-medium mb-4">Be the First to Review</h3>
                      <p className="text-muted-foreground mb-6">
                        Share your experience with this product and help other shoppers make informed decisions.
                      </p>
                      <Button>Write a Review</Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
        
        {/* Sidebar - 1/3 width on desktop */}
        <div className="lg:col-span-1 space-y-8">
          {/* Sticky purchase box */}
          <div className="sticky top-4 space-y-5">
            {/* Quick purchase card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-background border rounded-xl p-6 shadow-sm overflow-hidden relative"
            >
              {/* Decorative background elements */}
              <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-primary/5"></div>
              <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-primary/5"></div>
              
              <h3 className="font-medium text-lg mb-4 relative z-10">Quick Purchase</h3>
              
              {/* Product title + price */}
              <div className="mb-4 relative z-10">
                <p className="font-semibold text-sm line-clamp-1">{product.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-primary">${displayPrice.toFixed(2)}</span>
                  {displayComparePrice && (
                    <>
                      <span className="text-sm text-muted-foreground line-through">${displayComparePrice.toFixed(2)}</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                        Save {discountPercentage}%
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              
              {/* Compact variant selector */}
              {product.hasVariants && product.variants.length > 0 && (
                <div className="mb-4 relative z-10">
                  <p className="text-sm text-muted-foreground mb-2">Select Option:</p>
                  <div className="flex flex-wrap gap-1">
                    {product.variants.slice(0, 3).map((variant) => (
                      <Button
                        key={variant.id}
                        variant={selectedVariant === variant.id ? "default" : "outline"}
                        size="sm"
                        className="text-xs py-1 h-7"
                        onClick={() => handleVariantChange(variant.id)}
                      >
                        {variant.name || `Option ${variant.id.slice(0, 4)}`}
                      </Button>
                    ))}
                    {product.variants.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs py-1 h-7"
                      >
                        +{product.variants.length - 3} more
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Compact quantity selector */}
              <div className="flex items-center gap-4 mb-5 relative z-10">
                <div className="flex items-center border rounded-md h-9">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="rounded-none h-9 w-9"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <div className="w-8 text-center text-sm font-medium">{quantity}</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={increaseQuantity}
                    disabled={product.inventory <= quantity}
                    className="rounded-none h-9 w-9"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <span className="text-xs text-muted-foreground">
                  {product.inventory} available
                </span>
              </div>
              
              {/* Add to cart button */}
              <Button 
                className="w-full relative z-10 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary" 
                disabled={product.inventory === 0 || (isProductInCart && !product.hasVariants)}
                onClick={addToCart}
              >
                <ShoppingCart className="mr-2 h-4 w-4" /> 
                {isProductInCart 
                  ? `Added to Cart (${productInCartQuantity})` 
                  : "Add to Cart"}
              </Button>
              
              {/* Secure transaction message */}
              <div className="mt-4 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>Secure transaction</span>
              </div>
            </motion.div>
            
            {/* Delivery options card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-background border rounded-xl overflow-hidden shadow-sm"
            >
              <div className="bg-primary/5 px-4 py-3 border-b border-primary/10">
                <h3 className="font-medium flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  Delivery Options
                </h3>
              </div>
              
              <div className="p-4">
                {/* Location selector */}
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Deliver to:</p>
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" />
                      New York, 10001
                    </span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
                
                {/* Delivery options */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg cursor-pointer border border-transparent hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-background flex items-center justify-center border border-muted">
                        <Truck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Standard Delivery</p>
                        <p className="text-xs text-muted-foreground">Get by Jun 18-20</p>
                      </div>
                    </div>
                    <p className="font-semibold text-sm">$4.99</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg cursor-pointer border border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Express Delivery</p>
                        <p className="text-xs text-muted-foreground">Get by Jun 15</p>
                      </div>
                    </div>
                    <p className="font-semibold text-sm">$9.99</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg cursor-pointer border border-transparent hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-background flex items-center justify-center border border-muted">
                        <Store className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Store Pickup</p>
                        <p className="text-xs text-muted-foreground">Available Jun 14</p>
                      </div>
                    </div>
                    <p className="font-semibold text-sm">Free</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Key features */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-background border rounded-xl p-6 shadow-sm"
            >
              <h3 className="font-medium mb-4">Key Features</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Premium quality materials</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Designed for maximum comfort</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Durable construction</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Easy to maintain</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Versatile usage</span>
                </li>
              </ul>
            </motion.div>
            
            {/* Recently viewed */}
            {recentlyViewed.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-background border rounded-xl overflow-hidden shadow-sm"
              >
                <div className="bg-primary/5 px-4 py-3 border-b border-primary/10">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Recently Viewed</h3>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="divide-y">
                  {recentlyViewed.map(item => (
                    <Link 
                      href={`/product/${item.id}`} 
                      key={item.id}
                      className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="relative w-14 h-14 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        {item.images && item.images.length > 0 ? (
                          <Image
                            src={item.images[0].url}
                            alt={item.name}
                            fill
                            sizes="56px"
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">{item.name}</p>
                        <p className="text-xs text-muted-foreground">${item.price.toFixed(2)}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3 w-3 ${
                                  i < Math.floor(item.avgRating || 0) 
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300 dark:text-gray-600"
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-xs">{item.avgRating?.toFixed(1) || "0.0"}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
            
            {/* Support/Question widget */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 border rounded-xl p-6"
            >
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full p-3">
                  <HelpCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Have Questions?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our product specialists are ready to help with any questions you may have.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Ask a Question
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Related products section */}
      {relatedProducts.length > 0 && (
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-24"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">You Might Also Like</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-full h-10 w-10 hidden md:flex">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full h-10 w-10 hidden md:flex">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct, index) => (
              <motion.div
                key={relatedProduct.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full overflow-hidden group">
                  <Link href={`/product/${relatedProduct.id}`} className="block">
                    <div className="relative aspect-square bg-muted/50">
                      {relatedProduct.images && relatedProduct.images.length > 0 ? (
                        <Image
                          src={relatedProduct.images[0].url}
                          alt={relatedProduct.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-accent/10 text-muted-foreground">
                          No image
                        </div>
                      )}
                      
                      {/* Quick action buttons */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary" className="rounded-full h-9 w-9 p-0">
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="secondary" className="rounded-full h-9 w-9 p-0">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="secondary" className="rounded-full h-9 w-9 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Sale tag if applicable */}
                      {relatedProduct.isOnSale && (
                        <div className="absolute top-2 left-2">
                          <Badge variant="destructive">Sale</Badge>
                        </div>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <Link href={`/product/${relatedProduct.id}`} className="block">
                      <h3 className="font-medium line-clamp-1 group-hover:text-primary transition-colors">{relatedProduct.name}</h3>
                    </Link>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-semibold">${relatedProduct.price.toFixed(2)}</span>
                      {relatedProduct.comparePrice && (
                        <span className="text-sm text-muted-foreground line-through">${relatedProduct.comparePrice.toFixed(2)}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${
                              i < Math.floor(relatedProduct.avgRating || 0) 
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300 dark:text-gray-600"
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">({relatedProduct.totalRatings || 0})</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            <Button variant="outline">
              View All Products <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.section>
      )}
    </motion.div>
  );
};

export default ProductPage;
