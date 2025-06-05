'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { products } from '@/lib/mock-data';

export default function FeaturedProductsSection() {
  const [activeTab, setActiveTab] = useState('all');
  
  // Create tabs based on available categories
  const categories = [...new Set(products.map(product => product.category))];
  
  // Filter products based on active tab
  const filteredProducts = activeTab === 'all' 
    ? products 
    : products.filter(product => product.category === activeTab);

  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Featured Products</h2>
            <p className="text-muted-foreground mt-2">Discover our best-selling items and new arrivals</p>
          </div>
          
          <Link 
            href="/shop" 
            className="inline-flex items-center text-primary font-medium hover:underline mt-4 md:mt-0"
          >
            View All Products
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        {/* Category Tabs */}
        <div className="flex overflow-x-auto pb-2 mb-8 scrollbar-hide">
          <button
            className={`px-4 py-2 mr-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-foreground hover:bg-primary/10'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All Products
          </button>
          
          {categories.map(category => (
            <button
              key={category}
              className={`px-4 py-2 mr-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors ${
                activeTab === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-foreground hover:bg-primary/10'
              }`}
              onClick={() => setActiveTab(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
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
        
        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No products found in this category.</p>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
              onClick={() => setActiveTab('all')}
            >
              View All Products
            </button>
          </div>
        )}
      </div>
    </section>
  );
} 