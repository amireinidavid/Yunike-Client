'use client';

import { useState } from 'react';
import { Mail, Check, AlertCircle } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Simulate API call
    setLoading(true);
    
    setTimeout(() => {
      // This would be an API call in a real application
      console.log('Subscribed:', email);
      setSubscribed(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <section className="py-20 bg-black text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute right-0 top-0 w-1/3 h-full" style={{ 
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px' 
        }} />
        <div className="absolute left-0 bottom-0 w-1/3 h-1/2" style={{ 
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px' 
        }} />
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block p-3 bg-white/10 rounded-full mb-6">
            <Mail className="h-8 w-8 text-white" />
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Stay in the Loop
          </h2>
          
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Subscribe to our newsletter to receive updates on new products, special offers, and exclusive discounts.
          </p>
          
          {!subscribed ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className={`w-full py-3 px-4 rounded-md border ${
                      error ? 'border-red-500' : 'border-white/20'
                    } focus:outline-none focus:ring-2 focus:ring-white/30 bg-white/5 text-white placeholder:text-white/50`}
                    disabled={loading}
                  />
                  {error && (
                    <div className="absolute -bottom-6 left-0 flex items-center text-xs text-red-400">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {error}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-white text-black py-3 px-6 rounded-md font-medium hover:bg-white/90 transition-colors disabled:opacity-70"
                  disabled={loading}
                >
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              
              <p className="text-xs text-white/50 mt-4">
                By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
              </p>
            </form>
          ) : (
            <div className="bg-white/10 text-white rounded-md p-6 max-w-md mx-auto border border-white/20">
              <div className="flex items-center justify-center mb-2">
                <div className="bg-white/20 p-1 rounded-full">
                  <Check className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="font-semibold mb-1">Thank you for subscribing!</h3>
              <p className="text-sm text-white/80">We've sent a confirmation email to <span className="font-medium">{email}</span>.</p>
            </div>
          )}
        </div>
        
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white/5 p-6 rounded-md border border-white/10 hover:bg-white/10 transition-colors">
            <h3 className="font-semibold mb-2">Early Access</h3>
            <p className="text-white/60 text-sm">
              Be the first to know about new product launches and exclusive early bird access.
            </p>
          </div>
          <div className="bg-white/5 p-6 rounded-md border border-white/10 hover:bg-white/10 transition-colors">
            <h3 className="font-semibold mb-2">Exclusive Discounts</h3>
            <p className="text-white/60 text-sm">
              Subscribers receive special offers and promotions not available to the general public.
            </p>
          </div>
          <div className="bg-white/5 p-6 rounded-md border border-white/10 hover:bg-white/10 transition-colors">
            <h3 className="font-semibold mb-2">Personalized Recommendations</h3>
            <p className="text-white/60 text-sm">
              Get tailored product suggestions based on your preferences and shopping habits.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 