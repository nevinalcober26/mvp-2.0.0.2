'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { format, isSameDay } from 'date-fns';
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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  Calendar as CalendarIcon,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  XCircle,
  ArrowUpDown,
  ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { DashboardHeader } from '@/components/dashboard/header';
import { StatCards, type StatCardData } from '@/components/dashboard/stat-cards';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { Order } from './types';
import { generateMockOrders } from './mock';
import { getStatusBadgeVariant } from './utils';
import { OrderDetailsSheet } from './order-details-sheet';

export default function OrdersPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [date, setDate] = useState<Date | undefined>(new Date());

  const [filters, setFilters] = useState({
    search: '',
    branch: 'all',
    status: 'all',
  });
  const [selectedTables, setSelectedTables] = useState<string[]>([]);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Order;
    direction: 'ascending' | 'descending';
  } | null>({ key: 'orderTimestamp', direction: 'descending' });

  useEffect(() => {
    setAllOrders(generateMockOrders(50));
  }, []);

  const handleFilterChange = (type: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const requestSort = (key: keyof Order) => {
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

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = allOrders.filter((order) => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        filters.search === '' ||
        order.orderId.toLowerCase().includes(searchLower) ||
        order.table.toLowerCase().includes(searchLower);

      const matchesBranch =
        filters.branch === 'all' || order.branch === filters.branch;
      const matchesStatus =
        filters.status === 'all' || order.orderStatus === filters.status;
      
      const orderDate = new Date(order.orderTimestamp);
      const matchesDate = date ? isSameDay(orderDate, date) : true;

      const matchesTable =
        selectedTables.length === 0 || selectedTables.includes(order.table);

      return matchesSearch && matchesBranch && matchesStatus && matchesDate && matchesTable;
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
  }, [allOrders, filters, sortConfig, date, selectedTables]);

  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedOrders, currentPage]);

  const kpiCards: StatCardData[] = useMemo(() => {
    const successfulOrders = allOrders.filter(
      (order) =>
        order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Refunded'
    );

    const totalRevenue = successfulOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    const totalOrders = allOrders.length;

    const averageOrderValue =
      successfulOrders.length > 0 ? totalRevenue / successfulOrders.length : 0;

    const cancelledCount = allOrders.filter(
      (order) =>
        order.orderStatus === 'Cancelled' || order.orderStatus === 'Refunded'
    ).length;

    const successfulOrdersCount = successfulOrders.length;

    const cancelledPercentage =
      totalOrders > 0 ? (cancelledCount / totalOrders) * 100 : 0;

    return [
      {
        title: 'Total Revenue',
        value: `$${totalRevenue.toFixed(2)}`,
        changeDescription: `from ${successfulOrdersCount} orders`,
        icon: DollarSign,
        color: 'teal',
      },
      {
        title: 'Total Orders',
        value: `+${totalOrders}`,
        changeDescription: 'in the last 30 days',
        icon: ShoppingCart,
        color: 'orange',
      },
      {
        title: 'Avg. Order Value',
        value: `$${averageOrderValue.toFixed(2)}`,
        change: '+5.2%',
        changeDescription: 'vs last month',
        icon: TrendingUp,
        color: 'pink',
      },
      {
        title: 'Cancelled & Refunded',
        value: `${cancelledCount}`,
        changeDescription: `${cancelledPercentage.toFixed(0)}% of total orders`,
        icon: XCircle,
        color: 'green',
      },
    ];
  }, [allOrders]);

  const handleStatusChange = (
    orderId: string,
    newStatus: Order['orderStatus']
  ) => {
    setAllOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.orderId === orderId ? { ...order, orderStatus: newStatus } : order
      )
    );
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsSheetOpen(true);
  };

  const SortableHeader = ({
    tKey,
    label,
  }: {
    tKey: keyof Order;
    label: string;
  }) => (
    <Button variant="ghost" onClick={() => requestSort(tKey)} className="px-2">
      {label}
      <ArrowUpDown
        className={cn(
          'ml-2 h-4 w-4',
          sortConfig?.key !== tKey && 'text-muted-foreground/50'
        )}
      />
    </Button>
  );

  const tableNumbers = useMemo(() => {
    const uniqueTables = [...new Set(allOrders.map(order => order.table))];
    return uniqueTables.sort((a,b) => parseInt(a.substring(1)) - parseInt(b.substring(1)));
  }, [allOrders]);

  return (
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <StatCards cards={kpiCards} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>
              View and manage all recent orders.
            </CardDescription>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Input
                placeholder="Search by ID, table..."
                className="max-w-xs"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              <Select
                value={filters.branch}
                onValueChange={(value) => handleFilterChange('branch', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="Ras Al Khaimah">Ras Al Khaimah</SelectItem>
                  <SelectItem value="Dubai Mall">Dubai Mall</SelectItem>
                </SelectContent>
              </Select>
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[180px] justify-between">
                    <span>
                      Table
                      {selectedTables.length > 0 && ` (${selectedTables.length})`}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[180px]" align="start">
                  <DropdownMenuLabel>Filter by table</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {tableNumbers.map((table) => (
                    <DropdownMenuCheckboxItem
                      key={table}
                      checked={selectedTables.includes(table)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTables((prev) => [...prev, table]);
                        } else {
                          setSelectedTables((prev) =>
                            prev.filter((t) => t !== table)
                          );
                        }
                      }}
                    >
                      {table}
                    </DropdownMenuCheckboxItem>
                  ))}
                  {selectedTables.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => setSelectedTables([])}
                        className="justify-center text-center"
                      >
                        Clear filters
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
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
                    {date ? (isSameDay(date, new Date()) ? 'Today' : format(date, 'PPP')) : <span>Pick a date</span>}
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
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><SortableHeader tKey="orderId" label="Order ID" /></TableHead>
                  <TableHead><SortableHeader tKey="branch" label="Branch" /></TableHead>
                  <TableHead><SortableHeader tKey="table" label="Table" /></TableHead>
                  <TableHead><SortableHeader tKey="orderType" label="Order Type" /></TableHead>
                  <TableHead><SortableHeader tKey="orderStatus" label="Order Status" /></TableHead>
                  <TableHead><SortableHeader tKey="paymentState" label="Payment State" /></TableHead>
                  <TableHead className="text-right"><SortableHeader tKey="totalAmount" label="Total" /></TableHead>
                  <TableHead className="text-right"><SortableHeader tKey="paidAmount" label="Paid" /></TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order) => (
                  <TableRow
                    key={order.orderId}
                    onClick={() => handleViewDetails(order)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">{order.orderId}</TableCell>
                    <TableCell>{order.branch}</TableCell>
                    <TableCell>{order.table}</TableCell>
                    <TableCell>{order.orderType}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.orderStatus)}>
                        {order.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                       <Badge variant={getStatusBadgeVariant(order.paymentState)}>
                        {order.paymentState}
                        {order.paymentState === 'Partial' && order.splitType === 'equally' && ' (Equally)'}
                        {order.paymentState === 'Partial' && order.splitType === 'byItem' && ' (By Item)'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono text-green-600">${order.paidAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono text-red-600">${(order.totalAmount - order.paidAmount).toFixed(2)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(order)}
                        >
                          View
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Set Order Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(order.orderId, 'Draft')
                              }
                            >
                              Draft
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(order.orderId, 'Open')
                              }
                            >
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(order.orderId, 'Paid')
                              }
                            >
                              Paid
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(
                                  order.orderId,
                                  'Cancelled'
                                )
                              }
                            >
                              Cancelled
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(
                                  order.orderId,
                                  'Refunded'
                                )
                              }
                            >
                              Refunded
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing{' '}
              <strong>
                {Math.min(
                  (currentPage - 1) * itemsPerPage + 1,
                  filteredAndSortedOrders.length
                )}
              </strong>{' '}
              to{' '}
              <strong>
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredAndSortedOrders.length
                )}
              </strong>{' '}
              of <strong>{filteredAndSortedOrders.length}</strong> orders
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
      </main>

      <OrderDetailsSheet
        order={selectedOrder}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </>
  );
}
