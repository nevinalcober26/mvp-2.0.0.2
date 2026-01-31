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
  MoreHorizontal,
  Calendar as CalendarIcon,
  ArrowUpDown,
  Download,
  TrendingUp,
  Users,
  AlertTriangle,
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
        const splitMethods: Transaction['splitMethod'][] = ['Equal', 'Item-based', 'Custom'];
        splitMethod = splitMethods[i % splitMethods.length];
    }
    const timestamp = Date.now() - i * 3600000 * 3;


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

const kpiCards = [
  { title: 'Total Sales', value: '$128,430.20', change: '+2.5%' },
  { title: 'Total Collected', value: '$125,120.90', change: '+2.8%' },
  { title: 'Outstanding Balance', value: '$3,309.30', change: '-5.1%' },
  { title: 'Average Bill Value', value: '$45.80', change: '+0.5%' },
  { title: 'Average Time to Pay', value: '8m 15s', change: '-2.0%' },
  { title: 'Total Tips Collected', value: '$9,870.50', change: '+4.2%' },
];

const chartConfig = {
  sales: {
    label: 'Sales',
    color: 'hsl(var(--chart-1))',
  },
};

export default function PaymentsReportPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filters, setFilters] = useState({
    paymentStatus: 'all',
    paymentMethod: 'all',
    table: 'all',
    branch: 'all',
  });

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

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.timestamp);
      const matchesDate = date ? isSameDay(transactionDate, date) : true;
      const matchesStatus =
        filters.paymentStatus === 'all' ||
        transaction.paymentStatus === filters.paymentStatus;
      const matchesMethod =
        filters.paymentMethod === 'all' ||
        transaction.paymentMethod === filters.paymentMethod;
      const matchesTable =
        filters.table === 'all' || transaction.table === filters.table;
      const matchesBranch =
        filters.branch === 'all' || transaction.branch === filters.branch;

      return (
        matchesDate &&
        matchesStatus &&
        matchesMethod &&
        matchesTable &&
        matchesBranch
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
  }, [transactions, sortConfig, date, filters]);

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
    transactions.forEach((t) => {
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
  }, [transactions]);
  
  const splitTransactions = useMemo(() => filteredAndSortedTransactions.filter(t => t.payers > 1 || t.splitMethod), [filteredAndSortedTransactions]);
  const splitAdoptionRate = transactions.length > 0 ? (transactions.filter(t => t.payers > 1).length / transactions.length) * 100 : 0;
  const avgPayers = splitTransactions.length > 0 ? splitTransactions.reduce((acc, t) => acc + t.payers, 0) / splitTransactions.length : 1;
  
  const outstandingTransactions = useMemo(() => {
    return filteredAndSortedTransactions.filter(
        (t) => t.paymentStatus === 'Partial' || t.paymentStatus === 'Unpaid'
    );
  }, [filteredAndSortedTransactions]);


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

  const branches = useMemo(() => {
    return [...new Set(transactions.map((t) => t.branch))];
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
      <main className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Payments Reports</h1>
          <p className="text-muted-foreground">
            Track and analyze orders, payments, split bills, tips, and
            outstanding balances.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-[280px] justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                  isSameDay(date, new Date()) ? 'Today' : format(date, 'PPP')
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Select
            value={filters.paymentStatus}
            onValueChange={(value) => handleFilterChange('paymentStatus', value)}
          >
            <SelectTrigger className="w-[180px]">
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
            onValueChange={(value) => handleFilterChange('paymentMethod', value)}
          >
            <SelectTrigger className="w-[180px]">
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
            <SelectTrigger className="w-[180px]">
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
          <Select
            value={filters.branch}
            onValueChange={(value) => handleFilterChange('branch', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Branch/Venue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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

        <Tabs
          value={view}
          onValueChange={(v) => setView(v as 'table' | 'chart')}
        >
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="chart">Chart View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
            </TabsList>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
          </div>
          <TabsContent value="table">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Summary</CardTitle>
                <CardDescription>
                  A complete list of all transactions in the selected period.
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                            selectedRows.includes(t.id) ? 'selected' : undefined
                          }
                        >
                          <TableCell className="px-4">
                            <Checkbox
                              checked={selectedRows.includes(t.id)}
                              onCheckedChange={() => handleRowSelect(t.id)}
                            />
                          </TableCell>
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
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost">
                                  <MoreHorizontal />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>View Order</DropdownMenuItem>
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
          </TabsContent>
          <TabsContent value="chart">
            <Card>
              <CardHeader>
                <CardTitle>Sales Over Time</CardTitle>
                <CardDescription>
                  Total sales amount per day for the selected period.
                </CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Placeholder Sections */}
        <div className="grid grid-cols-1 gap-8">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Split Bill Analytics</CardTitle>
                    <CardDescription>
                    Analysis of orders with split payments.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <Card>
                        <CardHeader className="p-4">
                        <CardDescription>Split Adoption Rate</CardDescription>
                        <CardTitle className="text-3xl">{splitAdoptionRate.toFixed(1)}%</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="p-4">
                        <CardDescription>Avg. Payers per Split</CardDescription>
                        <CardTitle className="text-3xl">{avgPayers.toFixed(1)}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="p-4">
                        <CardDescription>Abandoned Splits</CardDescription>
                        <CardTitle className="text-3xl text-red-500">
                            {splitTransactions.filter(t => t.paymentStatus === 'Unpaid' || t.paymentStatus === 'Partial').length}
                        </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="p-4">
                        <CardDescription>Total Outstanding</CardDescription>
                        <CardTitle className="text-3xl">
                            ${splitTransactions.reduce((acc, t) => acc + t.outstandingAmount, 0).toFixed(2)}
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
                            <TableHead className="text-center"># of Payers</TableHead>
                            <TableHead>Split Method</TableHead>
                            <TableHead>Time to Settle</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {splitTransactions.slice(0, 5).map((t) => (
                            <TableRow key={t.id}>
                            <TableCell className="font-medium">{t.orderId}</TableCell>
                            <TableCell className="font-mono">${t.totalAmount.toFixed(2)}</TableCell>
                            <TableCell className="text-center">{t.payers}</TableCell>
                            <TableCell>{t.splitMethod || 'N/A'}</TableCell>
                            <TableCell>8m 15s</TableCell> {/* Placeholder */}
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
                        <p className="text-center text-muted-foreground py-8">No split bill transactions match the current filters.</p>
                    )}
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Outstanding / Partial Payments</CardTitle>
                    <CardDescription>
                        Monitor orders with pending payments to manage risk and collections.
                    </CardDescription>
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
                                <TableHead><span className="sr-only">Warning</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {outstandingTransactions.slice(0, 5).map((t) => {
                                const daysOutstanding = differenceInDays(new Date(), new Date(t.timestamp));
                                const isHighRisk = t.outstandingAmount > 50;
                                return (
                                    <TableRow key={t.id} className={cn(isHighRisk && 'bg-red-50/50 border-l-4 border-red-500')}>
                                        <TableCell className="font-medium">{t.orderId}</TableCell>
                                        <TableCell>${t.totalAmount.toFixed(2)}</TableCell>
                                        <TableCell className="text-green-600">${t.paidAmount.toFixed(2)}</TableCell>
                                        <TableCell className="font-semibold text-red-600">${t.outstandingAmount.toFixed(2)}</TableCell>
                                        <TableCell>{daysOutstanding} day(s)</TableCell>
                                        <TableCell>{new Date(t.lastPaymentAttempt).toLocaleDateString()}</TableCell>
                                        <TableCell>{t.closeType}</TableCell>
                                        <TableCell className="text-right">
                                            {isHighRisk && <AlertTriangle className="h-5 w-5 text-red-500" />}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                     {outstandingTransactions.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">No outstanding payments match the current filters.</p>
                    )}
                </CardContent>
            </Card>
            <Card>
            <CardHeader>
                <CardTitle>Tips & Service Charges</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Content coming soon...</p>
            </CardContent>
            </Card>
        </div>
      </main>
    </>
  );
}
