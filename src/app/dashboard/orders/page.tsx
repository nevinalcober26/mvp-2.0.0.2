'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import Image from 'next/image';
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
  Printer,
  Calendar,
  CreditCard,
  User,
  Info,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  XCircle,
  ArrowUpDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { DashboardHeader } from '@/components/dashboard/header';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatCards, type StatCardData } from '@/components/dashboard/stat-cards';
import { cn } from '@/lib/utils';

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type Payment = {
  method: string;
  amount: string;
  date: string;
  transactionId: string;
};

type Order = {
  orderId: string;
  branch: 'Ras Al Khaimah' | 'Dubai Mall';
  table: string;
  orderType: 'Post-Paid' | 'Prepaid';
  orderStatus: 'Draft' | 'Open' | 'Paid' | 'Cancelled' | 'Refunded';
  paymentState: 'Unpaid' | 'Partial' | 'Fully Paid';
  totalAmount: number;
  paidAmount: number;
  items: OrderItem[];
  customerName: string;
  customerEmail: string;
  customerAvatar: string;
  orderDate: string;
  orderTimestamp: number;
  payments: Payment[];
};

const generateMockOrders = (count: number): Order[] => {
  const statuses: Order['orderStatus'][] = [
    'Paid',
    'Open',
    'Draft',
    'Cancelled',
    'Refunded',
  ];
  const paymentStates: Order['paymentState'][] = [
    'Fully Paid',
    'Partial',
    'Unpaid',
  ];
  const branches: Order['branch'][] = ['Ras Al Khaimah', 'Dubai Mall'];
  const names = [
    'Liam Smith',
    'Olivia Johnson',
    'Noah Williams',
    'Emma Brown',
    'Oliver Jones',
    'Ava Garcia',
    'Elijah Miller',
    'Charlotte Davis',
    'William Rodriguez',
    'Sophia Martinez',
  ];
  const menuItems = [
    { id: '1', name: 'Classic Pancakes', price: 12.5 },
    { id: '2', name: 'Orange Juice', price: 5.0 },
    { id: '3', name: 'Espresso', price: 3.5 },
    { id: '4', name: 'Avocado Toast', price: 15.0 },
    { id: '5', name: 'Latte', price: 5.5 },
    { id: '6', name: 'Ribeye Steak', price: 45.0 },
    { id: '7', name: 'Margherita Pizza', price: 20.0 },
    { id: '8', name: 'Cheesecake', price: 8.9 },
  ];

  const orders: Order[] = [];
  for (let i = 0; i < count; i++) {
    const orderStatus = statuses[i % statuses.length];

    let paymentState = paymentStates[i % paymentStates.length];
    if (orderStatus === 'Paid') paymentState = 'Fully Paid';
    if (
      orderStatus === 'Cancelled' ||
      orderStatus === 'Draft' ||
      orderStatus === 'Refunded'
    )
      paymentState = 'Unpaid';
    if (orderStatus === 'Open' && paymentState === 'Fully Paid')
      paymentState = 'Partial';

    const orderItemsCount = Math.floor(Math.random() * 3) + 1;
    const currentItems = Array.from({ length: orderItemsCount }, (_, j) => {
      const item = menuItems[Math.floor(Math.random() * menuItems.length)];
      return {
        ...item,
        id: `${item.id}-${i}-${j}`,
        quantity: Math.floor(Math.random() * 2) + 1,
      };
    });

    const totalAmount = currentItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    let paidAmount = 0;
    if (paymentState === 'Fully Paid') {
      paidAmount = totalAmount;
    } else if (paymentState === 'Partial') {
      paidAmount = totalAmount / 2;
    }

    if (orderStatus === 'Refunded') {
      paidAmount = totalAmount;
    }

    const orderTimestamp = Date.now() - i * 3600000;
    const orderDate = new Date(orderTimestamp);

    let customerName = 'Guest';
    let customerEmail = '—';
    let customerAvatar = '';

    // About 25% of orders will have customer details
    if (i % 4 !== 0) {
      const assignedName = names[Math.floor(i / 4) % names.length];
      customerName = assignedName;
      customerEmail = `${assignedName
        .toLowerCase()
        .replace(' ', '.')}@example.com`;
      customerAvatar = `https://picsum.photos/seed/${assignedName
        .split(' ')[0]
        .toLowerCase()}/100/100`;
    }

    orders.push({
      orderId: `#${3210 + i}`,
      branch: branches[i % branches.length],
      table: `T${(i % 12) + 1}`,
      orderType: i % 2 === 0 ? 'Post-Paid' : 'Prepaid',
      orderStatus,
      paymentState,
      totalAmount,
      paidAmount,
      customerName,
      customerEmail,
      customerAvatar,
      orderDate: orderDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      orderTimestamp,
      items: currentItems,
      payments:
        paidAmount > 0
          ? [
              {
                method: i % 2 === 0 ? 'Credit Card' : 'Cash',
                amount: paidAmount.toFixed(2),
                date: new Date(orderTimestamp + 120000).toLocaleString(),
                transactionId: `txn_${12345 + i}`,
              },
            ]
          : [],
    });
  }
  return orders;
};

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'fully paid':
      return 'default';
    case 'open':
    case 'partial':
      return 'secondary';
    case 'cancelled':
    case 'unpaid':
    case 'refunded':
      return 'destructive';
    case 'draft':
      return 'outline';
    default:
      return 'outline';
  }
};

