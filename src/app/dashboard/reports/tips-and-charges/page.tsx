'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
  Filter,
  RotateCcw,
  File as FileIcon,
  FileText,
  Sheet as SheetIcon,
  HandCoins,
  CirclePercent,
  TrendingUp,
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
  staffName: 'all',
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

export default function TipsAndChargesReportPage() {
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
      const matchesStaffName =
        filters.staffName === 'all' || transaction.staffName === filters.staffName;

      return (
        matchesDate &&
        matchesBranch &&
        matchesStaffName
      );
    });
  }, [transactions, filters]);

  const tipTransactions = useMemo(() => {
    return filteredTransactions.filter(
      (t) => t.tipAmount && t.tipAmount > 0
    );
  }, [filteredTransactions]);

  const totalGrossTips = useMemo(() => {
    return tipTransactions.reduce((acc, t) => acc + (t.tipAmount || 0), 0);
  }, [tipTransactions]);

    const serviceChargeTransactions = useMemo(() => {
    return filteredTransactions.filter(t => t.serviceChargeAmount && t.serviceChargeAmount > 0);
  }, [filteredTransactions]);

  const totalServiceCharge = useMemo(() => {
      return serviceChargeTransactions.reduce((acc, t) => acc + (t.serviceChargeAmount || 0), 0);
  }, [serviceChargeTransactions]);

  const tipsKpiCards: StatCardData[] = useMemo(() => {
    const paidTransactionsCount = filteredTransactions.filter(
      (t) => t.paidAmount > 0
    ).length;
    const tipAdoptionRate =
      paidTransactionsCount > 0
        ? (tipTransactions.length / paidTransactionsCount) * 100
        : 0;

    const totalBillForTippedTxns = tipTransactions.reduce(
      (acc, t) => acc + t.totalAmount,
      0
    );
    const avgTipPercentage =
      totalBillForTippedTxns > 0
        ? (totalGrossTips / totalBillForTippedTxns) * 100
        : 0;

    return [
      {
        title: 'Total Tips Collected',
        value: `$${totalGrossTips.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        icon: HandCoins,
        color: 'teal',
        tooltipText: 'The total gross amount of all tips collected across the filtered transactions before any fees.'
      },
      {
        title: 'Tip Adoption Rate',
        value: `${tipAdoptionRate.toFixed(1)}%`,
        icon: CirclePercent,
        color: 'orange',
        tooltipText: 'The percentage of transactions with a paid amount where a tip was also given.'
      },
      {
        title: 'Average Tip %',
        value: `${avgTipPercentage.toFixed(1)}%`,
        icon: TrendingUp,
        color: 'pink',
        tooltipText: 'The average tip amount as a percentage of the total bill for transactions that included a tip.'
      },
    ];
  }, [filteredTransactions, tipTransactions, totalGrossTips]);

  const tipsByStaffChartData = useMemo(() => {
    const data = tipTransactions.reduce(
      (acc, t) => {
        const staff = t.staffName;
        acc[staff] = (acc[staff] || 0) + (t.tipAmount || 0);
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(data)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [tipTransactions]);

  const staffNames = useMemo(() => {
    return [...new Set(transactions.map((t) => t.staffName))].sort();
  }, [transactions]);

  const activeSecondaryFilterCount = useMemo(() => {
    let count = 0;
    if (filters.staffName !== 'all') count++;
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
            <h1 className="text-2xl font-bold">Tips & Charges Report</h1>
            <p className="text-muted-foreground">
              Analyze tips and service charges applied to transactions.
            </p>
          </div>
          <Button variant="outline" onClick={() => setIsExportDialogOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        <AiSummary data={tipTransactions} context="tips and charges" />
            
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
                        <Label htmlFor="staff-filter">Staff Name</Label>
                        <Select
                        value={filters.staffName}
                        onValueChange={(value) => handleFilterChange('staffName', value)}
                        >
                        <SelectTrigger id="staff-filter">
                            <SelectValue placeholder="Filter by Staff" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Staff</SelectItem>
                            {staffNames.map((name) => (
                            <SelectItem key={name} value={name}>{name}</SelectItem>
                            ))}
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
            <StatCards cards={tipsKpiCards} />

            <Card>
              <CardHeader>
                <CardTitle>Top Tips by Staff</CardTitle>
                <CardDescription>
                  Total tips collected by each staff member.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={chartConfig}
                  className="h-[300px] w-full"
                >
                  <BarChart
                    data={tipsByStaffChartData}
                    layout="vertical"
                    margin={{ left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                    />
                    <XAxis
                      type="number"
                      tickFormatter={(value) => `$${value}`}
                      hide={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar
                      dataKey="total"
                      fill="var(--color-total)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tips Report</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative w-full overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Waiter</TableHead>
                          <TableHead>Tip Amount</TableHead>
                          <TableHead>Tip %</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tipTransactions.slice(0, 10).map((t) => (
                          <TableRow key={t.id} onClick={() => handleViewDetails(t)} className="cursor-pointer">
                              <TableCell className="font-medium">{t.orderId}</TableCell>
                              <TableCell>{t.staffName}</TableCell>
                              <TableCell className="font-mono">${t.tipAmount?.toFixed(2)}</TableCell>
                              <TableCell className="font-mono">
                                {t.paidAmount > 0 ? `${((t.tipAmount! / t.paidAmount) * 100).toFixed(1)}%` : 'N/A'}
                              </TableCell>
                              <TableCell>{t.paymentMethod}</TableCell>
                              <TableCell><Badge variant="outline">{t.tipType}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {tipTransactions.length === 0 && (
                    <p className="text-center text-muted-foreground p-8">
                      No transactions with tips match the current filters.
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex-col items-start bg-muted/50 p-6 space-y-2 border-t">
                  <div className="flex justify-between items-center w-full text-sm font-semibold">
                    <span>Gross Tips Collected</span>
                    <span className="font-bold text-lg">${totalGrossTips.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center w-full text-sm text-muted-foreground">
                    <span>Net Tips (after 5% fee)</span>
                    <span className="font-bold text-lg">${(totalGrossTips * 0.95).toFixed(2)}</span>
                  </div>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Charge Report</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative w-full overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Bill Amount</TableHead>
                          <TableHead className="text-right">Service Charge</TableHead>
                          <TableHead>Staff</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {serviceChargeTransactions.slice(0, 10).map((t) => (
                          <TableRow key={t.id} onClick={() => handleViewDetails(t)} className="cursor-pointer">
                              <TableCell className="font-medium">{t.orderId}</TableCell>
                              <TableCell>{new Date(t.timestamp).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right font-mono">${t.totalAmount.toFixed(2)}</TableCell>
                              <TableCell className="text-right font-mono">${t.serviceChargeAmount?.toFixed(2)}</TableCell>
                              <TableCell>{t.staffName}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {serviceChargeTransactions.length === 0 && (
                    <p className="text-center text-muted-foreground p-8">
                      No transactions with service charges match the current filters.
                    </p>
                  )}
                </CardContent>
                <CardFooter className="bg-muted/50 p-6 border-t">
                  <div className="flex justify-between items-center w-full text-sm font-semibold">
                    <span>Total Service Charges Collected</span>
                    <span className="font-bold text-lg">${totalServiceCharge.toFixed(2)}</span>
                  </div>
                </CardFooter>
              </Card>
            </div>
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
