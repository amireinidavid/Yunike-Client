'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, ShoppingBag } from 'lucide-react';
import useCheckOutStore from '@/store/useCheckOutStore';
import useCartStore from '@/store/useCartStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Extract session_id and order_ref from URL parameters
  // Handle both formats: /checkout?step=confirmation?session_id=... and /checkout/success?session_id=...
  const fullUrl = typeof window !== 'undefined' ? window.location.href : '';
  const sessionIdFromUrl = fullUrl.includes('session_id=') 
    ? fullUrl.split('session_id=')[1]?.split('&')[0] 
    : null;
  
  const sessionId = searchParams.get('session_id') || sessionIdFromUrl;
  const orderRef = searchParams.get('order_ref');
  
  const { getCheckoutStatus, isLoading, error, orderReference, shippingInfo } = useCheckOutStore();
  const { clearCart } = useCartStore();
  
  useEffect(() => {
    // If we have a session ID, fetch the checkout status
    if (sessionId) {
      getCheckoutStatus(sessionId).then(() => {
        // Clear cart after successful checkout
        clearCart();
      });
    } 
    // If no session ID but we have order ref, go to main checkout with confirmation
    else if (orderRef && !sessionId) {
      router.push('/checkout?step=confirmation');
      // Also clear cart in this case
      clearCart();
    }
    // No payment info, redirect to checkout
    else if (!sessionId && !orderRef) {
      router.push('/checkout');
    }
  }, [sessionId, orderRef, getCheckoutStatus, router, clearCart]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-slate-200 mb-4"></div>
          <div className="h-8 w-64 bg-slate-200 rounded mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg">
        <Card className="border-red-100">
          <CardHeader className="bg-red-50 border-b border-red-100">
            <CardTitle className="text-red-700">Payment Verification Failed</CardTitle>
            <CardDescription className="text-red-600">
              We encountered a problem verifying your payment
            </CardDescription>
          </CardHeader>
          <CardContent className="py-6">
            <p className="text-slate-600 mb-4">
              There was an issue confirming your payment details. This could be temporary or may require additional action.
            </p>
            <p className="mb-6 text-slate-700 font-medium">
              Error details: {error}
            </p>
            <p className="text-sm text-slate-500">
              If you believe your payment was successful, please contact our customer support team with any order reference number you received.
            </p>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/checkout">Return to Checkout</Link>
            </Button>
            <Button asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <Card className="overflow-hidden shadow-lg border-green-100">
        <CardHeader className="bg-green-50 border-b border-green-100">
          <div className="mx-auto rounded-full bg-green-100 p-3 mb-4 w-16 h-16 flex items-center justify-center">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-center text-2xl">Thank You for Your Order!</CardTitle>
          <CardDescription className="text-center text-slate-600">
            Your payment was successful and your order has been confirmed
          </CardDescription>
        </CardHeader>
        
        <CardContent className="py-8 space-y-6">
          {/* Order reference */}
          <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-sm text-slate-500">Order Reference</p>
            <p className="font-mono text-lg font-medium">{orderReference || orderRef}</p>
          </div>
          
          {/* Confirmation message */}
          <div className="text-center space-y-2">
            <p className="text-slate-700">
              We've sent a confirmation email with all the details of your purchase.
            </p>
            <p className="text-slate-600">
              You can also view your order details in your account dashboard.
            </p>
          </div>
          
          {/* Shipping details if available */}
          {shippingInfo && (
            <div className="border border-slate-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium mb-2 flex items-center">
                <ShoppingBag className="h-4 w-4 mr-2 text-slate-500" />
                Shipping Details
              </h3>
              <p className="text-sm text-slate-600">
                {shippingInfo.firstName} {shippingInfo.lastName}<br />
                {shippingInfo.address}<br />
                {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}<br />
                {shippingInfo.country}
              </p>
            </div>
          )}
          
          {/* Delivery information */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-blue-800">
            <h3 className="font-medium mb-1">Delivery Information</h3>
            <p className="text-sm">
              Your order will be processed within 1-2 business days.
              You'll receive tracking information once your package ships.
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="bg-slate-50 border-t flex justify-center gap-4 py-6">
          <Button variant="outline" asChild>
            <Link href="/profile/orders">View Orders</Link>
          </Button>
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </CardFooter>
      </Card>
      
      {/* Additional information */}
      <div className="mt-8 text-center">
        <h3 className="text-lg font-medium mb-2">Need Help?</h3>
        <p className="text-slate-600 text-sm">
          If you have any questions about your order, please contact our
          <Link href="/contact" className="text-primary font-medium ml-1">customer service team</Link>.
        </p>
      </div>
    </div>
  );
} 