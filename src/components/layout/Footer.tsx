'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ChevronRight } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="w-10 h-10 relative mr-2 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">Y</span>
              </div>
              <span className="text-foreground font-bold text-xl">Yunike</span>
            </div>
            <p className="text-muted-foreground">
              Discover unique products from independent sellers around the world, all in one place.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-muted hover:bg-accent/10 hover:text-accent transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-muted hover:bg-accent/10 hover:text-accent transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-muted hover:bg-accent/10 hover:text-accent transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-muted hover:bg-accent/10 hover:text-accent transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/shop" className="flex items-center text-muted-foreground hover:text-accent transition-colors">
                  <ChevronRight className="h-4 w-4 mr-2" />
                  <span>Shop All</span>
                </Link>
              </li>
              <li>
                <Link href="/deals" className="flex items-center text-muted-foreground hover:text-accent transition-colors">
                  <ChevronRight className="h-4 w-4 mr-2" />
                  <span>Deals & Promotions</span>
                </Link>
              </li>
              <li>
                <Link href="/become-a-seller" className="flex items-center text-muted-foreground hover:text-accent transition-colors">
                  <ChevronRight className="h-4 w-4 mr-2" />
                  <span>Become a Seller</span>
                </Link>
              </li>
              <li>
                <Link href="/shipping-info" className="flex items-center text-muted-foreground hover:text-accent transition-colors">
                  <ChevronRight className="h-4 w-4 mr-2" />
                  <span>Shipping Information</span>
                </Link>
              </li>
              <li>
                <Link href="/returns" className="flex items-center text-muted-foreground hover:text-accent transition-colors">
                  <ChevronRight className="h-4 w-4 mr-2" />
                  <span>Returns & Exchanges</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Categories</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/category/clothing" className="flex items-center text-muted-foreground hover:text-accent transition-colors">
                  <ChevronRight className="h-4 w-4 mr-2" />
                  <span>Clothing</span>
                </Link>
              </li>
              <li>
                <Link href="/category/electronics" className="flex items-center text-muted-foreground hover:text-accent transition-colors">
                  <ChevronRight className="h-4 w-4 mr-2" />
                  <span>Electronics</span>
                </Link>
              </li>
              <li>
                <Link href="/category/home" className="flex items-center text-muted-foreground hover:text-accent transition-colors">
                  <ChevronRight className="h-4 w-4 mr-2" />
                  <span>Home & Living</span>
                </Link>
              </li>
              <li>
                <Link href="/category/beauty" className="flex items-center text-muted-foreground hover:text-accent transition-colors">
                  <ChevronRight className="h-4 w-4 mr-2" />
                  <span>Beauty & Health</span>
                </Link>
              </li>
              <li>
                <Link href="/category/jewelry" className="flex items-center text-muted-foreground hover:text-accent transition-colors">
                  <ChevronRight className="h-4 w-4 mr-2" />
                  <span>Jewelry & Accessories</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-accent mt-0.5" />
                <span className="text-muted-foreground">
                  123 Commerce Street, Shopville, SV 12345
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-accent" />
                <a href="tel:+1234567890" className="text-muted-foreground hover:text-accent transition-colors">
                  (123) 456-7890
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-accent" />
                <a href="mailto:info@yunike.com" className="text-muted-foreground hover:text-accent transition-colors">
                  info@yunike.com
                </a>
              </li>
            </ul>
            
            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="font-medium mb-3">Subscribe to our newsletter</h4>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="flex-1 py-2 px-4 rounded-l-lg border border-input focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button className="bg-accent text-accent-foreground px-4 py-2 rounded-r-lg hover:bg-accent/90 transition-colors">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm mb-4 md:mb-0">
              © {currentYear} Yunike. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                Terms of Service
              </Link>
              <Link href="/sitemap" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                Sitemap
              </Link>
              <Link href="/accessibility" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 