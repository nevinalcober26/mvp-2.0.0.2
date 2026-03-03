
'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Download,
  RotateCcw,
  File as FileIcon,
  FileText,
  Sheet as SheetIcon,
  HandCoins,
  WalletCards,
  CirclePercent,
  TrendingUp,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Lock,
  Clock,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { type DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/dashboard/reports/date-range-picker';
import type { Order } from '@/app/dashboard/orders/types';
import { mockDataStore } from '@/lib/mock-data-store';
import { OrderDetailsSheet } from '@/app/dashboard/orders/order-details-sheet';
import { StatCards, type StatCardData } from '@/components/dashboard/stat-cards';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


type Transaction = {
  id: string;
  orderId: string;
  timestamp: number;
  totalAmount: number;
  paidAmount: number;
  paymentMethod: string;
  branch: string;
  staffName: string;
  tipAmount?: number;
  tipType?: 'Preset' | 'Custom';
};

const generateTransactionsFromOrders = (orders: Order[]): Transaction[] => {
    return orders.flatMap(order => {
        if (!order.payments || order.payments.length === 0) return [];
        
        return order.payments.map((p, index) => {
            const tipType = p.tip ? (Math.random() > 0.4 ? 'Preset' : 'Custom') : undefined;
            return {
                id: `txn_${order.orderId.replace('#', '')}_${index}`,
                orderId: order.orderId,
                timestamp: order.orderTimestamp,
                totalAmount: order.totalAmount,
                paidAmount: parseFloat(p.amount),
                paymentMethod: p.method,
                branch: order.branch,
                staffName: order.staffName,
                tipAmount: p.tip,
                tipType: tipType,
            };
        });
    });
};

const initialFilterState = {
  dateRange: {
    from: subDays(new Date(), 29),
    to: new Date(),
  } as DateRange | undefined,
  branches: ["Bloomsbury's - Ras Al Khaimah"],
  staffName: 'all',
  sortBy: 'all',
};

const avatarColors = [
  'bg-blue-100 text-blue-600',
  'bg-purple-100 text-purple-600',
  'bg-pink-100 text-pink-600',
  'bg-orange-100 text-orange-600',
  'bg-teal-100 text-teal-600',
  'bg-green-100 text-green-600',
  'bg-yellow-100 text-yellow-600'
];

const getAvatarColorClass = (name: string) => {
  const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarColors[charCodeSum % avatarColors.length];
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

export default function TipsAndGratuityReportPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilterState);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
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
  }, []);
  
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
      description: `Your report is being prepared for a ${format} download.`,
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
      const matchesStaffName =
        filters.staffName === 'all' || transaction.staffName === filters.staffName;

      return matchesDate && matchesBranch && matchesStaffName;
    });
  }, [transactions, filters]);

  const tipTransactions = useMemo(() => {
    let tips = filteredTransactions.filter(t => t.tipAmount && t.tipAmount > 0);

    if (filters.sortBy === 'highest_revenue') {
        tips.sort((a, b) => b.totalAmount - a.totalAmount);
    } else if (filters.sortBy === 'highest_tip_percent') {
      tips.sort((a, b) => {
        const percentA = a.totalAmount > 0 ? (a.tipAmount || 0) / a.totalAmount : 0;
        const percentB = b.totalAmount > 0 ? (b.tipAmount || 0) / b.totalAmount : 0;
        return percentB - percentA;
      });
    } else {
      // Default sort by timestamp
      tips.sort((a, b) => b.timestamp - a.timestamp);
    }
    return tips;
  }, [filteredTransactions, filters.sortBy]);

  const staffNames = useMemo(() => {
    return [...new Set(transactions.map((t) => t.staffName))].sort();
  }, [transactions]);
  
  const totalPages = Math.ceil(tipTransactions.length / itemsPerPage);
  
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return tipTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [tipTransactions, currentPage]);

  const tipsKpiCards: StatCardData[] = useMemo(() => {
    const grossTips = tipTransactions.reduce((acc, t) => acc + (t.tipAmount || 0), 0);
    const netTips = grossTips * 0.97; // Assuming 3% fee
    const totalBillForTipped = tipTransactions.reduce((acc, t) => acc + t.totalAmount, 0);
    const avgTipPercentage = totalBillForTipped > 0 ? (grossTips / totalBillForTipped) * 100 : 0;
    const presetTips = tipTransactions.filter(t => t.tipType === 'Preset').length;
    const presetAdoption = tipTransactions.length > 0 ? (presetTips / tipTransactions.length) * 100 : 0;
    const activeWaiters = new Set(tipTransactions.map(t => t.staffName)).size;

    return [
      { title: 'Gross Tips', value: `AED ${grossTips.toFixed(3)}`, icon: HandCoins, color: 'green', changeDescription: 'Total Collected', tooltipText: 'Total gross tips collected before any fees.' },
      { title: 'Net Tips', value: `AED ${netTips.toFixed(3)}`, icon: WalletCards, color: 'blue', changeDescription: 'After 3% Fees', tooltipText: 'Net tips after processing fees.' },
      { title: 'Average Tip %', value: `${avgTipPercentage.toFixed(1)}%`, icon: TrendingUp, color: 'green', changeDescription: 'of Bill Total', tooltipText: 'Average tip amount as a percentage of the total bill.' },
      { title: 'Preset Adoption', value: `${presetAdoption.toFixed(1)}%`, icon: CirclePercent, color: 'red', changeDescription: 'vs Custom Tips', tooltipText: 'Percentage of tips made using preset amounts.' },
      { title: 'Staff Context', value: activeWaiters.toString(), icon: Users, color: 'orange', changeDescription: 'Active Waiters', tooltipText: 'Number of unique staff members who received tips.' },
    ];
  }, [tipTransactions]);

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
        } else if (currentPage >= totalPages - 2) {
            startPage = totalPages - 3;
            endPage = totalPages - 2;
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
            <h1 className="text-2xl font-bold">Tips & Gratuity Report</h1>
            <p className="text-muted-foreground">
              Analyze gratuity patterns, staff performance, and net earnings.
            </p>
          </div>
          <Button variant="outline" onClick={() => setIsExportDialogOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        <StatCards cards={tipsKpiCards} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 items-end gap-4 rounded-lg border bg-card p-3 shadow-sm">
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
                <Label className="text-xs font-semibold text-muted-foreground px-1">STAFF MEMBERS</Label>
                <Select
                    value={filters.staffName}
                    onValueChange={(value) => handleFilterChange('staffName', value)}
                >
                    <SelectTrigger className="w-full">
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
            <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground px-1">Ranked by</Label>
                <Select
                    value={filters.sortBy}
                    onValueChange={(value) => handleFilterChange('sortBy', value)}
                >
                    <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Most recent activity</SelectItem>
                        <SelectItem value="highest_revenue">Highest revenue</SelectItem>
                        <SelectItem value="highest_tip_percent">Highest tip %</SelectItem>
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
            size="sm"
            onClick={resetAllFilters}
            className="lg:justify-self-end"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Tip Transaction Log</CardTitle>
                <CardDescription>
                Detailed overview of gratuities per order and payer.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Order Total</TableHead>
                    <TableHead className="text-right">Tip Amount</TableHead>
                    <TableHead className="text-right">Tip %</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedTransactions.map((t) => (
                    <TableRow key={t.id} onClick={() => handleViewDetails(t)} className="cursor-pointer">
                        <TableCell className="font-medium">{t.orderId}</TableCell>
                        <TableCell>{new Date(t.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarFallback className={cn("text-xs font-bold", getAvatarColorClass(t.staffName))}>
                                        {t.staffName.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <span>{t.staffName}</span>
                            </div>
                        </TableCell>
                        <TableCell>{t.paymentMethod}</TableCell>
                        <TableCell>
                            <Badge variant={t.tipType === 'Custom' ? 'secondary' : 'default'} className={cn(t.tipType === 'Custom' && 'bg-blue-100 text-blue-700', t.tipType === 'Preset' && 'bg-green-100 text-green-700')}>
                                {t.tipType}
                            </Badge>
                        </TableCell>
                        <TableCell>AED {t.totalAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-semibold text-foreground">AED {t.tipAmount?.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-semibold text-primary">{((t.tipAmount! / t.totalAmount) * 100).toFixed(1)}%</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
                {paginatedTransactions.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                    No tip transactions found for the selected filters.
                </p>
                )}
            </CardContent>
            {totalPages > 1 && (
                <CardFooter className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                        Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, tipTransactions.length)}</strong> of <strong>{tipTransactions.length}</strong> transactions
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
