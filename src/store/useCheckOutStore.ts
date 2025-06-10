import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import api from '../utils/api';

// Initialize Stripe outside of the store
let stripePromise: Promise<Stripe | null> | null = null;

interface CheckoutState {
  // Session data
  sessionId: string | null;
  orderReference: string | null;
  paymentIntent: string | null;
  
  // Status flags
  isLoading: boolean;
  isCreatingSession: boolean;
  isProcessingPayment: boolean;
  isPaymentComplete: boolean;
  isPaymentFailed: boolean;
  
  // Error handling
  error: string | null;
  
  // UI states
  activeStep: number;
  shippingInfo: any;
  billingInfo: any;
  
  // Actions
  createCheckoutSession: (cartId: string, successUrl: string, cancelUrl: string) => Promise<{ success: boolean, url?: string }>;
  getCheckoutStatus: (sessionId: string) => Promise<void>;
  resetCheckoutState: () => void;
  setActiveStep: (step: number) => void;
  setShippingInfo: (info: any) => void;
  setBillingInfo: (info: any) => void;
  initializeStripe: () => Promise<Stripe | null>;
  redirectToCheckout: (sessionId: string) => Promise<{ success: boolean, error?: string }>;
}

const useCheckOutStore = create<CheckoutState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        sessionId: null,
        orderReference: null,
        paymentIntent: null,
        isLoading: false,
        isCreatingSession: false,
        isProcessingPayment: false,
        isPaymentComplete: false,
        isPaymentFailed: false,
        error: null,
        activeStep: 0,
        shippingInfo: null,
        billingInfo: null,
        
        // Initialize Stripe instance with publishable key
        initializeStripe: async () => {
          if (!stripePromise) {
            const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
            stripePromise = loadStripe(publishableKey);
          }
          return stripePromise;
        },

        // Create a checkout session using the API
        createCheckoutSession: async (cartId, successUrl, cancelUrl) => {
          try {
            set({ isCreatingSession: true, error: null });
            
            const response = await api.post(`/checkout/${cartId}`, {
              successUrl,
              cancelUrl
            });
            
            if (!response.success) {
              set({ 
                isCreatingSession: false, 
                error: response.message || 'Failed to create checkout session'
              });
              return { success: false };
            }
            
            set({ 
              isCreatingSession: false,
              sessionId: response.data.sessionId,
              orderReference: response.data.orderReference
            });
            
            return { 
              success: true, 
              url: response.data.url
            };
          } catch (error) {
            const errorMessage = error instanceof Error 
              ? error.message 
              : 'Failed to create checkout session';
            
            set({ 
              isCreatingSession: false, 
              error: errorMessage
            });
            
            return { success: false };
          }
        },

        // Get the status of a checkout session
        getCheckoutStatus: async (sessionId) => {
          try {
            set({ isLoading: true, error: null });
            
            const response = await api.get(`/checkout/status/${sessionId}`);
            
            if (!response.success) {
              set({ 
                isLoading: false, 
                error: response.message || 'Failed to get checkout status'
              });
              return;
            }
            
            // Update state based on checkout status
            set({ 
              isLoading: false,
              isPaymentComplete: response.data.paymentStatus === 'paid',
              isPaymentFailed: response.data.paymentStatus === 'failed',
              orderReference: response.data.orderReference
            });
          } catch (error) {
            const errorMessage = error instanceof Error 
              ? error.message 
              : 'Failed to get checkout status';
            
            set({ 
              isLoading: false, 
              error: errorMessage
            });
          }
        },
        
        // Redirect to Stripe Checkout
        redirectToCheckout: async (sessionId) => {
          try {
            const stripe = await get().initializeStripe();
            
            if (!stripe) {
              return {
                success: false,
                error: 'Failed to initialize Stripe'
              };
            }
            
            const { error } = await stripe.redirectToCheckout({
              sessionId
            });
            
            if (error) {
              return {
                success: false,
                error: error.message
              };
            }
            
            return { success: true };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Checkout redirect failed'
            };
          }
        },

        // Reset checkout state
        resetCheckoutState: () => {
          set({
            sessionId: null,
            orderReference: null,
            paymentIntent: null,
            isLoading: false,
            isCreatingSession: false,
            isProcessingPayment: false,
            isPaymentComplete: false,
            isPaymentFailed: false,
            error: null,
            activeStep: 0
          });
        },
        
        // UI state management
        setActiveStep: (step) => set({ activeStep: step }),
        setShippingInfo: (info) => set({ shippingInfo: info }),
        setBillingInfo: (info) => set({ billingInfo: info })
      }),
      {
        name: 'checkout-store',
        partialize: (state) => ({
          // Only persist these fields
          sessionId: state.sessionId,
          orderReference: state.orderReference,
          activeStep: state.activeStep,
          shippingInfo: state.shippingInfo,
          billingInfo: state.billingInfo
        })
      }
    )
  )
);

export default useCheckOutStore;
