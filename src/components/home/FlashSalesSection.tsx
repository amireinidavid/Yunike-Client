'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { flashSales } from '@/lib/mock-data';

export default function FlashSalesSection() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const endTime = new Date(flashSales.endTime).getTime();
      const now = new Date().getTime();
      const difference = endTime - now;
      
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        // Sale has ended
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatTime = (time: number) => {
    return time < 10 ? `0${time}` : time;
  };
  
  return (
    <section className="py-16 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" style={{ 
          backgroundImage: 'radial-gradient(circle, var(--primary) 1px, transparent 1px)',
          backgroundSize: '30px 30px' 
        }} />
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="bg-primary/10 rounded-2xl px-6 py-8 mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <div className="inline-block bg-primary text-primary-foreground px-3 py-1 text-sm font-medium rounded-full mb-3">
                Limited Time Offer
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Flash Sale</h2>
              <p className="text-muted-foreground mt-2">Amazing discounts on top products. Hurry before they're gone!</p>
            </div>
            
            {/* Countdown Timer */}
            <div className="mt-6 md:mt-0">
              <div className="flex space-x-3">
                <div className="flex flex-col items-center">
                  <div className="bg-card w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold shadow-sm">
                    {formatTime(timeLeft.hours)}
                  </div>
                  <span className="text-xs mt-1 text-muted-foreground">Hours</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-card w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold shadow-sm">
                    {formatTime(timeLeft.minutes)}
                  </div>
                  <span className="text-xs mt-1 text-muted-foreground">Minutes</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-card w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold shadow-sm">
                    {formatTime(timeLeft.seconds)}
                  </div>
                  <span className="text-xs mt-1 text-muted-foreground">Seconds</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashSales.products.map(product => (
            <div key={product.id} className="relative">
              <ProductCard
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
              
              {/* Stock Indicator */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {product.stockRemaining} of {product.totalStock} left
                  </span>
                  <span className={`font-medium ${product.stockRemaining < 10 ? 'text-red-500' : 'text-primary'}`}>
                    {Math.round((product.stockRemaining / product.totalStock) * 100)}% left
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full mt-1 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${product.stockRemaining < 10 ? 'bg-red-500' : 'bg-primary'}`}
                    style={{ width: `${(product.stockRemaining / product.totalStock) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* View All Link */}
        <div className="flex justify-center mt-12">
          <Link 
            href="/flash-sales" 
            className="inline-flex items-center bg-primary/10 text-primary px-6 py-3 rounded-lg font-medium hover:bg-primary/20 transition-colors"
          >
            View All Flash Sales
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  );
} 