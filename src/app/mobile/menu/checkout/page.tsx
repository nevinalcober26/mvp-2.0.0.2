'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, ShieldCheck, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const VisaIcon = () => (
  <svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M29.87 0H2.13C.95 0 0 .95 0 2.13v15.74C0 19.05.95 20 2.13 20h27.74c1.18 0 2.13-.95 2.13-2.13V2.13C32 .95 31.05 0 29.87 0z" fill="#1A1F71"/>
    <path d="m9.28 14.71-2.9-10.2H3.2l-2.9 10.2H3.5l1.05-3.37h2.6l.51 3.37h3.2zm-2.77-5.1-.81-2.52-.8 2.52h1.6zM13.2 4.51h2.53l1.58 6.78 1.47-6.78H21.3l-2.9 10.2h-3.1L13.2 4.51zM26.27 4.51h3.2v10.2h-3.2V4.51z" fill="#fff"/>
  </svg>
);

const MastercardIcon = () => (
    <svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 10a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" fill="#EB001B"/>
    <path d="M11 10a5 5 0 1 0 10 0 5 5 0 0 0-10 0z" fill="#F79E1B"/>
    <path d="M16 10a5 5 0 1 1-10 0 5 5 0 0 1 10 0z" fill="#FF5F00"/>
  </svg>
);

const NetworkLogo = () => (
  <svg width="140" height="30" viewBox="0 0 140 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#0069B1]">
    <path d="M21.1 13.5h-5.2v8.9h-3.4v-15h8.6c4.6 0 7.7 3.1 7.7 7.6 0 4.1-2.4 6.7-6 7.4l6.8 7.5h-4.2l-6.3-7.5zm0-2.2h-5.2v4.4h5.2c2.4 0 3.7-1.3 3.7-3.6 0-2.7-1.4-3.8-3.7-3.8" fill="currentColor"/>
    <path d="M32.5 7.4h3.4v15h-3.4v-15z" fill="currentColor"/>
    <path d="M49.9 22.4h-3.6L39.8 7.4h3.7l4.4 11.2 4.4-11.2h3.6l-6.5 15z" fill="currentColor"/>
    <path d="M68.4 22.4v-15h-8.8v-3.4h21v3.4h-8.8v15h-3.4z" fill="currentColor"/>
    <path d="M89.3 22.4h-9.9l-3.5-15h3.6l2 9.4 1.8-9.4h3.5l1.8 9.4 2-9.4h3.6l-3.6 15z" fill="currentColor"/>
    <path d="M109.1 22.4h-4.2l-6.3-7.5v7.5h-3.4v-15h3.4v7.5l6-7.5h4.4l-6.4 7.6 6.5 7.4z" fill="currentColor"/>
    <path d="M123.6 24.1c-5.8 0-9.6-4-9.6-9.7s3.8-9.7 9.6-9.7 9.6 4 9.6 9.7-3.8 9.7-9.6 9.7zm0-3.1c3.8 0 6.2-2.7 6.2-6.6s-2.4-6.6-6.2-6.6-6.2 2.7-6.2 6.6 2.4 6.6 6.2 6.6z" fill="currentColor"/>
    <path d="M136.2 12.3 133.5 9.6l4.2-4.2-2.4-2.4-4.2 4.2-2.7-2.7-2.4 2.4 2.7 2.7-4.2 4.2 2.4 2.4 4.2-4.2 2.7 2.7z" fill="#E31E24"/>
  </svg>
);


function CheckoutContent() {
    const router = useRouter();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const total = searchParams.get('total');
    const totalAmount = total ? parseFloat(total) : 0;
    
    const handlePayNow = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 2500));
        setIsProcessing(false);
        toast({
            title: "Payment Successful!",
            description: "Your order has been confirmed.",
        });
        router.push('/mobile/welcome');
    };

    return (
        <div className="flex flex-col min-h-screen w-full max-w-md mx-auto bg-gray-50">
            <header className="p-6 text-center border-b bg-white">
                <NetworkLogo />
            </header>
            
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                <Card className="rounded-2xl shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-200">
                            <Building2 className="h-6 w-6 text-blue-600"/>
                        </div>
                        <div>
                            <p className="font-bold text-gray-800">Network International</p>
                            <p className="text-sm text-gray-500">Secure payment gateway</p>
                        </div>
                    </CardContent>
                    <div className="border-t border-dashed" />
                    <CardContent className="p-4 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">Total Amount</span>
                        <span className="font-bold text-lg text-gray-800 font-mono">AED {totalAmount.toFixed(2)}</span>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm">
                    <CardContent className="p-4 space-y-4">
                        <h3 className="font-bold text-gray-800">Card Information</h3>
                        <div className="space-y-2">
                            <Label htmlFor="card-number">Card Number</Label>
                            <div className="relative">
                                <Input id="card-number" placeholder="1234 5678 9012 3456" className="h-12 rounded-lg bg-gray-100 border-gray-200 pr-20" />
                                {isMounted && (
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                      <VisaIcon />
                                      <MastercardIcon />
                                  </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="expiry-date">Expiry Date</Label>
                                <Input id="expiry-date" placeholder="MM/YY" className="h-12 rounded-lg bg-gray-100 border-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cvv">CVV</Label>
                                <Input id="cvv" placeholder="123" className="h-12 rounded-lg bg-gray-100 border-gray-200" />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="cardholder-name">Cardholder Name</Label>
                            <Input id="cardholder-name" placeholder="John Smith" className="h-12 rounded-lg bg-gray-100 border-gray-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm">
                    <CardContent className="p-4 space-y-4">
                        <h3 className="font-bold text-gray-800">Billing Address</h3>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" placeholder="john@example.com" className="h-12 rounded-lg bg-gray-100 border-gray-200"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Select defaultValue="uae">
                                <SelectTrigger id="country" className="h-12 rounded-lg bg-gray-100 border-gray-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="uae">United Arab Emirates</SelectItem>
                                    <SelectItem value="us">United States</SelectItem>
                                    <SelectItem value="uk">United Kingdom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <div className="p-4 bg-green-50 rounded-2xl border border-green-200 flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-green-600"/>
                    <div>
                        <p className="font-bold text-sm text-green-800">Secure Payment</p>
                        <p className="text-xs text-green-700">Your payment information is encrypted and secure</p>
                    </div>
                </div>
            </main>

            <footer className="sticky bottom-0 p-4 bg-white/80 backdrop-blur-sm border-t">
                <Button 
                    className="w-full h-14 rounded-2xl text-lg font-bold bg-[#0069B1] hover:bg-[#005a99]"
                    onClick={handlePayNow}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                        `Pay AED ${totalAmount.toFixed(2)}`
                    )}
                </Button>
            </footer>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
