'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Users,
  Package,
  ArrowLeft,
  CheckCircle,
  Minus,
  Plus,
  Circle,
  Check,
  ArrowRight,
} from 'lucide-react';
import type { Order, OrderItem, Payment } from './types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SplitPaymentDialogProps {
  order: Order | null;
  totalWithTax: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateOrder: (updatedOrder: Order) => void;
}

// ##################################
// ##       EQUAL SPLIT VIEW       ##
// ##################################

const SplitEquallyView = ({
  order,
  totalWithTax,
  onBack,
  onUpdateOrder,
  onOpenChange,
}: Omit<SplitPaymentDialogProps, 'open' | 'order'> & {
  order: Order;
  onBack: () => void;
}) => {
  const { toast } = useToast();
  const [numSplits, setNumSplits] = useState(2);

  const amountPerPerson = numSplits > 0 ? totalWithTax / numSplits : 0;

  const handleSetupSplit = () => {
    const newPayments: Payment[] = [];
    for (let i = 0; i < numSplits; i++) {
      newPayments.push({
        amount: amountPerPerson.toFixed(2),
        guestName: `Payer ${i + 1}`,
        status: 'Pending',
        transactionId: `split_${order.orderId}_${i}_${Date.now()}`,
      });
    }

    const updatedOrder: Order = {
      ...order,
      payments: newPayments,
      paidAmount: 0,
      paymentState: 'Unpaid',
      splitType: 'equally',
    };

    onUpdateOrder(updatedOrder);
    onOpenChange(false);
    toast({
      title: 'Split Setup',
      description: `Bill has been split ${numSplits} ways.`,
    });
  };

  return (
    <div className="py-6 space-y-6 relative">
      <div className="grid grid-cols-2 gap-4 items-end">
        <div className="space-y-1.5">
          <Label>Number of People</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-lg"
              onClick={() => setNumSplits((s) => Math.max(2, s - 1))}
              disabled={numSplits <= 2}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="flex h-10 w-16 items-center justify-center rounded-lg border bg-background text-lg font-bold">
              {numSplits}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-lg"
              onClick={() => setNumSplits((s) => Math.min(20, s + 1))}
              disabled={numSplits >= 20}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="text-right pb-2">
          <p className="text-sm text-muted-foreground">Amount per person</p>
          <p className="text-2xl font-bold font-mono">
            AED {amountPerPerson.toFixed(2)}
          </p>
        </div>
      </div>
      <Separator />
      <ScrollArea className="h-64">
        <div className="space-y-3 pr-4">
          {Array.from({ length: numSplits }).map((_, index) => (
            <Card key={index} className="p-4 flex justify-between items-center bg-card">
              <p className="font-semibold">Payer {index + 1}</p>
              <p className="font-mono font-semibold">
                AED {amountPerPerson.toFixed(2)}
              </p>
            </Card>
          ))}
        </div>
      </ScrollArea>
      <DialogFooter>
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSetupSplit}>Setup Split</Button>
      </DialogFooter>
    </div>
  );
};


// ##################################
// ##     ITEM SPLIT SUB-VIEWS     ##
// ##################################

const DefineGroupStep = ({ onContinue, onBack }: { onContinue: (peopleCount: number) => void; onBack: () => void }) => {
    const [peopleCount, setPeopleCount] = useState(2);
    return (
        <>
            <DialogHeader className="text-center pt-4 items-center">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20">
                    <Users className="h-7 w-7 text-primary" />
                </div>
                <DialogTitle className="text-xl pt-2">How many people are splitting?</DialogTitle>
                <DialogDescription>Set the number of guests who will be paying.</DialogDescription>
            </DialogHeader>
            <div className="py-8 flex justify-center items-center gap-4">
                <Button variant="outline" size="icon" className="h-14 w-14 rounded-full" onClick={() => setPeopleCount(c => Math.max(2, c - 1))} disabled={peopleCount <= 2}>
                    <Minus className="h-6 w-6"/>
                </Button>
                <span className="text-6xl font-bold w-24 text-center">{peopleCount}</span>
                <Button variant="outline" size="icon" className="h-14 w-14 rounded-full" onClick={() => setPeopleCount(c => c + 1)}>
                    <Plus className="h-6 w-6"/>
                </Button>
            </div>
            <DialogFooter>
                 <Button variant="ghost" onClick={onBack}>Back</Button>
                <Button onClick={() => onContinue(peopleCount)}>Continue <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </DialogFooter>
        </>
    )
}

