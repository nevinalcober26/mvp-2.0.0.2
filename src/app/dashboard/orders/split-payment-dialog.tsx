'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Package, ArrowLeft, CreditCard, Banknote, CheckCircle, X } from 'lucide-react';
import type { Order, OrderItem, Payment } from './types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SplitPaymentDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateOrder: (updatedOrder: Order) => void;
}

// --- Internal Components for each step ---

const SelectMethodStep = ({ onSelect }: { onSelect: (method: 'equally' | 'byItem') => void }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
        <Card className="hover:shadow-lg hover:border-primary transition-all cursor-pointer text-center" onClick={() => onSelect('equally')}>
            <CardContent className="p-8">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg">Split Equally</h3>
                <p className="text-sm text-muted-foreground mt-1">Divide the bill evenly among a number of people.</p>
            </CardContent>
        </Card>
        <Card className="hover:shadow-lg hover:border-primary transition-all cursor-pointer text-center" onClick={() => onSelect('byItem')}>
            <CardContent className="p-8">
                <Package className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg">Split by Item</h3>
                <p className="text-sm text-muted-foreground mt-1">Let each person pay for their specific items.</p>
            </CardContent>
        </Card>
    </div>
);

const RecordPaymentConfirm = ({ onConfirm }: { onConfirm: (method: 'Card' | 'Cash') => void }) => (
    <div className="flex gap-2">
        <Button onClick={() => onConfirm('Card')} className="flex-1">
            <CreditCard className="mr-2 h-4 w-4" /> Card
        </Button>
        <Button onClick={() => onConfirm('Cash')} variant="secondary" className="flex-1">
            <Banknote className="mr-2 h-4 w-4" /> Cash
        </Button>
    </div>
);

