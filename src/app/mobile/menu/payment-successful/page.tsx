'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Mail } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

const feedbackOptions = [
  { level: 'Poor', emoji: '😔' },
  { level: 'Fair', emoji: '😐' },
  { level: 'Good', emoji: '😊' },
  { level: 'Great', emoji: '😄' },
  { level: 'Excellent', emoji: '🤩' },
];

export default function PaymentSuccessfulPage() {
  const router = useRouter();
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
  const giftIcon = PlaceHolderImages.find(img => img.id === 'gift-icon');

  return (
    <div className="flex flex-col min-h-screen w-full max-w-md mx-auto bg-[#F7F9FB] p-4 font-sans">
      <main className="flex-1 flex flex-col items-center justify-center">
        <Card className="w-full rounded-3xl shadow-lg bg-white p-6 pt-8 text-center space-y-6">
          
          <div className="flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-10 w-10 text-green-500" strokeWidth={3} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
            <p className="text-gray-500 mt-1">Thank you for dining with us</p>
          </div>

          <div className="w-full border-t border-dashed border-gray-200" />

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">How was your experience?</h2>
            <p className="text-sm text-gray-500">Your feedback helps us improve</p>
            <div className="flex justify-around pt-2">
              {feedbackOptions.map((opt) => (
                <button
                  key={opt.level}
                  onClick={() => setSelectedFeedback(opt.level)}
                  className={cn(
                    "flex flex-col items-center gap-2 text-center rounded-xl p-2 w-16 transition-all",
                    selectedFeedback === opt.level ? "bg-teal-50" : "hover:bg-gray-100"
                  )}
                >
                  <span className="text-3xl">{opt.emoji}</span>
                  <span className={cn(
                    "text-xs font-semibold",
                    selectedFeedback === opt.level ? "text-teal-600" : "text-gray-500"
                  )}>{opt.level}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-4 bg-gray-800 rounded-2xl flex items-center justify-between text-white my-4">
              <div className="flex items-center gap-3 text-left">
                  {giftIcon && (
                      <div className="relative h-12 w-12 flex-shrink-0">
                          <Image src={giftIcon.imageUrl} alt={giftIcon.description} fill sizes="48px" className="object-contain" data-ai-hint={giftIcon.imageHint} />
                      </div>
                  )}
                  <div>
                      <p className="font-extrabold uppercase">Join VIP Club</p>
                      <p className="text-xs text-gray-300">Get special <span className="font-bold text-yellow-300">discounts +</span> exclusive perks</p>
                  </div>
              </div>
              <Button className="rounded-lg h-9 px-4 bg-white text-gray-900 font-bold text-sm hover:bg-gray-200">Join Free</Button>
          </div>
          
        </Card>

        <div className="w-full space-y-3 mt-6">
            <Button variant="outline" className="w-full h-14 rounded-xl text-base font-bold bg-white border-gray-300">
                <Mail className="h-5 w-5 mr-3 text-gray-500" />
                Email Receipt
            </Button>
            <Button className="w-full h-14 rounded-xl text-base font-bold bg-teal-500 hover:bg-teal-600" onClick={() => router.push('/mobile/welcome')}>
                Done
            </Button>
        </div>

      </main>
    </div>
  );
}
