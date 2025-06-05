'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { products } from '@/lib/mock-data';

export default function RecommendationsSection() {
  // In a real app, these would be fetched from an API based on user behavior
  // For now, we'll use random products from our mock data
  const shuffleArray = (array: typeof products) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  const [personalizedProducts] = useState(() => shuffleArray(products).slice(0, 4));

  return (
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-3">
            <Sparkles className="h-4 w-4 mr-2" />
            <span>Personalized For You</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Recommended Products</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Based on your browsing history and preferences, we think you'll love these products
          </p>
        </div>
        
        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {personalizedProducts.map(product => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price}
              originalPrice={product.originalPrice}
              discountPercentage={product.discountPercentage}
              rating={product.rating}
              image={product.image}
              vendorName={product.vendorName}
              category={product.category}
              badges={product.badges}
            />
          ))}
        </div>
        
        {/* Reason Tags */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <div className="bg-background py-2 px-4 rounded-full text-sm text-muted-foreground">
            Based on your recent views
          </div>
          <div className="bg-background py-2 px-4 rounded-full text-sm text-muted-foreground">
            Similar to items you've liked
          </div>
          <div className="bg-background py-2 px-4 rounded-full text-sm text-muted-foreground">
            Popular in your area
          </div>
          <div className="bg-background py-2 px-4 rounded-full text-sm text-muted-foreground">
            Matches your style preferences
          </div>
        </div>
      </div>
    </section>
  );
}