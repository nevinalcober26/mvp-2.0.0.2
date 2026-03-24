'use client';

import * as React from 'react';
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RotateCcw,
  ShoppingCart,
  DollarSign,
  WalletCards,
  AlertTriangle,
  Ban,
  HelpCircle,
  Smartphone,
  Laptop,
  ChevronLeft,
  ChevronRight,
  Download,
  File as FileIcon,
  FileText,
  Sheet as SheetIcon,
  ChevronDown,
  X,
  Lock,
  Clock,
} from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/header';
import { cn } from '@/lib/utils';
import { OrdersPageSkeleton } from '@/components/dashboard/skeletons';
import {
  isWithinInterval,
  subDays,
  endOfDay,
  isSameDay,
  format,
} from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { type DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/dashboard/reports/date-range-picker';
import type { Order } from '@/app/dashboard/orders/types';
import { mockDataStore } from '@/lib/mock-data-store';
import { OrderDetailsSheet } from '@/app/dashboard/orders/order-details-sheet';
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { StatCards, type StatCardData } from '@/components/dashboard/stat-cards';

type Transaction = {
  id: string;
  orderId: string;
  timestamp: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid' | 'Refunded' | 'Voided';
  paymentMethod: string;
  payers: number;
  branch: string;
  source: 'App to App' | 'POS';
};

const generateTransactionsFromOrders = (orders: Order[]): Transaction[] => {
    return orders.map(order => {
        const paymentStatusMap = {
            'Fully Paid': 'Paid',
            'Partial': 'Partial',
            'Unpaid': 'Unpaid',
            'Voided': 'Voided',
            'Returned': 'Refunded',
        };

        return {
            id: `txn_${order.orderId.replace('#', '')}`,
            orderId: order.orderId,
            timestamp: order.orderTimestamp,
            totalAmount: order.totalAmount,
            paidAmount: order.paidAmount,
            outstandingAmount: order.totalAmount - order.paidAmount,
            paymentStatus: paymentStatusMap[order.paymentState] as Transaction['paymentStatus'] || 'Unpaid',
            paymentMethod: order.payments[0]?.method || '-',
            payers: order.payments.length > 0 ? order.payments.length : 1,
            branch: order.branch,
            source: order.source || 'App to App',
        };
    });
};


const initialFilterState = {
  dateRange: {
    from: subDays(new Date(), 29),
    to: new Date(),
  } as DateRange | undefined,
  branches: ["Bloomsbury's - Ras Al Khaimah"],
  paymentStatus: 'all',
  source: 'all',
};

const ExportDialog = ({ open, onOpenChange, onExport, dateRange }: { open: boolean; onOpenChange: (open: boolean) => void; onExport: (format: "CSV" | "Excel" | "PDF") => void; dateRange?: DateRange; }) => {
    const rangeLabel = React.useMemo(() => {
        if (!dateRange?.from) return 'All Time';
        if (isSameDay(dateRange.from, new Date()) && !dateRange.to) return 'Today';
        if (!dateRange.to || isSameDay(dateRange.from, dateRange.to)) {
            return format(dateRange.from, "PPP");
        }
        return `${format(dateRange.from, "LLL d")} - ${format(dateRange.to, "LLL d, y")}`;
    }, [dateRange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden border-0 shadow-2xl rounded-2xl bg-white">
        <DialogClose asChild>
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 rounded-full h-10 w-10 bg-black/5 hover:bg-black/10 z-10">
            <X className="h-5 w-5 text-muted-foreground" />
          </Button>
        </DialogClose>
        <div className="p-10 pt-12 text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-2xl bg-[#18B4A6] flex items-center justify-center shadow-lg">
              <Download className="h-10 w-10 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-3xl font-bold tracking-tight">Export Your Data</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">Select your preferred format and download instantly</DialogDescription>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <button
              onClick={() => onExport('CSV')}
              className="flex flex-col items-center gap-5 p-6 rounded-2xl border-2 border-green-500/10 bg-green-50/50 hover:border-green-500/30 hover:bg-green-50 transition-all group outline-none text-center"
            >
              <div className="relative h-16 w-16 rounded-2xl flex items-center justify-center bg-green-500 shadow-lg shadow-green-500/20 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6">
                <FileIcon className="h-8 w-8 text-white" />
                <span className="absolute bottom-1 right-1 text-[8px] font-bold bg-white text-green-600 px-1 rounded-sm">CSV</span>
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-foreground">CSV</p>
                <p className="text-xs text-muted-foreground">Perfect for Excel & Google Sheets</p>
              </div>
            </button>
            <button
              onClick={() => onExport('Excel')}
              className="flex flex-col items-center gap-5 p-6 rounded-2xl border-2 border-blue-500/10 bg-blue-50/50 hover:border-blue-500/30 hover:bg-blue-50 transition-all group outline-none text-center"
            >
              <div className="relative h-16 w-16 rounded-2xl flex items-center justify-center bg-blue-500 shadow-lg shadow-blue-500/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                <SheetIcon className="h-8 w-8 text-white" />
                <span className="absolute bottom-1 right-1 text-sm font-bold bg-white text-blue-600 px-1.5 rounded-sm">x</span>
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-foreground">Excel</p>
                <p className="text-xs text-muted-foreground">Advanced formatting & formulas</p>
              </div>
            </button>
            <button
              onClick={() => onExport('PDF')}
              className="flex flex-col items-center gap-5 p-6 rounded-2xl border-2 border-red-500/10 bg-red-50/50 hover:border-red-500/30 hover:bg-red-50 transition-all group outline-none text-center"
            >
              <div className="relative h-16 w-16 rounded-2xl flex items-center justify-center bg-red-500 shadow-lg shadow-red-500/20 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6">
                <FileText className="h-8 w-8 text-white" />
                 <span className="absolute bottom-1 right-1 text-[8px] font-bold bg-white text-red-600 px-1 rounded-sm">PDF</span>
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-foreground">PDF</p>
                <p className="text-xs text-muted-foreground">Print-ready professional docs</p>
              </div>
            </button>
          </div>
          <div className="pt-6">
            <div className="flex items-center justify-center gap-4 text-xs font-medium text-muted-foreground bg-muted/50 p-3 rounded-lg border">
              <Lock className="h-3.5 w-3.5" />
              <span>Your data is encrypted and secure</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <Clock className="h-3.5 w-3.5" />
              <span>Report Range: {rangeLabel}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function OrderReportPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [filters, setFilters] = useState(initialFilterState);
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    
      const mockOrders = mockDataStore.orders;
      const mockTransactions = generateTransactionsFromOrders(mockOrders);
      setTransactions(mockTransactions);
      setAllOrders(mockOrders);
      setIsLoading(false);
    
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
    setCurrentPage(1);
  };

  const handleBranchesChange = (branchName: string, isChecked: boolean) => {
    setFilters(prev => {
        const newBranches = isChecked 
            ? [...prev.branches, branchName] 
            : prev.branches.filter(b => b !== branchName);
        return { ...prev, branches: newBranches };
    });
    setCurrentPage(1);
  };
  
  const handleSelectAllBranches = (isChecked: boolean) => {
    setFilters(prev => ({
        ...prev,
        branches: isChecked ? mockDataStore.branches.map(b => b.name) : []
    }));
    setCurrentPage(1);
  };

  const resetAllFilters = () => {
    setFilters(initialFilterState);
    setCurrentPage(1);
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
      const matchesBranch = filters.branches.includes(transaction.branch);
      const matchesStatus =
        filters.paymentStatus === 'all' ||
        transaction.paymentStatus === filters.paymentStatus;
      const matchesSource =
        filters.source === 'all' || transaction.source === filters.source;

      return (
        matchesDate &&
        matchesBranch &&
        matchesStatus &&
        matchesSource
      );
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions, filters]);

    const kpiData: StatCardData[] = useMemo(() => {
        const totalOrders = filteredTransactions.length;
        const grossSales = filteredTransactions.reduce((acc, t) => acc + t.totalAmount, 0);
        const paidAmount = filteredTransactions.reduce((acc, t) => acc + t.paidAmount, 0);
        const outstandingAmount = filteredTransactions.reduce((acc, t) => acc + t.outstandingAmount, 0);
        const voidedOrders = filteredTransactions.filter(t => t.paymentStatus === 'Voided').length;

        return [
            { title: 'Total Orders', value: totalOrders.toLocaleString(), changeDescription: 'Processed', icon: ShoppingCart, color: 'orange', tooltipText: 'Total number of orders processed within the selected period.' },
            { title: 'Gross Sales', value: `AED ${grossSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, changeDescription: 'Before Voids', icon: DollarSign, color: 'pink', tooltipText: 'Total sales value from all orders, including unpaid amounts.' },
            { title: 'Paid Amount', value: `AED ${paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, changeDescription: 'Revenue Collected', icon: WalletCards, color: 'green', tooltipText: 'Total revenue successfully collected from customers.' },
            { title: 'Outstanding', value: `AED ${outstandingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, changeDescription: 'Revenue at Risk', icon: AlertTriangle, color: 'orange', tooltipText: 'Total amount from orders that has not yet been paid.' },
            { title: 'Voided Orders', value: voidedOrders.toLocaleString(), changeDescription: 'Non-Revenue', icon: Ban, color: 'red', tooltipText: 'Total number of orders that were voided and resulted in no revenue.' },
        ]
    }, [filteredTransactions]);

  const totalPages = Math.ceil(
    filteredTransactions.length / itemsPerPage
  );
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredTransactions, currentPage]);

  const renderPagination = () => {
    const pageNumbers = [];
    const maxPagesToShow = 3;
    
    if (totalPages <= maxPagesToShow + 2) {
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
    } else {
        pageNumbers.push(1);
        if (currentPage > 3) {
            pageNumbers.push('...');
        }
        
        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 1, currentPage + 1);

        if(currentPage <= 2){
            startPage = 2;
            endPage = 3;
        }
        
        if(currentPage >= totalPages - 1){
            startPage = totalPages - 2;
            endPage = totalPages - 1;
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        
        if (currentPage < totalPages - 2) {
            pageNumbers.push('...');
        }
        pageNumbers.push(totalPages);
    }
    
    return (
        <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {pageNumbers.map((page, index) =>
              typeof page === 'number' ? (
                <Button
                  key={index}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </Button>
              ) : (
                <span key={index} className="px-2 h-8 flex items-center justify-center">...</span>
              )
            )}
             <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
        </div>
    );
};


  if (isLoading) {
    return <OrdersPageSkeleton view="list" />;
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Order Report</h1>
            <p className="text-muted-foreground">
              A financial breakdown of orders, items, and payer information.
            </p>
          </div>
          <Button variant="outline" onClick={() => setIsExportDialogOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-end gap-4 rounded-lg border bg-card p-3 shadow-sm">
            <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground px-1">OUTLET</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="truncate">
                        {filters.branches.length === mockDataStore.branches.length
                          ? 'All Branches'
                          : filters.branches.length === 0
                          ? 'Select Branch'
                          : filters.branches.length === 1
                          ? filters.branches[0]
                          : `${filters.branches.length} branches selected`}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[220px]">
                    <DropdownMenuCheckboxItem
                      checked={filters.branches.length === mockDataStore.branches.length}
                      onCheckedChange={handleSelectAllBranches}
                    >
                      All Branches
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    {mockDataStore.branches.map((branch) => (
                      <DropdownMenuCheckboxItem
                        key={branch.id}
                        checked={filters.branches.includes(branch.name)}
                        onCheckedChange={(checked) => handleBranchesChange(branch.name, !!checked)}
                      >
                        {branch.name}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
            
            <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground px-1">PAYMENT STATUS</Label>
                <Select
                    value={filters.paymentStatus}
                    onValueChange={(value) => handleFilterChange('paymentStatus', value)}
                >
                    <SelectTrigger className="w-full">
                    <SelectValue placeholder="Payment Status" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Partial">Partially Paid</SelectItem>
                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                    <SelectItem value="Refunded">Refunded</SelectItem>
                    <SelectItem value="Voided">Voided</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground px-1">SOURCE</Label>
                <Select
                    value={filters.source}
                    onValueChange={(value) => handleFilterChange('source', value)}
                >
                    <SelectTrigger className="w-full">
                    <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="App to App">App to App</SelectItem>
                    <SelectItem value="POS">POS</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground px-1">REPORT PERIOD</Label>
                <DateRangePicker
                dateRange={filters.dateRange}
                onDateRangeChange={(range) => handleFilterChange('dateRange', range)}
                />
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={resetAllFilters}
                className="lg:col-start-5 lg:justify-self-end"
                title="Refresh"
            >
                <RotateCcw className="h-4 w-4" />
                <span className="sr-only">Refresh</span>
            </Button>
        </div>

        <StatCards cards={kpiData} />

          <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Transactions Summary</CardTitle>
                        <CardDescription>
                            Order → Item → Payer financial breakdown.
                        </CardDescription>
                    </div>
                    <Badge variant="outline">{filteredTransactions.length} Entries</Badge>
                </div>
            </CardHeader>
            <CardContent>
              <div className="relative w-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Paid Amount</TableHead>
                      <TableHead>Outstanding</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Payers</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.map((t) => (
                      <TableRow key={t.id} onClick={() => handleViewDetails(t)} className="cursor-pointer">
                          <TableCell className="font-medium">{t.orderId}</TableCell>
                          <TableCell>{new Date(t.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</TableCell>
                          <TableCell className="font-semibold">AED {t.totalAmount.toFixed(2)}</TableCell>
                          <TableCell className="font-semibold text-green-600">AED {t.paidAmount.toFixed(2)}</TableCell>
                          <TableCell className="font-semibold text-red-600">AED {t.outstandingAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                t.paymentStatus === 'Paid' ? 'default' : 
                                t.paymentStatus === 'Partial' ? 'secondary' : 
                                'destructive'
                              }
                              className={cn(
                                'capitalize font-bold',
                                t.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                                t.paymentStatus === 'Partial' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              )}
                            >
                              {t.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>{t.paymentMethod}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                                {t.source === 'POS' ? <Laptop className="h-4 w-4 text-muted-foreground" /> : <Smartphone className="h-4 w-4 text-muted-foreground" />}
                                {t.source}
                            </div>
                          </TableCell>
                          <TableCell>{t.payers}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
               {paginatedTransactions.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No transactions found for the selected filters.
                </p>
              )}
            </CardContent>
            {totalPages > 1 && (
                <CardFooter className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                        Showing{' '}
                        <strong>
                        {filteredTransactions.length > 0
                            ? (currentPage - 1) * itemsPerPage + 1
                            : 0}
                        </strong>{' '}
                        to{' '}
                        <strong>
                        {Math.min(
                            currentPage * itemsPerPage,
                            filteredTransactions.length
                        )}
                        </strong>{' '}
                        of <strong>{filteredTransactions.length}</strong>{' '}
                        transactions
                    </div>
                    {renderPagination()}
                </CardFooter>
            )}
          </Card>
      </main>
      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        onExport={handleExport}
        dateRange={filters.dateRange}
      />
      <OrderDetailsSheet 
        order={selectedOrder}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </>
  );
}
