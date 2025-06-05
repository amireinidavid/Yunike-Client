import { Suspense } from "react";

// Import all home page sections
import HeroSection from "@/components/home/HeroSection";
import SearchSection from "@/components/home/SearchSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedProductsSection from "@/components/home/FeaturedProductsSection";
import FlashSalesSection from "@/components/home/FlashSalesSection";
import RecommendationsSection from "@/components/home/RecommendationsSection";
import VendorSection from "@/components/home/VendorSection";
import BlogSection from "@/components/home/BlogSection";
import NewsletterSection from "@/components/home/NewsletterSection";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<div>Loading hero...</div>}>
        <HeroSection />
      </Suspense>
      
      <Suspense fallback={<div>Loading search...</div>}>
        <SearchSection />
      </Suspense>
      
      <Suspense fallback={<div>Loading categories...</div>}>
        <CategoriesSection />
      </Suspense>
      
      <Suspense fallback={<div>Loading featured products...</div>}>
        <FeaturedProductsSection />
      </Suspense>
      
      <Suspense fallback={<div>Loading flash sales...</div>}>
        <FlashSalesSection />
      </Suspense>
      
      <Suspense fallback={<div>Loading recommendations...</div>}>
        <RecommendationsSection />
      </Suspense>
      
      <Suspense fallback={<div>Loading vendors...</div>}>
        <VendorSection />
      </Suspense>
      
      <Suspense fallback={<div>Loading blog...</div>}>
        <BlogSection />
      </Suspense>
      
      <Suspense fallback={<div>Loading newsletter...</div>}>
        <NewsletterSection />
      </Suspense>
    </div>
  );
}
