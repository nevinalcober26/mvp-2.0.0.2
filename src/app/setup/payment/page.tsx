'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { EMenuIcon } from '@/components/dashboard/app-sidebar';
import { CreditCard, Lock, ShieldCheck, Check, ArrowRight, Loader2, RefreshCw, Crown, AlertCircle } from 'lucide-react';
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
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#fef3eb] blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#f0f7ff] blur-[120px] opacity-60" />
        </div>
        <div className="relative z-10 flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-4 border-[#EE7623]/20 flex items-center justify-center animate-pulse">
              <ShieldCheck className="h-12 w-12 text-[#EE7623]" />
            </div>
            <div className="absolute inset-0 h-24 w-24 rounded-full border-t-4 border-[#EE7623] animate-spin" />
          </div>
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black text-[#142424]">Securing Transaction</h2>
            <p className="text-[15px] font-medium text-gray-400 max-w-[300px]">
              Processing through Network International secure servers...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-[#fafbfc]">
      <header className="relative z-20 w-full bg-white border-b border-gray-100 py-4 px-8 flex justify-between items-center shrink-0">
        <EMenuIcon />
        <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Powered by</span>
            <div className="flex items-center gap-1.5">
                <div className="h-6 w-6 rounded-md bg-[#EE7623] flex items-center justify-center text-white font-black text-[10px]">NI</div>
                <span className="text-sm font-black text-[#142424] tracking-tight">Network International</span>
            </div>
        </div>
      </header>

      <main className="relative flex-1 flex flex-col items-center p-4 pt-12 overflow-auto">
        <div className="absolute inset-0 z-0 pointer-events-none fixed">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#fef3eb] blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#fffcf0] blur-[120px] opacity-60" />
        </div>

        <div className="relative z-10 w-full max-w-[900px] grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24">
          <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="space-y-2">
              <h1 className="text-[32px] font-black tracking-tight text-[#142424]">Complete Your Purchase</h1>
              <p className="text-[15px] font-medium text-gray-400">Secure hosted checkout for your Pro license activation</p>
            </div>

            <Card className="border-0 shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-[24px] overflow-hidden bg-white/90 backdrop-blur-xl">
              <CardContent className="p-8 space-y-8">
                {/* Prototype Disclaimer Badge */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-[0.1em] text-amber-900">Prototype Demo Environment</p>
                    <p className="text-[13px] font-medium text-amber-800 leading-relaxed">
                      This payment gateway is for prototype demonstration purposes only. No actual credit card will be charged.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#EE7623]/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-[#EE7623]" />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-[#142424]">Credit Card</p>
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Visa, Mastercard, Amex</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 w-10 bg-white rounded border border-gray-200" />
                    <div className="h-6 w-10 bg-white rounded border border-gray-200" />
                  </div>
                </div>

                <form onSubmit={handleProcessPayment} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-[12px] font-bold text-[#142424]">Cardholder Name</Label>
                      <Input defaultValue="John Smith" className="h-12 bg-white border-gray-200 rounded-xl px-4 font-bold text-[#142424]" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[12px] font-bold text-[#142424]">Card Number</Label>
                      <div className="relative">
                        <Input defaultValue="4242 4242 4242 4242" className="h-12 bg-white border-gray-200 rounded-xl px-4 font-bold tracking-widest text-[#142424]" />
                        <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[12px] font-bold text-[#142424]">Expiry Date</Label>
                        <Input defaultValue="12/26" className="h-12 bg-white border-gray-200 rounded-xl px-4 font-bold text-[#142424]" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[12px] font-bold text-[#142424]">CVV</Label>
                        <div className="relative">
                          <Input defaultValue="***" type="password" className="h-12 bg-white border-gray-200 rounded-xl px-4 font-bold text-[#142424]" />
                          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-14 bg-[#EE7623] hover:bg-[#d6651d] text-white font-black uppercase tracking-widest text-[15px] rounded-xl shadow-xl shadow-[#EE7623]/20 transition-all active:scale-[0.98]"
                    type="submit"
                  >
                    Pay ${planData?.price || 0}.00 Now
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    <Lock className="h-3 w-3" />
                    Secure Encrypted Transaction via NI
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
            <h3 className="text-[18px] font-black text-[#142424] pt-4 text-left">Order Summary</h3>
            <Card className="border-0 shadow-lg rounded-[24px] bg-white text-[#142424] overflow-hidden">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                  <div className="space-y-1 text-left">
                    <Badge className="bg-[#EE7623]/10 text-[#EE7623] font-black text-[9px] uppercase px-2 py-0.5 border-0 shadow-none">PRO PLAN</Badge>
                    <h4 className="text-xl font-black">eMenu Digital Hub</h4>
                  </div>
                  <Crown className="h-8 w-8 text-[#EE7623]" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-bold">Billing Cycle</span>
                    <span className="font-black capitalize">{planData?.cycle}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-bold">Platform Fee</span>
                    <span className="font-black">${planData?.price || 0}.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-bold">Setup Fee</span>
                    <span className="text-[#EE7623] font-black uppercase tracking-wider">WAIVED</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 flex justify-between items-center">
                  <span className="text-lg font-black tracking-tight">Total Amount</span>
                  <span className="text-3xl font-black text-[#EE7623] tabular-nums">${planData?.price || 0}.00</span>
                </div>
              </CardContent>
            </Card>

            <div className="p-6 bg-white rounded-[24px] border border-gray-100 shadow-sm space-y-4 text-left">
              <h4 className="text-[13px] font-black text-[#142424] uppercase tracking-wider">Plan Highlights</h4>
              <ul className="space-y-3">
                {['Up to 5 locations', 'Priority 24/7 Support', 'Advanced Analytics'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-[12px] font-bold text-gray-500">
                    <Check className="h-4 w-4 text-[#EE7623]" strokeWidth={3} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
