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
import { AuthCardSkeleton } from '@/components/dashboard/skeletons';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@domain.com');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (loggedIn) {
      router.push('/dashboard');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Admin backdoor
    if (email === 'admin@domain.com' && password === 'admin') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', JSON.stringify({ email: 'admin@domain.com', firstName: 'Admin', lastName: 'User' }));
      toast({ title: 'Welcome back!', description: 'Redirecting to your dashboard...' });
      router.push('/dashboard');
      return;
    }

    // Check LocalStorage "database"
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const user = storedUsers.find((u: any) => u.email === email && u.password === password);

    if (user) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', JSON.stringify(user));
      toast({ title: 'Welcome back!', description: 'Redirecting to your dashboard...' });
      router.push('/dashboard');
    } else {
      setError('Invalid email or password. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <AuthCardSkeleton />;
  }

  return (
    <div className={cn("relative flex flex-col min-h-screen bg-[#fafbfc]", inter.className)}>
      {/* Corporate Header */}
      <header className="relative z-20 w-full bg-white border-b border-gray-100 py-4 flex justify-center shrink-0 shadow-sm">
        <EMenuIcon />
      </header>

      {/* Background Mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none fixed">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#e6f7f6] blur-[120px] opacity-60" />
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#fffcf0] blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#f0f7ff] blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#fff5f8] blur-[120px] opacity-60" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 py-8">
        <div className="w-full max-w-[440px] space-y-8">
          <Card className="border-0 shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-[24px] overflow-hidden bg-white/90 backdrop-blur-xl">
            <CardContent className="p-8 pt-10 pb-10">
              <div className="text-center space-y-2 mb-10">
                <h1 className="text-[28px] font-bold tracking-tight text-[#142424]">
                  Login to your Account
                </h1>
                <p className="text-[14px] font-medium text-gray-400">
                  One Platform. Every Tool Your Restaurant Needs
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[13px] font-bold text-[#142424]">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-white border-gray-200 rounded-xl px-4 text-[14px] focus:ring-[#18B4A6] focus:border-[#18B4A6] transition-all placeholder:text-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[13px] font-bold text-[#142424]">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 bg-white border-gray-200 rounded-xl px-4 pr-12 text-[14px] focus:ring-[#18B4A6] focus:border-[#18B4A6] transition-all placeholder:text-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#18B4A6] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Checkbox 
                      id="remember" 
                      className="border-gray-300 rounded-md data-[state=checked]:bg-[#18B4A6] data-[state=checked]:border-[#18B4A6]" 
                    />
                    <label htmlFor="remember" className="text-[13px] font-medium text-gray-500 cursor-pointer">
                      Remember me
                    </label>
                  </div>
                  <button 
                    type="button" 
                    className="text-[13px] font-bold text-[#18B4A6] hover:underline transition-all"
                  >
                    Forgot password?
                  </button>
                </div>

                {error && <p className="text-destructive text-sm font-bold text-center animate-in fade-in slide-in-from-top-1">{error}</p>}

                <Button 
                  className="w-full h-14 bg-[#18B4A6] hover:bg-[#149d94] text-white font-bold text-[16px] rounded-xl shadow-lg shadow-[#18B4A6]/20 transition-all active:scale-[0.98]" 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Logging In...
                    </>
                  ) : (
                    'Log In'
                  )}
                </Button>
              </form>
            </CardContent>

            <div className="border-t border-dotted border-gray-300 px-8 py-8 bg-gray-50/30">
              <Button 
                variant="outline"
                onClick={() => router.push('/signup')}
                className="w-full h-12 border-[#18B4A6] text-[#18B4A6] hover:bg-[#18B4A6]/5 font-bold text-[14px] rounded-xl transition-all"
              >
                Sign up
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
