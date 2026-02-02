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
  ArrowUpDown,
  Download,
  AlertTriangle,
  Filter,
  RotateCcw,
  File as FileIcon,
  FileText,
  Sheet as SheetIcon,
  DollarSign,
  WalletCards,
  Clock,
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
  format,
  isWithinInterval,
  differenceInDays,
  subDays,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  addDays,
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
import { generateMockOrders } from '@/app/dashboard/orders/mock';
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

const generateMockTransactions = (
  count: number,
  dateRange?: DateRange
): Transaction[] => {
  const transactions: Transaction[] = [];
  const { from = subDays(new Date(), 29), to = new Date() } = dateRange || {};
  const dateDiff = Math.abs(differenceInDays(to, from));

  const statuses: Transaction['paymentStatus'][] = [
    'Paid',
    'Partial',
    'Unpaid',
    'Refunded',
  ];
  const methods = ['Credit Card', 'Cash', 'Online'];
  const branches: ('Ras Al Khaimah' | 'Dubai Mall')[] = [
    'Ras Al Khaimah',
    'Dubai Mall',
  ];
  const closeTypes: Transaction['closeType'][] = ['Auto', 'Manual'];
  const staffNames = ['Alex', 'Maria', 'John', 'Sarah', 'David'];

  for (let i = 0; i < count; i++) {
    const randomDayOffset = Math.floor(Math.random() * (dateDiff + 1));
    let randomDate = subDays(endOfDay(to), randomDayOffset);
    randomDate = setHours(randomDate, Math.floor(Math.random() * 24));
    randomDate = setMinutes(randomDate, Math.floor(Math.random() * 60));
    randomDate = setSeconds(randomDate, Math.floor(Math.random() * 60));

    // Ensure the generated date is within the provided range
    if (
      randomDate.getTime() < from.getTime() ||
      randomDate.getTime() > endOfDay(to).getTime()
    ) {
      continue;
    }

    const timestamp = randomDate.getTime();

    const totalAmount = parseFloat((Math.random() * 200 + 10).toFixed(2));
    const status = statuses[i % statuses.length];
    let paidAmount = 0;
    if (status === 'Paid') {
      paidAmount = totalAmount;
    } else if (status === 'Partial') {
      paidAmount = parseFloat(
        (totalAmount * (Math.random() * 0.7 + 0.2)).toFixed(2)
      );
    } else if (status === 'Refunded') {
      paidAmount = totalAmount;
    }

    const payers = Math.floor(Math.random() * 4) + 1;
    let splitMethod: Transaction['splitMethod'] | undefined = undefined;
    if (payers > 1 || status === 'Partial') {
      const splitMethods: Transaction['splitMethod'][] = [
        'Equal',
        'Item-based',
        'Custom',
      ];
      splitMethod = splitMethods[i % splitMethods.length];
    }

    const staffName = staffNames[i % staffNames.length];
    let tipAmount: number | undefined = undefined;
    let tipType: Transaction['tipType'] | undefined = undefined;
    let serviceChargeAmount: number | undefined = undefined;


    if ((status === 'Paid' || status === 'Partial') && paidAmount > 0) {
      if (Math.random() > 0.3) {
        // 70% chance of tip
        tipAmount = parseFloat(
          (paidAmount * (Math.random() * 0.1 + 0.1)).toFixed(2)
        ); // 10-20% tip
        tipType = Math.random() > 0.5 ? 'Preset' : 'Custom';
      }
      if (Math.random() > 0.4) { // 60% chance of service charge
        serviceChargeAmount = parseFloat((totalAmount * 0.10).toFixed(2)); // 10%
      }
    }

    transactions.push({
      id: `txn_${12345 + i}`,
      orderId: `#${3210 + i}`,
      timestamp: timestamp,
      totalAmount,
      paidAmount,
      outstandingAmount: totalAmount - paidAmount,
      paymentStatus: status,
      paymentMethod: methods[i % methods.length],
      payers,
      branch: branches[i % branches.length],
      table: `T${(i % 24) + 1}`,
      splitMethod,
      lastPaymentAttempt: timestamp + Math.random() * 3600000,
      closeType: closeTypes[i % closeTypes.length],
      staffName,
      tipAmount,
      tipType,
      serviceChargeAmount,
    });
  }
  return transactions;
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
  sales: {
    label: 'Sales',
    color: 'hsl(var(--chart-1))',
  },
};

