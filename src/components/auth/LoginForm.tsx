'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { login, verifyLoginOTP } from '@/lib/authApi';
import { useAuth } from '@/context/AuthContext';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requireOtp, setRequireOtp] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  
  const router = useRouter();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (!requireOtp) {
        // Initial login step
        const response = await login({ email, password });
        
        if (response.requireOTP) {
          // OTP verification required
          setRequireOtp(true);
          setUserId(response.userId || null);
          console.log('OTP required for login');
        } else {
          // Login successful
          authLogin(response.accessToken, response.user);
          router.push('/'); // Redirect to home page
        }
      } else {
        // OTP verification step
        if (!otp) {
          setError('Please enter the verification code');
          setLoading(false);
          return;
        }
        
        const response = await verifyLoginOTP(email, otp, rememberMe);
        authLogin(response.accessToken, response.user);
        router.push('/'); // Redirect to home page
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-card rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {requireOtp ? 'Enter Verification Code' : 'Login to Your Account'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {!requireOtp ? (
          // Initial login form
          <>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-input rounded-md bg-background"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-input rounded-md bg-background"
                required
              />
            </div>
            
            <div className="flex items-center mb-6">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm">
                Remember me
              </label>
            </div>
          </>
        ) : (
          // OTP verification form
          <div className="mb-6">
            <label htmlFor="otp" className="block text-sm font-medium mb-1">
              Verification Code
            </label>
            <p className="text-sm text-muted-foreground mb-2">
              Please enter the verification code sent to your email
            </p>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 border border-input rounded-md bg-background"
              required
              autoFocus
            />
          </div>
        )}
        
        <button
          type="submit"
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
          disabled={loading}
        >
          {loading 
            ? 'Please wait...' 
            : requireOtp 
              ? 'Verify' 
              : 'Login'
          }
        </button>
      </form>
    </div>
  );
} 