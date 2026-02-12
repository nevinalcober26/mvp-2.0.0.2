'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EMenuIcon } from '@/components/dashboard/app-sidebar';
import { 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink, 
  Loader2,
  Crown,
  Check,
  BookOpen,
  Video,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function ActivationConfirmationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleGoToDashboard = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    toast({
      title: "Welcome to eMenu!",
      description: "Redirecting to your workspace...",
    });
    router.push('/dashboard');
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-[#fafbfc]">
      {/* Header */}
      <header className="relative z-20 w-full bg-white border-b border-gray-100 py-5 flex justify-center shrink-0">
        <EMenuIcon />
      </header>

      <main className="relative flex-1 flex flex-col items-center p-4 pt-16 pb-32 overflow-auto">
        {/* Mesh Background */}
        <div className="absolute inset-0 z-0 pointer-events-none fixed">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#e6f7f6] blur-[120px] opacity-60" />
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#fffcf0] blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#f0f7ff] blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#fff5f8] blur-[120px] opacity-60" />
        </div>

        <div className="relative z-10 w-full max-w-[740px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* 1. Success Banner */}
          <div className="animated-gradient-border relative rounded-2xl bg-white p-8 shadow-confirmation flex items-start gap-5 border border-white">
            <div className="h-10 w-10 rounded-full bg-[#4ade80] flex items-center justify-center shrink-0 mt-1">
              <Check className="h-6 w-6 text-white" strokeWidth={4} />
            </div>
            <div className="space-y-2">
              <h1 className="text-[22px] font-bold tracking-tight text-[#142424]">License Successfully Activated!</h1>
              <p className="text-[14px] font-medium text-gray-500 leading-relaxed">
                Your Reservationz Pro license has been successfully provisioned and is now active.
              </p>
              <div className="pt-1">
                <Badge className="bg-[#f0fdf4] text-[#166534] font-bold text-[11px] px-3 py-1 border border-[#bbf7d0] flex items-center gap-2 w-fit rounded-full shadow-none">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#166534]" />
                  Payment Processed
                </Badge>
              </div>
            </div>
          </div>

          {/* 2. License Details Card */}
          <Card className="border-0 shadow-confirmation rounded-[24px] overflow-hidden bg-white/95">
            <div className="p-8 pb-4">
              <h2 className="text-[20px] font-bold text-[#142424]">License Details</h2>
              <p className="text-[13px] font-medium text-gray-400">Review your subscription details below</p>
            </div>
            
            <CardContent className="p-8 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-gray-50 pt-8">
                {/* Left: Plan Info */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-[#facc15] fill-[#facc15]" />
                      <span className="text-[13px] font-bold text-[#142424]">Pro Plan</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[36px] font-bold text-[#142424]">$49</span>
                      <span className="text-[14px] font-medium text-gray-400">/month</span>
                    </div>
                    <p className="text-[12px] font-medium text-gray-400">Billed annually ($588/year)</p>
                  </div>
                  
                  <ul className="space-y-3">
                    {[
                      'Up to 5 restaurant locations',
                      'Up to 20 staff users',
                      'Up to 100 tables per restaurant',
                      'Advanced features: Tags, Notes, Analytics',
                      'Email & chat support'
                    ].map(feat => (
                      <li key={feat} className="flex items-center gap-3 text-[13px] font-medium text-gray-600">
                        <Check className="h-4 w-4 text-[#18B4A6]" strokeWidth={3} />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right: Status Table */}
                <div className="space-y-6">
                  <h4 className="text-[13px] font-bold text-[#142424] uppercase tracking-wider mb-4">License Status</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-gray-400 font-medium">License ID:</span>
                      <span className="font-bold text-[#142424] font-mono">PRO-2023-06158942</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-gray-400 font-medium">Status:</span>
                      <span className="font-bold text-[#18B4A6]">Active</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-gray-400 font-medium">Activation Date:</span>
                      <span className="font-bold text-[#142424]">June 16, 2023</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-gray-400 font-medium">Expiration Date:</span>
                      <span className="font-bold text-[#142424]">June 16, 2024</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-gray-400 font-medium">Billing Cycle:</span>
                      <span className="font-bold text-[#142424]">Annual</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-gray-400 font-medium">Auto-renewal:</span>
                      <span className="font-bold text-[#142424]">Enabled</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Primary Dashboard Action */}
          <div className="pt-4 flex flex-col items-center">
            <Button 
              onClick={handleGoToDashboard}
              disabled={isLoading}
              className="h-12 px-8 bg-[#18B4A6] hover:bg-[#149d94] text-white font-bold text-[14px] rounded-xl shadow-lg shadow-[#18B4A6]/20 transition-all active:scale-[0.98] group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4 rotate-180" />
                  Go to Reservationz Dashboard
                </>
              )}
            </Button>
          </div>

          {/* 4. Help Link Box */}
          <div className="p-4 bg-[#f0fdfa] border border-[#ccfbf1] rounded-xl text-center">
            <p className="text-[13px] font-medium text-gray-500">
              Need help getting started? <span className="text-[#18B4A6] font-bold cursor-pointer hover:underline">Watch our tutorial videos</span> or <span className="text-[#18B4A6] font-bold cursor-pointer hover:underline">contact support</span>.
            </p>
          </div>

          {/* 5. Resources Section */}
          <div className="pt-8 space-y-10">
            <h3 className="text-[20px] font-bold text-center text-[#142424]">Resources to Help You Get Started</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Resource 1 */}
              <Card className="border-0 shadow-confirmation rounded-[24px] bg-white overflow-hidden hover:scale-[1.02] transition-transform">
                <CardContent className="p-8 flex items-start gap-5">
                  <div className="h-10 w-10 rounded-lg bg-[#18B4A6]/10 flex items-center justify-center shrink-0">
                    <BookOpen className="h-5 w-5 text-[#18B4A6]" />
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-[16px] font-bold text-[#142424]">Knowledge Base</h4>
                    <p className="text-[13px] font-medium text-gray-400 leading-relaxed">
                      Explore our comprehensive guides and documentation to learn how to use Reservationz effectively.
                    </p>
                    <div className="pt-2">
                      <span className="text-[13px] font-bold text-[#18B4A6] cursor-pointer hover:underline">
                        Browse Knowledge Base
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resource 2 */}
              <Card className="border-0 shadow-confirmation rounded-[24px] bg-white overflow-hidden hover:scale-[1.02] transition-transform">
                <CardContent className="p-8 flex items-start gap-5">
                  <div className="h-10 w-10 rounded-lg bg-[#18B4A6]/10 flex items-center justify-center shrink-0">
                    <Video className="h-5 w-5 text-[#18B4A6]" />
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-[16px] font-bold text-[#142424]">Video Tutorials</h4>
                    <p className="text-[13px] font-medium text-gray-400 leading-relaxed">
                      Watch step-by-step tutorials to help you set up your restaurant management system quickly.
                    </p>
                    <div className="pt-2">
                      <span className="text-[13px] font-bold text-[#18B4A6] cursor-pointer hover:underline">
                        Watch Tutorials
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
