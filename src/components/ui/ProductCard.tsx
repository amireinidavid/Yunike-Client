'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import useCartStore from '@/store/useCartStore';
import { toast } from 'sonner';

export interface ProductProps {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  rating: number;
  image: string;
  vendorName: string;
  category: string;
  badges?: string[];
}

export default function ProductCard({ 
  id, 
  title, 
  price, 
  originalPrice, 
  discountPercentage, 
  rating, 
  image, 
  vendorName, 
  category,
  badges = [] 
}: ProductProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // Get addItem function from cart store
  const { addItem } = useCartStore();
  
  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };
  
  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingToCart(true);
    
    try {
      // Add product to cart with quantity 1
      await addItem(id, 1);
      toast.success(`${title} added to cart`);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Format the price with 2 decimal places and currency symbol
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="group relative bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      {/* Product Image with badges */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link href={`/product/${id}`} className="block w-full h-full">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        
        {/* Wishlist button - now in top left */}
        <button 
          onClick={toggleWishlist}
          className={`absolute top-3 left-3 p-2 rounded-full shadow-md backdrop-blur-sm transition-all duration-300
            ${isWishlisted 
              ? 'bg-red-500 text-white scale-110' 
              : 'bg-white/80 text-foreground hover:bg-white'} 
            hover:scale-110 z-10`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`h-[18px] w-[18px] ${isWishlisted ? 'fill-current' : ''} transition-all`} />
        </button>
          
        {/* Discount badge */}
        {discountPercentage && discountPercentage > 0 && (
          <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full shadow-sm z-10">
            -{discountPercentage}%
          </span>
        )}
        
        {/* Other badges */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1 z-10">
          {badges.map((badge, index) => (
            <span 
              key={index} 
              className="bg-accent/90 text-accent-foreground text-xs font-medium px-2 py-1 rounded-full shadow-sm backdrop-blur-sm"
            >
              {badge}
            </span>
          ))}
        </div>
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      {/* Product Info */}
      <Link href={`/product/${id}`} className="block flex-grow">
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">by {vendorName}</p>
          
          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-1">({rating.toFixed(1)})</span>
          </div>
          
          {/* Price */}
          <div className="mt-auto">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-semibold text-foreground">{formatPrice(price)}</span>
              {originalPrice && originalPrice > price && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
      
      {/* Add to Cart Button - Now a proper button at bottom */}
      <div className="px-4 pb-4">
        <button 
          onClick={addToCart}
          disabled={isAddingToCart}
          className={`w-full py-2.5 px-4 rounded-md flex items-center justify-center gap-2 font-medium transition-all duration-300
            ${isAddingToCart 
              ? 'bg-primary/80 cursor-not-allowed' 
              : 'bg-primary hover:bg-primary/90 active:scale-[0.98]'} 
            text-primary-foreground shadow-sm`}
        >
          <ShoppingCart className={`h-[18px] w-[18px] ${isAddingToCart ? 'animate-bounce' : ''}`} />
          {isAddingToCart ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
} 