type ItemAssignments = Record<string, { [personIndex: number]: number }>;

const AssignItemsStep = ({ order, peopleCount, onContinue, onBack }: { order: Order; peopleCount: number; onContinue: (assignments: ItemAssignments) => void; onBack: () => void }) => {
    const { toast } = useToast();
    const [currentPersonIndex, setCurrentPersonIndex] = useState(0);
    const [assignments, setAssignments] = useState<ItemAssignments>({});

    const handleAssignmentChange = (itemId: string, newQuantity: number) => {
        setAssignments(prev => ({
            ...prev,
            [itemId]: {
                ...(prev[itemId] || {}),
                [currentPersonIndex]: newQuantity
            }
        }));
    };
    
    const handleNextPerson = () => {
        // Validation: check if any item quantity is over-assigned for the current person
        for (const item of order.items) {
            const totalAssigned = Object.values(assignments[item.id] || {}).reduce((s, q) => s + q, 0);
            if (totalAssigned > item.quantity) {
                 toast({
                    variant: 'destructive',
                    title: 'Over-assigned Item',
                    description: `You have assigned more ${item.name} than are on the bill.`
                });
                return;
            }
        }

        const isMovingToLastPerson = currentPersonIndex === peopleCount - 2;

        if (isMovingToLastPerson) {
             const newAssignments = { ...assignments };
             let itemsAssigned = false;
             order.items.forEach(item => {
                 const totalAssigned = Object.values(newAssignments[item.id] || {}).reduce((sum, qty) => sum + qty, 0);
                 const remaining = item.quantity - totalAssigned;
                 if (remaining > 0) {
                     if (!newAssignments[item.id]) newAssignments[item.id] = {};
                     newAssignments[item.id][peopleCount - 1] = (newAssignments[item.id][peopleCount - 1] || 0) + remaining;
                     itemsAssigned = true;
                 }
             });
             setAssignments(newAssignments);
             if (itemsAssigned) {
                 toast({ title: "Remaining items automatically assigned to the last person." });
             }
        }
        setCurrentPersonIndex(p => p + 1);
    };

    const isLastPerson = currentPersonIndex === peopleCount - 1;

    const personSubtotal = useMemo(() => {
        return order.items.reduce((total, item) => {
            const quantity = (assignments[item.id] || {})[currentPersonIndex] || 0;
            return total + (item.price * quantity);
        }, 0);
    }, [assignments, currentPersonIndex, order.items]);

    return (
        <>
            <DialogHeader>
                <div className="flex items-center justify-center gap-2 mb-4">
                    {Array.from({ length: peopleCount }).map((_, index) => (
                        <div key={index} className={cn(
                            "h-2 flex-1 rounded-full",
                            index === currentPersonIndex ? "bg-primary" : "bg-muted"
                        )} />
                    ))}
                </div>
                <DialogTitle className="text-xl">Assign Items for Person {currentPersonIndex + 1}</DialogTitle>
                <DialogDescription>Select the items this person is paying for.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-96 my-4 pr-4 -mr-4">
                <div className="space-y-3">
                {order.items.map(item => {
                    const totalAssignedForAllPeople = Object.values(assignments[item.id] || {}).reduce((s, q) => s + q, 0);
                    const assignedToCurrent = (assignments[item.id] || {})[currentPersonIndex] || 0;
                    const maxAssignableToCurrent = item.quantity - totalAssignedForAllPeople + assignedToCurrent;
                    const isFullyAssigned = totalAssignedForAllPeople >= item.quantity;
                    
                    return (
                        <div key={item.id} className={cn("p-4 border rounded-lg flex items-center justify-between transition-opacity", isFullyAssigned && assignedToCurrent === 0 && "opacity-40")}>
                            <div className="space-y-1">
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-sm text-muted-foreground">{item.quantity} total @ AED {item.price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleAssignmentChange(item.id, Math.max(0, assignedToCurrent - 1))} disabled={assignedToCurrent === 0}>
                                    <Minus className="h-4 w-4"/>
                                </Button>
                                <span className="font-bold w-6 text-center text-lg">{assignedToCurrent}</span>
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleAssignmentChange(item.id, Math.min(maxAssignableToCurrent, assignedToCurrent + 1))} disabled={assignedToCurrent >= maxAssignableToCurrent}>
                                    <Plus className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                    );
                })}
                </div>
            </ScrollArea>
             <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
                <span className="font-bold text-lg">Person {currentPersonIndex + 1}'s Total</span>
                <span className="font-bold font-mono text-xl">AED {personSubtotal.toFixed(2)}</span>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => currentPersonIndex > 0 ? setCurrentPersonIndex(p => p - 1) : onBack()}>Back</Button>
                {isLastPerson ? (
                     <Button onClick={() => onContinue(assignments)}>View Summary <ArrowRight className="h-4 w-4 ml-2" /></Button>
                ) : (
                    <Button onClick={handleNextPerson}>Next Person <ArrowRight className="h-4 w-4 ml-2" /></Button>
                )}
            </DialogFooter>
        </>
    );
};

