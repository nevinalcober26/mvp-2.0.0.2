'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  AlertTriangle,
  Filter,
  RotateCcw,
  File as FileIcon,
  FileText,
  Sheet as SheetIcon,
  DollarSign,
  FileWarning,
  CalendarDays,
  Info,
  User,
  Zap,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { DashboardHeader } from '@/components/dashboard/header';
import { cn } from '@/lib/utils';
import { OrdersPageSkeleton } from '@/components/dashboard/skeletons';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  isWithinInterval,
  differenceInDays,
  subDays,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
} from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { type DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/dashboard/reports/date-range-picker';
import type { Order } from '@/app/dashboard/orders/types';
import { mockDataStore } from '@/lib/mock-data-store';
import { OrderDetailsSheet } from '@/app/dashboard/orders/order-details-sheet';
import { StatCards, type StatCardData } from '@/components/dashboard/stat-cards';
import { AiSummary } from '@/components/dashboard/ai-summary';
import {
  TooltipProvider,
  Tooltip as UiTooltip,
  TooltipContent as UiTooltipContent,
  TooltipTrigger as UiTooltipTrigger,
} from '@/components/ui/tooltip';


type Transaction = {
  id: string;
  orderId: string;
  timestamp: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid' | 'Refunded';
  paymentMethod: string;
  payers: number;
  branch: 'Ras Al Khaimah' | 'Dubai Mall';
  table: string;
  splitMethod?: 'Equal' | 'Item-based' | 'Custom';
  lastPaymentAttempt: number;
  closeType: 'Auto' | 'Manual';
  staffName: string;
  tipAmount?: number;
  tipType?: 'Preset' | 'Custom';
  serviceChargeAmount?: number;
};

const generateTransactionsFromOrders = (orders: Order[]): Transaction[] => {
    return orders.map(order => {
        const paymentStatusMap = {
            'Fully Paid': 'Paid',
            'Partial': 'Partial',
            'Unpaid': 'Unpaid',
            'Voided': 'Unpaid',
            'Returned': 'Refunded',
        };

        const tipAmount = order.payments.reduce((acc, p) => acc + (p.tip || 0), 0);

        return {
            id: `txn_${order.orderId.replace('#', '')}`,
            orderId: order.orderId,
            timestamp: order.orderTimestamp,
            totalAmount: order.totalAmount,
            paidAmount: order.paidAmount,
            outstandingAmount: order.totalAmount - order.paidAmount,
            paymentStatus: paymentStatusMap[order.paymentState] as Transaction['paymentStatus'] || 'Unpaid',
            paymentMethod: order.payments[0]?.method || 'Credit Card',
            payers: order.payments.length > 0 ? order.payments.length : 1,
            branch: order.branch,
            table: order.table,
            splitMethod: order.splitType === 'equally' ? 'Equal' : order.splitType === 'byItem' ? 'Item-based' : undefined,
            lastPaymentAttempt: order.orderTimestamp + Math.random() * 3600000,
            closeType: Math.random() > 0.5 ? 'Auto' : 'Manual',
            staffName: order.staffName,
            tipAmount: tipAmount > 0 ? tipAmount : undefined,
            tipType: 'Custom',
            serviceChargeAmount: Math.random() > 0.5 ? order.totalAmount * 0.1 : undefined,
        };
    });
};


const chartConfig = {
  total: {
    label: 'Total',
    color: 'hsl(var(--chart-3))',
  },
};

const initialFilterState = {
  dateRange: {
    from: subDays(new Date(), 29),
    to: new Date(),
  } as DateRange | undefined,
  branch: 'all',
  closeType: 'all',
};

const ExportDialog = ({
  open,
  onOpenChange,
  onExport,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: 'CSV' | 'Excel' | 'PDF') => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Transactions</DialogTitle>
          <DialogDescription>
            Select a file format to download the current view of transactions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4 py-4">
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => onExport('CSV')}>
            <FileIcon className="h-6 w-6" />
            <span>CSV</span>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => onExport('Excel')}>
            <SheetIcon className="h-6 w-6" />
            <span>Excel</span>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => onExport('PDF')}>
            <FileText className="h-6 w-6" />
            <span>PDF</span>
          </Button>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function OutstandingReportPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilterState);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const mockOrders = mockDataStore.orders;
      const mockTransactions = generateTransactionsFromOrders(mockOrders);
      setTransactions(mockTransactions);
      setAllOrders(mockOrders);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.dateRange]);
  
  const handleViewDetails = (transaction: Transaction) => {
    const order = allOrders.find(o => o.orderId === transaction.orderId);
    if (order) {
        setSelectedOrder(order);
        setIsSheetOpen(true);
    } else {
        toast({
            variant: 'destructive',
            title: 'Order not found',
            description: `Details for order ${transaction.orderId} are not available.`,
        });
    }
  };

  const handleExport = (format: 'CSV' | 'Excel' | 'PDF') => {
    setIsExportDialogOpen(false);
    toast({
      title: 'Export Initiated',
      description: `Your transactions are being prepared for a ${format} download.`,
    });
  };

  const handleFilterChange = (
    filterName: string,
    value: string | DateRange | undefined
  ) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const resetAllFilters = () => {
    setFilters(initialFilterState);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.timestamp);
      const matchesDate =
        filters.dateRange?.from && filters.dateRange?.to
          ? isWithinInterval(transactionDate, {
              start: filters.dateRange.from,
              end: endOfDay(filters.dateRange.to),
            })
          : true;
      const matchesBranch =
        filters.branch === 'all' || transaction.branch === filters.branch;
      const matchesCloseType =
        filters.closeType === 'all' || transaction.closeType === filters.closeType;

      return (
        matchesDate &&
        matchesBranch &&
        matchesCloseType
      );
    });
  }, [transactions, filters]);

  const outstandingTransactions = useMemo(() => {
    return filteredTransactions.filter(
      (t) => t.paymentStatus === 'Partial' || t.paymentStatus === 'Unpaid'
    );
  }, [filteredTransactions]);

  const outstandingKpiCards: StatCardData[] = useMemo(() => {
    const totalOutstanding = outstandingTransactions.reduce(
      (acc, t) => acc + t.outstandingAmount,
      0
    );
    const outstandingCount = outstandingTransactions.length;
    const totalAge = outstandingTransactions.reduce(
      (acc, t) => acc + differenceInDays(new Date(), new Date(t.timestamp)),
      0
    );
    const avgAge = outstandingCount > 0 ? totalAge / outstandingCount : 0;
    return [
      {
        title: 'Total Outstanding',
        value: `$${totalOutstanding.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        icon: DollarSign,
        color: 'pink',
        changeDescription: 'Across all filtered orders',
        tooltipText: 'The total amount of money that has not yet been paid across all partially paid or unpaid orders.'
      },
      {
        title: 'Outstanding Orders',
        value: `${outstandingCount}`,
        icon: FileWarning,
        color: 'orange',
        tooltipText: 'The total number of orders that are either partially paid or completely unpaid.'
      },
      {
        title: 'Avg. Days Outstanding',
        value: `${avgAge.toFixed(1)}`,
        icon: CalendarDays,
        color: 'green',
        tooltipText: 'The average number of days an order has remained in an outstanding (unpaid or partially paid) state.'
      },
    ];
  }, [outstandingTransactions]);

  const outstandingByStatusChartData = useMemo(() => {
    const data = outstandingTransactions.reduce(
      (acc, t) => {
        const status = t.paymentStatus;
        acc[status] = (acc[status] || 0) + t.outstandingAmount;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(data).map(([name, total]) => ({ name, total }));
  }, [outstandingTransactions]);

  const activeSecondaryFilterCount = useMemo(() => {
    let count = 0;
    if (filters.closeType !== 'all') count++;
    return count;
  }, [filters]);

  if (isLoading) {
    return <OrdersPageSkeleton view="list" />;
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Outstanding Payments Report</h1>
            <p className="text-muted-foreground">
              Monitor orders with pending payments to manage risk and collections.
            </p>
          </div>
          <Button variant="outline" onClick={() => setIsExportDialogOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        <AiSummary data={outstandingTransactions} context="outstanding payments" />
            
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border bg-card p-3">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium">Filters:</span>
            <DateRangePicker
              dateRange={filters.dateRange}
              onDateRangeChange={(range) => handleFilterChange('dateRange', range)}
            />
            <Select
              value={filters.branch}
              onValueChange={(value) => handleFilterChange('branch', value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Branch/Venue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                <SelectItem value="Ras Al Khaimah">Ras Al Khaimah</SelectItem>
                <SelectItem value="Dubai Mall">Dubai Mall</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  More Filters
                  {activeSecondaryFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2 rounded-full px-1.5 py-0.5 text-xs">
                      {activeSecondaryFilterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-screen max-w-sm" align="start">
                <div className="space-y-4 p-4">
                  <h4 className="font-medium leading-none">Additional Filters</h4>
                    <div className="space-y-2">
                        <Label htmlFor="close-type-filter">Close Type</Label>
                        <Select
                        value={filters.closeType}
                        onValueChange={(value) => handleFilterChange('closeType', value)}
                        >
                        <SelectTrigger id="close-type-filter">
                            <SelectValue placeholder="Close Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Close Types</SelectItem>
                            <SelectItem value="Auto">Auto</SelectItem>
                            <SelectItem value="Manual">Manual</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Button variant="ghost" size="sm" onClick={resetAllFilters}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset All Filters
          </Button>
        </div>

        <div className="space-y-6">
            <StatCards cards={outstandingKpiCards} />
            
             <Card>
                <CardHeader>
                    <CardTitle>Outstanding Balance by Status</CardTitle>
                    <CardDescription>
                        A breakdown of remaining balances by payment status.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                         <BarChart data={outstandingByStatusChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                            <YAxis tickFormatter={(value) => `$${value}`} tickLine={false} axisLine={false} fontSize={12} />
                            <Tooltip cursor={{ fill: "hsl(var(--muted))" }} content={<ChartTooltipContent indicator="dot" />} />
                            <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
             </Card>

            <Card>
              <CardHeader>
                  <CardTitle>Outstanding / Partial Payments</CardTitle>
                  <CardDescription>
                    Detailed list of orders with pending payments.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                <TooltipProvider>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>
                          <UiTooltip>
                            <UiTooltipTrigger className="flex items-center gap-1">
                              Total <Info className="h-3 w-3 text-muted-foreground" />
                            </UiTooltipTrigger>
                            <UiTooltipContent>
                              <p>The total bill amount for the order.</p>
                            </UiTooltipContent>
                          </UiTooltip>
                        </TableHead>
                        <TableHead>
                          <UiTooltip>
                            <UiTooltipTrigger className="flex items-center gap-1">
                              Paid <Info className="h-3 w-3 text-muted-foreground" />
                            </UiTooltipTrigger>
                            <UiTooltipContent>
                              <p>The amount successfully paid by the customer.</p>
                            </UiTooltipContent>
                          </UiTooltip>
                        </TableHead>
                        <TableHead>
                          <UiTooltip>
                            <UiTooltipTrigger className="flex items-center gap-1">
                              Remaining <Info className="h-3 w-3 text-muted-foreground" />
                            </UiTooltipTrigger>
                            <UiTooltipContent>
                              <p>The outstanding balance that still needs to be paid.</p>
                            </UiTooltipContent>
                          </UiTooltip>
                        </TableHead>
                        <TableHead>
                          <UiTooltip>
                            <UiTooltipTrigger className="flex items-center gap-1">
                              Days Open <Info className="h-3 w-3 text-muted-foreground" />
                            </UiTooltipTrigger>
                            <UiTooltipContent>
                              <p>The number of days the order has been in an unpaid state.</p>
                            </UiTooltipContent>
                          </UiTooltip>
                        </TableHead>
                        <TableHead>
                          <UiTooltip>
                            <UiTooltipTrigger className="flex items-center gap-1">
                              Last Attempt <Info className="h-3 w-3 text-muted-foreground" />
                            </UiTooltipTrigger>
                            <UiTooltipContent>
                              <p>The date of the last recorded payment attempt.</p>
                            </UiTooltipContent>
                          </UiTooltip>
                        </TableHead>
                        <TableHead>
                           <UiTooltip>
                            <UiTooltipTrigger className="flex items-center gap-1">
                              Close Type <Info className="h-3 w-3 text-muted-foreground" />
                            </UiTooltipTrigger>
                            <UiTooltipContent>
                               <div className="max-w-xs space-y-2 p-1">
                                <p>
                                  <strong className="font-semibold">Auto:</strong> Order automatically closed by the system, typically after a successful online or QR code payment by the customer.
                                </p>
                                <p>
                                  <strong className="font-semibold">Manual:</strong> Order manually closed by a staff member in the POS after handling a payment (e.g., cash or card terminal).
                                </p>
                              </div>
                            </UiTooltipContent>
                          </UiTooltip>
                        </TableHead>
                        <TableHead className="text-right">
                          <UiTooltip>
                            <UiTooltipTrigger className="flex items-center gap-1 justify-end">
                              Risk <Info className="h-3 w-3 text-muted-foreground" />
                            </UiTooltipTrigger>
                            <UiTooltipContent>
                              <p>Orders with a large remaining balance are marked as high-risk.</p>
                            </UiTooltipContent>
                          </UiTooltip>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {outstandingTransactions.map((t) => {
                        const daysOutstanding = differenceInDays(
                          new Date(),
                          new Date(t.timestamp)
                        );
                        const isHighRisk = t.outstandingAmount > 50;
                        return (
                          <TableRow
                            key={t.id}
                            className={cn(
                              "cursor-pointer",
                              isHighRisk &&
                                'bg-red-50/50 border-l-4 border-red-500'
                            )}
                            onClick={() => handleViewDetails(t)}
                          >
                            <TableCell className="font-medium">{t.orderId}</TableCell>
                            <TableCell>${t.totalAmount.toFixed(2)}</TableCell>
                            <TableCell className="text-green-600">${t.paidAmount.toFixed(2)}</TableCell>
                            <TableCell className="font-semibold text-red-600">${t.outstandingAmount.toFixed(2)}</TableCell>
                            <TableCell>{daysOutstanding} day(s)</TableCell>
                            <TableCell>{new Date(t.lastPaymentAttempt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-normal capitalize flex items-center gap-1.5 w-fit">
                                {t.closeType === 'Manual' ? (
                                  <User className="h-3 w-3" />
                                ) : (
                                  <Zap className="h-3 w-3" />
                                )}
                                {t.closeType}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {isHighRisk && (
                                <AlertTriangle className="h-5 w-5 text-red-500 inline-block" />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TooltipProvider>
                {outstandingTransactions.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No outstanding payments match the current filters.
                  </p>
                )}
              </CardContent>
            </Card>
        </div>
      </main>
      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        onExport={handleExport}
      />
      <OrderDetailsSheet 
        order={selectedOrder}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </>
  );
}
