"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle, LogIn } from "lucide-react";
import { toast } from "sonner";
import useAuthStore from "@/store/useAuthStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { API_BASE_URL, API_ENDPOINTS } from "@/utils/api";
import { debugApiUrl } from "@/utils/apiDebug";
import { useAuth } from "@/components/AuthProvider";
import { isJwtExpired } from "@/utils/jwt";

// Form validation schema with explicit types
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean()
});

// Type for login form fields
type LoginFormValues = {
  email: string;
  password: string;
  rememberMe: boolean;
};

// OTP validation schema
const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

// Type for OTP form fields
type OtpFormValues = {
  otp: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentStep, setCurrentStep] = useState<"form" | "otp">("form");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Auth store
  const { 
    login, 
    verifyLogin, 
    resendLoginOTP, 
    loginData,
    error,
    setError
  } = useAuthStore();

  // Login form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    },
  });

  // OTP form
  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Handle login form submission
  const onSubmit = async (values: LoginFormValues) => {
    setIsLoggingIn(true);
    setError(null); // Clear any previous errors
    
    try {
      // Add debug info
      const debugInfo = debugApiUrl();
      console.log('🔍 Debug API URLs:', debugInfo);
      
      console.log(`🔐 Attempting login for: ${values.email}`);
      console.log(`🌐 API_BASE_URL: ${API_BASE_URL}`);
      console.log(`🔗 Login endpoint: ${API_ENDPOINTS.AUTH.LOGIN}`);
      console.log(`🔗 Full URL: ${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`);
      
      const result = await login(values.email, values.password);
      
      if (result) {
        // OTP is required
        setCurrentStep("otp");
        // Set countdown timer for OTP expiration
        setSecondsLeft(result.expiresIn);
        // Store remember me preference
        setRememberMe(values.rememberMe);
        
        // Start countdown timer
        const timer = setInterval(() => {
          setSecondsLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        toast.info("Verification required", {
          description: "Please enter the verification code sent to your email."
        });
      } else {
        // If no OTP required, user is already logged in
        // This happens when login function returns null but sets isAuthenticated to true
        toast.success("Login successful!", {
          description: "Welcome back to Yunike!"
        });
        
        // Redirect to home page
        router.push("/");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to log in. Please check your credentials and try again.");
      toast.error("Login failed", {
        description: err.message || "Please check your credentials and try again."
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle OTP verification
  const onVerifyOtp = async (values: OtpFormValues) => {
    if (!loginData) return;
    
    setIsVerifying(true);
    setError(null); // Clear any previous errors
    
    try {
      const user = await verifyLogin(
        loginData.email,
        values.otp,
        rememberMe
      );
      
      if (user) {
        // Success notification
        toast.success("Login successful!", {
          description: "Welcome back to Yunike!"
        });
        
        // Redirect to home page
        router.push("/");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (!loginData) return;
    
    try {
      const result = await resendLoginOTP(loginData.email);
      
      if (result) {
        // Reset countdown timer
        setSecondsLeft(loginData.expiresIn);
        
        toast.success("OTP resent!", {
          description: "A new verification code has been sent to your email."
        });
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
    }
  };

  // Format seconds to minutes and seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-green-200 shadow-xl shadow-emerald-100/70 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 text-white p-8 relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
              <div className="absolute top-6 left-6 w-20 h-20 rounded-full bg-white/20"></div>
              <div className="absolute bottom-12 right-8 w-16 h-16 rounded-full bg-white/10"></div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative z-10"
            >
              <CardTitle className="text-3xl font-bold text-center mb-2">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-green-50 text-center text-lg">
                Log in to your Yunike account
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              {currentStep === "form" ? (
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-5"
                    >
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium text-gray-700">Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Your email address"
                                {...field}
                                className="h-12 text-base focus-visible:ring-green-500 border-green-200 focus-visible:border-green-500 bg-green-50/40 rounded-lg"
                              />
                            </FormControl>
                            <FormMessage className="text-sm font-medium" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium text-gray-700">Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter your password"
                                {...field}
                                className="h-12 text-base focus-visible:ring-green-500 border-green-200 focus-visible:border-green-500 bg-green-50/40 rounded-lg"
                              />
                            </FormControl>
                            <FormMessage className="text-sm font-medium" />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center justify-between">
                        <FormField
                          control={form.control}
                          name="rememberMe"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-medium text-gray-600 cursor-pointer">
                                Remember me
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        
                        <Link
                          href="#"
                          className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>

                      {error && (
                        <Alert variant="destructive" className="mt-4 bg-red-50 border-red-200 text-red-800">
                          <AlertCircle className="h-5 w-5" />
                          <AlertDescription className="text-base">{error}</AlertDescription>
                        </Alert>
                      )}

                      <Button
                        type="submit"
                        className="w-full h-14 text-lg font-medium bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-md shadow-green-200 rounded-lg mt-2"
                        disabled={isLoggingIn}
                      >
                        {isLoggingIn ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          <>
                            Log In
                            <LogIn className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </motion.div>
              ) : (
                <motion.div
                  key="otp-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="py-4"
                >
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="bg-green-100 rounded-full p-4 w-24 h-24 mx-auto flex items-center justify-center"
                    >
                      <CheckCircle2 className="h-14 w-14 text-green-600" />
                    </motion.div>
                    <h3 className="mt-6 text-2xl font-bold text-gray-800">
                      Verification Required
                    </h3>
                    <p className="mt-3 text-base text-gray-600">
                      We've sent a verification code to{" "}
                      <span className="font-medium text-green-600">
                        {loginData?.email}
                      </span>
                    </p>
                  </div>

                  <Form {...otpForm}>
                    <form
                      onSubmit={otpForm.handleSubmit(onVerifyOtp)}
                      className="space-y-6"
                    >
                      <FormField
                        control={otpForm.control}
                        name="otp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium text-gray-700">Verification Code</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter 6-digit code"
                                {...field}
                                className="h-16 text-2xl font-bold tracking-widest text-center focus-visible:ring-green-500 border-green-200 focus-visible:border-green-500 bg-green-50/40 rounded-lg"
                                maxLength={6}
                              />
                            </FormControl>
                            <FormMessage className="text-sm font-medium" />
                          </FormItem>
                        )}
                      />

                      {error && (
                        <Alert variant="destructive" className="mt-4 bg-red-50 border-red-200 text-red-800">
                          <AlertCircle className="h-5 w-5" />
                          <AlertDescription className="text-base">{error}</AlertDescription>
                        </Alert>
                      )}

                      <div className="flex flex-col space-y-5">
                        <Button
                          type="submit"
                          className="w-full h-14 text-lg font-medium bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-md shadow-green-200 rounded-lg"
                          disabled={isVerifying}
                        >
                          {isVerifying ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            "Verify & Login"
                          )}
                        </Button>

                        <div className="text-center">
                          <p className="text-base text-gray-600 mb-3">
                            Code expires in{" "}
                            <span className="font-bold text-lg text-amber-600">
                              {formatTime(secondsLeft)}
                            </span>
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleResendOtp}
                            disabled={secondsLeft > 0}
                            className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300 h-10 px-5 text-base"
                          >
                            Resend Code
                          </Button>
                        </div>
                      </div>
                    </form>
                  </Form>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-8 mx-auto block text-gray-500 font-medium text-base"
                    onClick={() => setCurrentStep("form")}
                  >
                    Back to Login
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>

          <CardFooter className="bg-gray-50 px-8 py-4 flex flex-col">
            <div className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="text-emerald-600 hover:underline">
                Sign up
              </Link>
            </div>
            
            <DevTools />
          </CardFooter>
        </Card>
      </motion.div>

      {/* Decorative elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[15%] left-[10%] w-64 h-64 rounded-full bg-green-200/20 blur-3xl"></div>
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 rounded-full bg-emerald-200/30 blur-3xl"></div>
        <div className="absolute top-[40%] right-[25%] w-40 h-40 rounded-full bg-teal-200/20 blur-2xl"></div>
      </div>

      {/* Debug tools */}
      <DevTools />
    </div>
  );
}

// This is a debugging component that can be used to test token refresh
function TokenDebugger() {
  const { refreshTokenManually } = useAuth();
  
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
    
    console.log('🔍 Token Status:');
    console.log('  localStorage accessToken:', localStorageToken ? '✅ Present' : '❌ Missing');
    console.log('  localStorage refreshToken:', refreshTokenValue ? '✅ Present' : '❌ Missing');
    console.log('  cookie accessToken:', cookies.accessToken ? '✅ Present' : '❌ Missing');
    console.log('  JWT expired:', localStorageToken ? (isJwtExpired(localStorageToken) ? '⚠️ Yes' : '✅ No') : '❌ No token');
  };
  
  const testTokenRefresh = async () => {
    console.log('🔄 Testing manual token refresh...');
    const result = await refreshTokenManually();
    console.log('🔄 Refresh result:', result ? '✅ Success' : '❌ Failed');
    checkTokenStatus();
  };
  
  const simulateExpiredToken = () => {
    // This doesn't actually delete the token, just replaces it with an expired one
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ';
    localStorage.setItem('accessToken', expiredToken);
    console.log('⚠️ Replaced token with expired one');
    checkTokenStatus();
  };
  
  return (
    <div className="mt-8 p-4 border border-dashed border-primary/50 rounded-lg">
      <h3 className="text-sm font-semibold mb-3">Token Debug Panel (Dev Only)</h3>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={checkTokenStatus}>
          Check Token Status
        </Button>
        <Button size="sm" variant="outline" onClick={testTokenRefresh}>
          Test Token Refresh
        </Button>
        <Button size="sm" variant="outline" onClick={simulateExpiredToken}>
          Simulate Expired Token
        </Button>
      </div>
    </div>
  );
}

// Make sure this is visible in development environment only
function DevTools() {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return <TokenDebugger />;
}
