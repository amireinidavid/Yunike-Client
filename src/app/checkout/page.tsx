'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, CreditCard, MapPin, ShoppingBag, Truck, Clock } from 'lucide-react';
import useCheckOutStore from '@/store/useCheckOutStore';
import useCartStore from '@/store/useCartStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CHECKOUT_STEPS = [
  { id: 0, title: 'Review Order', icon: ShoppingBag },
  { id: 1, title: 'Shipping', icon: Truck },
  { id: 2, title: 'Payment', icon: CreditCard },
  { id: 3, title: 'Confirmation', icon: Check },
];

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const { 
    activeStep, 
    setActiveStep,
    createCheckoutSession,
    getCheckoutStatus,
    redirectToCheckout,
    isPaymentComplete,
    isCreatingSession,
    error,
    shippingInfo,
    setShippingInfo,
    orderReference
  } = useCheckOutStore();
  
  const { cart, isLoading: isCartLoading } = useCartStore();
  
  // Local state for shipping form
  const [shippingForm, setShippingForm] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    email: '',
    phone: ''
  });

  // Check if coming back from Stripe with a session ID
  useEffect(() => {
    // If we have a session ID, redirect to the success page
    if (sessionId) {
      router.push(`/checkout/success?session_id=${sessionId}&order_ref=${orderReference || ''}`);
    }
  }, [sessionId, orderReference, router]);

  // Handle next step
  const handleNextStep = () => {
    setActiveStep(activeStep + 1);
  };

  // Handle previous step
  const handlePrevStep = () => {
    setActiveStep(Math.max(0, activeStep - 1));
  };

  // Handle shipping form change
  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingForm({ ...shippingForm, [name]: value });
  };

  // Handle country change
  const handleCountryChange = (value: string) => {
    setShippingForm({ ...shippingForm, country: value });
  };

  // Handle shipping submission
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShippingInfo(shippingForm);
    handleNextStep();
  };

  // Proceed to Stripe checkout
  const handleProceedToPayment = async () => {
    if (!cart?.id) return;
    
    const successUrl = `${window.location.origin}/checkout/success`;
    const cancelUrl = `${window.location.origin}/checkout`;
    
    const result = await createCheckoutSession(cart.id, successUrl, cancelUrl);
    
    if (result.success && result.url) {
      window.location.href = result.url;
    }
  };

  // Render Order Summary
  const OrderSummary = () => (
    <Card className="bg-gray-100 border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-black">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cart?.items?.map((item: any) => (
          <div key={item.id} className="flex items-center space-x-4">
            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-white">
              {item.product?.images?.[0]?.url ? (
                <Image 
                  src={item.product.images[0].url} 
                  alt={item.product.name} 
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-black/40">
                  <ShoppingBag size={20} />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-black">{item.product.name}</p>
              {item.variant && (
                <p className="text-sm text-black/60">
                  {Object.entries(item.variant.options).map(([key, value]) => (
                    `${key}: ${value}`
                  )).join(', ')}
                </p>
              )}
              <p className="text-sm">
                Qty: {item.quantity} × ${item.price.toFixed(2)}
              </p>
            </div>
            <span className="font-medium">${item.totalPrice.toFixed(2)}</span>
          </div>
        ))}
        
        <Separator className="my-4 bg-gray-200" />
        
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-black/70">Subtotal</span>
            <span>${cart?.subtotal?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-black/70">Shipping</span>
            <span>${cart?.shipping?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-black/70">Tax</span>
            <span>${cart?.tax?.toFixed(2) || '0.00'}</span>
          </div>
          {cart?.discount && cart.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-${cart.discount.toFixed(2)}</span>
            </div>
          )}
        </div>
        
        <Separator className="my-4 bg-gray-200" />
        
        <div className="flex justify-between font-semibold text-black">
          <span>Total</span>
          <span>${cart?.total?.toFixed(2) || '0.00'}</span>
        </div>
      </CardContent>
    </Card>
  );

  // Loading state
  if (isCartLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
        <Clock className="w-12 h-12 animate-spin text-black" />
        <p className="text-lg font-medium text-black">Loading your checkout...</p>
      </div>
    );
  }

  // Empty cart state
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-6 px-4">
        <ShoppingBag className="w-20 h-20 text-black/30" />
        <h1 className="text-2xl font-bold text-center text-black">Your cart is empty</h1>
        <p className="text-black/70 text-center max-w-md">
          Looks like you haven't added anything to your cart yet. Explore our products and find something you'll love!
        </p>
        <Button asChild className="bg-black text-white hover:bg-black/90">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      {/* Checkout header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-black">Checkout</h1>
        <p className="mt-2 text-black/70">Complete your purchase securely</p>
      </div>
      
      {/* Checkout steps */}
      <div className="flex justify-between mb-12 max-w-3xl">
        {CHECKOUT_STEPS.map((step, index) => (
          <div key={step.id} className="flex flex-1 items-center">
            <div className={`flex flex-col items-center ${index <= activeStep ? 'text-black' : 'text-black/40'}`}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                index < activeStep 
                  ? 'bg-black text-white border-black' 
                  : index === activeStep 
                    ? 'border-black text-black' 
                    : 'border-gray-200'
              }`}>
                {index < activeStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <span className={`mt-2 text-xs font-medium ${
                index <= activeStep ? 'text-black' : 'text-black/40'
              }`}>
                {step.title}
              </span>
            </div>
            
            {index < CHECKOUT_STEPS.length - 1 && (
              <div className="flex-1 h-px bg-gray-200 mx-2 mt-5" />
            )}
          </div>
        ))}
      </div>

      {/* Main checkout content */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <AnimatePresence mode="wait">
            {/* Step 0: Review order */}
            {activeStep === 0 && (
              <motion.div
                key="review"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-black">Review Your Order</CardTitle>
                    <CardDescription className="text-black/70">
                      Please verify your items before proceeding
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cart.items.map((item: any) => (
                      <div key={item.id} className="flex items-center space-x-4 py-2 border-b border-gray-200">
                        <div className="relative w-20 h-20 rounded-md overflow-hidden bg-gray-100">
                          {item.product?.images?.[0]?.url ? (
                            <Image 
                              src={item.product.images[0].url} 
                              alt={item.product.name} 
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-black/40">
                              <ShoppingBag size={24} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-black">{item.product.name}</h3>
                          {item.variant && (
                            <p className="text-sm text-black/60">
                              {Object.entries(item.variant.options).map(([key, value]) => (
                                `${key}: ${value}`
                              )).join(', ')}
                            </p>
                          )}
                          <p className="text-sm text-black/60 mt-1">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="font-medium text-black">
                          ${item.totalPrice.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" asChild className="border-gray-200 text-black hover:bg-black/5">
                      <Link href="/cart">Edit Cart</Link>
                    </Button>
                    <Button onClick={handleNextStep} className="bg-black text-white hover:bg-black/90">
                      Continue to Shipping <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {/* Step 1: Shipping Information */}
            {activeStep === 1 && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-black">
                      <MapPin className="mr-2 h-5 w-5" />
                      Shipping Information
                    </CardTitle>
                    <CardDescription className="text-black/70">
                      Enter your shipping details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleShippingSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-black">First Name *</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            placeholder="John"
                            value={shippingForm.firstName}
                            onChange={handleShippingChange}
                            required
                            className="border-gray-200 focus-visible:ring-black focus-visible:border-black"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-black">Last Name *</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            placeholder="Doe"
                            value={shippingForm.lastName}
                            onChange={handleShippingChange}
                            required
                            className="border-gray-200 focus-visible:ring-black focus-visible:border-black"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-black">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john.doe@example.com"
                          value={shippingForm.email}
                          onChange={handleShippingChange}
                          required
                          className="border-gray-200 focus-visible:ring-black focus-visible:border-black"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-black">Phone Number *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          placeholder="+1 (555) 123-4567"
                          value={shippingForm.phone}
                          onChange={handleShippingChange}
                          required
                          className="border-gray-200 focus-visible:ring-black focus-visible:border-black"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-black">Street Address *</Label>
                        <Input
                          id="address"
                          name="address"
                          placeholder="123 Main Street"
                          value={shippingForm.address}
                          onChange={handleShippingChange}
                          required
                          className="border-gray-200 focus-visible:ring-black focus-visible:border-black"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-black">City *</Label>
                          <Input
                            id="city"
                            name="city"
                            placeholder="New York"
                            value={shippingForm.city}
                            onChange={handleShippingChange}
                            required
                            className="border-gray-200 focus-visible:ring-black focus-visible:border-black"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state" className="text-black">State/Province *</Label>
                          <Input
                            id="state"
                            name="state"
                            placeholder="NY"
                            value={shippingForm.state}
                            onChange={handleShippingChange}
                            required
                            className="border-gray-200 focus-visible:ring-black focus-visible:border-black"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="zipCode" className="text-black">Zip/Postal Code *</Label>
                          <Input
                            id="zipCode"
                            name="zipCode"
                            placeholder="10001"
                            value={shippingForm.zipCode}
                            onChange={handleShippingChange}
                            required
                            className="border-gray-200 focus-visible:ring-black focus-visible:border-black"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country" className="text-black">Country *</Label>
                          <Select 
                            value={shippingForm.country} 
                            onValueChange={handleCountryChange}
                          >
                            <SelectTrigger className="border-gray-200 focus:ring-black">
                              <SelectValue placeholder="Select a country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="US">United States</SelectItem>
                              <SelectItem value="CA">Canada</SelectItem>
                              <SelectItem value="GB">United Kingdom</SelectItem>
                              <SelectItem value="AU">Australia</SelectItem>
                              <SelectItem value="DE">Germany</SelectItem>
                              <SelectItem value="FR">France</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <CardFooter className="px-0 pt-4 flex justify-between">
                        <Button type="button" variant="outline" onClick={handlePrevStep} className="border-gray-200 text-black hover:bg-black/5">
                          Back to Review
                        </Button>
                        <Button type="submit" className="bg-black text-white hover:bg-black/90">
                          Continue to Payment <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                      </CardFooter>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {activeStep === 2 && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-black">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Payment
                    </CardTitle>
                    <CardDescription className="text-black/70">
                      You'll be redirected to Stripe to complete your payment securely
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                        <h3 className="font-medium mb-2 text-black">Shipping Address</h3>
                        <p className="text-sm text-black/70">
                          {shippingInfo?.firstName} {shippingInfo?.lastName}<br />
                          {shippingInfo?.address}<br />
                          {shippingInfo?.city}, {shippingInfo?.state} {shippingInfo?.zipCode}<br />
                          {shippingInfo?.country}<br />
                          {shippingInfo?.email} | {shippingInfo?.phone}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handlePrevStep} className="border-gray-200 text-black hover:bg-black/5">
                      Back to Shipping
                    </Button>
                    <Button 
                      onClick={handleProceedToPayment}
                      disabled={isCreatingSession}
                      className="bg-black text-white hover:bg-black/90"
                    >
                      {isCreatingSession ? (
                        <span className="flex items-center">
                          <Clock className="animate-spin mr-2 h-4 w-4" />
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          Proceed to Payment <ChevronRight className="ml-2 h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Confirmation */}
            {activeStep === 3 && (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-gray-200">
                  <CardHeader>
                    <div className="mx-auto rounded-full bg-green-100 p-3 mb-4">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle className="text-center text-black">Order Confirmed!</CardTitle>
                    <CardDescription className="text-center text-black/70">
                      Your order has been successfully placed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {orderReference && (
                      <div className="text-center p-4 bg-gray-100 rounded-lg">
                        <p className="text-sm text-black/70">Order Reference</p>
                        <p className="font-mono font-medium text-black">{orderReference}</p>
                      </div>
                    )}
                    
                    <p className="text-center text-black/70">
                      We've sent a confirmation email to <span className="font-medium">{shippingInfo?.email}</span> with your order details.
                    </p>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium mb-2 text-black">Shipping Information</h3>
                      <p className="text-sm text-black/70">
                        {shippingInfo?.firstName} {shippingInfo?.lastName}<br />
                        {shippingInfo?.address}<br />
                        {shippingInfo?.city}, {shippingInfo?.state} {shippingInfo?.zipCode}<br />
                        {shippingInfo?.country}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-center">
                    <Button asChild className="bg-black text-white hover:bg-black/90">
                      <Link href="/shop">Continue Shopping</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Order Summary (right sidebar) */}
        <div>
          <OrderSummary />
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
              {error}
            </div>
          )}
          
          {/* Additional help info */}
          <Card className="mt-4 border-gray-200">
            <CardContent className="pt-4">
              <div className="text-sm space-y-4">
                <h3 className="font-semibold text-black">Need Help?</h3>
                <p className="text-black/70">
                  If you have any questions about your order, please contact our customer support:
                </p>
                <p className="text-black"><span className="font-medium">Email:</span> support@yunike.com</p>
                <p className="text-black"><span className="font-medium">Phone:</span> +1 (555) 123-4567</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
