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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, User } from "lucide-react";
import { toast } from "sonner"
import useAuthStore from "@/store/useAuthStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain uppercase, lowercase, number and special character"
    ),
  phone: z.string().optional(),
});

// OTP validation schema
const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

// Profile validation schema
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
  dateOfBirth: z.string().optional(),
  phone: z.string().optional(),
});

export default function RegisterPage() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [currentStep, setCurrentStep] = useState<"form" | "otp" | "profile">("form");
  const [secondsLeft, setSecondsLeft] = useState(0);
  
  // Auth store
  const { 
    register, 
    verifyRegistration, 
    resendRegistrationOTP, 
    registrationData,
    createCustomerProfile,
    error,
    setError,
    user
  } = useAuthStore();

  // Registration form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
    },
  });

  // OTP form
  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Profile form
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: undefined,
      dateOfBirth: "",
      phone: "",
    },
  });

  // Handle registration form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsRegistering(true);
    setError(null); // Clear any previous errors
    
    try {
      const result = await register(
        values.email, 
        values.password, 
        values.name,
        values.phone || undefined
      );
      
      if (result) {
        // Show OTP input
        setCurrentStep("otp");
        // Set countdown timer for OTP expiration
        setSecondsLeft(result.expiresIn);
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
        
        // Success notification
        toast.success("Registration successful!", {
          description: "Please enter the verification code sent to your email."
        });
      }
    } catch (err) {
      console.error("Registration error:", err);
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle OTP verification
  const onVerifyOtp = async (values: z.infer<typeof otpSchema>) => {
    if (!registrationData) return;
    
    setIsVerifying(true);
    setError(null); // Clear any previous errors
    
    try {
      const user = await verifyRegistration(
        registrationData.registrationId,
        registrationData.email,
        values.otp
      );
      
      if (user) {
        toast.success("Account verified!", {
          description: "Your account has been verified successfully."
        });
        
        // Proceed to profile creation instead of directly going to profile page
        setCurrentStep("profile");
        
        // Pre-fill profile form with any data we already have
        const nameParts = user.name?.split(' ') || [];
        profileForm.setValue("firstName", nameParts[0] || "");
        profileForm.setValue("lastName", nameParts.slice(1).join(' ') || "");
        if (user.phone) {
          profileForm.setValue("phone", user.phone);
        }
      }
    } catch (err) {
      console.error("OTP verification error:", err);
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle profile creation
  const onCreateProfile = async (values: z.infer<typeof profileSchema>) => {
    setIsCreatingProfile(true);
    setError(null); // Clear any previous errors
    
    try {
      const updatedUser = await createCustomerProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth,
        phone: values.phone,
      });
      
      if (updatedUser) {
        toast.success("Profile created!", {
          description: "Welcome to Yunike! Your profile has been set up."
        });
        
        // Redirect to profile page
        router.push("/profile");
      }
    } catch (err) {
      console.error("Profile creation error:", err);
    } finally {
      setIsCreatingProfile(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (!registrationData) return;
    
    try {
      const result = await resendRegistrationOTP(
        registrationData.registrationId,
        registrationData.email
      );
      
      if (result) {
        // Reset countdown timer
        setSecondsLeft(registrationData.expiresIn);
        
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
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-gray-200 shadow-xl shadow-gray-100/70 rounded-xl overflow-hidden">
          <CardHeader className="bg-black text-white p-8 relative">
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
                {currentStep === "form" ? "Create Your Account" :
                 currentStep === "otp" ? "Verify Your Email" :
                 "Complete Your Profile"}
              </CardTitle>
              <CardDescription className="text-gray-300 text-center text-lg">
                {currentStep === "form" ? "Join Yunike and start shopping today" :
                 currentStep === "otp" ? "Enter the code sent to your email" :
                 "Tell us a bit about yourself"}
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              {currentStep === "form" ? (
                <motion.div
                  key="registration-form"
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
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium text-gray-700">Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your name"
                                {...field}
                                className="h-12 text-base focus-visible:ring-black border-gray-200 focus-visible:border-black bg-gray-50/40 rounded-lg"
                              />
                            </FormControl>
                            <FormMessage className="text-sm font-medium" />
                          </FormItem>
                        )}
                      />

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
                                className="h-12 text-base focus-visible:ring-black border-gray-200 focus-visible:border-black bg-gray-50/40 rounded-lg"
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
                                placeholder="Create a password"
                                {...field}
                                className="h-12 text-base focus-visible:ring-black border-gray-200 focus-visible:border-black bg-gray-50/40 rounded-lg"
                              />
                            </FormControl>
                            <FormMessage className="text-sm font-medium" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium text-gray-700">Phone (optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your phone number"
                                {...field}
                                className="h-12 text-base focus-visible:ring-black border-gray-200 focus-visible:border-black bg-gray-50/40 rounded-lg"
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

                      <Button
                        type="submit"
                        className="w-full h-14 text-lg font-medium bg-black hover:bg-black/90 text-white shadow-md rounded-lg mt-2"
                        disabled={isRegistering}
                      >
                        {isRegistering ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          <>
                            Register
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </motion.div>
              ) : currentStep === "otp" ? (
                <motion.div
                  key="otp-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="py-4"
                >
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="bg-gray-100 rounded-full p-4 w-24 h-24 mx-auto flex items-center justify-center"
                    >
                      <CheckCircle2 className="h-14 w-14 text-black" />
                    </motion.div>
                    <h3 className="mt-6 text-2xl font-bold text-gray-800">
                      Verify Your Email
                    </h3>
                    <p className="mt-3 text-base text-gray-600">
                      We've sent a verification code to{" "}
                      <span className="font-medium text-black">
                        {registrationData?.email}
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
                                className="h-16 text-2xl font-bold tracking-widest text-center focus-visible:ring-black border-gray-200 focus-visible:border-black bg-gray-50/40 rounded-lg"
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
                          className="w-full h-14 text-lg font-medium bg-black hover:bg-black/90 text-white shadow-md rounded-lg"
                          disabled={isVerifying}
                        >
                          {isVerifying ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            "Verify Account"
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
                            className="text-black hover:text-black/80 border-gray-200 hover:border-gray-300 h-10 px-5 text-base"
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
                    Back to Registration
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="profile-form"
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
                      className="bg-gray-100 rounded-full p-4 w-24 h-24 mx-auto flex items-center justify-center"
                    >
                      <User className="h-12 w-12 text-black" />
                    </motion.div>
                    <h3 className="mt-6 text-2xl font-bold text-gray-800">
                      Complete Your Profile
                    </h3>
                    <p className="mt-3 text-base text-gray-600">
                      Add a few more details to personalize your experience
                    </p>
                  </div>

                  <Form {...profileForm}>
                    <form
                      onSubmit={profileForm.handleSubmit(onCreateProfile)}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium text-gray-700">First Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="First name"
                                  {...field}
                                  className="h-12 text-base focus-visible:ring-black border-gray-200 focus-visible:border-black bg-gray-50/40 rounded-lg"
                                />
                              </FormControl>
                              <FormMessage className="text-sm font-medium" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium text-gray-700">Last Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Last name"
                                  {...field}
                                  className="h-12 text-base focus-visible:ring-black border-gray-200 focus-visible:border-black bg-gray-50/40 rounded-lg"
                                />
                              </FormControl>
                              <FormMessage className="text-sm font-medium" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium text-gray-700">Phone (optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your phone number"
                                {...field}
                                className="h-12 text-base focus-visible:ring-black border-gray-200 focus-visible:border-black bg-gray-50/40 rounded-lg"
                              />
                            </FormControl>
                            <FormMessage className="text-sm font-medium" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium text-gray-700">Gender (optional)</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-12 text-base focus-visible:ring-black border-gray-200 focus-visible:border-black bg-gray-50/40 rounded-lg">
                                  <SelectValue placeholder="Select your gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="MALE">Male</SelectItem>
                                <SelectItem value="FEMALE">Female</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                                <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-sm font-medium" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium text-gray-700">Date of Birth (optional)</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                className="h-12 text-base focus-visible:ring-black border-gray-200 focus-visible:border-black bg-gray-50/40 rounded-lg"
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

                      <Button
                        type="submit"
                        className="w-full h-14 text-lg font-medium bg-black hover:bg-black/90 text-white shadow-md rounded-lg mt-2"
                        disabled={isCreatingProfile}
                      >
                        {isCreatingProfile ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Saving profile...
                          </>
                        ) : (
                          <>
                            Complete Setup
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 text-base bg-transparent border-gray-200 text-black hover:bg-gray-50"
                        onClick={() => router.push("/profile")}
                      >
                        Skip for now
                      </Button>
                    </form>
                  </Form>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>

          <CardFooter className="px-8 py-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="w-full text-center"
            >
              <p className="text-base text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-bold text-black hover:text-gray-700 hover:underline transition"
                >
                  Login here
                </Link>
              </p>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Decorative elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[15%] left-[10%] w-64 h-64 rounded-full bg-gray-200/20 blur-3xl"></div>
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 rounded-full bg-gray-200/30 blur-3xl"></div>
        <div className="absolute top-[40%] right-[25%] w-40 h-40 rounded-full bg-gray-200/20 blur-2xl"></div>
      </div>
    </div>
  );
}