export default function OrdersPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [filters, setFilters] = useState({
    search: '',
    branch: 'all',
    status: 'all',
  });

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
        order.table.toLowerCase().includes(searchLower) ||
        order.customerName.toLowerCase().includes(searchLower);

      const matchesBranch =
        filters.branch === 'all' || order.branch === filters.branch;
      const matchesStatus =
        filters.status === 'all' || order.orderStatus === filters.status;

      return matchesSearch && matchesBranch && matchesStatus;
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
  }, [allOrders, filters, sortConfig]);

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
            <div className="mt-4 flex items-center gap-4">
              <Input
                placeholder="Search by ID, customer, table..."
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
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortableHeader tKey="orderId" label="Order" />
                  </TableHead>
                  <TableHead>
                    <SortableHeader tKey="table" label="Table" />
                  </TableHead>
                  <TableHead>
                    <SortableHeader tKey="orderTimestamp" label="Date" />
                  </TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Payment State</TableHead>
                  <TableHead className="text-right">
                    <SortableHeader tKey="totalAmount" label="Total" />
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order) => (
                  <TableRow
                    key={order.orderId}
                    onClick={() => handleViewDetails(order)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">
                      {order.orderId}
                    </TableCell>
                    <TableCell>{order.table}</TableCell>
                    <TableCell>{order.orderDate}</TableCell>
                    <TableCell>{order.branch}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.orderStatus)}>
                        {order.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.paymentState)}>
                        {order.paymentState}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ${order.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
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
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(order)}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              Update Status
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
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
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg w-full p-0">
          {selectedOrder && (
            <div className="flex flex-col h-full">
              <SheetHeader className="p-6 border-b bg-muted/50">
                <SheetTitle className="text-2xl">
                  Order {selectedOrder.orderId}
                </SheetTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{selectedOrder.orderDate}</span>
                </div>
              </SheetHeader>
              <div className="flex-grow overflow-y-auto p-6 space-y-6">
                {selectedOrder.customerName !== 'Guest' ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Customer Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage
                          src={selectedOrder.customerAvatar}
                          alt={selectedOrder.customerName}
                          data-ai-hint="person face"
                        />
                        <AvatarFallback>
                          {selectedOrder.customerName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {selectedOrder.customerName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedOrder.customerEmail}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Customer Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground pt-4">
                        No customer details provided for this order.
                      </p>
                    </CardContent>
                  </Card>
                )}

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
                      <span>{selectedOrder.branch}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Table</span>
                      <span>{selectedOrder.table}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order Type</span>
                      <Badge
                        variant={
                          selectedOrder.orderType === 'Prepaid'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {selectedOrder.orderType}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Order Status
                      </span>
                      <Badge
                        variant={getStatusBadgeVariant(
                          selectedOrder.orderStatus
                        )}
                      >
                        {selectedOrder.orderStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Payment State
                      </span>
                      <Badge
                        variant={getStatusBadgeVariant(
                          selectedOrder.paymentState
                        )}
                      >
                        {selectedOrder.paymentState}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Items Ordered ({selectedOrder.items.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item) => (
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
                        <span>${selectedOrder.totalAmount.toFixed(2)}</span>
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
                        <span>${selectedOrder.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-green-600">
                        <span>Paid</span>
                        <span>${selectedOrder.paidAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-red-600">
                        <span>Pending</span>
                        <span>
                          $
                          {(
                            selectedOrder.totalAmount - selectedOrder.paidAmount
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <h4 className="font-semibold mb-3">Payment History</h4>
                    <div className="space-y-4">
                      {selectedOrder.payments.length > 0 ? (
                        selectedOrder.payments.map((payment, index) => (
                          <div key={index} className="flex items-center">
                            <div className="flex-grow">
                              <p className="font-medium">
                                Paid ${payment.amount} via {payment.method}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {payment.date}
                              </p>
                            </div>
                            <Badge variant="default">Success</Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No payments have been made for this order yet.
                        </p>
                      )}
                    </div>
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
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
