
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { EMenuIcon } from '@/components/dashboard/app-sidebar';
import { SignupCardSkeleton } from '@/components/dashboard/skeletons';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';
import NextLink from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export default function SignupPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({ 
      title: 'Account Created!', 
      description: 'Welcome to eMenu. Redirecting to setup...',
    });
    
    // Proceed to onboarding flow
    router.push('/setup/business-profile');
  };

  if (!isMounted) {
    return <SignupCardSkeleton />;
  }

  return (
    <div className={cn("relative flex flex-col min-h-screen bg-[#fafbfc]", inter.className)}>
      {/* Background Mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none fixed">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#e6f7f6] blur-[120px] opacity-60" />
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#fffcf0] blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#f0f7ff] blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#fff5f8] blur-[120px] opacity-60" />
      </div>

      {/* Corporate Header */}
      <header className="relative z-20 w-full bg-white border-b border-gray-100 py-4 flex justify-center shrink-0">
        <EMenuIcon />
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 py-8">
        <div className="w-full max-w-[540px] space-y-6">
          <Card className="border-0 shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-[24px] overflow-hidden bg-white/90 backdrop-blur-xl">
            <CardContent className="p-6 sm:p-8">
              <div className="text-center space-y-1 mb-8">
                <h1 className="text-[28px] font-bold tracking-tight text-[#142424]">
                  Welcome to eMenu
                </h1>
                <p className="text-[13px] font-medium text-gray-400">
                  One Platform. Every Tool Your Restaurant Needs
                </p>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="space-y-1.5">
                    <Label htmlFor="first-name" className="text-[12px] font-bold text-[#142424]">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="first-name"
                      placeholder="John"
                      required
                      className="h-11 bg-white border-gray-200 rounded-xl px-4 text-[14px] focus:ring-[#18B4A6] focus:border-[#18B4A6] transition-all placeholder:text-gray-300"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="last-name" className="text-[12px] font-bold text-[#142424]">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="last-name"
                      placeholder="Smith"
                      required
                      className="h-11 bg-white border-gray-200 rounded-xl px-4 text-[14px] focus:ring-[#18B4A6] focus:border-[#18B4A6] transition-all placeholder:text-gray-300"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <Label htmlFor="email" className="text-[12px] font-bold text-[#142424]">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    className="h-11 bg-white border-gray-200 rounded-xl px-4 text-[14px] focus:ring-[#18B4A6] focus:border-[#18B4A6] transition-all placeholder:text-gray-300"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <Label htmlFor="password" className="text-[12px] font-bold text-[#142424]">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      required
                      className="h-11 bg-white border-gray-200 rounded-xl px-4 pr-12 text-[14px] focus:ring-[#18B4A6] focus:border-[#18B4A6] transition-all placeholder:text-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#18B4A6] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium ml-1">
                    Must be at least 8 characters with numbers and letters
                  </p>
                </div>

                <div className="space-y-1.5 text-left">
                  <Label htmlFor="confirm-password" className="text-[12px] font-bold text-[#142424]">
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      required
                      className="h-11 bg-white border-gray-200 rounded-xl px-4 pr-12 text-[14px] focus:ring-[#18B4A6] focus:border-[#18B4A6] transition-all placeholder:text-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#18B4A6] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-1 text-left">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="terms" 
                      className="mt-0.5 border-gray-300 rounded-md data-[state=checked]:bg-[#18B4A6] data-[state=checked]:border-[#18B4A6]" 
                      required
                    />
                    <label htmlFor="terms" className="text-[12px] font-medium text-gray-500 leading-relaxed cursor-pointer">
                      I agree to the <span className="text-[#18B4A6] font-bold cursor-pointer hover:underline">Terms of Service</span> and <span className="text-[#18B4A6] font-bold cursor-pointer hover:underline">Privacy Policy</span>
                    </label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="marketing" 
                      className="mt-0.5 border-gray-300 rounded-md data-[state=checked]:bg-[#18B4A6] data-[state=checked]:border-[#18B4A6]" 
                    />
                    <label htmlFor="marketing" className="text-[12px] font-medium text-gray-500 leading-relaxed cursor-pointer">
                      Send me product updates and marketing emails
                    </label>
                  </div>
                </div>

                <Button 
                  className="w-full h-12 bg-[#18B4A6] hover:bg-[#149d94] text-white font-bold text-[15px] rounded-xl shadow-lg shadow-[#18B4A6]/20 transition-all active:scale-[0.98]" 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <div className="text-center pt-1">
                  <p className="text-[13px] font-medium text-gray-500">
                    Already have an account?{' '}
                    <NextLink href="/" className="text-[#18B4A6] font-bold hover:underline transition-all">
                      Sign in
                    </NextLink>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
