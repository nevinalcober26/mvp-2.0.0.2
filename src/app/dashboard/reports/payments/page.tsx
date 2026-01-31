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
import { format } from 'date-fns';

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

    transactions.push({
      id: `txn_${12345 + i}`,
      orderId: `#${3210 + i}`,
      timestamp: Date.now() - i * 3600000 * 3, // 3 hour intervals
      totalAmount,
      paidAmount,
      outstandingAmount: totalAmount - paidAmount,
      paymentStatus: status,
      paymentMethod: methods[i % methods.length],
      payers: Math.floor(Math.random() * 4) + 1,
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
  const [view, setView] = useState<'table' | 'chart'>('chart');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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

  const sortedTransactions = useMemo(() => {
    let sortableItems = [...transactions];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [transactions, sortConfig]);

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTransactions, currentPage]);

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
                  new Date(date).toLocaleDateString()
                ) : (
                  <span>Pick a date range</span>
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
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Table Number" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tables</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Branch/Venue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
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
                          <SortableHeader tKey="orderId" label="Table/Order ID" />
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
                            <Badge variant={getStatusBadgeVariant(t.paymentStatus)}>
                              {t.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>{t.paymentMethod}</TableCell>
                          <TableCell className="text-right">{t.payers}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost">
                                  <MoreHorizontal />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>View Order</DropdownMenuItem>
                                <DropdownMenuItem>View Receipt</DropdownMenuItem>
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
                    {(currentPage - 1) * itemsPerPage + 1}
                  </strong>{' '}
                  to{' '}
                  <strong>
                    {Math.min(
                      currentPage * itemsPerPage,
                      transactions.length
                    )}
                  </strong>{' '}
                  of <strong>{transactions.length}</strong> transactions
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
                    disabled={currentPage === totalPages}
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
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
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
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Split Bill Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Content coming soon...</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Outstanding / Partial Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Content coming soon...</p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Tips & Service Charges</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Content coming soon...</p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