const SplitEquallyView = ({ order, onBack, onUpdateOrder, onOpenChange }: Omit<SplitPaymentDialogProps, 'open'> & { onBack: () => void }) => {
    const { toast } = useToast();
    const [numSplits, setNumSplits] = useState(2);
    const [paidStatus, setPaidStatus] = useState<boolean[]>([]);
    const [confirmingPayerIndex, setConfirmingPayerIndex] = useState<number | null>(null);

    useEffect(() => {
        setPaidStatus(Array(numSplits).fill(false));
    }, [numSplits]);

    const totalAmount = order?.totalAmount || 0;
    const amountPerPerson = numSplits > 0 ? totalAmount / numSplits : 0;

    const handleRecordPayment = (index: number, method: 'Card' | 'Cash') => {
        setPaidStatus(prev => {
            const newStatus = [...prev];
            newStatus[index] = true;
            return newStatus;
        });
        
        const newPayment: Payment = {
            method: method,
            amount: amountPerPerson.toFixed(2),
            date: new Date().toLocaleString(),
            transactionId: `txn_split_${Date.now()}`,
            guestName: `Payer ${index + 1}`
        };

        if (order) {
            const updatedOrder: Order = {
                ...order,
                paidAmount: order.paidAmount + amountPerPerson,
                payments: [...order.payments, newPayment],
                paymentState: order.paidAmount + amountPerPerson >= totalAmount ? 'Fully Paid' : 'Partial',
                splitType: 'equally',
            };
            onUpdateOrder(updatedOrder);
        }

        toast({ title: "Payment Recorded", description: `Payment of $${amountPerPerson.toFixed(2)} for Payer ${index + 1} recorded.` });
        setConfirmingPayerIndex(null);

        if (paidStatus.filter(s => !s).length === 1) { // This was the last one
            setTimeout(() => onOpenChange(false), 500);
        }
    };
    
    return (
        <div className="py-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 items-end">
                <div className="space-y-1.5">
                    <Label htmlFor="num-splits">Number of People</Label>
                    <Input id="num-splits" type="number" min="2" max="20" value={numSplits} onChange={e => setNumSplits(parseInt(e.target.value, 10) || 2)} />
                </div>
                <div className="text-right pb-2">
                    <p className="text-sm text-muted-foreground">Amount per person</p>
                    <p className="text-2xl font-bold font-mono">${amountPerPerson.toFixed(2)}</p>
                </div>
            </div>
            <Separator />
            <ScrollArea className="h-64">
                <div className="space-y-3 pr-4">
                    {Array.from({ length: numSplits }).map((_, index) => (
                        <Card key={index} className={cn("p-4 flex justify-between items-center", paidStatus[index] && "bg-green-50 border-green-200")}>
                            <p className="font-semibold">Payer {index + 1}</p>
                            {paidStatus[index] ? (
                                <div className="flex items-center gap-2 text-green-600 font-semibold">
                                    <CheckCircle className="h-5 w-5" /> Paid
                                </div>
                            ) : (
                                <Button size="sm" onClick={() => setConfirmingPayerIndex(index)}>Record Payment</Button>
                            )}
                        </Card>
                    ))}
                </div>
            </ScrollArea>
             <AlertDialog open={confirmingPayerIndex !== null} onOpenChange={() => setConfirmingPayerIndex(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Record Payment for Payer {confirmingPayerIndex !== null ? confirmingPayerIndex + 1 : ''}</AlertDialogTitle>
                        <AlertDialogDescription>
                            Confirm payment of <strong>${amountPerPerson.toFixed(2)}</strong>. Choose the payment method used.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <div className="flex gap-2">
                             <Button onClick={() => handleRecordPayment(confirmingPayerIndex!, 'Card')} className="flex-1">
                                <CreditCard className="mr-2 h-4 w-4" /> Card
                            </Button>
                            <Button onClick={() => handleRecordPayment(confirmingPayerIndex!, 'Cash')} variant="secondary" className="flex-1">
                                <Banknote className="mr-2 h-4 w-4" /> Cash
                            </Button>
                        </div>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

const SplitByItemView = ({ order, onBack, onUpdateOrder, onOpenChange }: Omit<SplitPaymentDialogProps, 'open'> & { onBack: () => void }) => {
    const { toast } = useToast();
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [paidItems, setPaidItems] = useState<Set<string>>(new Set());
    const [confirmingPayment, setConfirmingPayment] = useState(false);

    const subtotal = useMemo(() => {
        return Array.from(selectedItems).reduce((acc, itemId) => {
            const item = order?.items.find(i => i.id === itemId);
            return acc + (item ? item.price * item.quantity : 0);
        }, 0);
    }, [selectedItems, order?.items]);

    const handleToggleItem = (itemId: string) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const handleRecordPayment = (method: 'Card' | 'Cash') => {
        const itemsToPay = order?.items.filter(i => selectedItems.has(i.id)) || [];
        
        const newPayment: Payment = {
            method: method,
            amount: subtotal.toFixed(2),
            date: new Date().toLocaleString(),
            transactionId: `txn_split_item_${Date.now()}`,
            guestName: 'Guest',
            items: itemsToPay.map(i => ({ name: i.name, quantity: i.quantity })),
        };
        
        if (order) {
            const newPaidAmount = order.paidAmount + subtotal;
            const updatedOrder: Order = {
                ...order,
                paidAmount: newPaidAmount,
                payments: [...order.payments, newPayment],
                paymentState: newPaidAmount >= order.totalAmount ? 'Fully Paid' : 'Partial',
                splitType: 'byItem',
            };
            onUpdateOrder(updatedOrder);
        }
        
        setPaidItems(prev => new Set([...prev, ...selectedItems]));
        setSelectedItems(new Set());
        setConfirmingPayment(false);

        toast({ title: "Payment Recorded", description: `Payment of $${subtotal.toFixed(2)} for selected items recorded.` });

        const allItemsPaid = order?.items.every(i => paidItems.has(i.id) || selectedItems.has(i.id));
        if (allItemsPaid) {
             setTimeout(() => onOpenChange(false), 500);
        }
    };
    
    return (
        <div className="py-6 space-y-4">
            <h4 className="font-semibold text-muted-foreground">Select items to pay for:</h4>
            <ScrollArea className="h-80 border rounded-lg p-2">
                <div className="space-y-2 p-2">
                    {order?.items.map(item => {
                        const isPaid = paidItems.has(item.id);
                        return (
                            <div key={item.id} className={cn("flex items-center gap-4 p-3 rounded-md", isPaid ? 'bg-gray-100 opacity-50' : 'bg-white')}>
                                <Checkbox 
                                    id={`item-${item.id}`}
                                    checked={selectedItems.has(item.id)}
                                    onCheckedChange={() => handleToggleItem(item.id)}
                                    disabled={isPaid}
                                />
                                <Label htmlFor={`item-${item.id}`} className="flex-1 grid grid-cols-[1fr_auto] items-center gap-4 cursor-pointer">
                                    <span className="font-medium">{item.quantity}x {item.name}</span>
                                    <span className="font-mono font-semibold text-right">${(item.price * item.quantity).toFixed(2)}</span>
                                </Label>
                            </div>
                        )
                    })}
                </div>
            </ScrollArea>
             <Card className="mt-4">
                <CardContent className="p-4 flex justify-between items-center">
                    <div>
                        <p className="text-sm text-muted-foreground">Subtotal for selected</p>
                        <p className="text-2xl font-bold font-mono">${subtotal.toFixed(2)}</p>
                    </div>
                    <Button size="lg" disabled={selectedItems.size === 0} onClick={() => setConfirmingPayment(true)}>
                        Record Payment
                    </Button>
                </CardContent>
            </Card>
            <AlertDialog open={confirmingPayment} onOpenChange={setConfirmingPayment}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Record Payment for Selected Items</AlertDialogTitle>
                        <AlertDialogDescription>
                            Confirm payment of <strong>${subtotal.toFixed(2)}</strong>. Choose the payment method used.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <div className="flex gap-2">
                             <Button onClick={() => handleRecordPayment('Card')} className="flex-1">
                                <CreditCard className="mr-2 h-4 w-4" /> Card
                            </Button>
                            <Button onClick={() => handleRecordPayment('Cash')} variant="secondary" className="flex-1">
                                <Banknote className="mr-2 h-4 w-4" /> Cash
                            </Button>
                        </div>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

// --- Main Dialog Component ---

export function SplitPaymentDialog({ order, open, onOpenChange, onUpdateOrder }: SplitPaymentDialogProps) {
  const [step, setStep] = useState<'select' | 'equally' | 'byItem'>('select');

  useEffect(() => {
    if (open) {
      setStep('select');
    }
  }, [open]);

  const handleBack = () => setStep('select');
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
            {step !== 'select' && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            )}
            <div>
                <DialogTitle className="text-xl">Split Payment</DialogTitle>
                <DialogDescription>
                    {step === 'select' && "Choose how you want to split the bill."}
                    {step === 'equally' && `Splitting bill for Order ${order?.orderId} equally.`}
                    {step === 'byItem' && `Splitting bill for Order ${order?.orderId} by items.`}
                </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {step === 'select' && <SelectMethodStep onSelect={setStep} />}
        {step === 'equally' && <SplitEquallyView order={order} onBack={handleBack} onUpdateOrder={onUpdateOrder} onOpenChange={onOpenChange} />}
        {step === 'byItem' && <SplitByItemView order={order} onBack={handleBack} onUpdateOrder={onUpdateOrder} onOpenChange={onOpenChange} />}
        
        {step !== 'select' && (
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Done</Button>
                </DialogClose>
            </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
