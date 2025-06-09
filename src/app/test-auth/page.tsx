"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { isJwtExpired } from "@/utils/jwt";
import { refreshAccessTokenManually } from "@/utils/authInitializer";
import TokenInfoPanel from "./token-info";

export default function TestAuthPage() {
  const { refreshTokenManually, isAuthenticated, user } = useAuth();
  const [refreshResult, setRefreshResult] = useState<string | null>(null);
  const [tokenStatus, setTokenStatus] = useState<any>(null);
  
  // Check all token locations and their status
  const checkTokenStatus = () => {
    // Check localStorage tokens
    const localStorageToken = localStorage.getItem('accessToken');
    const refreshTokenValue = localStorage.getItem('refreshToken');
    
    // Check cookie tokens (non-httpOnly cookies can be read by JS)
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    const status = {
      localStorage: {
        accessToken: localStorageToken ? '✅ Present' : '❌ Missing',
        refreshToken: refreshTokenValue ? '✅ Present' : '❌ Missing',
      },
      cookies: {
        accessToken: cookies.accessToken ? '✅ Present' : '❌ Missing',
        refreshToken: cookies.refreshToken ? '✅ Present' : '❌ Missing',
      },
      jwtStatus: localStorageToken 
        ? (isJwtExpired(localStorageToken) ? '⚠️ Expired' : '✅ Valid') 
        : '❌ No token',
      isAuthenticated: isAuthenticated ? '✅ Yes' : '❌ No',
      hasUser: user ? '✅ Yes' : '❌ No',
    };
    
    console.log('🔍 Token Status:', status);
    setTokenStatus(status);
    return status;
  };
  
  // Test token refresh using AuthProvider
  const testAuthProviderRefresh = async () => {
    setRefreshResult("⏳ Testing auth provider refresh...");
    try {
      const result = await refreshTokenManually();
      setRefreshResult(result ? "✅ Auth provider refresh successful" : "❌ Auth provider refresh failed");
      checkTokenStatus();
    } catch (error) {
      console.error("Error refreshing token:", error);
      setRefreshResult(`❌ Error: ${error}`);
    }
  };
  
  // Test token refresh using direct method
  const testDirectRefresh = async () => {
    setRefreshResult("⏳ Testing direct refresh...");
    try {
      const result = await refreshAccessTokenManually();
      setRefreshResult(result ? "✅ Direct refresh successful" : "❌ Direct refresh failed");
      checkTokenStatus();
    } catch (error) {
      console.error("Error refreshing token:", error);
      setRefreshResult(`❌ Error: ${error}`);
    }
  };
  
  // Simulate an expired token
  const simulateExpiredToken = () => {
    // This doesn't actually delete the token, just replaces it with an expired one
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ';
    localStorage.setItem('accessToken', expiredToken);
    setRefreshResult("⚠️ Replaced token with expired one");
    checkTokenStatus();
  };
  
  // Delete access token from localStorage only
  const deleteLocalStorageToken = () => {
    localStorage.removeItem('accessToken');
    setRefreshResult("⚠️ Deleted access token from localStorage");
    checkTokenStatus();
  };
  
  // Delete access token cookie only
  const deleteCookieToken = () => {
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setRefreshResult("⚠️ Deleted access token cookie");
    checkTokenStatus();
  };
  
  return (
    <div className="container mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test Tools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Button onClick={checkTokenStatus}>
              Check Token Status
            </Button>
            <Button onClick={testAuthProviderRefresh}>
              Test Auth Provider Refresh
            </Button>
            <Button onClick={testDirectRefresh}>
              Test Direct Refresh
            </Button>
            <Button onClick={simulateExpiredToken} variant="outline">
              Simulate Expired Token
            </Button>
            <Button onClick={deleteLocalStorageToken} variant="outline">
              Delete localStorage Token
            </Button>
            <Button onClick={deleteCookieToken} variant="outline">
              Delete Cookie Token
            </Button>
          </div>
          
          {refreshResult && (
            <div className="p-4 bg-muted rounded-md">
              <p className="font-mono">{refreshResult}</p>
            </div>
          )}
          
          {tokenStatus && (
            <div className="p-4 bg-muted rounded-md space-y-2">
              <h3 className="font-medium">Token Status:</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="font-medium">localStorage:</p>
                  <p>Access Token: {tokenStatus.localStorage.accessToken}</p>
                  <p>Refresh Token: {tokenStatus.localStorage.refreshToken}</p>
                </div>
                <div>
                  <p className="font-medium">Cookies:</p>
                  <p>Access Token: {tokenStatus.cookies.accessToken}</p>
                  <p>Refresh Token: {tokenStatus.cookies.refreshToken}</p>
                </div>
              </div>
              <div>
                <p>JWT Status: {tokenStatus.jwtStatus}</p>
                <p>Is Authenticated: {tokenStatus.isAuthenticated}</p>
                <p>Has User: {tokenStatus.hasUser}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <TokenInfoPanel />
      
      <div className="mt-8 pt-4">
        <Link href="/" className="text-primary hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
} 