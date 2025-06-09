'use client';

import { useEffect, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

// Routes that don't require authentication
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

interface AuthCheckProps {
  children: ReactNode;
}

/**
 * AuthCheck is now a lightweight wrapper that leverages the AuthProvider context
 * It's kept for backwards compatibility and page-level auth requirements
 */
export default function AuthCheck({ children }: AuthCheckProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  
  // If this is a public route, render immediately
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }
  
  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If not authenticated, the AuthProvider should have already redirected
  // This is just a safety net
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to access this page</p>
        </div>
      </div>
    );
  }
  
  // Authenticated, render children
  return <>{children}</>;
} 