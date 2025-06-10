'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Bell, User, ShoppingCart, ChevronDown, Menu, X, LogOut, Heart } from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';
import useCartStore from '@/store/useCartStore';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState(0);
  
  // Auth store
  const { user, isAuthenticated, clearState } = useAuthStore();
  
  // Cart store
  const { cart, getItemCount } = useCartStore();

  // Update cart item count when cart changes
  useEffect(() => {
    setCartItems(getItemCount());
  }, [cart, getItemCount]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Handle user logout
  const handleLogout = () => {
    clearState();
  };

  return (
    <header className={`w-full ${isScrolled ? 'sticky top-0 shadow-md bg-background/95 backdrop-blur-sm' : 'bg-background'} z-50 transition-all duration-300`}>
      {/* Top Row */}
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <div className="w-12 h-12 relative mr-3 bg-primary rounded-full flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-bold text-2xl">Y</span>
          </div>
          <span className="text-foreground font-bold text-2xl hidden sm:block">Yunike</span>
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex relative max-w-md w-full mx-4">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full py-3 pl-12 pr-4 rounded-full border border-input focus:outline-none focus:ring-2 focus:ring-ring bg-muted text-base"
          />
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
        </div>

        {/* Right Icons */}
        <div className="flex items-center space-x-5">
          <button className="relative p-2 rounded-full hover:bg-accent/10 transition-colors">
            <Bell className="h-6 w-6 text-foreground" />
            <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-accent rounded-full ring-2 ring-background"></span>
          </button>
          
          <div className="relative group">
            {isAuthenticated && user ? (
              <button className="flex items-center p-1.5 rounded-full hover:bg-accent/10 transition-colors">
                {user.profileImageUrl ? (
                  <Image 
                    src={user.profileImageUrl} 
                    alt={user.name || user.email}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                    <span className="font-medium text-sm">{user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </button>
            ) : (
              <button className="p-2 rounded-full hover:bg-accent/10 transition-colors">
              <User className="h-6 w-6 text-foreground" />
            </button>
            )}
            
            <div className="absolute right-0 mt-2 w-72 rounded-lg shadow-lg py-2 bg-background border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              {isAuthenticated && user ? (
                <>
                  <div className="px-4 py-3 border-b border-border">
                    <div className="flex items-center space-x-3">
                      {user.profileImageUrl ? (
                        <Image 
                          src={user.profileImageUrl} 
                          alt={user.name || user.email}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                          <span className="font-medium">{user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{user.name || 'User'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <Link href="/account" className="flex items-center px-4 py-2.5 text-base hover:bg-muted transition-colors">
                    <User className="h-5 w-5 mr-3" />
                    My Account
                  </Link>
                  <Link href="/wishlist" className="flex items-center px-4 py-2.5 text-base hover:bg-muted transition-colors">
                    <Heart className="h-5 w-5 mr-3" />
                    Wishlist
                  </Link>
                  <Link href="/orders" className="flex items-center px-4 py-2.5 text-base hover:bg-muted transition-colors">
                    <ShoppingCart className="h-5 w-5 mr-3" />
                    Orders
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="flex w-full items-center px-4 py-2.5 text-base hover:bg-muted transition-colors text-red-500"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block px-4 py-2.5 text-base hover:bg-muted transition-colors">Login</Link>
                  <Link href="/register" className="block px-4 py-2.5 text-base hover:bg-muted transition-colors">Sign Up</Link>
                </>
              )}
            </div>
          </div>
          <Link href="/cart">
          <button className="relative p-2 rounded-full hover:bg-accent/10 transition-colors">
            <ShoppingCart className="h-6 w-6 text-foreground" />
            {cartItems > 0 && (
              <span className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center bg-accent text-accent-foreground text-xs font-bold rounded-full shadow-sm">
                {cartItems}
              </span>
            )}
          </button>
          </Link>

          <button 
            className="md:hidden p-2 rounded-full hover:bg-muted transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Menu - Desktop */}
      <nav className="hidden md:block border-t border-border">
        <div className="container mx-auto px-4">
          <ul className="flex space-x-10 py-4">
            <li>
              <Link href="/" className="text-foreground hover:text-accent transition-colors font-medium text-base">
                Home
              </Link>
            </li>
            <li>
              <Link href="/shop" className="text-foreground hover:text-accent transition-colors font-medium text-base">
                Shop
              </Link>
            </li>
            <li className="relative group">
              <button className="flex items-center text-foreground hover:text-accent transition-colors font-medium text-base">
                Categories
                <ChevronDown className="ml-1.5 h-4 w-4" />
              </button>
              <div className="absolute left-0 mt-2 w-64 rounded-lg shadow-lg py-2 bg-card border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <Link href="/category/clothing" className="block px-5 py-2.5 text-base hover:bg-muted hover:text-accent transition-colors">Clothing</Link>
                <Link href="/category/electronics" className="block px-5 py-2.5 text-base hover:bg-muted hover:text-accent transition-colors">Electronics</Link>
                <Link href="/category/home" className="block px-5 py-2.5 text-base hover:bg-muted hover:text-accent transition-colors">Home & Living</Link>
                <Link href="/category/beauty" className="block px-5 py-2.5 text-base hover:bg-muted hover:text-accent transition-colors">Beauty & Health</Link>
              </div>
            </li>
            <li>
              <Link href="/deals" className="text-foreground hover:text-accent transition-colors font-medium text-base">
                Deals
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-foreground hover:text-accent transition-colors font-medium text-base">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-foreground hover:text-accent transition-colors font-medium text-base">
                About
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`md:hidden fixed inset-0 bg-background z-50 transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Close button positioned at the top right */}
        <button 
          onClick={() => setIsMenuOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors z-50"
          aria-label="Close menu"
        >
          <X className="h-6 w-6 text-foreground" />
        </button>
        
        <div className="flex flex-col h-full p-6 pt-20">
          <div className="relative mb-8">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full py-3 pl-12 pr-4 rounded-full border border-input focus:outline-none focus:ring-2 focus:ring-ring bg-muted text-base"
            />
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
          </div>
          
          <nav className="flex-1">
            <ul className="space-y-6">
              <li>
                <Link 
                  href="/" 
                  className="block text-xl font-medium hover:text-accent transition-colors" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/shop" 
                  className="block text-xl font-medium hover:text-accent transition-colors" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Shop
                </Link>
              </li>
              <li>
                <details className="group">
                  <summary className="list-none flex items-center justify-between text-xl font-medium cursor-pointer hover:text-accent transition-colors">
                    Categories
                    <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
                  </summary>
                  <ul className="mt-4 ml-4 space-y-3">
                    <li>
                      <Link 
                        href="/category/clothing" 
                        className="block py-1 text-lg hover:text-accent transition-colors" 
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Clothing
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/category/electronics" 
                        className="block py-1 text-lg hover:text-accent transition-colors" 
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Electronics
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/category/home" 
                        className="block py-1 text-lg hover:text-accent transition-colors" 
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Home & Living
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/category/beauty" 
                        className="block py-1 text-lg hover:text-accent transition-colors" 
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Beauty & Health
                      </Link>
                    </li>
                  </ul>
                </details>
              </li>
              <li>
                <Link 
                  href="/deals" 
                  className="block text-xl font-medium hover:text-accent transition-colors" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Deals
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="block text-xl font-medium hover:text-accent transition-colors" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="block text-xl font-medium hover:text-accent transition-colors" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  href="/become-a-seller"
                  className="block text-xl font-medium hover:text-accent transition-colors" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Become a Seller
                </Link>
              </li>
            </ul>
          </nav>
          
          <div className="border-t border-border pt-6 mt-6">
            {isAuthenticated && user ? (
              <div className="space-y-4">
                {/* User profile section */}
                <div className="flex items-center mb-6">
                  {user.profileImageUrl ? (
                    <Image 
                      src={user.profileImageUrl} 
                      alt={user.name || user.email}
                      width={48}
                      height={48}
                      className="rounded-full object-cover mr-3"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mr-3">
                      <span className="font-medium">{user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-lg">{user.name || 'User'}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Link 
                  href="/account" 
                  className="flex items-center py-2.5 text-lg font-medium hover:text-accent transition-colors" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-5 w-5 mr-3" />
                  My Account
                </Link>
                <Link 
                  href="/wishlist" 
                  className="flex items-center py-2.5 text-lg font-medium hover:text-accent transition-colors" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="h-5 w-5 mr-3" />
                  Wishlist
                </Link>
                <Link 
                  href="/orders" 
                  className="flex items-center py-2.5 text-lg font-medium hover:text-accent transition-colors" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCart className="h-5 w-5 mr-3" />
                  Orders
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full py-2.5 text-lg font-medium text-red-500 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <Link 
                  href="/login" 
                  className="block w-full py-3 text-center rounded-lg bg-primary text-primary-foreground font-medium text-lg shadow-sm hover:bg-primary/90 transition-colors" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="block w-full py-3 text-center rounded-lg border-2 border-accent text-accent font-medium text-lg hover:bg-accent/10 transition-colors" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 