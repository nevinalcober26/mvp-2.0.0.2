'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import type { Order } from './types';
import { getStatusBadgeVariant } from './utils';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


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

  if (!order) return null;

  const subtotal = order.totalAmount;
  const taxAmount = subtotal * 0.05;
  const totalWithTax = subtotal + taxAmount;
  const pendingAmount = totalWithTax - order.paidAmount;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-4xl w-full p-0">
        <DialogTitleComponent className="sr-only">Order Details</DialogTitleComponent>
        <SheetDescription className="sr-only">A detailed view of the selected order, including items, payment status, and customer information.</SheetDescription>
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 border-b bg-muted/50">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <h2 className="text-2xl font-bold">Order {order.orderId}</h2>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadgeVariant(order.orderStatus)}>
                  {order.orderStatus}
                </Badge>
                <Badge variant={getStatusBadgeVariant(order.paymentState)}>
                  {order.paymentState}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
              <CalendarIcon className="h-4 w-4" />
              <span>{order.orderDate}</span>
            </div>
          </SheetHeader>
          <div className="flex-grow overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 space-y-6">
                <Card>
                  <CardHeader className="p-8">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Items Ordered ({order.items.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <React.Fragment key={item.id}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <p className="font-mono">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          {index < order.items.length - 1 && (
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
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax (5%)</span>
                        <span>${taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Discount
                        </span>
                        <span>$0.00</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-bold text-base">
                        <span>Total</span>
                        <span>${totalWithTax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-green-600">
                        <span>Paid</span>
                        <span>${order.paidAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-red-600">
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

                      {order.splitType ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 p-3 bg-secondary rounded-md border">
                          {order.splitType === 'equally' ? (
                            <Users className="h-5 w-5" />
                          ) : (
                            <Package className="h-5 w-5" />
                          )}
                          <span>
                            Payment split <strong>{order.splitType === 'byItem' ? 'by Item' : 'Equally'}</strong>.
                          </span>
                        </div>
                      ) : order.paymentState === 'Partial' ? (
                        <p className="text-sm text-muted-foreground mb-3">
                          A partial payment was made.
                        </p>
                      ) : null}

                      {order.payments.length > 0 ||
                      pendingAmount > 0.01 ? (
                        <div className="flow-root">
                          <ul>
                            {order.payments.map((payment, index) => {
                              const isLastPayment =
                                index === order.payments.length - 1;
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
                                        {order.splitType === 'byItem' && payment.items && payment.items.length > 0 && (
                                            <div className="mt-3 p-4 bg-card rounded-lg border">
                                                <div className="space-y-2">
                                                    <p className="text-sm font-semibold text-foreground">Items Paid For:</p>
                                                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                                        {payment.items.map((item, idx) => (
                                                        <li key={idx}>{item.quantity}x {item.name}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                {payment.tip && payment.tip > 0 && (
                                                    <>
                                                        <Separator className="my-3"/>
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="font-medium text-muted-foreground">Tip Amount:</span>
                                                            <span className="font-mono font-semibold text-foreground">${payment.tip.toFixed(2)}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                        <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                                            <p>Transaction ID: {payment.transactionId}</p>
                                            {order.staffReference?.employee_reference_code && (
                                                <p>Terminal ID: {order.staffReference.employee_reference_code}</p>
                                            )}
                                            {order.source && (
                                                <p>Source: {order.source === 'POS' ? 'POS Machine' : order.source}</p>
                                            )}
                                        </div>
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
                      {order.customer ? 'Customer Details' : 'Guest Details'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 text-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium">
                        {order.customer?.name || 'Guest Customer'}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">
                        {order.customer?.email || 'N/A'}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">
                        {order.customer?.phone || 'N/A'}
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
                      <p className="font-medium">{order.branch}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Table</p>
                      <p className="font-medium">{order.table}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Server</p>
                        {order.staffReference ? (
                            <Button
                                variant="link"
                                className="p-0 h-auto font-medium"
                                onClick={() => setIsStaffInfoOpen(true)}
                            >
                                {order.staffName}
                            </Button>
                        ) : (
                            <p className="font-medium">{order.staffName}</p>
                        )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Order Type</p>
                      <p className="font-medium">{order.orderType}</p>
                    </div>
                  </CardContent>
                </Card>

                {order.orderComments && (
                    <Card>
                        <CardHeader className="p-8">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Order Comments
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            <p className="text-sm text-muted-foreground italic">
                                "{order.orderComments}"
                            </p>
                        </CardContent>
                    </Card>
                )}
              </div>
            </div>
          </div>
          <SheetFooter className="p-6 border-t bg-background flex-row justify-between w-full">
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" /> Print Receipt
            </Button>
            <SheetClose asChild>
              <Button variant="secondary">Close</Button>
            </SheetClose>
          </SheetFooter>
        </div>
      </SheetContent>
      {order.staffReference && (
        <Dialog open={isStaffInfoOpen} onOpenChange={setIsStaffInfoOpen}>
            <DialogContent className="bg-white p-0 max-w-sm overflow-hidden rounded-3xl border-0 shadow-2xl">
                <RadixDialogClose className="absolute top-4 left-4 z-50 h-10 w-10 rounded-full bg-black/20 text-white ring-offset-0 focus:ring-0 focus:outline-none flex items-center justify-center transition-all hover:bg-black/30">
                    <X className="h-5 w-5" />
                </RadixDialogClose>
                <div className="relative">
                    <div className="h-64 w-full bg-gradient-to-br from-teal-300 to-cyan-400 p-8 flex flex-col items-center justify-center">
                        <Avatar className="h-28 w-28 border-4 border-white/30 shadow-xl">
                            <AvatarFallback className="text-4xl bg-gray-100 text-gray-400">
                                <User className="h-16 w-16" />
                            </AvatarFallback>
                        </Avatar>
                        <h2 className="mt-4 text-4xl font-bold text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>{order.staffName}</h2>
                        <p className="font-mono text-lg text-white/90 mt-1" style={{textShadow: '0 1px 3px rgba(0,0,0,0.3)'}}>{order.staffReference.employee_reference_code}</p>
                    </div>

                    <div className="p-6 -mt-16 space-y-4">
                        <Card className="rounded-2xl shadow-xl bg-white">
                            <CardContent className="p-6 text-center">
                                <Badge variant="secondary" className="font-bold text-xs bg-gray-100 text-gray-500 mb-3 border-gray-200 uppercase tracking-wider">
                                    <Star className="h-3.5 w-3.5 mr-1.5 text-yellow-400 fill-yellow-400"/>
                                    Total Tips Earned
                                </Badge>
                                <p className="text-5xl font-black text-teal-600">
                                    {order.staffReference.currency} {order.staffReference.total_tip_amount.toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">Outstanding performance this period</p>
                            </CardContent>
                        </Card>
                        
                        <Card className="rounded-2xl shadow-lg bg-white border-gray-200">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 flex items-center justify-center bg-purple-100 text-purple-600 rounded-lg">
                                        <CalendarDays className="h-5 w-5"/>
                                    </div>
                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Period</p>
                                </div>
                                <p className="font-bold text-sm text-gray-900">
                                    {format(new Date(order.staffReference.start_date), 'MMM d')} - {format(new Date(order.staffReference.end_date), 'MMM d')}
                                </p>
                            </CardContent>
                        </Card>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="rounded-2xl shadow-lg bg-purple-50 border-0">
                                <CardContent className="p-4 text-left">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase">
                                        <DollarSign className="h-4 w-4 text-green-500"/>
                                        Total Sales
                                    </div>
                                     <div>
                                        <span className="text-sm font-bold text-gray-900">{order.staffReference.currency}</span>
                                        <p className="text-3xl font-bold text-gray-900 leading-none">
                                            {order.staffReference.total_sale_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="rounded-2xl shadow-lg bg-yellow-50 border-0">
                                <CardContent className="p-4 text-left">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase">
                                        <FileText className="h-4 w-4 text-orange-500"/>
                                        Total Orders
                                    </div>
                                    <p className="text-5xl font-bold text-gray-900">
                                        {order.staffReference.order_count}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
      )}
    </Sheet>
  );
}
