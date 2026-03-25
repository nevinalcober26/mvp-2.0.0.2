'use client';

import React, { useEffect } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Loader2, Lock } from 'lucide-react';

interface PaymentRedirectSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
}

export function PaymentRedirectSheet({ isOpen, onOpenChange, total }: PaymentRedirectSheetProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        // In a real app, you'd redirect to the payment gateway here.
        // For this prototype, we'll just close the sheet.
        onOpenChange(false);
      }, 4000); // Simulate a 4-second redirect
      return () => clearTimeout(timer);
    }
  }, [isOpen, onOpenChange]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="w-full max-w-md mx-auto p-8 rounded-t-3xl border-0 bg-[#F7F9FB] flex flex-col justify-center items-center text-center h-full">
        <div className="space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <Loader2 className="w-full h-full text-blue-500 animate-spin" style={{ animationDuration: '1.5s' }} />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-800">Redirecting Payment</h2>
            <p className="text-gray-500">Please wait a moment...</p>
          </div>

          <div className="w-full max-w-sm mx-auto bg-white rounded-2xl p-5 space-y-4 border border-gray-200/80 shadow-sm">
            <div className="flex justify-between items-center text-left">
              <span className="text-sm text-gray-500">Amount</span>
              <span className="text-lg font-bold text-gray-800 font-mono">AED {total.toFixed(2)}</span>
            </div>
            <div className="border-t border-dashed border-gray-200" />
            <div className="flex items-center gap-3 text-left">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-200">
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin"/>
              </div>
              <div>
                  <p className="font-semibold text-gray-800">Connecting to payment gateway</p>
                  <p className="text-sm text-gray-500">Network International</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-sm text-gray-400">
            <Lock className="h-4 w-4" />
            <span>Secure payment</span>
        </div>
      </SheetContent>
    </Sheet>
  );
}
