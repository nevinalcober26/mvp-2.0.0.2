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
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { DashboardHeader } from '@/components/dashboard/header';
import { cn } from '@/lib/utils';
import { OrdersPageSkeleton } from '@/components/dashboard/skeletons';
import {
  isWithinInterval,
  subDays,
  endOfDay,
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
          <DialogTitle>Export Report</DialogTitle>
          <DialogDescription>
            Select a file format to download the current report view.
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

    if (filters.sortBy === 'top_earners_amount') {
      tips.sort((a, b) => (b.tipAmount || 0) - (a.tipAmount || 0));
    } else if (filters.sortBy === 'top_earners_percent') {
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

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border bg-card p-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-muted-foreground">OUTLET</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-[220px] justify-between">
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
            <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-muted-foreground">STAFF MEMBERS</p>
                <Select
                    value={filters.staffName}
                    onValueChange={(value) => handleFilterChange('staffName', value)}
                >
                    <SelectTrigger className="w-full sm:w-[180px]">
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
            <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-muted-foreground">SORT BY</p>
                <Select
                    value={filters.sortBy}
                    onValueChange={(value) => handleFilterChange('sortBy', value)}
                >
                    <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Default (Date)</SelectItem>
                        <SelectItem value="top_earners_amount">Top Earners (Amount)</SelectItem>
                        <SelectItem value="top_earners_percent">Highest Tip %</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-muted-foreground">REPORT PERIOD</p>
                <DateRangePicker
                  dateRange={filters.dateRange}
                  onDateRangeChange={(range) => handleFilterChange('dateRange', range)}
                />
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={resetAllFilters} className="self-end">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <StatCards cards={tipsKpiCards} />

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
      />
      <OrderDetailsSheet 
        order={selectedOrder}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </>
  );
}
