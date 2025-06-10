'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { categories } from '@/lib/mock-data';

export default function SearchSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Mock popular searches
  const popularSearches = [
    'Wireless Headphones', 'Organic Skincare', 'Summer Dresses', 
    'Smart Home', 'Fitness Tracker', 'Handmade Jewelry'
  ];
  
  // Mock search suggestions based on input
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length > 1) {
      // In a real app, this would be an API call to a search service
      const mockSuggestions = popularSearches.filter(item => 
        item.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const categoryParam = selectedCategory ? `&category=${selectedCategory}` : '';
      router.push(`/search?q=${encodeURIComponent(searchQuery)}${categoryParam}`);
      setShowSuggestions(false);
    }
  };
  
  const selectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const toggleCategory = (categorySlug: string) => {
    if (selectedCategory === categorySlug) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categorySlug);
    }
  };

  return (
    <section className="py-10 bg-background border-y border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <div className="flex items-center relative">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  placeholder="What are you looking for today?"
                  className="w-full py-4 pl-12 pr-12 rounded-l-lg border border-r-0 border-border focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background text-foreground"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-muted text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-4 rounded-r-lg font-medium hover:bg-primary/90 transition-colors flex-shrink-0"
              >
                Search
              </button>
            </div>
            
            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                <ul>
                  {suggestions.map((suggestion, index) => (
                    <li key={index}>
                      <button
                        type="button"
                        onClick={() => selectSuggestion(suggestion)}
                        className="w-full text-left px-4 py-2 hover:bg-muted flex items-center"
                      >
                        <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{suggestion}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </form>
          
          {/* Category Pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.slice(0, 6).map((category) => (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.slug)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.slug
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          {/* Popular Searches */}
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-2">Popular searches:</p>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term, index) => (
                <button
                  key={index}
                  onClick={() => selectSuggestion(term)}
                  className="text-xs px-2 py-1 bg-background border border-border rounded hover:bg-muted transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 