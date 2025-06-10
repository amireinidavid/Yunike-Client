'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { vendors, testimonials } from '@/lib/mock-data';

export default function VendorSection() {
  const [activeTab, setActiveTab] = useState('vendors'); // 'vendors' or 'testimonials'
  const [activeFeaturedVendor, setActiveFeaturedVendor] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
  const nextVendor = () => {
    setActiveFeaturedVendor((prev) => (prev === vendors.length - 1 ? 0 : prev + 1));
  };

  const prevVendor = () => {
    setActiveFeaturedVendor((prev) => (prev === 0 ? vendors.length - 1 : prev - 1));
  };
  
  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center">Our Community</h2>
          <p className="text-muted-foreground mt-2 text-center max-w-2xl">
            Discover the talented sellers behind our products and hear from our happy customers
          </p>
          
          {/* Tabs */}
          <div className="flex space-x-1 mt-6 bg-card p-1 rounded-lg">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'vendors'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              }`}
              onClick={() => setActiveTab('vendors')}
            >
              Featured Sellers
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'testimonials'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              }`}
              onClick={() => setActiveTab('testimonials')}
            >
              Customer Reviews
            </button>
          </div>
        </div>
        
        {/* Featured Vendors */}
        {activeTab === 'vendors' && (
          <div className="relative">
            <div className="max-w-4xl mx-auto">
              {vendors.map((vendor, index) => (
                <div 
                  key={vendor.id}
                  className={`${index === activeFeaturedVendor ? 'block' : 'hidden'}`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="relative h-80 rounded-xl overflow-hidden border border-border">
                      <Image
                        src={vendor.logo}
                        alt={vendor.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    
                    <div className="bg-card p-6 rounded-xl border border-border">
                      <div className="flex items-center mb-4">
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-5 w-5 ${i < Math.floor(vendor.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-muted-foreground text-sm">
                          {vendor.rating.toFixed(1)}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-2">{vendor.name}</h3>
                      <p className="text-muted-foreground mb-4">{vendor.description}</p>
                      
                      <div className="flex flex-wrap gap-3 mb-6">
                        <div className="bg-muted py-1 px-3 rounded text-xs">
                          {vendor.productCount} Products
                        </div>
                        {vendor.featured && (
                          <div className="bg-primary/10 text-primary py-1 px-3 rounded text-xs">
                            Featured Seller
                          </div>
                        )}
                      </div>
                      
                      <Link 
                        href={`/vendor/${vendor.id}`}
                        className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                      >
                        Visit Store
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Navigation Arrows */}
            <button 
              onClick={prevVendor} 
              className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-md hover:bg-muted transition-colors -ml-4 md:-ml-6"
              aria-label="Previous vendor"
            >
              <ChevronLeft className="h-6 w-6 text-foreground" />
            </button>
            <button 
              onClick={nextVendor} 
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-md hover:bg-muted transition-colors -mr-4 md:-mr-6"
              aria-label="Next vendor"
            >
              <ChevronRight className="h-6 w-6 text-foreground" />
            </button>
            
            {/* Dots */}
            <div className="flex justify-center mt-6 space-x-2">
              {vendors.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFeaturedVendor(index)}
                  className={`w-2.5 h-2.5 rounded-full ${
                    index === activeFeaturedVendor ? 'bg-primary' : 'bg-border'
                  }`}
                  aria-label={`Go to vendor ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Customer Testimonials */}
        {activeTab === 'testimonials' && (
          <div className="relative">
            <div className="max-w-3xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={testimonial.id}
                  className={`${index === activeTestimonial ? 'block' : 'hidden'}`}
                >
                  <div className="bg-card p-8 rounded-xl border border-border relative">
                    <div className="absolute top-6 left-6 text-primary/20">
                      <Quote className="h-16 w-16 rotate-180" />
                    </div>
                    
                    <div className="text-center relative z-10">
                      <div className="w-20 h-20 mx-auto mb-4 relative rounded-full overflow-hidden border-4 border-background">
                        <Image
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      
                      <div className="flex justify-center space-x-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      
                      <p className="text-lg font-medium mb-6 italic">
                        "{testimonial.comment}"
                      </p>
                      
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">Customer since {testimonial.date}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Navigation Arrows */}
            <button 
              onClick={prevTestimonial} 
              className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-md hover:bg-muted transition-colors -ml-4 md:-ml-6"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-6 w-6 text-foreground" />
            </button>
            <button 
              onClick={nextTestimonial} 
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-md hover:bg-muted transition-colors -mr-4 md:-mr-6"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-6 w-6 text-foreground" />
            </button>
            
            {/* Dots */}
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2.5 h-2.5 rounded-full ${
                    index === activeTestimonial ? 'bg-primary' : 'bg-border'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
} 