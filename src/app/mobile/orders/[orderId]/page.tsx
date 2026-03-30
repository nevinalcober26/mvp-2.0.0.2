'use client';

import React, { Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrders } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Utensils, Bell, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Order } from '@/app/dashboard/orders/types';

const OrderStatusIndicator = ({ currentStatus }: { currentStatus: Order['orderStatus'] }) => {
  const statuses = ['Placed', 'Preparing', 'Served', 'Completed'];
  const statusIcons = {
    'Placed': Check,
    'Preparing': Bell,
    'Served': Utensils,
    'Completed': CheckCircle
  };
  let currentIndex = statuses.indexOf(currentStatus);
  if (currentIndex < 0) {
    // Fallback for statuses like 'Paid' etc.
    if (['Paid', 'Completed', 'Served'].includes(currentStatus)) currentIndex = 3;
    else if (currentStatus === 'Preparing') currentIndex = 1;
    else currentIndex = 0;
  }


  return (
    <div className="flex items-center justify-between">
      {statuses.map((status, index) => {
        const isCompleted = index <= currentIndex;
        const Icon = statusIcons[status as keyof typeof statusIcons] || Check;

        return (
          <React.Fragment key={status}>
            <div className="flex flex-col items-center gap-2 text-center">
              <div
                className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center transition-colors',
                  isCompleted ? 'bg-teal-500 text-white' : 'bg-teal-100 text-teal-400'
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className={cn(
                'text-xs font-bold',
                isCompleted ? 'text-gray-800' : 'text-gray-400'
              )}>{status}</span>
            </div>
            {index < statuses.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-2",
                isCompleted && index < currentIndex ? 'bg-teal-500' : 'bg-teal-100'
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};


function OrderDetails() {
  const router = useRouter();
  const params = useParams();
  const { orders } = useOrders();
  
  const orderId = params.orderId as string;
  const order = orders.find(o => o.orderId.replace('#', '') === orderId);

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen w-full max-w-md mx-auto bg-[#F7F9FB] p-4 font-sans justify-center items-center">
        <p>Order not found.</p>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const subtotal = order.totalAmount;
  const taxesAndFees = subtotal * 0.18; // Example tax calculation
  const tip = 0.00;
  const total = subtotal + taxesAndFees + tip;

  return (
    <div className="flex flex-col min-h-screen w-full max-w-md mx-auto bg-[#F7F9FB] font-sans">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg p-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="-ml-2" onClick={() => router.back()}>
            <ArrowLeft className="h-6 w-6 text-gray-800" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900 text-center flex-1 -ml-10">
            Order #{orderId}
          </h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <Card className="w-full rounded-2xl shadow-lg shadow-gray-200/50 border overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Order Status</h2>
              <Badge className="bg-green-100 text-green-800 border-green-200 font-bold">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                Paid
              </Badge>
            </div>
            <OrderStatusIndicator currentStatus={order.orderStatus} />
          </CardContent>
        </Card>

        <Card className="w-full rounded-2xl shadow-lg shadow-gray-200/50 border overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Bill Summary</h2>
            <div className="space-y-3 text-base">
              <div className="flex justify-between items-center text-gray-600">
                <span>Subtotal</span>
                <span className="font-mono font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Taxes & Fees</span>
                <span className="font-mono font-medium">${taxesAndFees.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Tip</span>
                <span className="font-mono font-medium">${tip.toFixed(2)}</span>
              </div>
            </div>
            <div className="border-t border-dashed border-gray-200 my-4" />
            <div className="flex justify-between items-center text-xl font-bold text-gray-900">
              <span>Total</span>
              <span className="font-mono">${total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function OrderDetailsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OrderDetails />
        </Suspense>
    )
}
