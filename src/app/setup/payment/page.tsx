'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { EMenuIcon } from '@/components/dashboard/app-sidebar';
import { 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  Loader2, 
  Crown, 
  ChevronLeft,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function PaymentGatewayPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [planData, setPlanData] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem('selectedPlan');
    if (data) {
      setPlanData(JSON.parse(data));
    } else {
      router.push('/setup/choose-plan');
    }
  }, [router]);

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate sophisticated payment processing
    await new Promise((resolve) => setTimeout(resolve, 2500));

    toast({
      title: 'Payment Successful',
      description: 'Your premium license has been activated.',
    });

    router.push('/setup/confirmation');
  };

  if (isProcessing) {
    return (
      <div className="relative flex flex-col min-h-screen items-center justify-center bg-[#fafbfc]">
        <div className="absolute inset-0 z-0 pointer-events-none fixed">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#f0f7ff] blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#f0f7ff] blur-[120px] opacity-60" />
        </div>
        <div className="relative z-10 flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-500 text-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-4 border-[#BC1E2D]/10 flex items-center justify-center">
              <ShieldCheck className="h-12 w-12 text-[#BC1E2D] animate-pulse" />
            </div>
            <div className="absolute inset-0 h-24 w-24 rounded-full border-t-4 border-[#BC1E2D] animate-spin" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-[#142424]">Securing Transaction</h2>
            <p className="text-[15px] font-medium text-gray-400 max-w-[340px] leading-relaxed">
              We are verifying your payment details with <span className="font-bold text-[#142424]">Network International</span> secure servers...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-[#fafbfc]">
      {/* Refined Corporate Header */}
      <header className="relative z-20 w-full bg-white border-b border-gray-100 py-5 px-8 flex justify-between items-center shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors group"
          >
            <ChevronLeft className="h-5 w-5 text-gray-400 group-hover:text-[#BC1E2D]" />
          </button>
          <div className="h-8 w-px bg-gray-100 mx-2 hidden sm:block" />
          <EMenuIcon />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Payment Provider</span>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded bg-[#EE7623] flex items-center justify-center text-white font-bold text-[8px]">NI</div>
              <span className="text-xs font-bold text-[#142424]">Network International</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center border">
            <Lock className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </header>

      <main className="relative flex-1 flex flex-col items-center p-4 pt-12 overflow-auto">
        {/* Professional Mesh Gradient */}
        <div className="absolute inset-0 z-0 pointer-events-none fixed">
          <div className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] rounded-full bg-[#fff1f1] blur-[100px] opacity-70" />
          <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[#fdf0f0] blur-[100px] opacity-70" />
        </div>

        <div className="relative z-10 w-full max-w-[960px] grid grid-cols-1 lg:grid-cols-12 gap-10 mb-24">
          
          {/* Payment Details Column */}
          <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="space-y-2">
              <h1 className="text-[32px] font-bold text-[#142424]">Secure Checkout</h1>
              <p className="text-[15px] font-medium text-gray-400">Complete your activation by providing payment information</p>
            </div>

            <Card className="border-0 shadow-2xl shadow-red-900/5 rounded-[32px] overflow-hidden bg-white/95 backdrop-blur-xl">
              <CardContent className="p-8 sm:p-10 space-y-8">
                
                {/* Demo Disclaimer Badge - Professional Style */}
                <div className="p-5 rounded-[20px] bg-red-50/50 border border-red-100 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                    <ShieldCheck className="h-5 w-5 text-[#BC1E2D]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase text-[#BC1E2D]">Prototype Environment</p>
                    <p className="text-[13px] font-medium text-gray-600 leading-relaxed">
                      This interface is for <span className="font-bold text-[#142424]">prototype demonstration purposes only</span>. No real credit card processing or charges will occur.
                    </p>
                  </div>
                </div>

                {/* Card Selection Visual */}
                <div className="flex items-center justify-between p-5 bg-gray-50/80 rounded-2xl border border-gray-100/50">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white shadow-sm border flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-[#142424]">Credit or Debit Card</p>
                      <p className="text-[11px] text-gray-400 font-medium uppercase">Accepting Visa, Mastercard, AMEX</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 opacity-60 grayscale hover:grayscale-0 transition-all cursor-default">
                    <div className="h-6 w-10 bg-[#1A1F71] rounded flex items-center justify-center text-[8px] text-white font-bold italic">VISA</div>
                    <div className="h-6 w-10 bg-[#EB001B] rounded flex items-center justify-center text-[8px] text-white font-bold">MC</div>
                  </div>
                </div>

                <form onSubmit={handleProcessPayment} className="space-y-6">
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-[12px] font-bold uppercase text-gray-400">Cardholder Name</Label>
                      <Input 
                        defaultValue="John Smith" 
                        className="h-14 bg-white border-gray-200 rounded-2xl px-5 font-bold text-[#142424] text-base focus:ring-[#BC1E2D] focus:border-[#BC1E2D] transition-all" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[12px] font-bold uppercase text-gray-400">Card Number</Label>
                      <div className="relative">
                        <Input 
                          defaultValue="4242 4242 4242 4242" 
                          className="h-14 bg-white border-gray-200 rounded-2xl px-5 font-bold text-[#142424] text-base focus:ring-[#BC1E2D] focus:border-[#BC1E2D] transition-all" 
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                           <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-[12px] font-bold uppercase text-gray-400">Expiration Date</Label>
                        <Input 
                          defaultValue="12/26" 
                          className="h-14 bg-white border-gray-200 rounded-2xl px-5 font-bold text-[#142424] text-base focus:ring-[#BC1E2D] focus:border-[#BC1E2D] transition-all" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[12px] font-bold uppercase text-gray-400">CVV / CVC</Label>
                        <div className="relative">
                          <Input 
                            defaultValue="***" 
                            type="password" 
                            className="h-14 bg-white border-gray-200 rounded-2xl px-5 font-bold text-[#142424] text-base focus:ring-[#BC1E2D] focus:border-[#BC1E2D] transition-all" 
                          />
                          <Lock className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-16 bg-[#BC1E2D] hover:bg-[#9e1825] text-white font-bold uppercase text-[15px] rounded-2xl shadow-xl shadow-red-900/20 transition-all active:scale-[0.98] mt-4"
                    type="submit"
                  >
                    Authorize Payment — ${planData?.price || 0}.00
                  </Button>

                  <div className="flex items-center justify-center gap-3 text-[11px] font-bold text-gray-400 uppercase">
                    <div className="flex items-center gap-1 text-green-600">
                      <Lock className="h-3 w-3" /> Secure
                    </div>
                    <span className="h-1 w-1 rounded-full bg-gray-200" />
                    Encrypted via Network International
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-5 space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
            <h3 className="text-[18px] font-bold text-[#142424] pt-4 px-2">Order Summary</h3>
            <Card className="border-0 shadow-lg rounded-[32px] bg-white text-[#142424] overflow-hidden">
              <CardContent className="p-8 space-y-8">
                <div className="flex items-center justify-between border-b border-gray-50 pb-8">
                  <div className="space-y-1">
                    <Badge className="bg-[#BC1E2D]/10 text-[#BC1E2D] font-bold uppercase px-3 py-1 border-0 shadow-none mb-1">
                      {planData?.plan || 'PRO'} PLAN
                    </Badge>
                    <h4 className="text-2xl font-bold">eMenu Digital Hub</h4>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
                    <Crown className="h-7 w-7 text-[#BC1E2D]" />
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-gray-400 uppercase text-[11px]">Billing Cycle</span>
                    <span className="text-[#142424] capitalize">{planData?.cycle || 'Monthly'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-gray-400 uppercase text-[11px]">Subtotal (License)</span>
                    <span className="text-[#142424] tabular-nums">${planData?.price || 0}.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-gray-400 uppercase text-[11px]">Tax / VAT</span>
                    <span className="text-[#142424] tabular-nums">$0.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-gray-400 uppercase text-[11px]">Setup Fee</span>
                    <span className="text-green-600 font-bold uppercase text-xs bg-green-50 px-2 py-0.5 rounded">Waived</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-gray-400 leading-none mb-1">Total Due</span>
                    <span className="text-sm font-bold text-[#BC1E2D]">USD / Monthly</span>
                  </div>
                  <span className="text-4xl font-bold text-[#142424] tabular-nums">
                    ${planData?.price || 0}.00
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Support Hint */}
            <div className="p-6 bg-red-50/30 rounded-[24px] border border-red-100/50 space-y-2">
              <p className="text-[13px] font-bold text-gray-700">Need help with your purchase?</p>
              <p className="text-[12px] font-medium text-gray-500 leading-relaxed">
                Contact our accounts team at <span className="text-[#BC1E2D] font-bold cursor-pointer">billing@emenutable.com</span> for any subscription inquiries.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
