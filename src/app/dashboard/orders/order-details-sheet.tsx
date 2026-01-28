'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
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
} from 'lucide-react';
import type { Order } from './types';
import { getStatusBadgeVariant } from './utils';

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
  if (!order) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-full p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 border-b bg-muted/50">
            <SheetTitle className="text-2xl">Order {order.orderId}</SheetTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <span>{order.orderDate}</span>
            </div>
          </SheetHeader>
          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Branch</span>
                  <span>{order.branch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Table</span>
                  <span>{order.table}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Type</span>
                  <Badge
                    variant={
                      order.orderType === 'Prepaid' ? 'secondary' : 'outline'
                    }
                  >
                    {order.orderType}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Status</span>
                  <Badge variant={getStatusBadgeVariant(order.orderStatus)}>
                    {order.orderStatus}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment State</span>
                  <Badge variant={getStatusBadgeVariant(order.paymentState)}>
                    {order.paymentState}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Items Ordered ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start"
                    >
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
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (0%)</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span>$0.00</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-green-600">
                    <span>Paid</span>
                    <span>${order.paidAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-red-600">
                    <span>Pending</span>
                    <span>
                      $
                      {(order.totalAmount - order.paidAmount).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Separator className="my-4" />
                
                <h4 className="font-semibold mb-3">Payment History</h4>
                
                {order.splitType ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 p-3 bg-secondary rounded-md border">
                    {order.splitType === 'equally' ? (
                      <Users className="h-5 w-5" />
                    ) : (
                      <Package className="h-5 w-5" />
                    )}
                    <span>
                      Payment split <strong>{order.splitType === 'equally' ? 'equally' : 'by item'}</strong>.
                    </span>
                  </div>
                ) : order.paymentState === 'Partial' ? (
                     <p className="text-sm text-muted-foreground mb-3">
                      A partial payment was made.
                    </p>
                ) : null }

                {order.payments.length > 0 ? (
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {order.payments.map((payment, index) => (
                        <li key={index}>
                          <div className="relative pb-8">
                            {index !== order.payments.length - 1 ? (
                              <span className="absolute left-2.5 top-4 -ml-px h-full w-0.5 bg-border" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex items-start space-x-3">
                              <div>
                                <span className="h-5 w-5 rounded-full bg-primary flex items-center justify-center ring-4 ring-background">
                                  <Check className="h-3 w-3 text-primary-foreground" />
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-sm">
                                    Paid ${payment.amount} via {payment.method}
                                  </p>
                                  <p className="mt-0.5 text-sm text-muted-foreground">
                                    {payment.guestName} - {payment.date}
                                  </p>
                                </div>
                                <Badge variant="outline" className="bg-green-100 text-green-700 border-transparent">
                                  Success
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No payments have been made for this order yet.
                  </p>
                )}
              </CardContent>
            </Card>
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
    </Sheet>
  );
}
