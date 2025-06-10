/**
 * Cart Token Utilities
 * 
 * This file provides utilities for managing cart tokens
 * which are JWT tokens used for identifying guest carts.
 */
import jwt from 'jsonwebtoken';

// Constants for token storage
const CART_TOKEN_KEY = 'cartToken';

/**
 * Generate a cart token for a specific cart ID
 * 
 * @param cartId The cart ID to include in the token
 * @returns JWT token string
 */
export function generateCartToken(cartId: string): string {
  // Use a lightweight payload with cart ID and timestamp
  const payload = {
    cartId,
    issuedAt: Date.now()
  };
  
  // Generate a signed token using a secret
  // In production, this would typically happen server-side
  // Here we use a simple implementation for the client
  const secret = process.env.NEXT_PUBLIC_CART_TOKEN_SECRET || 'cart-token-secret';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

/**
 * Save cart token to localStorage
 * 
 * @param token JWT token for the cart
 */
export function saveCartToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CART_TOKEN_KEY, token);
  }
}

/**
 * Get the stored cart token from localStorage
 * 
 * @returns Cart token or null if not found
 */
export function getCartToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(CART_TOKEN_KEY);
  }
  return null;
}

/**
 * Remove the cart token from localStorage
 */
export function removeCartToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CART_TOKEN_KEY);
  }
}

/**
 * Parse and verify a cart token
 * 
 * @param token Cart JWT token
 * @returns Decoded token payload or null if invalid
 */
export function decodeCartToken(token: string): { cartId: string; issuedAt: number } | null {
  try {
    const secret = process.env.NEXT_PUBLIC_CART_TOKEN_SECRET || 'cart-token-secret';
    return jwt.verify(token, secret) as { cartId: string; issuedAt: number };
  } catch (error) {
    console.error('Invalid cart token:', error);
    return null;
  }
}

/**
 * Helper function to create a cart token header for API requests
 */
export function getCartAuthHeader(): Record<string, string> {
  const token = getCartToken();
  if (token) {
    return { 'X-Cart-Authorization': token };
  }
  return {};
} 