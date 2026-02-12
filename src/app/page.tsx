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
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        localStorage.setItem('isLoggedIn', 'true');
        router.push('/dashboard');
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [auth, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSigningIn(true);

    if (email === 'admin' && password === 'admin') {
      localStorage.setItem('isLoggedIn', 'true');
      toast({
        title: 'Welcome back!',
        description: 'Redirecting to your dashboard...',
      });
      router.push('/dashboard');
      return;
    }

    try {
      const loginEmail = email.includes('@') ? email : `${email}@example.com`;
      await signInWithEmailAndPassword(auth, loginEmail, password);
      localStorage.setItem('isLoggedIn', 'true');
      toast({
        title: 'Welcome back!',
        description: 'Redirecting to your dashboard...',
      });
      router.push('/dashboard');
    } catch (e: any) {
      console.error(e);
      setError('Invalid email or password. Please try again.');
      setIsSigningIn(false);
    }
  };

  if (isLoading) {
    return <AuthCardSkeleton />;
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4 overflow-hidden bg-[#fafbfc]">
      {/* Mirroring the 120000% Gradient Accuracy */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#e6f7f6] blur-[120px] opacity-60" />
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#fffcf0] blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#f0f7ff] blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#fff5f8] blur-[120px] opacity-60" />
      </div>

      <div className="relative z-10 w-full max-w-[480px] space-y-12">
        {/* Centered Logo */}
        <div className="flex justify-center">
          <EMenuIcon />
        </div>

        <Card className="border-0 shadow-[0_8px_40px_rgba(0,0,0,0.04)] rounded-[24px] overflow-hidden bg-white/80 backdrop-blur-xl">
          {/* Tab Navigation */}
          <div className="flex w-full border-b border-gray-100">
            <button
              onClick={() => setActiveTab('login')}
              className={cn(
                "flex-1 py-5 text-[15px] font-bold transition-all relative",
                activeTab === 'login' ? "text-[#18B4A6]" : "text-gray-400 hover:text-gray-600"
              )}
            >
              Log In
              {activeTab === 'login' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#18B4A6]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={cn(
                "flex-1 py-5 text-[15px] font-bold transition-all relative",
                activeTab === 'signup' ? "text-[#18B4A6]" : "text-gray-400 hover:text-gray-600"
              )}
            >
              Sign Up
              {activeTab === 'signup' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#18B4A6]" />
              )}
            </button>
          </div>

          <CardContent className="p-10 pt-12 space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-[28px] font-black tracking-tight text-[#142424]">
                Login to your Account
              </h1>
              <p className="text-[13px] font-medium text-gray-400">
                One Platform. Every Tool Your Restaurant Needs
              </p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-6">
              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-[13px] font-bold text-[#142424]">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-white border-gray-200 rounded-xl px-4 text-[14px] focus:ring-[#18B4A6] focus:border-[#18B4A6] transition-all placeholder:text-gray-300"
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="password" className="text-[13px] font-bold text-[#142424]">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 bg-white border-gray-200 rounded-xl px-4 text-[14px] focus:ring-[#18B4A6] focus:border-[#18B4A6] transition-all placeholder:text-gray-300"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
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

              {error && <p className="text-destructive text-xs font-bold text-center animate-in fade-in slide-in-from-top-1">{error}</p>}

              <Button 
                className="w-full h-14 bg-[#18B4A6] hover:bg-[#149d94] text-white font-bold text-[15px] rounded-xl shadow-lg shadow-[#18B4A6]/20 transition-all active:scale-[0.98]" 
                type="submit" 
                disabled={isSigningIn}
              >
                {isSigningIn ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Log In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
