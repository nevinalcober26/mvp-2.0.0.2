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
  LayoutGrid,
  List,
  Download,
  File as FileIcon, // Aliased to avoid conflict
  FileText,
  Sheet as SheetIcon, // Aliased to avoid conflict
  BellRing,
  Settings,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
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
import { OrdersPageSkeleton } from '@/components/dashboard/skeletons';
import { AiSummary } from '@/components/dashboard/ai-summary';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const OrderCard = ({
  order,
  onViewDetails,
}: {
  order: Order;
  onViewDetails: (order: Order) => void;
}) => {
  return (
    <Card
      onClick={() => onViewDetails(order)}
      className="cursor-pointer hover:shadow-md transition-shadow"
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex justify-between items-center">
          <span>{order.orderId}</span>
          <Badge variant={getStatusBadgeVariant(order.orderStatus)}>
            {order.orderStatus}
          </Badge>
        </CardTitle>
        <CardDescription className="flex items-center gap-2 pt-1 flex-wrap">
          <span>{order.table}</span>
          <span className="text-muted-foreground">&bull;</span>
          <span>{order.staffName}</span>
          <span className="text-muted-foreground">&bull;</span>
          <span>{order.items.length} items</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pb-4">
        <div className="flex justify-between text-sm font-mono">
          <span className="text-muted-foreground">Total:</span>
          <span className="font-semibold">${order.totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm font-mono">
          <span className="text-muted-foreground">Paid:</span>
          <span className="text-green-600">${order.paidAmount.toFixed(2)}</span>
        </div>
      </CardContent>
      <CardFooter className="pb-4">
        <Badge
          variant={getStatusBadgeVariant(order.paymentState)}
          className="w-full justify-center"
        >
          {order.paymentState}
        </Badge>
      </CardFooter>
    </Card>
  );
};

const OrderGalleryView = ({
  orders,
  onViewDetails,
}: {
  orders: Order[];
  onViewDetails: (order: Order) => void;
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {orders.map((order) => (
        <OrderCard
          key={order.orderId}
          order={order}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
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
          <DialogTitle>Export Orders</DialogTitle>
          <DialogDescription>
            Select a file format to download the current view of orders.
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

const allColumns = [
    { id: 'customer', label: 'Customer', defaultVisible: true, category: 'Customer' },
    { id: 'orderType', label: 'Order Type', defaultVisible: true, category: 'Order' },
    { id: 'items', label: 'Items', defaultVisible: false, category: 'Order' },
    { id: 'categories', label: 'Categories', defaultVisible: false, category: 'Order' },
    { id: 'orderComments', label: 'Order Comments', defaultVisible: false, category: 'Order' },
    { id: 'paymentState', label: 'Payment State', defaultVisible: true, category: 'Payment' },
    { id: 'paymentMethod', label: 'Payment Method', defaultVisible: false, category: 'Payment' },
    { id: 'total', label: 'Total', defaultVisible: true, category: 'Payment' },
] as const;

type ColumnId = typeof allColumns[number]['id'];

export default function OrdersPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'list' | 'gallery'>('list');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const { toast } = useToast();
  const [permission, setPermission] = useState('default');
  const [columnSearch, setColumnSearch] = useState('');

  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnId, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    allColumns.forEach(col => {
      initialState[col.id] = col.defaultVisible;
    });
    return initialState as Record<ColumnId, boolean>;
  });


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
    const timer = setTimeout(() => {
      setAllOrders(generateMockOrders(50));
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleNotificationClick = () => {
    if (!('Notification' in window)) {
      toast({
        variant: 'destructive',
        title: 'Notifications not supported',
        description: 'Your browser does not support desktop notifications.',
      });
      return;
    }

    if (Notification.permission === 'granted') {
      toast({
        title: 'Notifications are already enabled',
      });
      new Notification('eMenu Digital Hub', {
        body: 'You are all set for future updates!',
      });
      return;
    }

    if (Notification.permission === 'denied') {
      toast({
        variant: 'destructive',
        title: 'Notifications blocked',
        description:
          'Please enable notifications in your browser settings to receive updates.',
      });
      return;
    }

    Notification.requestPermission().then((result) => {
      setPermission(result);
      if (result === 'granted') {
        toast({
          title: 'Notifications Enabled!',
          description: 'You will now receive important updates.',
        });
        new Notification('eMenu Digital Hub', {
          body: 'You are all set for future updates!',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Notifications Blocked',
          description: 'You have denied notification permissions.',
        });
      }
    });
  };

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

  const searchableColumns = useMemo(() => {
    return allColumns.filter(column => 
      column.label.toLowerCase().includes(columnSearch.toLowerCase())
    );
  }, [columnSearch]);

  const groupedColumns = useMemo(() => {
    return searchableColumns.reduce((acc, column) => {
      const category = column.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(column);
      return acc;
    }, {} as Record<string, typeof searchableColumns>);
  }, [searchableColumns]);


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
  
  const handleExport = (format: 'CSV' | 'Excel' | 'PDF') => {
    setIsExportDialogOpen(false);
    toast({
      title: 'Export Initiated',
      description: `Your orders are being prepared for a ${format} download.`,
    });
    // In a real app, you would implement the actual export logic here
    console.log(`Exporting ${filteredAndSortedOrders.length} orders as ${format}...`);
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

  if (isLoading) {
    return <OrdersPageSkeleton view={view} />;
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Orders</h1>
        </div>
        <div>
          <div className="flex justify-end gap-2 mb-4">
            <Button variant="outline" onClick={() => setIsExportDialogOpen(true)}>
                <Download className="mr-2 h-4 w-4" />
                Export
            </Button>
            {permission !== 'granted' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleNotificationClick}
                disabled={permission === 'denied'}
              >
                <BellRing className="mr-2 h-4 w-4" />
                {permission === 'denied'
                  ? 'Notifications Blocked'
                  : 'Enable Notifications'}
              </Button>
            )}
          </div>
          <AiSummary data={filteredAndSortedOrders} context="daily restaurant orders" />
        </div>
        <StatCards cards={kpiCards} />
        <Card className="w-full">
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>
                  View and manage all recent orders from this branch.
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="ml-auto">
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Toggle columns</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[250px]">
                   <div className="p-2" onClick={(e) => e.stopPropagation()}>
                      <Input
                        autoFocus
                        placeholder="Search columns..."
                        value={columnSearch}
                        onChange={(e) => setColumnSearch(e.target.value)}
                        className="h-8"
                      />
                    </div>
                  <DropdownMenuSeparator />
                  
                  {Object.keys(groupedColumns).length > 0 ? (
                      Object.entries(groupedColumns).map(([category, columns]) => (
                      <DropdownMenuGroup key={category}>
                          <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold">{category}</DropdownMenuLabel>
                          {columns.map(column => (
                              <DropdownMenuCheckboxItem
                              key={column.id}
                              className="capitalize"
                              checked={visibleColumns[column.id]}
                              onCheckedChange={(value) =>
                                  setVisibleColumns(prev => ({ ...prev, [column.id]: !!value }))
                              }
                              onSelect={(e) => e.preventDefault()}
                              >
                              {column.label}
                              </DropdownMenuCheckboxItem>
                          ))}
                      </DropdownMenuGroup>
                      ))
                  ) : (
                      <p className="p-4 text-sm text-muted-foreground text-center">No columns found.</p>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
               <Input
                placeholder="Search by ID, table..."
                className="max-w-xs"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={filters.branch}
                  onValueChange={(value) => handleFilterChange('branch', value)}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
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
                    <Button variant="outline" className="w-full sm:w-[180px] justify-between">
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
                  <SelectTrigger className="w-full sm:w-[180px]">
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
                        'w-full sm:w-[280px] justify-start text-left font-normal',
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
                <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                  <Button
                    variant={view === 'gallery' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setView('gallery')}
                    aria-label="Gallery View"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span className="sr-only">Gallery</span>
                  </Button>
                  <Button
                    variant={view === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setView('list')}
                    aria-label="List View"
                  >
                    <List className="h-4 w-4" />
                    <span className="sr-only">List</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto" style={{ width: '1280px', overflow: 'scroll' }}>
              {view === 'list' ? (
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead><SortableHeader tKey="orderId" label="Order ID" /></TableHead>
                        {visibleColumns.customer && <TableHead>Customer</TableHead>}
                        <TableHead><SortableHeader tKey="branch" label="Branch" /></TableHead>
                        <TableHead><SortableHeader tKey="table" label="Table" /></TableHead>
                        {visibleColumns.items && <TableHead>Items</TableHead>}
                        {visibleColumns.categories && <TableHead>Categories</TableHead>}
                        {visibleColumns.orderComments && <TableHead>Comments</TableHead>}
                        {visibleColumns.orderType && <TableHead><SortableHeader tKey="orderType" label="Order Type" /></TableHead>}
                        <TableHead>Order Status</TableHead>
                        {visibleColumns.paymentState && <TableHead><SortableHeader tKey="paymentState" label="Payment State" /></TableHead>}
                        {visibleColumns.paymentMethod && <TableHead>Payment Method</TableHead>}
                        {visibleColumns.total && <TableHead className="text-right"><SortableHeader tKey="totalAmount" label="Total" /></TableHead>}
                        <TableHead className="text-right">Paid</TableHead>
                        <TableHead className="text-right">Pending</TableHead>
                        <TableHead className="text-right sticky right-0 bg-background" style={{ boxShadow: '-5px 0 5px -5px #0003' }}>Actions</TableHead>
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
                          {visibleColumns.customer && (
                            <TableCell>
                              {order.customer ? (
                                <div>
                                  <div className="font-medium">
                                    {order.customer.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {order.customer.email}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {order.customer.phone}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs italic text-muted-foreground">
                                  Guest
                                </div>
                              )}
                            </TableCell>
                          )}
                          <TableCell>{order.branch}</TableCell>
                          <TableCell>{order.table}</TableCell>
                          {visibleColumns.items && <TableCell className="max-w-[200px] truncate">{order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}</TableCell>}
                          {visibleColumns.categories && <TableCell>{[...new Set(order.items.map(item => item.category))].join(', ')}</TableCell>}
                          {visibleColumns.orderComments && <TableCell className="max-w-[150px] truncate">{order.orderComments}</TableCell>}
                          {visibleColumns.orderType && <TableCell>{order.orderType}</TableCell>}
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(order.orderStatus)}>
                              {order.orderStatus}
                            </Badge>
                          </TableCell>
                          {visibleColumns.paymentState && (
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(order.paymentState)}>
                                {order.paymentState}
                                {order.paymentState === 'Partial' && order.splitType === 'equally' && ' (Equally)'}
                                {order.paymentState === 'Partial' && order.splitType === 'byItem' && ' (By Item)'}
                              </Badge>
                            </TableCell>
                          )}
                          {visibleColumns.paymentMethod && <TableCell>{[...new Set(order.payments.map(p => p.method))].join(', ')}</TableCell>}
                          {visibleColumns.total && <TableCell className="text-right font-mono">${order.totalAmount.toFixed(2)}</TableCell>}
                          <TableCell className="text-right font-mono text-green-600">${order.paidAmount.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-mono text-red-600">${(order.totalAmount - order.paidAmount).toFixed(2)}</TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()} className="sticky right-0 bg-background" style={{ boxShadow: '-5px 0 5px -5px #0003' }}>
                            <div className="flex items-center justify-end gap-2">
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
              ) : (
                <OrderGalleryView
                  orders={paginatedOrders}
                  onViewDetails={handleViewDetails}
                />
              )}
            </div>
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
      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        onExport={handleExport}
      />
    </>
  );
}
