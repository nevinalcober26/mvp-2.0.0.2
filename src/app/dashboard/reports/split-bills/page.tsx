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
  Filter,
  RotateCcw,
  File as FileIcon,
  FileText,
  Sheet as SheetIcon,
  DollarSign,
  CirclePercent,
  Users,
  UserX,
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
  Cell,
} from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
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


const getStatusBadgeVariant = (status: Transaction['paymentStatus']) => {
  switch (status) {
    case 'Paid':
      return 'default';
    case 'Partial':
      return 'secondary';
    case 'Unpaid':
      return 'destructive';
    case 'Refunded':
      return 'outline';
    default:
      return 'outline';
  }
};

const chartConfig = {
  'Equal': {
    label: 'Equal',
    color: 'hsl(var(--chart-1))',
  },
  'Item-based': {
    label: 'Item-based',
    color: 'hsl(var(--chart-2))',
  },
  'Custom': {
    label: 'Custom',
    color: 'hsl(var(--chart-3))',
  },
  'Unknown': {
    label: 'Unknown',
    color: 'hsl(var(--chart-4))',
  },
};

const initialFilterState = {
  dateRange: {
    from: subDays(new Date(), 29),
    to: new Date(),
  } as DateRange | undefined,
  branch: 'all',
  splitMethod: 'all',
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

export default function SplitBillsReportPage() {
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
      const matchesSplitMethod =
        filters.splitMethod === 'all' ||
        transaction.splitMethod === filters.splitMethod;

      return (
        matchesDate &&
        matchesBranch &&
        matchesSplitMethod
      );
    });
  }, [transactions, filters]);
  
  const splitTransactions = useMemo(
    () =>
      filteredTransactions.filter(
        (t) => t.payers > 1 || t.splitMethod
      ),
    [filteredTransactions]
  );
  
  const splitKpiCards: StatCardData[] = useMemo(() => {
      const splitAdoptionRate =
        filteredTransactions.length > 0
          ? (splitTransactions.length /
              filteredTransactions.length) *
            100
          : 0;
      const avgPayers =
        splitTransactions.length > 0
          ? splitTransactions.reduce((acc, t) => acc + t.payers, 0) /
            splitTransactions.length
          : 1;

      const abandonedSplits = splitTransactions.filter(
            (t) =>
                t.paymentStatus === 'Unpaid' ||
                t.paymentStatus === 'Partial'
        ).length
      
      const totalOutstanding = splitTransactions.reduce((acc, t) => acc + t.outstandingAmount, 0)

      return [
        {
            title: 'Split Adoption Rate',
            value: `${splitAdoptionRate.toFixed(1)}%`,
            icon: CirclePercent,
            color: 'teal',
            tooltipText: 'The percentage of total transactions where the bill was split among multiple payers.'
        },
        {
            title: 'Avg. Payers per Split',
            value: `${avgPayers.toFixed(1)}`,
            icon: Users,
            color: 'orange',
            tooltipText: 'The average number of individuals who contributed to paying a single bill when it was split.'
        },
        {
            title: 'Abandoned Splits',
            value: `${abandonedSplits}`,
            icon: UserX,
            color: 'pink',
            tooltipText: 'The number of split bill transactions that were not fully paid and remain in a partial or unpaid state.'
        },
        {
            title: 'Total Outstanding',
            value: `$${totalOutstanding.toFixed(2)}`,
            icon: DollarSign,
            color: 'green',
            tooltipText: 'The total outstanding amount from split bill transactions that were not fully paid.'
        }
      ]
  }, [filteredTransactions, splitTransactions]);

  const splitMethodChartData = useMemo(() => {
    const data = splitTransactions.reduce(
      (acc, t) => {
        const method = t.splitMethod || 'Unknown';
        acc[method] = (acc[method] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(data).map(([name, count]) => ({ name, count }));
  }, [splitTransactions]);

  const activeSecondaryFilterCount = useMemo(() => {
    let count = 0;
    if (filters.splitMethod !== 'all') count++;
    return count;
  }, [filters]);

  if (isLoading) {
    return <OrdersPageSkeleton view="list" />;
  }
  
  const legendPayload = splitMethodChartData.map((item) => ({
    value: item.name,
    type: 'rect' as const,
    id: item.name,
    color: (chartConfig[item.name as keyof typeof chartConfig] as any)?.color,
  }));


  return (
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Split Bills Report</h1>
            <p className="text-muted-foreground">
              Analysis of orders with split payments.
            </p>
          </div>
          <Button variant="outline" onClick={() => setIsExportDialogOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        <AiSummary data={splitTransactions} context="split bills" />
            
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
                        <Label htmlFor="split-filter">Split Method</Label>
                        <Select
                        value={filters.splitMethod}
                        onValueChange={(value) => handleFilterChange('splitMethod', value)}
                        >
                        <SelectTrigger id="split-filter">
                            <SelectValue placeholder="Split Method" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Split Methods</SelectItem>
                            <SelectItem value="Equal">Equal</SelectItem>
                            <SelectItem value="Item-based">Item-based</SelectItem>
                            <SelectItem value="Custom">Custom</SelectItem>
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
            <StatCards cards={splitKpiCards} />
            
            <Card>
              <CardHeader>
                <CardTitle>Split Method Distribution</CardTitle>
                <CardDescription>
                  How customers are splitting their bills.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={chartConfig}
                  className="h-[300px] w-full"
                >
                  <BarChart
                    data={splitMethodChartData}
                    layout="vertical"
                    margin={{ left: 20, right: 20 }}
                  >
                    <defs>
                      <linearGradient id="fillEqual" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2} />
                      </linearGradient>
                      <linearGradient id="fillItemBased" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2} />
                      </linearGradient>
                      <linearGradient id="fillCustom" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.2} />
                      </linearGradient>
                      <linearGradient id="fillUnknown" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      width={80}
                    />
                    <XAxis type="number" hide />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <ChartLegend content={<ChartLegendContent payload={legendPayload} />} />
                    <Bar
                      dataKey="count"
                      radius={[0, 4, 4, 0]}
                      label={{ position: 'right', offset: 8, formatter: (value) => value, fontSize: 12 }}
                    >
                      {splitMethodChartData.map((entry) => {
                        const gradientMap = {
                            'Equal': 'url(#fillEqual)',
                            'Item-based': 'url(#fillItemBased)',
                            'Custom': 'url(#fillCustom)',
                            'Unknown': 'url(#fillUnknown)'
                        }
                        return (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={gradientMap[entry.name as keyof typeof gradientMap]}
                        />
                      )})}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                  <CardTitle>Split Bill Analytics</CardTitle>
                  <CardDescription>
                    Detailed list of orders with split payments.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Total Bill</TableHead>
                        <TableHead className="text-center"># of Payers</TableHead>
                        <TableHead>Split Method</TableHead>
                        <TableHead>Time to Settle</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {splitTransactions.map((t) => (
                        <TableRow key={t.id} onClick={() => handleViewDetails(t)} className="cursor-pointer">
                           <TableCell className="font-medium">{t.orderId}</TableCell>
                           <TableCell className="font-mono">${t.totalAmount.toFixed(2)}</TableCell>
                           <TableCell className="text-center">{t.payers}</TableCell>
                           <TableCell>{t.splitMethod || 'N/A'}</TableCell>
                           <TableCell>8m 15s</TableCell>
                           <TableCell>
                            <Badge variant={getStatusBadgeVariant(t.paymentStatus)}>
                              {t.paymentStatus}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                  {splitTransactions.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No split bill transactions match the current filters.
                    </p>
                  )}
                </div>
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