const initialFilterState = {
  dateRange: {
    from: subDays(new Date(), 29),
    to: new Date(),
  } as DateRange | undefined,
  branch: 'all',
  paymentStatus: 'all',
  paymentMethod: 'all',
  table: 'all',
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
          <Button
            variant="outline"
            className="h-24 flex-col gap-2"
            onClick={() => onExport('CSV')}
          >
            <FileIcon className="h-6 w-6" />
            <span>CSV</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex-col gap-2"
            onClick={() => onExport('Excel')}
          >
            <SheetIcon className="h-6 w-6" />
            <span>Excel</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex-col gap-2"
            onClick={() => onExport('PDF')}
          >
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

export default function PaymentsReportPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filters, setFilters] = useState(initialFilterState);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Transaction;
    direction: 'ascending' | 'descending';
  } | null>({ key: 'timestamp', direction: 'descending' });

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const mockTransactions = generateMockTransactions(100, filters.dateRange);
      const mockOrders = generateMockOrders(100, filters.dateRange);
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
    console.log(
      `Exporting ${filteredAndSortedTransactions.length} transactions as ${format}...`
    );
  };

  const handleFilterChange = (
    filterName: string,
    value: string | DateRange | undefined
  ) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  const resetAllFilters = () => {
    setFilters(initialFilterState);
    setCurrentPage(1);
  };

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter((transaction) => {
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
      const matchesStatus =
        filters.paymentStatus === 'all' ||
        transaction.paymentStatus === filters.paymentStatus;
      const matchesMethod =
        filters.paymentMethod === 'all' ||
        transaction.paymentMethod === filters.paymentMethod;
      const matchesTable =
        filters.table === 'all' || transaction.table === filters.table;

      return (
        matchesDate &&
        matchesBranch &&
        matchesStatus &&
        matchesMethod &&
        matchesTable
      );
    });

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return filtered;
  }, [transactions, sortConfig, filters]);

  const summaryKpiCards: StatCardData[] = useMemo(() => {
    const totalSales = filteredAndSortedTransactions.reduce(
      (acc, t) => acc + t.totalAmount,
      0
    );
    const totalCollected = filteredAndSortedTransactions.reduce(
      (acc, t) => acc + t.paidAmount,
      0
    );
    const outstandingBalance = filteredAndSortedTransactions.reduce(
      (acc, t) => acc + t.outstandingAmount,
      0
    );
    const paidTransactions = filteredAndSortedTransactions.filter(
      (t) => t.paymentStatus === 'Paid' || t.paymentStatus === 'Partial'
    );
    const avgBillValue =
      paidTransactions.length > 0 ? totalSales / paidTransactions.length : 0;
    
    return [
      {
        title: 'Total Sales',
        value: `$${totalSales.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        change: '+2.5%',
        icon: DollarSign,
        color: 'teal',
      },
      {
        title: 'Total Collected',
        value: `$${totalCollected.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        change: '+2.8%',
        icon: WalletCards,
        color: 'green',
      },
      {
        title: 'Outstanding Balance',
        value: `$${outstandingBalance.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        change: '-5.1%',
        icon: AlertTriangle,
        color: 'pink',
      },
      {
        title: 'Average Bill Value',
        value: `$${avgBillValue.toFixed(2)}`,
        change: '+0.5%',
        icon: FileText,
        color: 'orange',
      },
      {
        title: 'Average Time to Pay',
        value: '8m 15s',
        change: '-2.0%',
        icon: Clock,
        color: 'teal',
      },
    ];
  }, [filteredAndSortedTransactions]);

  const totalPages = Math.ceil(
    filteredAndSortedTransactions.length / itemsPerPage
  );
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedTransactions.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredAndSortedTransactions, currentPage]);

  const summaryChartData = useMemo(() => {
    if (!filters.dateRange?.from) return [];

    const salesByDay: { [key: string]: number } = {};
    const dateDiff = differenceInDays(
      endOfDay(filters.dateRange.to || new Date()),
      filters.dateRange.from
    );

    for (let i = 0; i <= dateDiff; i++) {
      const day = format(addDays(filters.dateRange.from, i), 'MMM d');
      salesByDay[day] = 0;
    }

    filteredAndSortedTransactions.forEach((t) => {
      const day = format(new Date(t.timestamp), 'MMM d');
      if (day in salesByDay) {
        salesByDay[day] += t.totalAmount;
      }
    });

    return Object.keys(salesByDay)
      .map((day) => ({
        date: day,
        sales: salesByDay[day],
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredAndSortedTransactions, filters.dateRange]);

  const requestSort = (key: keyof Transaction) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const tableNumbers = useMemo(() => {
    const uniqueTables = [...new Set(transactions.map((t) => t.table))];
    return uniqueTables.sort(
      (a, b) => parseInt(a.substring(1)) - parseInt(b.substring(1))
    );
  }, [transactions]);

  const staffNames = useMemo(() => {
    return [...new Set(transactions.map((t) => t.staffName))].sort();
  }, [transactions]);

  const activeSecondaryFilterCount = useMemo(() => {
    let count = 0;
    if (filters.paymentStatus !== 'all') count++;
    if (filters.paymentMethod !== 'all') count++;
    if (filters.table !== 'all') count++;
    return count;
  }, [filters]);


  const SortableHeader = ({
    tKey,
    label,
    className,
  }: {
    tKey: keyof Transaction;
    label: string;
    className?: string;
  }) => (
    <Button
      variant="ghost"
      onClick={() => requestSort(tKey)}
      className={cn('px-2', className)}
    >
      {label}
      <ArrowUpDown
        className={cn(
          'ml-2 h-4 w-4',
          sortConfig?.key !== tKey && 'text-muted-foreground/50'
        )}
      />
    </Button>
  );

  if (isLoading) {
    return <OrdersPageSkeleton view="list" />;
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Payments Summary</h1>
            <p className="text-muted-foreground">
              Track and analyze orders, payments, and outstanding balances.
            </p>
          </div>
          <Button variant="outline" onClick={() => setIsExportDialogOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        <AiSummary data={filteredAndSortedTransactions} context="payments summary" />
            
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
                  <p className="text-sm text-muted-foreground">
                    Filter the data for the summary report.
                  </p>
                  <div className="space-y-2">
                      <Label htmlFor="status-filter">Payment Status</Label>
                      <Select
                          value={filters.paymentStatus}
                          onValueChange={(value) => handleFilterChange('paymentStatus', value)}
                      >
                          <SelectTrigger id="status-filter">
                          <SelectValue placeholder="Payment Status" />
                          </SelectTrigger>
                          <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Partial">Partial</SelectItem>
                          <SelectItem value="Unpaid">Unpaid</SelectItem>
                          <SelectItem value="Refunded">Refunded</SelectItem>
                          </SelectContent>
                      </Select>
                      </div>
                      <div className="space-y-2">
                      <Label htmlFor="method-filter">Payment Method</Label>
                      <Select
                          value={filters.paymentMethod}
                          onValueChange={(value) => handleFilterChange('paymentMethod', value)}
                      >
                          <SelectTrigger id="method-filter">
                          <SelectValue placeholder="Payment Method" />
                          </SelectTrigger>
                          <SelectContent>
                          <SelectItem value="all">All Methods</SelectItem>
                          <SelectItem value="Credit Card">Credit Card</SelectItem>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Online">Online</SelectItem>
                          </SelectContent>
                      </Select>
                      </div>
                      <div className="space-y-2">
                      <Label htmlFor="table-filter">Table Number</Label>
                      <Select
                          value={filters.table}
                          onValueChange={(value) => handleFilterChange('table', value)}
                      >
                          <SelectTrigger id="table-filter">
                          <SelectValue placeholder="Table Number" />
                          </SelectTrigger>
                          <SelectContent>
                          <SelectItem value="all">All Tables</SelectItem>
                          {tableNumbers.map((table) => (
                              <SelectItem key={table} value={table}>{table}</SelectItem>
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
          <StatCards cards={summaryKpiCards} />

          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>
                A summary of your sales performance based on current filters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={chartConfig}
                className="h-[400px] w-full"
              >
                <BarChart
                  data={summaryChartData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                  />
                  <YAxis
                    tickFormatter={(value) => `$${Number(value) / 1000}k`}
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    domain={[0, 'dataMax + 1000']}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar
                    dataKey="sales"
                    fill="var(--color-sales)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                  <CardTitle>Transaction Summary</CardTitle>
                  <CardDescription>
                    A detailed list of all transactions within the filtered
                    range.
                  </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>
                        <SortableHeader tKey="id" label="Transaction ID" />
                      </TableHead>
                      <TableHead>
                        <SortableHeader
                          tKey="orderId"
                          label="Table/Order ID"
                        />
                      </TableHead>
                      <TableHead>
                        <SortableHeader tKey="timestamp" label="Timestamp" />
                      </TableHead>
                      <TableHead className="text-right">
                        <SortableHeader
                          tKey="totalAmount"
                          label="Total Amount"
                        />
                      </TableHead>
                      <TableHead className="text-right">
                        <SortableHeader
                          tKey="paidAmount"
                          label="Paid Amount"
                        />
                      </TableHead>
                      <TableHead className="text-right">
                        <SortableHeader
                          tKey="outstandingAmount"
                          label="Outstanding"
                        />
                      </TableHead>
                      <TableHead>
                        <SortableHeader
                          tKey="paymentStatus"
                          label="Payment Status"
                        />
                      </TableHead>
                      <TableHead>
                        <SortableHeader
                          tKey="paymentMethod"
                          label="Payment Method"
                        />
                      </TableHead>
                      <TableHead className="text-right">
                        <SortableHeader tKey="payers" label="# of Payers" />
                      </TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.map((t) => (
                      <TableRow key={t.id} onClick={() => handleViewDetails(t)} className="cursor-pointer">
                          <TableCell className="font-medium">{t.id}</TableCell>
                          <TableCell>{t.orderId}</TableCell>
                          <TableCell>
                          {new Date(t.timestamp).toLocaleString()}
                        </TableCell>
                          <TableCell className="text-right font-mono">
                          ${t.totalAmount.toFixed(2)}
                        </TableCell>
                          <TableCell className="text-right font-mono text-green-600">
                          ${t.paidAmount.toFixed(2)}
                        </TableCell>
                          <TableCell className="text-right font-mono text-red-600">
                          ${t.outstandingAmount.toFixed(2)}
                        </TableCell>
                          <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(t.paymentStatus)}
                          >
                            {t.paymentStatus}
                          </Badge>
                        </TableCell>
                          <TableCell>{t.paymentMethod}</TableCell>
                          <TableCell className="text-right">
                          {t.payers}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Showing{' '}
                <strong>
                  {filteredAndSortedTransactions.length > 0
                    ? (currentPage - 1) * itemsPerPage + 1
                    : 0}
                </strong>{' '}
                to{' '}
                <strong>
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredAndSortedTransactions.length
                  )}
                </strong>{' '}
                of <strong>{filteredAndSortedTransactions.length}</strong>{' '}
                transactions
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage >= totalPages}
                >
                  Next
                </Button>
              </div>
            </CardFooter>
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
