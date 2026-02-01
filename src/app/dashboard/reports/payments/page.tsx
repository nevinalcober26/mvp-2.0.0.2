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
  TableFooter,
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
  MoreHorizontal,
  Calendar as CalendarIcon,
  ArrowUpDown,
  Download,
  TrendingUp,
  Users,
  AlertTriangle,
  LayoutGrid,
  List,
  Filter,
  RotateCcw,
  File as FileIcon,
  FileText,
  Sheet as SheetIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DashboardHeader } from '@/components/dashboard/header';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { OrdersPageSkeleton } from '@/components/dashboard/skeletons';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { format, isSameDay, differenceInDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

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
};

const generateMockTransactions = (count: number): Transaction[] => {
  const transactions: Transaction[] = [];
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
    const timestamp = Date.now() - i * 3600000 * 3;
    const staffName = staffNames[i % staffNames.length];
    let tipAmount: number | undefined = undefined;
    let tipType: Transaction['tipType'] | undefined = undefined;

    if ((status === 'Paid' || status === 'Partial') && paidAmount > 0) {
      if (Math.random() > 0.3) {
        // 70% chance of tip
        tipAmount = parseFloat(
          (paidAmount * (Math.random() * 0.1 + 0.1)).toFixed(2)
        ); // 10-20% tip
        tipType = Math.random() > 0.5 ? 'Preset' : 'Custom';
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
  date: new Date() as Date | undefined,
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
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filters, setFilters] = useState(initialFilterState);
  const [view, setView] = useState<'chart' | 'list'>('chart');
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const { toast } = useToast();

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Transaction;
    direction: 'ascending' | 'descending';
  } | null>({ key: 'timestamp', direction: 'descending' });

  useEffect(() => {
    const timer = setTimeout(() => {
      setTransactions(generateMockTransactions(100));
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleExport = (format: 'CSV' | 'Excel' | 'PDF') => {
    setIsExportDialogOpen(false);
    toast({
      title: 'Export Initiated',
      description: `Your transactions are being prepared for a ${format} download.`,
    });
    // In a real app, you would implement the actual export logic here
    console.log(
      `Exporting ${filteredAndSortedTransactions.length} transactions as ${format}...`
    );
  };

  const {
    totalSales,
    totalCollected,
    outstandingBalance,
    avgBillValue,
    totalTips,
  } = useMemo(() => {
    const totalSales = transactions.reduce((acc, t) => acc + t.totalAmount, 0);
    const totalCollected = transactions.reduce(
      (acc, t) => acc + t.paidAmount,
      0
    );
    const outstandingBalance = transactions.reduce(
      (acc, t) => acc + t.outstandingAmount,
      0
    );
    const paidTransactions = transactions.filter(
      (t) => t.paymentStatus === 'Paid' || t.paymentStatus === 'Partial'
    );
    const avgBillValue =
      paidTransactions.length > 0 ? totalSales / paidTransactions.length : 0;
    const totalTips = transactions.reduce(
      (acc, t) => acc + (t.tipAmount || 0),
      0
    );
    return {
      totalSales,
      totalCollected,
      outstandingBalance,
      avgBillValue,
      totalTips,
    };
  }, [transactions]);

  const kpiCards = useMemo(
    () => [
      {
        title: 'Total Sales',
        value: `$${totalSales.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        change: '+2.5%',
      },
      {
        title: 'Total Collected',
        value: `$${totalCollected.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        change: '+2.8%',
      },
      {
        title: 'Outstanding Balance',
        value: `$${outstandingBalance.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        change: '-5.1%',
      },
      {
        title: 'Average Bill Value',
        value: `$${avgBillValue.toFixed(2)}`,
        change: '+0.5%',
      },
      { title: 'Average Time to Pay', value: '8m 15s', change: '-2.0%' },
      {
        title: 'Total Tips Collected',
        value: `$${totalTips.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        change: '+4.2%',
      },
    ],
    [totalSales, totalCollected, outstandingBalance, avgBillValue, totalTips]
  );

  const handleFilterChange = (
    filterName: string,
    value: string | Date | undefined
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
      const matchesDate = filters.date
        ? isSameDay(transactionDate, filters.date)
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

  const chartData = useMemo(() => {
    const salesByDay: { [key: string]: number } = {};
    filteredAndSortedTransactions.forEach((t) => {
      const day = format(new Date(t.timestamp), 'MMM d');
      if (!salesByDay[day]) {
        salesByDay[day] = 0;
      }
      salesByDay[day] += t.totalAmount;
    });
    return Object.keys(salesByDay)
      .map((day) => ({
        date: day,
        sales: salesByDay[day],
      }))
      .reverse(); // To show chronologically
  }, [filteredAndSortedTransactions]);

  const splitTransactions = useMemo(
    () =>
      filteredAndSortedTransactions.filter(
        (t) => t.payers > 1 || t.splitMethod
      ),
    [filteredAndSortedTransactions]
  );
  const splitAdoptionRate =
    filteredAndSortedTransactions.length > 0
      ? (filteredAndSortedTransactions.filter((t) => t.payers > 1).length /
          filteredAndSortedTransactions.length) *
        100
      : 0;
  const avgPayers =
    splitTransactions.length > 0
      ? splitTransactions.reduce((acc, t) => acc + t.payers, 0) /
        splitTransactions.length
      : 1;

  const outstandingTransactions = useMemo(() => {
    return filteredAndSortedTransactions.filter(
      (t) => t.paymentStatus === 'Partial' || t.paymentStatus === 'Unpaid'
    );
  }, [filteredAndSortedTransactions]);

  const tipTransactions = useMemo(() => {
    return filteredAndSortedTransactions.filter(
      (t) => t.tipAmount && t.tipAmount > 0
    );
  }, [filteredAndSortedTransactions]);

  const totalGrossTips = useMemo(() => {
    return tipTransactions.reduce((acc, t) => acc + (t.tipAmount || 0), 0);
  }, [tipTransactions]);

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(paginatedTransactions.map((t) => t.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowSelect = (rowId: string) => {
    setSelectedRows((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId]
    );
  };

  const tableNumbers = useMemo(() => {
    const uniqueTables = [...new Set(transactions.map((t) => t.table))];
    return uniqueTables.sort(
      (a, b) => parseInt(a.substring(1)) - parseInt(b.substring(1))
    );
  }, [transactions]);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Payments Reports</h1>
            <p className="text-muted-foreground">
              Track and analyze orders, payments, split bills, tips, and
              outstanding balances.
            </p>
          </div>
          <Button variant="outline" onClick={() => setIsExportDialogOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4" />
              Global Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-[240px] justify-start text-left font-normal',
                    !filters.date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.date ? (
                    isSameDay(filters.date, new Date()) ? (
                      'Today'
                    ) : (
                      format(filters.date, 'PPP')
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.date}
                  onSelect={(date) => handleFilterChange('date', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Select
              value={filters.branch}
              onValueChange={(value) => handleFilterChange('branch', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Branch/Venue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                <SelectItem value="Ras Al Khaimah">Ras Al Khaimah</SelectItem>
                <SelectItem value="Dubai Mall">Dubai Mall</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.paymentStatus}
              onValueChange={(value) =>
                handleFilterChange('paymentStatus', value)
              }
            >
              <SelectTrigger className="w-full sm:w-[160px]">
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
            <Select
              value={filters.paymentMethod}
              onValueChange={(value) =>
                handleFilterChange('paymentMethod', value)
              }
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="Credit Card">Credit Card</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.table}
              onValueChange={(value) => handleFilterChange('table', value)}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Table Number" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tables</SelectItem>
                {tableNumbers.map((table) => (
                  <SelectItem key={table} value={table}>
                    {table}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={resetAllFilters}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset All Filters
            </Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="split-bills">Split Bills</TabsTrigger>
            <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
            <TabsTrigger value="tips">Tips & Charges</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4 mt-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {kpiCards.map((card) => (
                <Card key={card.title}>
                  <CardHeader className="pb-2">
                    <CardDescription>{card.title}</CardDescription>
                    <CardTitle className="text-2xl font-bold">
                      {card.value}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <TrendingUp
                        className={cn(
                          'mr-1 h-4 w-4',
                          card.change.startsWith('+')
                            ? 'text-green-500'
                            : 'text-red-500'
                        )}
                      />
                      <span
                        className={cn(
                          card.change.startsWith('+')
                            ? 'text-green-500'
                            : 'text-red-500',
                          'font-semibold'
                        )}
                      >
                        {card.change}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-shrink-0">
                    <CardTitle>Sales Overview</CardTitle>
                    <CardDescription>
                      A summary of your sales performance.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                      <Button
                        variant={view === 'chart' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setView('chart')}
                        aria-label="Chart View"
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={view === 'list' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setView('list')}
                        aria-label="List View"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {view === 'chart' ? (
                  <ChartContainer
                    config={chartConfig}
                    className="h-[400px] w-full"
                  >
                    <AreaChart
                      data={chartData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="colorSales"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="var(--color-sales)"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--color-sales)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
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
                        cursor={{ strokeDasharray: '3 3' }}
                        content={<ChartTooltipContent indicator="dot" />}
                      />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="var(--color-sales)"
                        fillOpacity={1}
                        fill="url(#colorSales)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                ) : (
                  <div className="relative w-full overflow-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead className="w-12 px-4">
                            <Checkbox
                              checked={
                                paginatedTransactions.length > 0 &&
                                selectedRows.length ===
                                  paginatedTransactions.length
                              }
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead>
                            <SortableHeader tKey="id" label="Transaction ID" />
                          </TableHead>
                          <TableHead>
                            <SortableHeader
                              tKey="orderId"
                              label="Table/Order ID"
                            />
                          </TableHead>
                          <TableHead>
                            <SortableHeader
                              tKey="timestamp"
                              label="Timestamp"
                            />
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
                          </TableHead>
                          <TableHead>
                            <span className="sr-only">Actions</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedTransactions.map((t) => (
                          <TableRow
                            key={t.id}
                            data-state={
                              selectedRows.includes(t.id)
                                ? 'selected'
                                : undefined
                            }
                          >
                            <TableCell className="px-4">
                              <Checkbox
                                checked={selectedRows.includes(t.id)}
                                onCheckedChange={() => handleRowSelect(t.id)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {t.id}
                            </TableCell>
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
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="icon" variant="ghost">
                                    <MoreHorizontal />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem>
                                    View Order
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    View Receipt
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              {view === 'list' && (
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
              )}
            </Card>
          </TabsContent>
          <TabsContent value="split-bills" className="mt-4">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Split Bill Analytics</CardTitle>
                  <CardDescription>
                    Analysis of orders with split payments.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <Card>
                    <CardHeader className="p-4">
                      <CardDescription>Split Adoption Rate</CardDescription>
                      <CardTitle className="text-3xl">
                        {splitAdoptionRate.toFixed(1)}%
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="p-4">
                      <CardDescription>Avg. Payers per Split</CardDescription>
                      <CardTitle className="text-3xl">
                        {avgPayers.toFixed(1)}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="p-4">
                      <CardDescription>Abandoned Splits</CardDescription>
                      <CardTitle className="text-3xl text-red-500">
                        {
                          splitTransactions.filter(
                            (t) =>
                              t.paymentStatus === 'Unpaid' ||
                              t.paymentStatus === 'Partial'
                          ).length
                        }
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="p-4">
                      <CardDescription>Total Outstanding</CardDescription>
                      <CardTitle className="text-3xl">
                        $
                        {splitTransactions
                          .reduce((acc, t) => acc + t.outstandingAmount, 0)
                          .toFixed(2)}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                <div className="relative w-full overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Total Bill</TableHead>
                        <TableHead className="text-center">
                          # of Payers
                        </TableHead>
                        <TableHead>Split Method</TableHead>
                        <TableHead>Time to Settle</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {splitTransactions.slice(0, 5).map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">
                            {t.orderId}
                          </TableCell>
                          <TableCell className="font-mono">
                            ${t.totalAmount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            {t.payers}
                          </TableCell>
                          <TableCell>{t.splitMethod || 'N/A'}</TableCell>
                          <TableCell>8m 15s</TableCell> {/* Placeholder */}
                          <TableCell>
                            <Badge
                              variant={getStatusBadgeVariant(t.paymentStatus)}
                            >
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
          </TabsContent>
          <TabsContent value="outstanding" className="mt-4">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Outstanding / Partial Payments</CardTitle>
                  <CardDescription>
                    Monitor orders with pending payments to manage risk and
                    collections.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Days Open</TableHead>
                      <TableHead>Last Attempt</TableHead>
                      <TableHead>Close Type</TableHead>
                      <TableHead>
                        <span className="sr-only">Warning</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outstandingTransactions.slice(0, 5).map((t) => {
                      const daysOutstanding = differenceInDays(
                        new Date(),
                        new Date(t.timestamp)
                      );
                      const isHighRisk = t.outstandingAmount > 50;
                      return (
                        <TableRow
                          key={t.id}
                          className={cn(
                            isHighRisk &&
                              'bg-red-50/50 border-l-4 border-red-500'
                          )}
                        >
                          <TableCell className="font-medium">
                            {t.orderId}
                          </TableCell>
                          <TableCell>${t.totalAmount.toFixed(2)}</TableCell>
                          <TableCell className="text-green-600">
                            ${t.paidAmount.toFixed(2)}
                          </TableCell>
                          <TableCell className="font-semibold text-red-600">
                            ${t.outstandingAmount.toFixed(2)}
                          </TableCell>
                          <TableCell>{daysOutstanding} day(s)</TableCell>
                          <TableCell>
                            {new Date(
                              t.lastPaymentAttempt
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{t.closeType}</TableCell>
                          <TableCell className="text-right">
                            {isHighRisk && (
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {outstandingTransactions.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No outstanding payments match the current filters.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="tips" className="mt-4">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Tips &amp; Service Charges</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="tips">
                  <TabsList>
                    <TabsTrigger value="tips">Tips Report</TabsTrigger>
                    <TabsTrigger value="service-charges">
                      Service Charge Report
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="tips" className="mt-4">
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
                        {tipTransactions.slice(0, 5).map((t) => (
                          <TableRow key={t.id}>
                            <TableCell className="font-medium">
                              {t.orderId}
                            </TableCell>
                            <TableCell>{t.staffName}</TableCell>
                            <TableCell className="font-mono">
                              ${t.tipAmount?.toFixed(2)}
                            </TableCell>
                            <TableCell className="font-mono">
                              {t.paidAmount > 0
                                ? `${(
                                    (t.tipAmount! / t.paidAmount) *
                                    100
                                  ).toFixed(1)}%`
                                : 'N/A'}
                            </TableCell>
                            <TableCell>{t.paymentMethod}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{t.tipType}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="font-semibold text-right"
                          >
                            Gross Tips Collected
                          </TableCell>
                          <TableCell
                            colSpan={2}
                            className="text-right font-bold text-lg"
                          >
                            ${totalGrossTips.toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="font-semibold text-right text-muted-foreground"
                          >
                            Net Tips (after 5% fee)
                          </TableCell>
                          <TableCell
                            colSpan={2}
                            className="text-right font-bold text-lg text-muted-foreground"
                          >
                            ${(totalGrossTips * 0.95).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                    {tipTransactions.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No transactions with tips match the current filters.
                      </p>
                    )}
                  </TabsContent>
                  <TabsContent value="service-charges" className="mt-4">
                    <p className="text-muted-foreground text-center py-8">
                      Service Charge reporting is coming soon.
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        onExport={handleExport}
      />
    </>
  );
}
