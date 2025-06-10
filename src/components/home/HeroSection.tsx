'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  
  const slides = [
    {
      heading: "Discover Unique Products from Independent Sellers",
      subheading: "Shop from a curated collection of handpicked items and support small businesses",
      cta: "Shop Now",
      ctaLink: "/shop",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1799&auto=format&fit=crop",
      alt: "Featured product display"
    },
    {
      heading: "New Season, New Style",
      subheading: "Explore our latest collections for summer with exclusive deals",
      cta: "View Collection",
      ctaLink: "/category/clothing",
      image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=1740&auto=format&fit=crop",
      alt: "Summer collection showcase"
    },
    {
      heading: "Handcrafted with Love",
      subheading: "Unique home decor items made by skilled artisans around the world",
      cta: "Discover More",
      ctaLink: "/category/home",
      image: "https://images.unsplash.com/photo-1631125915902-d8abe9225ff2?q=80&w=1587&auto=format&fit=crop",
      alt: "Handcrafted home decor items"
    }
  ];

  const nextSlide = () => {
    setActiveSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setActiveSlide(index);
  };

  // Auto-rotate slides every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentSlide = slides[activeSlide];

  return (
    <section className="relative bg-background overflow-hidden">
      <div className="container mx-auto px-4 py-16 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <motion.div 
            className="space-y-7 max-w-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block bg-primary-foreground/20 text-black px-4 py-1.5 rounded-full text-sm font-medium">
              Premium Quality
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight">
              {currentSlide.heading}
            </h1>
            <p className="text-lg text-black/80">
              {currentSlide.subheading}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href={currentSlide.ctaLink}
                className="inline-flex items-center bg-primary-foreground text-black px-6 py-3 rounded-md font-medium hover:bg-primary-foreground/90 transition-colors"
              >
                {currentSlide.cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link 
                href="/become-a-seller"
                className="inline-flex items-center bg-transparent text-black border border-black/30 px-6 py-3 rounded-md font-medium hover:bg-black/10 transition-colors"
              >
                Become a Seller
              </Link>
            </div>
            
            {/* Dots Indicator */}
            <div className="flex space-x-3 mt-8">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === activeSlide 
                      ? "bg-black w-8" 
                      : "bg-black/30 hover:bg-black/50"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </motion.div>
          
          {/* Hero Image */}
          <motion.div 
            className="relative h-[400px] lg:h-[550px] rounded-md overflow-hidden shadow-2xl"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Image
              src={currentSlide.image}
              alt={currentSlide.alt}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
          </motion.div>
        </div>
      </div>
      
      {/* Minimal Decorative Elements */}
      <div className="absolute top-0 right-0 w-full h-1/3 bg-gradient-to-b from-black/5 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-black/10" />
    </section>
  );
}