'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { categories } from '@/lib/mock-data';

export default function CategoriesSection() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  const scroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    
    const { scrollLeft, clientWidth } = carouselRef.current;
    const scrollTo = direction === 'left' 
      ? scrollLeft - clientWidth / 2 
      : scrollLeft + clientWidth / 2;
      
    carouselRef.current.scrollTo({
      left: scrollTo,
      behavior: 'smooth'
    });
    
    setScrollPosition(scrollTo);
  };
  
  const handleScroll = () => {
    if (!carouselRef.current) return;
    setScrollPosition(carouselRef.current.scrollLeft);
  };
  
  const showLeftArrow = scrollPosition > 0;
  const showRightArrow = carouselRef.current 
    ? scrollPosition < carouselRef.current.scrollWidth - carouselRef.current.clientWidth - 10 
    : true;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-black">Shop by Category</h2>
            <p className="text-black/70 mt-2">Browse our curated collection of unique products</p>
          </div>
          
          <Link 
            href="/categories" 
            className="text-black font-medium hover:underline hidden md:block"
          >
            View All Categories
          </Link>
        </div>
        
        {/* Mobile Grid View */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:hidden">
          {categories.slice(0, 6).map((category) => (
            <Link 
              key={category.id} 
              href={`/category/${category.slug}`}
              className="group"
            >
              <div className="relative h-40 rounded-lg overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 w-full">
                  <h3 className="text-white font-semibold">{category.name}</h3>
                  <p className="text-white/80 text-xs">{category.productCount} Products</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Desktop Carousel View */}
        <div className="relative hidden md:block">
          {showLeftArrow && (
            <button 
              onClick={() => scroll('left')} 
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors -ml-4"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-6 w-6 text-black" />
            </button>
          )}
          
          <div
            ref={carouselRef}
            className="flex overflow-x-auto scrollbar-hide snap-x space-x-6 py-4 px-2"
            onScroll={handleScroll}
          >
            {categories.map((category) => (
              <Link 
                key={category.id} 
                href={`/category/${category.slug}`}
                className="shrink-0 w-[280px] group snap-start"
              >
                <div className="bg-white rounded-xl overflow-hidden border border-black/10 group-hover:shadow-md transition-all duration-300 h-full">
                  <div className="relative h-48">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="280px"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-black group-hover:text-black/80 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-black/60 text-sm mt-1">{category.description}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-sm font-medium text-black/70">{category.productCount} Products</span>
                      <span className="text-black text-sm font-medium group-hover:underline">
                        Browse
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {showRightArrow && (
            <button 
              onClick={() => scroll('right')} 
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors -mr-4"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-6 w-6 text-black" />
            </button>
          )}
        </div>
        
        {/* Mobile View All Button */}
        <div className="flex justify-center mt-8 md:hidden">
          <Link 
            href="/categories" 
            className="bg-black/10 text-black px-6 py-2.5 rounded-lg font-medium hover:bg-black/20 transition-colors"
          >
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  );
} 