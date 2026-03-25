'use client';

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X, UtensilsCrossed, ShoppingBag, Bike, Users, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface PaymentSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  subtotal: number;
  tax: number;
  serviceCharge: number;
}

const OrderTypeButton = ({ icon: Icon, label, selected, onClick }: { icon: React.ElementType, label: string, selected: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={cn(
        "flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all",
        selected ? "bg-teal-50 border-teal-500 text-teal-600" : "bg-white border-gray-200 text-gray-500 hover:border-gray-400"
    )}>
        <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center",
            selected ? "bg-teal-100" : "bg-gray-100"
        )}>
            <Icon className="h-5 w-5" />
        </div>
        <span className="text-sm font-bold">{label}</span>
    </button>
);

const TipButton = ({ emoji, label, popular, selected, onClick }: { emoji?: string, label: string, popular?: boolean, selected: boolean, onClick: () => void }) => (
     <button onClick={onClick} className={cn(
        "relative flex-1 flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-2xl border-2 transition-all min-w-[70px]",
        selected ? "bg-teal-50 border-teal-500 text-teal-600" : "bg-white border-gray-200 text-gray-500 hover:border-gray-400"
    )}>
        {popular && <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-teal-500 text-white px-2 py-0.5 text-[10px] font-bold">POPULAR</Badge>}
        {emoji ? <span className="text-2xl">{emoji}</span> : <Pencil className="h-6 w-6"/>}
        <span className="text-sm font-bold">{label}</span>
    </button>
);

export function PaymentSheet({ isOpen, onOpenChange, subtotal, tax, serviceCharge }: PaymentSheetProps) {
    const [orderType, setOrderType] = useState<'dine-in' | 'take-out' | 'delivery'>('dine-in');
    const [selectedTip, setSelectedTip] = useState<number | 'custom' | null>(4);

    const tipAmount = typeof selectedTip === 'number' ? selectedTip : 0;
    const total = subtotal + tax + serviceCharge + tipAmount;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="w-full max-w-md mx-auto p-0 rounded-t-3xl border-0 bg-[#F7F9FB] flex flex-col h-full">
                {/* Header */}
                <SheetHeader className="p-4 flex flex-row items-center justify-between border-b border-gray-200 bg-white rounded-t-3xl shrink-0">
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onOpenChange(false)}><ArrowLeft className="h-5 w-5" /></Button>
                    <SheetTitle className="text-lg font-bold">Payment</SheetTitle>
                    <SheetDescription className="sr-only">Complete your order payment.</SheetDescription>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onOpenChange(false)}><X className="h-5 w-5" /></Button>
                </SheetHeader>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Order Type */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-gray-800">Order Type</h3>
                        <div className="flex items-center gap-3">
                            <OrderTypeButton icon={UtensilsCrossed} label="Dine In" selected={orderType === 'dine-in'} onClick={() => setOrderType('dine-in')} />
                            <OrderTypeButton icon={ShoppingBag} label="Take Out" selected={orderType === 'take-out'} onClick={() => setOrderType('take-out')} />
                            <OrderTypeButton icon={Bike} label="Delivery" selected={orderType === 'delivery'} onClick={() => setOrderType('delivery')} />
                        </div>
                    </div>
                    
                    {/* Summary */}
                    <div className="p-5 bg-white rounded-2xl border border-gray-200/80 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-semibold text-gray-800 font-mono">AED {subtotal.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Taxes & Fees</span>
                            <span className="font-semibold text-gray-800 font-mono">AED {(tax + serviceCharge).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Tip</span>
                            <span className="font-semibold text-gray-800 font-mono">AED {tipAmount.toFixed(2)}</span>
                        </div>
                        <Separator className="my-2 bg-gray-200/80"/>
                        <div className="flex justify-between items-center text-lg">
                            <span className="font-bold text-gray-900">Total</span>
                            <span className="font-bold text-gray-900 font-mono">AED {total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Tip Section */}
                    <div className="text-center space-y-4">
                        <span className="text-6xl">👋</span>
                        <h3 className="text-xl font-bold text-gray-800">Thank your server?</h3>
                        <p className="text-sm text-gray-600 max-w-xs mx-auto">Your small act of kindness goes a long way. 100% of tips go to the staff.</p>
                        <div className="flex items-stretch gap-3 justify-center">
                            <TipButton emoji="☕" label="AED 2" selected={selectedTip === 2} onClick={() => setSelectedTip(2)} />
                            <TipButton emoji="🍕" label="AED 4" popular selected={selectedTip === 4} onClick={() => setSelectedTip(4)} />
                            <TipButton emoji="🍔" label="AED 8" selected={selectedTip === 8} onClick={() => setSelectedTip(8)} />
                             <TipButton label="Custom" selected={selectedTip === 'custom'} onClick={() => setSelectedTip('custom')} />
                        </div>
                        <Button variant="outline" className="w-full max-w-xs mx-auto h-12 bg-white rounded-xl border-gray-300" onClick={() => setSelectedTip(null)}>
                            <X className="h-4 w-4 mr-2 text-red-500"/>
                            <span className="font-bold text-gray-700">No Tip</span>
                        </Button>
                    </div>
                </div>

                <SheetFooter className="p-4 bg-white border-t border-gray-200/80 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] w-full shrink-0 flex-row gap-3">
                    <Button variant="outline" className="h-14 rounded-2xl flex-1 text-base font-bold border-2 border-teal-500 text-teal-600">
                        <Users className="h-5 w-5 mr-2" />
                        Split Bill
                    </Button>
                    <Button className="h-14 rounded-2xl flex-1 text-base font-bold bg-teal-500 hover:bg-teal-600 shadow-lg shadow-teal-500/20">
                        Pay AED {total.toFixed(2)}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
