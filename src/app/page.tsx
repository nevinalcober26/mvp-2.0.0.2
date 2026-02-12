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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
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

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (activeTab === 'login') {
      // Admin backdoor
      if (email === 'admin' && password === 'admin') {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify({ email: 'admin@example.com', firstName: 'Admin', lastName: 'User' }));
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
    } else {
      // Sign Up Logic
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setIsSubmitting(false);
        return;
      }

      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      if (storedUsers.some((u: any) => u.email === email)) {
        setError('User with this email already exists.');
        setIsSubmitting(false);
        return;
      }

      const newUser = { firstName, lastName, email, password };
      storedUsers.push(newUser);
      
      // Save to LocalStorage "Database"
      localStorage.setItem('users', JSON.stringify(storedUsers));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', JSON.stringify(newUser));

      toast({
        title: 'Account created!',
        description: 'Welcome to eMenu Table.',
      });
      
      router.push('/setup/business-profile');
    }
  };

  if (isLoading) {
    return <AuthCardSkeleton />;
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-[#fafbfc]">
      <header className="relative z-20 w-full bg-white border-b border-gray-100 py-4 flex justify-center shrink-0">
        <EMenuIcon />
      </header>

      <main className="relative flex-1 flex flex-col items-center justify-center p-4 overflow-auto">
        <div className="absolute inset-0 z-0 pointer-events-none fixed">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#e6f7f6] blur-[120px] opacity-60" />
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#fffcf0] blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#f0f7ff] blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#fff5f8] blur-[120px] opacity-60" />
        </div>

        <div className="relative z-10 w-full max-w-[480px] py-6 my-auto">
          <Card className="border-0 shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-[24px] overflow-hidden bg-white/80 backdrop-blur-xl">
            <div className="flex w-full border-b border-gray-100">
              <button
                onClick={() => setActiveTab('login')}
                className={cn(
                  "flex-1 py-4 text-[14px] font-bold transition-all relative",
                  activeTab === 'login' ? "text-[#18B4A6]" : "text-gray-400 hover:text-gray-600"
                )}
              >
                Log In
                {activeTab === 'login' && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#18B4A6] animate-in fade-in duration-300" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={cn(
                  "flex-1 py-4 text-[14px] font-bold transition-all relative",
                  activeTab === 'signup' ? "text-[#18B4A6]" : "text-gray-400 hover:text-gray-600"
                )}
              >
                Sign Up
                {activeTab === 'signup' && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#18B4A6] animate-in fade-in duration-300" />
                )}
              </button>
            </div>

            <CardContent className="p-6 sm:p-8">
              <div 
                key={activeTab} 
                className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6"
              >
                <div className="text-center space-y-1">
                  <h1 className="text-[24px] font-black tracking-tight text-[#142424]">
                    {activeTab === 'login' ? 'Login to your Account' : 'Welcome to eMenu Table'}
                  </h1>
                  <p className="text-[12px] font-medium text-gray-400">
                    One Platform. Every Tool Your Restaurant Needs
                  </p>
                </div>

                <form onSubmit={handleAuthAction} className="space-y-4">
                  {activeTab === 'signup' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="firstName" className="text-[12px] font-bold text-[#142424]">
                          First Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          className="h-11 bg-white border-gray-200 rounded-xl px-4 text-[13px]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="lastName" className="text-[12px] font-bold text-[#142424]">
                          Last Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          placeholder="Smith"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          className="h-11 bg-white border-gray-200 rounded-xl px-4 text-[13px]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-[12px] font-bold text-[#142424]">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 bg-white border-gray-200 rounded-xl px-4 text-[13px] focus:ring-[#18B4A6] focus:border-[#18B4A6] transition-all placeholder:text-gray-300"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-[12px] font-bold text-[#142424]">
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
                        className="h-11 bg-white border-gray-200 rounded-xl px-4 pr-12 text-[13px] focus:ring-[#18B4A6] focus:border-[#18B4A6] transition-all placeholder:text-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#18B4A6] transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {activeTab === 'signup' && (
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-[12px] font-bold text-[#142424]">
                        Confirm Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="h-11 bg-white border-gray-200 rounded-xl px-4 pr-12 text-[13px]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#18B4A6] transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'login' ? (
                    <div className="flex items-center justify-between pt-0.5">
                      <div className="flex items-center space-x-2.5">
                        <Checkbox 
                          id="remember" 
                          className="border-gray-300 rounded-md data-[state=checked]:bg-[#18B4A6] data-[state=checked]:border-[#18B4A6]" 
                        />
                        <label htmlFor="remember" className="text-[12px] font-medium text-gray-500 cursor-pointer">
                          Remember me
                        </label>
                      </div>
                      <button 
                        type="button" 
                        className="text-[12px] font-bold text-[#18B4A6] hover:underline transition-all"
                      >
                        Forgot password?
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-start space-x-3">
                        <Checkbox 
                          id="tos" 
                          required
                          className="mt-0.5 border-gray-300 rounded-md data-[state=checked]:bg-[#18B4A6] data-[state=checked]:border-[#18B4A6]" 
                        />
                        <label htmlFor="tos" className="text-[11px] font-medium text-gray-500 leading-tight">
                          I agree to the <span className="text-[#18B4A6] font-bold cursor-pointer">Terms of Service</span> and <span className="text-[#18B4A6] font-bold cursor-pointer">Privacy Policy</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {error && <p className="text-destructive text-xs font-bold text-center animate-in fade-in slide-in-from-top-1">{error}</p>}

                  <Button 
                    className="w-full h-12 bg-[#18B4A6] hover:bg-[#149d94] text-white font-bold text-[14px] rounded-xl shadow-lg shadow-[#18B4A6]/20 transition-all active:scale-[0.98] mt-2" 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait...
                      </>
                    ) : (
                      activeTab === 'login' ? 'Log In' : 'Create Account'
                    )}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