const SummaryStep = ({ order, peopleCount, assignments, onBack, onConfirmSplit, onOpenChange }: { order: Order; peopleCount: number; assignments: ItemAssignments; onBack: () => void; onConfirmSplit: (payments: Payment[]) => void; onOpenChange: (open: boolean) => void }) => {
    const finalBreakdown = useMemo(() => {
        const paymentsByPerson: Record<number, { items: OrderItem[], subtotal: number }> = {};
        for (let i = 0; i < peopleCount; i++) {
            paymentsByPerson[i] = { items: [], subtotal: 0 };
        }

        order.items.forEach(item => {
            const itemAssignments = assignments[item.id] || {};
            Object.entries(itemAssignments).forEach(([personIdxStr, quantity]) => {
                const personIdx = Number(personIdxStr);
                if (quantity > 0) {
                    paymentsByPerson[personIdx].items.push({ ...item, quantity });
                    paymentsByPerson[personIdx].subtotal += item.price * quantity;
                }
            });
        });

        const taxRate = 0.05;
        const serviceChargeRate = 0.10;
        const totalTax = order.totalAmount * taxRate;
        const totalService = order.totalAmount * serviceChargeRate;

        return Object.entries(paymentsByPerson)
            .filter(([_, data]) => data.items.length > 0)
            .map(([personIdxStr, data]) => {
                const personSubtotal = data.subtotal;
                const portionOfTotal = order.totalAmount > 0 ? personSubtotal / order.totalAmount : 0;
                const personTax = totalTax * portionOfTotal;
                const personService = totalService * portionOfTotal;
                const personTotal = personSubtotal + personTax + personService;

                return {
                    guestName: `Person ${Number(personIdxStr) + 1}`,
                    items: data.items,
                    taxBreakdown: {
                        subtotal: personSubtotal,
                        serviceCharge: personService,
                        vat: personTax,
                    },
                    total: personTotal,
                    payment: {
                        amount: personTotal.toFixed(2),
                        guestName: `Person ${Number(personIdxStr) + 1}`,
                        status: 'Pending' as const,
                        transactionId: `split_item_${order.orderId}_${personIdxStr}_${Date.now()}`,
                        items: data.items,
                        taxBreakdown: { subtotal: personSubtotal, serviceCharge: personService, vat: personTax }
                    },
                };
            });
    }, [assignments, peopleCount, order]);

    return (
        <>
            <DialogHeader className="text-center">
                <DialogTitle className="text-xl">Final Bill Summary</DialogTitle>
                <DialogDescription>Review the split before confirming. Each person can now pay their share.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[28rem] my-4 pr-4 -mr-4">
                <div className="space-y-4">
                    {finalBreakdown.map(p => (
                        <Card key={p.guestName} className="overflow-hidden">
                            <CardHeader className="flex flex-row justify-between items-center p-4 bg-muted/50">
                                <CardTitle className="text-base flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  {p.guestName}
                                </CardTitle>
                                <span className="text-xl font-bold font-mono">AED {p.total.toFixed(2)}</span>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="text-sm space-y-2">
                                  <h4 className="font-semibold text-muted-foreground text-xs uppercase">Items</h4>
                                  {p.items.map((item, idx) => (
                                      <div key={idx} className="flex justify-between items-center text-sm">
                                          <span>{item.quantity}x {item.name}</span>
                                          <span className="font-mono font-medium">AED {(item.price * item.quantity).toFixed(2)}</span>
                                      </div>
                                  ))}
                                </div>
                                <Separator />
                                <div className="text-sm space-y-1">
                                    <div className="flex justify-between text-muted-foreground"><span>Subtotal:</span><span className="font-mono">AED {p.taxBreakdown.subtotal.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-muted-foreground"><span>Service Charge (10%):</span><span className="font-mono">AED {p.taxBreakdown.serviceCharge.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-muted-foreground"><span>VAT (5%):</span><span className="font-mono">AED {p.taxBreakdown.vat.toFixed(2)}</span></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
             <DialogFooter>
                <Button variant="ghost" onClick={onBack}>Edit Assignments</Button>
                <Button onClick={() => { onConfirmSplit(finalBreakdown.map(p => p.payment)); onOpenChange(false); }}>Confirm & Create Payments</Button>
            </DialogFooter>
        </>
    );
}

const SplitByItemView = ({ order, onBack, onUpdateOrder, onOpenChange }: Omit<SplitPaymentDialogProps, 'open' | 'totalWithTax' | 'order'> & { order: Order; onBack: () => void }) => {
    const [step, setStep] = useState<'define' | 'assign' | 'summary'>('define');
    const [peopleCount, setPeopleCount] = useState(2);
    const [assignments, setAssignments] = useState<ItemAssignments>({});

    const handleDefineContinue = (count: number) => {
        setPeopleCount(count);
        setStep('assign');
    };
    
    const handleAssignContinue = (finalAssignments: ItemAssignments) => {
        setAssignments(finalAssignments);
        setStep('summary');
    }
    
    const handleConfirmSplit = (payments: Payment[]) => {
        const updatedOrder: Order = {
            ...order,
            payments,
            paidAmount: 0,
            paymentState: 'Unpaid',
            splitType: 'byItem'
        };
        onUpdateOrder(updatedOrder);
        onOpenChange(false);
    }

    return (
        <>
            {step === 'define' && <DefineGroupStep onBack={onBack} onContinue={handleDefineContinue} />}
            {step === 'assign' && <AssignItemsStep order={order} peopleCount={peopleCount} onContinue={handleAssignContinue} onBack={() => setStep('define')}/>}
            {step === 'summary' && <SummaryStep order={order} peopleCount={peopleCount} assignments={assignments} onBack={() => setStep('assign')} onConfirmSplit={handleConfirmSplit} onOpenChange={onOpenChange} />}
        </>
    )
}

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


// --- Main Dialog Component ---

export function SplitPaymentDialog({ order, totalWithTax, open, onOpenChange, onUpdateOrder }: SplitPaymentDialogProps) {
  const [step, setStep] = useState<'select' | 'equally' | 'byItem'>('select');

  useEffect(() => {
    if (open) {
      setStep('select');
    }
  }, [open]);

  const handleBack = () => setStep('select');
  
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
            {(step === 'equally' || step === 'byItem') && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            )}
            <div>
                <DialogTitle className="text-xl">Split Payment</DialogTitle>
                <DialogDescription>
                    {step === 'select' && "Choose how you want to split the bill."}
                    {step === 'equally' && `Splitting bill for Order ${order.orderId} equally.`}
                    {step === 'byItem' && `Splitting bill for Order ${order.orderId} by items.`}
                </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {step === 'select' && <SelectMethodStep onSelect={setStep} />}
        {step === 'equally' && <SplitEquallyView order={order} totalWithTax={totalWithTax} onBack={handleBack} onUpdateOrder={onUpdateOrder} onOpenChange={onOpenChange} />}
        {step === 'byItem' && <SplitByItemView order={order} onBack={handleBack} onUpdateOrder={onUpdateOrder} onOpenChange={onOpenChange} />}

      </DialogContent>
    </Dialog>
  );
}
