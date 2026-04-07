'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetClose,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogTitle as DialogTitleComponent, // Renamed to avoid conflict
  DialogDescription as DialogDescriptionComponent, // Renamed
  DialogClose as RadixDialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Calendar as CalendarIcon,
  CreditCard,
  Info,
  Printer,
  Check,
  Users,
  Package,
  User,
  Hourglass,
  MessageSquare,
  Star,
  CalendarDays,
  DollarSign,
  FileText,
  X,
  Split,
} from 'lucide-react';
import type { Order } from './types';
import { getStatusBadgeVariant } from './utils';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SplitPaymentDialog } from './split-payment-dialog';


interface OrderDetailsSheetProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailsSheet({
  order,
  open,
  onOpenChange,
}: OrderDetailsSheetProps) {
  const [isStaffInfoOpen, setIsStaffInfoOpen] = useState(false);
  const [isSplitDialogOpen, setIsSplitDialogOpen] = useState(false);
  const [localOrder, setLocalOrder] = useState<Order | null>(order);

  useEffect(() => {
    setLocalOrder(order);
  }, [order, open]);

  const handleOrderUpdate = (updatedOrder: Order) => {
      setLocalOrder(updatedOrder);
  };
  
  if (!localOrder) return null;

  const subtotal = localOrder.totalAmount;
  const taxAmount = subtotal * 0.05;
  const totalWithTax = subtotal + taxAmount;
  const pendingAmount = totalWithTax - localOrder.paidAmount;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-4xl w-full p-0">
        <DialogTitleComponent className="sr-only">Order Details</DialogTitleComponent>
        <SheetDescription className="sr-only">A detailed view of the selected order, including items, payment status, and customer information.</SheetDescription>
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 border-b bg-muted/50">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <h2 className="text-2xl font-bold">Order {localOrder.orderId}</h2>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadgeVariant(localOrder.orderStatus)}>
                  {localOrder.orderStatus}
                </Badge>
                <Badge variant={getStatusBadgeVariant(localOrder.paymentState)}>
                  {localOrder.paymentState}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
              <CalendarIcon className="h-4 w-4" />
              <span>{localOrder.orderDate}</span>
            </div>
          </SheetHeader>
          <div className="flex-grow overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 space-y-6">
                <Card>
                  <CardHeader className="p-8">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Items Ordered ({localOrder.items.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <div className="space-y-4">
                      {localOrder.items.map((item, index) => (
                        <React.Fragment key={item.id}>
                          <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 text-sm">
                            <div>
                                <p className="font-semibold">{item.name}</p>
                            </div>
                            <p className="text-muted-foreground font-medium">x{item.quantity}</p>
                            <p className="font-mono font-semibold text-right">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          {index < localOrder.items.length - 1 && (
                            <Separator className="my-4" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-8">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between font-mono">
                        <span className="text-muted-foreground font-sans">Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-muted-foreground font-sans">Tax (5%)</span>
                        <span>${taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-muted-foreground font-sans">
                          Discount
                        </span>
                        <span>$0.00</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-bold text-base font-mono">
                        <span>Total</span>
                        <span>${totalWithTax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-green-600 font-mono">
                        <span>Paid</span>
                        <span>${localOrder.paidAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-red-600 font-mono">
                        <span>Pending</span>
                        <span>
                          $
                          {pendingAmount > 0.01 ? pendingAmount.toFixed(2) : '0.00'}
                        </span>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div>
                      <h4 className="font-semibold mb-3">Payment History</h4>

                      {localOrder.splitType ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 p-3 bg-secondary rounded-md border">
                          {localOrder.splitType === 'byItem' ? (
                            <Package className="h-5 w-5" />
                          ) : (
                            <Users className="h-5 w-5" />
                          )}
                          <span>
                            Payment split <strong>{localOrder.splitType === 'byItem' ? 'by Item' : 'Equally'}</strong>.
                          </span>
                        </div>
                      ) : localOrder.paymentState === 'Partial' ? (
                        <p className="text-sm text-muted-foreground mb-3">
                          A partial payment was made.
                        </p>
                      ) : null}

                      {localOrder.payments.length > 0 ||
                      pendingAmount > 0.01 ? (
                        <div className="flow-root">
                          <ul>
                            {localOrder.payments.map((payment, index) => {
                              const isLastPayment =
                                index === localOrder.payments.length - 1;
                              const hasPendingAmount =
                                pendingAmount > 0.01;
                              const showLineAndPadding =
                                !isLastPayment || hasPendingAmount;

                              return (
                                <li key={`payment-${index}`}>
                                  <div
                                    className={cn(
                                      'relative',
                                      showLineAndPadding && 'pb-8'
                                    )}
                                  >
                                    {showLineAndPadding && (
                                      <span
                                        className="absolute left-2.5 top-4 -ml-px h-full w-0.5 bg-border"
                                        aria-hidden="true"
                                      />
                                    )}
                                    <div className="relative flex items-start space-x-3">
                                      <div>
                                        <span className="h-5 w-5 rounded-full bg-primary flex items-center justify-center ring-4 ring-background">
                                          <Check className="h-3 w-3 text-primary-foreground" />
                                        </span>
                                      </div>
                                      <div className="min-w-0 flex-1">
                                          <div className="flex justify-between items-start">
                                              <div>
                                                  <p className="font-medium text-sm">
                                                      Payment of ${payment.amount} via {payment.method}
                                                  </p>
                                                  <p className="mt-1 text-sm text-muted-foreground">
                                                      by {payment.guestName} on {payment.date}
                                                  </p>
                                              </div>
                                              <Badge
                                              variant="outline"
                                              className="bg-green-100 text-green-700 border-transparent shrink-0"
                                              >
                                              Success
                                              </Badge>
                                          </div>
                                          {localOrder.splitType && (
                                              <Card className="mt-3 bg-card border">
                                                  <CardContent className="p-4 space-y-3">
                                                      {localOrder.splitType === 'byItem' && payment.items && payment.items.length > 0 && (
                                                          <div>
                                                              <p className="text-sm font-semibold text-foreground mb-2">Items Paid For:</p>
                                                              <ul className="space-y-2 text-sm text-muted-foreground">
                                                                  {payment.items.map((item, idx) => (
                                                                      <li key={idx} className="flex justify-between items-center">
                                                                          <span>{item.quantity}x {item.name}</span>
                                                                      </li>
                                                                  ))}
                                                              </ul>
                                                          </div>
                                                      )}

                                                      {payment.tip && payment.tip > 0 && (
                                                          <>
                                                              {localOrder.splitType === 'byItem' && payment.items && payment.items.length > 0 && <Separator />}
                                                              <div className="flex justify-between items-center text-sm font-medium">
                                                                  <span className="text-muted-foreground">Tip Amount:</span>
                                                                  <span className="font-mono text-foreground">${payment.tip.toFixed(2)}</span>
                                                              </div>
                                                          </>
                                                      )}
                                                      
                                                      {((localOrder.splitType === 'byItem' && payment.items && payment.items.length > 0) || (payment.tip && payment.tip > 0)) && <Separator />}

                                                      <div className="space-y-1 text-xs text-muted-foreground">
                                                          <p>Transaction ID: {payment.transactionId}</p>
                                                          {localOrder.staffReference?.employee_reference_code && (
                                                              <p>Terminal ID: {localOrder.staffReference.employee_reference_code}</p>
                                                          )}
                                                          {localOrder.source && (
                                                              <p>Source: {localOrder.source === 'POS' ? 'POS Machine' : localOrder.source}</p>
                                                          )}
                                                      </div>
                                                  </CardContent>
                                              </Card>
                                          )}
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              );
                            })}

                            {pendingAmount > 0.01 && (
                              <li key="pending">
                                <div className="relative">
                                  <div className="relative flex items-start space-x-3">
                                    <div>
                                      <span className="h-5 w-5 rounded-full bg-destructive flex items-center justify-center ring-4 ring-background">
                                        <Hourglass className="h-3 w-3 text-destructive-foreground" />
                                      </span>
                                    </div>
                                    <div className="min-w-0 flex-1 flex justify-between items-start pt-0.5">
                                      <div>
                                        <p className="font-medium text-sm text-red-600">
                                          Pending Amount
                                        </p>
                                        <p className="mt-0.5 text-sm text-muted-foreground">
                                          Awaiting payment
                                        </p>
                                      </div>
                                      <span className="font-mono font-semibold text-red-600">
                                        $
                                        {pendingAmount.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            )}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          This order is fully paid.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader className="p-8">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {localOrder.customer ? 'Customer Details' : 'Guest Details'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 text-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium text-right">
                        {localOrder.customer?.name || 'Guest Customer'}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium text-right">
                        {localOrder.customer?.email || 'N/A'}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium text-right">
                        {localOrder.customer?.phone || 'N/A'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-8">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 grid grid-cols-2 gap-x-4 gap-y-6 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Branch</p>
                      <p className="font-medium">{localOrder.branch}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Table</p>
                      <p className="font-medium">{localOrder.table}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Server</p>
                        {localOrder.staffReference ? (
                            <Button
                                variant="link"
                                className="p-0 h-auto font-medium"
                                onClick={() => setIsStaffInfoOpen(true)}
                            >
                                {localOrder.staffName}
                            </Button>
                        ) : (
                            <p className="font-medium">{localOrder.staffName}</p>
                        )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Order Type</p>
                      <p className="font-medium">{localOrder.orderType}</p>
                    </div>
                  </CardContent>
                </Card>

                {localOrder.orderComments && (
                    <Card>
                        <CardHeader className="p-8">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Order Comments
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            <p className="text-sm text-muted-foreground italic">
                                "{localOrder.orderComments}"
                            </p>
                        </CardContent>
                    </Card>
                )}
              </div>
            </div>
          </div>
          <SheetFooter className="p-6 border-t bg-background flex-row justify-between w-full">
            <div>
              {pendingAmount > 0.01 && (
                <Button onClick={() => setIsSplitDialogOpen(true)}>
                  <Split className="mr-2 h-4 w-4" />
                  Split Payment
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Printer className="mr-2 h-4 w-4" /> Print Receipt
              </Button>
              <SheetClose asChild>
                <Button variant="secondary">Close</Button>
              </SheetClose>
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
      {localOrder.staffReference && (
        <Dialog open={isStaffInfoOpen} onOpenChange={setIsStaffInfoOpen}>
          <DialogContent className="bg-transparent p-0 max-w-sm overflow-visible border-0 shadow-none">
            <RadixDialogClose className="absolute top-0 left-0 z-50 h-9 w-9 rounded-full bg-black/20 text-white flex items-center justify-center transition-all hover:bg-black/30">
              <X className="h-5 w-5" />
            </RadixDialogClose>
            
            <div className="relative pt-20">
              <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-br from-green-200 via-teal-200 to-cyan-300 rounded-b-[40px]" />

              <div className="relative mx-4">
                <div className="flex flex-col items-center -mt-16 mb-6">
                  <div className="h-28 w-28 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <User className="h-16 w-16 text-gray-400" />
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-gray-800">
                    {localOrder.staffName}
                  </h2>
                  <p className="font-mono text-sm text-gray-500 mt-0.5">
                    {localOrder.staffReference.employee_reference_code}
                  </p>
                </div>
                
                <Card className="w-full rounded-2xl shadow-xl p-6 text-center">
                  <Badge variant="secondary" className="font-bold text-xs bg-yellow-100 text-yellow-800 mb-2 border-yellow-200/80">
                    <Star className="h-3 w-3 mr-1.5 text-yellow-500 fill-yellow-400"/>
                    TOTAL TIPS EARNED
                  </Badge>
                  <p className="text-5xl font-black text-teal-600">
                    <span className="text-3xl align-middle font-semibold mr-1">{localOrder.staffReference.currency}</span>
                    {localOrder.staffReference.total_tip_amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Outstanding performance for last 7 period
                  </p>

                  <div className="my-6 border-t border-gray-100" />
                  
                  <Card className="mb-4 rounded-xl shadow-none border bg-gray-50/50">
                    <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 flex items-center justify-center bg-purple-100 text-purple-600 rounded-lg">
                                <CalendarDays className="h-5 w-5"/>
                            </div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Period</p>
                        </div>
                        <p className="font-bold text-sm text-gray-900">
                            {format(new Date(localOrder.staffReference.start_date), 'MMM d')} - {format(new Date(localOrder.staffReference.end_date), 'MMM d, yyyy')}
                        </p>
                    </CardContent>
                  </Card>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-px rounded-xl bg-gradient-to-br from-pink-200 to-purple-200">
                        <Card className="h-full rounded-[11px] shadow-none border-0">
                            <CardContent className="p-4 text-left">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-1 uppercase">
                                    <div className="h-7 w-7 flex items-center justify-center bg-green-100 text-green-600 rounded-lg">
                                        <DollarSign className="h-4 w-4"/>
                                    </div>
                                    Total Sales
                                </div>
                                <p className="text-2xl font-black text-gray-900 leading-none mt-2">
                                    <span className="text-lg align-baseline font-semibold mr-0.5">{localOrder.staffReference.currency}</span>
                                    {localOrder.staffReference.total_sale_amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="p-px rounded-xl bg-gradient-to-br from-orange-200 to-yellow-200">
                         <Card className="h-full rounded-[11px] shadow-none border-0">
                            <CardContent className="p-4 text-left">
                               <div className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-1 uppercase">
                                    <div className="h-7 w-7 flex items-center justify-center bg-orange-100 text-orange-600 rounded-lg">
                                        <FileText className="h-4 w-4"/>
                                    </div>
                                    Total Orders
                                </div>
                                <p className="text-5xl font-black text-gray-900">
                                    {localOrder.staffReference.order_count}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
       <SplitPaymentDialog
        order={localOrder}
        totalWithTax={totalWithTax}
        open={isSplitDialogOpen}
        onOpenChange={setIsSplitDialogOpen}
        onUpdateOrder={handleOrderUpdate}
      />
    </Sheet>
  );
}
