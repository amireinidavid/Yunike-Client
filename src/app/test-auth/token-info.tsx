"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function decodeJwt(token: string | null) {
  if (!token) return null;
  
  try {
    const [header, payload, signature] = token.split('.');
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

function formatDate(timestamp: number) {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp * 1000); // JWT exp is in seconds
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'long'
  }).format(date);
}

function getTimeRemaining(expiryTimestamp: number) {
  if (!expiryTimestamp) return "Expired";
  
  const now = Math.floor(Date.now() / 1000); // Current time in seconds
  const remaining = expiryTimestamp - now;
  
  if (remaining <= 0) return "Expired";
  
  // Convert to days, hours, minutes, seconds
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

export default function TokenInfoPanel() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [decodedAccess, setDecodedAccess] = useState<any>(null);
  const [decodedRefresh, setDecodedRefresh] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [refreshTimeRemaining, setRefreshTimeRemaining] = useState<string>("");
  
  useEffect(() => {
    // Get tokens from localStorage
    const accessFromStorage = localStorage.getItem('accessToken');
    const refreshFromStorage = localStorage.getItem('refreshToken');
    
    setAccessToken(accessFromStorage);
    setRefreshToken(refreshFromStorage);
    
    if (accessFromStorage) {
      const decoded = decodeJwt(accessFromStorage);
      setDecodedAccess(decoded);
    }
    
    if (refreshFromStorage) {
      const decoded = decodeJwt(refreshFromStorage);
      setDecodedRefresh(decoded);
    }
    
    // Update remaining time every second
    const timer = setInterval(() => {
      if (decodedAccess?.exp) {
        setTimeRemaining(getTimeRemaining(decodedAccess.exp));
      }
      
      if (decodedRefresh?.exp) {
        setRefreshTimeRemaining(getTimeRemaining(decodedRefresh.exp));
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [decodedAccess?.exp, decodedRefresh?.exp]);
  
  const refreshTokenData = () => {
    // Get tokens from localStorage
    const accessFromStorage = localStorage.getItem('accessToken');
    const refreshFromStorage = localStorage.getItem('refreshToken');
    
    setAccessToken(accessFromStorage);
    setRefreshToken(refreshFromStorage);
    
    if (accessFromStorage) {
      const decoded = decodeJwt(accessFromStorage);
      setDecodedAccess(decoded);
    } else {
      setDecodedAccess(null);
    }
    
    if (refreshFromStorage) {
      const decoded = decodeJwt(refreshFromStorage);
      setDecodedRefresh(decoded);
    } else {
      setDecodedRefresh(null);
    }
  };
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>JWT Token Information</span>
          <Button variant="outline" size="sm" onClick={refreshTokenData}>Refresh Data</Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium text-xl">Access Token</h3>
          {decodedAccess ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="font-medium">Subject (sub):</div>
                <div>{decodedAccess.sub || "N/A"}</div>
                
                <div className="font-medium">Issued At (iat):</div>
                <div>{formatDate(decodedAccess.iat)}</div>
                
                <div className="font-medium">Expiration (exp):</div>
                <div>{formatDate(decodedAccess.exp)}</div>
                
                <div className="font-medium">Time Remaining:</div>
                <div className={`font-mono ${timeRemaining === "Expired" ? "text-red-500" : ""}`}>
                  {timeRemaining}
                </div>
              </div>
              
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  Show full payload
                </summary>
                <pre className="text-xs bg-muted p-2 rounded-md mt-2 overflow-auto max-h-60">
                  {JSON.stringify(decodedAccess, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <div className="text-muted-foreground">No access token found or token is invalid</div>
          )}
        </div>
        
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium text-xl">Refresh Token</h3>
          {decodedRefresh ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="font-medium">Subject (sub):</div>
                <div>{decodedRefresh.sub || "N/A"}</div>
                
                <div className="font-medium">Issued At (iat):</div>
                <div>{formatDate(decodedRefresh.iat)}</div>
                
                <div className="font-medium">Expiration (exp):</div>
                <div>{formatDate(decodedRefresh.exp)}</div>
                
                <div className="font-medium">Time Remaining:</div>
                <div className={`font-mono ${refreshTimeRemaining === "Expired" ? "text-red-500" : ""}`}>
                  {refreshTimeRemaining}
                </div>
              </div>
              
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  Show full payload
                </summary>
                <pre className="text-xs bg-muted p-2 rounded-md mt-2 overflow-auto max-h-60">
                  {JSON.stringify(decodedRefresh, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <div className="text-muted-foreground">No refresh token found or token is invalid</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 