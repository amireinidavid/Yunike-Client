"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Shield,
  Truck,
  Tag,
  X,
  RefreshCw,
  AlertCircle,
  Check,
  ChevronRight
} from "lucide-react";

// Import components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent,
  CardFooter
} from "@/components/ui/card";

// Import store
import useCartStore from "@/store/useCartStore";

const CartPage = () => {
  // Get cart state and actions from store
  const {
    cart,
    isLoading,
    error,
    cartInitialized,
    initializeCart,
    fetchCart,
    updateItemQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    reset: resetCart,
    setError
  } = useCartStore();

  // Local state for coupon input
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [cartLoaded, setCartLoaded] = useState(false);

  // Initialize cart on page load - with improved loop prevention
  useEffect(() => {
    // Skip if already loaded or loading in progress
    if (cartLoaded || isLoading) return;

    const loadCart = async () => {
      try {
        console.log("Loading cart on cart page...");
        
        // Set loading flag immediately to prevent multiple calls
        setCartLoaded(true);
        
        if (!cartInitialized) {
          await initializeCart();
        } else if (cart?.id) {
          await fetchCart();
        }
      } catch (error) {
        console.error("Failed to load cart:", error);
      }
    };

    loadCart();
  }, [cart?.id, cartInitialized, fetchCart, initializeCart, isLoading]);

  // Refresh cart when visibility changes, but only if already loaded
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && cartLoaded && !isLoading && cart?.id) {
        fetchCart();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [cartLoaded, fetchCart, isLoading, cart?.id]);

  // Handle quantity update
  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(itemId);
      return;
    }

    await updateItemQuantity(itemId, newQuantity);
  };

  // Handle coupon application
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    const success = await applyCoupon(couponCode);
    setIsApplyingCoupon(false);

    if (success) {
      toast.success("Coupon applied successfully");
      setCouponCode("");
    } else {
      toast.error("Invalid or expired coupon");
    }
  };

  // Handle remove coupon
  const handleRemoveCoupon = async () => {
    await removeCoupon();
    toast.success("Coupon removed");
  };

  // Handle clear cart
  const handleClearCart = async () => {
    if (confirm("Are you sure you want to clear your cart?")) {
      await clearCart();
      toast.success("Cart cleared successfully");
    }
  };

  // Empty cart state
  if (cartInitialized && cart?.items.length === 0) {
    return (
      <div className="container max-w-6xl mx-auto py-20 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center">
            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
          </div>
          
          <h1 className="text-3xl font-bold">Your cart is empty</h1>
          
          <p className="text-muted-foreground max-w-md mx-auto">
            Looks like you haven't added anything to your cart yet. Start shopping to find amazing products!
          </p>
          
          <div className="pt-6">
            <Button asChild size="lg">
              <Link href="/shop">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Start Shopping
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Loading state
  if (isLoading || !cart) {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <div className="flex flex-col gap-8">
          <h1 className="text-3xl font-bold">Your Cart</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 border rounded-lg p-4">
                  <Skeleton className="h-24 w-24 rounded-md" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              ))}
            </div>
            
            <div>
              <Skeleton className="h-[400px] w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-lg flex flex-col items-center text-center">
          <AlertCircle className="h-10 w-10 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => fetchCart()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                resetCart();
                setCartLoaded(false);
                toast.success("Cart has been reset");
              }}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Reset Cart
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="container max-w-6xl mx-auto py-12 px-4"
    >
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your Cart</h1>
          <Button variant="ghost" asChild className="text-sm">
            <Link href="/shop">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {cart.items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Product Image */}
                <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-md overflow-hidden bg-muted/30 flex-shrink-0">
                  {item.product?.images?.find(img => img.isMain)?.url ? (
                    <Link href={`/product/${item.productId}`}>
                      <Image 
                        src={item.product.images.find(img => img.isMain)?.url || item.product.images[0].url} 
                        alt={item.product.name}
                        fill
                        sizes="(max-width: 768px) 96px, 128px"
                        className="object-cover"
                      />
                    </Link>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                {/* Product Details and Actions */}
                <div className="flex flex-1 flex-col sm:flex-row gap-4 justify-between">
                  <div className="space-y-1 flex-1">
                    <Link 
                      href={`/product/${item.productId}`} 
                      className="font-medium hover:text-primary transition-colors line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                    
                    {item.variant && (
                      <div className="flex items-center text-sm">
                        <span className="text-muted-foreground">Variant:</span>
                        <Badge variant="outline" className="ml-2">
                          {item.variant.name}
                        </Badge>
                      </div>
                    )}
                    
                    {item.product.vendor && (
                      <div className="text-sm text-muted-foreground">
                        Sold by: <Link href={`/vendor/${item.product.vendor.slug}`} className="hover:text-primary">
                          {item.product.vendor.storeName}
                        </Link>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      
                      {/* Add to wishlist button could go here */}
                    </div>
                  </div>
                  
                  <div className="flex flex-row sm:flex-col justify-between items-end gap-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center border rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <div className="w-10 text-center text-sm font-medium">
                        {item.quantity}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {/* Price */}
                    <div className="text-right">
                      <div className="font-semibold">
                        ${item.price.toFixed(2)}
                      </div>
                      
                      {item.quantity > 1 && (
                        <div className="text-xs text-muted-foreground">
                          ${item.totalPrice.toFixed(2)} total
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Cart Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center py-4">
              <Button 
                variant="outline" 
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={handleClearCart}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Cart
              </Button>
              
              <div className="flex items-center gap-2">
                <Input 
                  placeholder="Promo code"
                  className="w-[150px]"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                
                <Button 
                  variant="secondary" 
                  size="sm"
                  disabled={isApplyingCoupon || !couponCode}
                  onClick={handleApplyCoupon}
                >
                  {isApplyingCoupon ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Tag className="h-4 w-4 mr-2" />
                  )}
                  Apply
                </Button>
              </div>
            </div>
          </div>
          
          {/* Order Summary - Right Side */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${cart.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {cart.discount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <div className="flex items-center">
                        <span>Discount</span>
                        {cart.couponId && (
                          <Button 
                            variant="ghost" 
                            className="h-6 w-6 p-0 ml-1 text-muted-foreground"
                            onClick={handleRemoveCoupon}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <span>-${cart.discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${cart.tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {cart.shipping > 0 ? `$${cart.shipping.toFixed(2)}` : "Calculated at checkout"}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-semibold pt-2">
                    <span>Total</span>
                    <span>${cart.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-4 px-6 pb-6">
                <Button className="w-full" size="lg" asChild>
                  <Link href="/checkout">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Proceed to Checkout
                  </Link>
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-4 w-4" />
                    <span>Secure checkout</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span>Free shipping on orders over $50</span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        {/* You might also like section */}
        <div className="pt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">You might also like</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/shop">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* This would be populated with product recommendations */}
            {/* For now showing placeholders */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[320px] rounded-lg bg-muted/40 animate-pulse"></div>
            ))}
          </div>
        </div>
        
        {/* Trust signals */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
              <div className="bg-primary/10 rounded-full p-3 mb-4">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-1">Free Shipping</h3>
              <p className="text-sm text-muted-foreground">On orders over $50</p>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
              <div className="bg-primary/10 rounded-full p-3 mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-1">Secure Payments</h3>
              <p className="text-sm text-muted-foreground">Encrypted & safe checkout</p>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
              <div className="bg-primary/10 rounded-full p-3 mb-4">
                <RefreshCw className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-1">Easy Returns</h3>
              <p className="text-sm text-muted-foreground">30-day return policy</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartPage;
