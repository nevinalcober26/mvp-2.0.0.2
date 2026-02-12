'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EMenuIcon } from '@/components/dashboard/app-sidebar';
import { Check, X, Building2, Crown, Sprout, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const steps = [
  { id: 1, label: 'Signup', status: 'completed' },
  { id: 2, label: 'Business Profile', status: 'completed' },
  { id: 3, label: 'Choose a Plan', status: 'current' },
  { id: 4, label: 'Payment', status: 'upcoming' },
  { id: 5, label: 'Confirmation', status: 'upcoming' },
];

const features = [
  { name: 'Restaurant Locations', free: '1', pro: 'Up to 5', enterprise: 'Unlimited' },
  { name: 'Staff Users', free: 'Up to 3', pro: 'Up to 20', enterprise: 'Unlimited' },
  { name: 'Tables Per Restaurant', free: 'Up to 20', pro: 'Up to 100', enterprise: 'Unlimited' },
  { name: 'Table Tags & Notes', free: false, pro: true, enterprise: true },
  { name: 'Floor Plan Designer', free: 'Basic', pro: 'Advanced', enterprise: 'Custom' },
  { name: 'API Access', free: false, pro: 'Basic', enterprise: 'Full + Webhooks' },
  { name: 'Analytics & Reporting', free: 'Basic', pro: 'Advanced', enterprise: 'Custom' },
  { name: 'Support', free: 'Email Only', pro: 'Email & Chat', enterprise: '24/7 Priority' },
  { name: 'Custom Branding', free: false, pro: true, enterprise: true },
];

export default function ChoosePlanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectPlan = async (plan: string) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    localStorage.setItem('selectedPlan', JSON.stringify({ plan, cycle: billingCycle }));
    
    toast({
      title: 'Plan Selected',
      description: `You have selected the ${plan} plan.`,
    });

    if (plan === 'Free') {
        router.push('/dashboard');
    } else {
        router.push('/dashboard'); // In a real app, go to /setup/payment
    }
  };

  const RenderCheck = ({ value }: { value: boolean | string }) => {
    if (typeof value === 'boolean') {
      return value ? (
        <div className="flex justify-center"><Check className="h-5 w-5 text-[#18B4A6]" strokeWidth={3} /></div>
      ) : (
        <div className="flex justify-center"><X className="h-5 w-5 text-gray-300" /></div>
      );
    }
    return <span className="text-[13px] font-medium text-gray-600">{value}</span>;
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-[#fafbfc]">
      <header className="relative z-20 w-full bg-white border-b border-gray-100 py-4 flex justify-center shrink-0">
        <EMenuIcon />
      </header>

      <main className="relative flex-1 flex flex-col items-center p-4 pt-12 overflow-auto pb-24">
        <div className="absolute inset-0 z-0 pointer-events-none fixed">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#e6f7f6] blur-[120px] opacity-60" />
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#fffcf0] blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#f0f7ff] blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#fff5f8] blur-[120px] opacity-60" />
        </div>

        {/* Stepper */}
        <div className="relative z-10 w-full max-w-[800px] mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold transition-all duration-300",
                      step.status === 'completed'
                        ? "bg-[#18B4A6] text-white"
                        : step.status === 'current'
                        ? "bg-[#18B4A6] text-white ring-4 ring-[#18B4A6]/10"
                        : "bg-gray-200 text-gray-400"
                    )}
                  >
                    {step.status === 'completed' ? <Check className="h-4 w-4" strokeWidth={3} /> : step.id}
                  </div>
                  <span
                    className={cn(
                      "text-[13px] font-bold whitespace-nowrap",
                      step.status === 'upcoming' ? "text-gray-400" : "text-gray-900"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4 h-[2px] bg-gray-200">
                    <div 
                      className={cn(
                        "h-full bg-[#18B4A6] transition-all duration-500",
                        step.status === 'completed' ? "w-full" : "w-0"
                      )} 
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="relative z-10 w-full max-w-[1000px] text-center space-y-12">
          <div className="space-y-3">
            <h1 className="text-[36px] font-black tracking-tight text-[#142424]">
              Choose Your License Plan
            </h1>
            <p className="text-[15px] font-medium text-gray-400 max-w-[600px] mx-auto leading-relaxed">
              Select the plan that best fits your business needs. All plans include our core reservation management features.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <div className="bg-white border border-gray-100 p-1 rounded-2xl shadow-sm flex items-center">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  "px-6 py-2 text-[13px] font-bold rounded-xl transition-all",
                  billingCycle === 'monthly' ? "bg-[#18B4A6] text-white shadow-lg shadow-[#18B4A6]/20" : "text-gray-400 hover:text-gray-600"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={cn(
                  "px-6 py-2 text-[13px] font-bold rounded-xl transition-all flex items-center gap-2",
                  billingCycle === 'annual' ? "bg-[#18B4A6] text-white shadow-lg shadow-[#18B4A6]/20" : "text-gray-400 hover:text-gray-600"
                )}
              >
                Annual
                <Badge className="bg-[#4ade80] text-[#064e3b] text-[10px] font-black px-1.5 py-0 border-0 h-4">Save 20%</Badge>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Free Plan */}
            <Card className="border-0 shadow-[0_15px_40px_rgba(0,0,0,0.04)] rounded-[24px] bg-white/80 backdrop-blur-xl overflow-hidden group hover:scale-[1.02] transition-all duration-300">
              <CardHeader className="p-8 text-left space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-[24px] font-black text-[#142424]">Free</CardTitle>
                    <p className="text-[12px] font-bold text-gray-400">For small businesses</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <Sprout className="h-5 w-5 text-green-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[32px] font-black text-[#142424]">$0</p>
                  <p className="text-[12px] font-medium text-gray-400">Forever free</p>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0 text-left space-y-6">
                <ul className="space-y-3">
                  {[
                    { text: '1 restaurant location', check: true },
                    { text: 'Up to 3 staff users', check: true },
                    { text: 'Up to 20 tables', check: true },
                    { text: 'Basic reservation management', check: true },
                    { text: 'No table tags & notes', check: false },
                    { text: 'No API access', check: false },
                    { text: 'Email support only', check: false },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-[13px] font-medium">
                      {item.check ? (
                        <Check className="h-4 w-4 text-[#18B4A6]" strokeWidth={3} />
                      ) : (
                        <X className="h-4 w-4 text-gray-300" />
                      )}
                      <span className={item.check ? "text-gray-700" : "text-gray-400"}>{item.text}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  variant="outline"
                  onClick={() => handleSelectPlan('Free')}
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl border-[#18B4A6] text-[#18B4A6] font-bold text-[14px] hover:bg-[#18B4A6]/5 transition-all"
                >
                  Select Free Plan
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-[#18B4A6] shadow-[0_20px_50px_rgba(24,180,166,0.15)] rounded-[24px] bg-white overflow-hidden relative group hover:scale-[1.05] transition-all duration-300 z-20">
              <div className="bg-[#18B4A6] text-white py-2 px-4 text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Most Popular</span>
              </div>
              <CardHeader className="p-8 text-left space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-[24px] font-black text-[#142424]">Pro</CardTitle>
                    <p className="text-[12px] font-bold text-gray-400">For growing businesses</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-[#18B4A6]/10 flex items-center justify-center">
                    <Crown className="h-5 w-5 text-[#18B4A6]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <p className="text-[32px] font-black text-[#142424]">{billingCycle === 'monthly' ? '$49' : '$39'}</p>
                    <p className="text-[14px] font-bold text-gray-400">/month</p>
                  </div>
                  <p className="text-[12px] font-medium text-[#18B4A6]">{billingCycle === 'annual' ? '$468 billed annually' : '$588 billed annually'}</p>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0 text-left space-y-6">
                <ul className="space-y-3">
                  {[
                    'Up to 5 restaurant locations',
                    'Up to 20 staff users',
                    'Up to 100 tables per restaurant',
                    'Advanced reservation management',
                    'Table tags & notes',
                    'Basic API access',
                    'Email & chat support',
                  ].map((text, i) => (
                    <li key={i} className="flex items-center gap-3 text-[13px] font-medium text-gray-700">
                      <Check className="h-4 w-4 text-[#18B4A6]" strokeWidth={3} />
                      {text}
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => handleSelectPlan('Pro')}
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl bg-[#18B4A6] text-white font-bold text-[14px] hover:bg-[#149d94] shadow-lg shadow-[#18B4A6]/30 transition-all active:scale-[0.98]"
                >
                  Select Pro Plan
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-0 shadow-[0_15px_40px_rgba(0,0,0,0.04)] rounded-[24px] bg-white/80 backdrop-blur-xl overflow-hidden group hover:scale-[1.02] transition-all duration-300">
              <CardHeader className="p-8 text-left space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-[24px] font-black text-[#142424]">Enterprise</CardTitle>
                    <p className="text-[12px] font-bold text-gray-400">For large organizations</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[32px] font-black text-[#142424]">Custom</p>
                  <p className="text-[12px] font-medium text-gray-400">Tailored to your needs</p>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0 text-left space-y-6">
                <ul className="space-y-3">
                  {[
                    'Unlimited restaurant locations',
                    'Unlimited staff users',
                    'Unlimited tables per restaurant',
                    'Enterprise-grade features',
                    'Advanced table management',
                    'Full API access & webhooks',
                    '24/7 priority support',
                  ].map((text, i) => (
                    <li key={i} className="flex items-center gap-3 text-[13px] font-medium text-gray-700">
                      <Check className="h-4 w-4 text-[#18B4A6]" strokeWidth={3} />
                      {text}
                    </li>
                  ))}
                </ul>
                <Button 
                  variant="outline"
                  onClick={() => handleSelectPlan('Enterprise')}
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl border-[#18B4A6] text-[#18B4A6] font-bold text-[14px] hover:bg-[#18B4A6]/5 transition-all"
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Table */}
          <div className="space-y-8 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-[24px] font-black text-[#142424]">Compare All Features</h2>
            
            <Card className="border-0 shadow-[0_15px_40px_rgba(0,0,0,0.04)] rounded-[24px] overflow-hidden bg-white/90">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="border-gray-100 h-16">
                    <TableHead className="w-[30%] px-8 text-[12px] font-black uppercase tracking-widest text-gray-400">Features</TableHead>
                    <TableHead className="text-center text-[12px] font-black uppercase tracking-widest text-gray-400">Free</TableHead>
                    <TableHead className="text-center text-[12px] font-black uppercase tracking-widest text-[#18B4A6]">Pro</TableHead>
                    <TableHead className="text-center text-[12px] font-black uppercase tracking-widest text-gray-400">Enterprise</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {features.map((feature, i) => (
                    <TableRow key={feature.name} className="border-gray-100 h-14 group">
                      <TableCell className="px-8 text-[13px] font-bold text-gray-900">{feature.name}</TableCell>
                      <TableCell className="text-center"><RenderCheck value={feature.free} /></TableCell>
                      <TableCell className="text-center bg-[#18B4A6]/[0.02]"><RenderCheck value={feature.pro} /></TableCell>
                      <TableCell className="text-center"><RenderCheck value={feature.enterprise} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          <div className="flex items-center justify-between pt-12">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="text-[13px] font-bold text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
            </Button>
            <p className="text-[12px] font-medium text-gray-400 italic">
              Need a custom plan? <span className="text-[#18B4A6] font-bold cursor-pointer hover:underline">Chat with us</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
