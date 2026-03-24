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
  Filter,
  RotateCcw,
  Users,
  GitFork,
  CheckCircle2,
  TrendingUp,
  Clock,
  Info,
  ChevronLeft,
  ChevronRight,
  Package,
  ChevronDown,
  X,
  Lock,
  File as FileIcon,
  FileText,
  Sheet as SheetIcon,
} from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/header';
import { cn } from '@/lib/utils';
import { OrdersPageSkeleton } from '@/components/dashboard/skeletons';
import { isWithinInterval, subDays, endOfDay, isSameDay, format } from 'date-fns';
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
import {
  TooltipProvider,
  Tooltip as UiTooltip,
  TooltipContent as UiTooltipContent,
  TooltipTrigger as UiTooltipTrigger,
} from '@/components/ui/tooltip';
import { StatCards, type StatCardData } from '@/components/dashboard/stat-cards';
import { Label } from '@/components/ui/label';

type SplitSettlementLog = {
  orderId: string;
  totalBill: number;
  splits: number;
  splitMethod?: 'Item-based' | 'Equal';
  payerBreakdown: number[];
  settlementTime: string;
  timestamp: number;
  branch: string;
};

const generateSettlementLogs = (orders: Order[]): SplitSettlementLog[] => {
  return orders
    .filter((order) => order.splitType)
    .map((order) => {
      const settlementMinutes = Math.floor(Math.random() * 20) + 1;
      const settlementSeconds = Math.floor(Math.random() * 60);

      return {
        orderId: order.orderId,
        totalBill: order.totalAmount,
        splits: order.payments.length,
        splitMethod: order.splitType === 'equally' ? 'Equal' : 'Item-based',
        payerBreakdown: order.payments.map((p) => parseFloat(p.amount)),
        settlementTime: `${settlementMinutes}m ${settlementSeconds}s`,
        timestamp: order.orderTimestamp,
        branch: order.branch,
      };
    });
};

const initialFilterState = {
  dateRange: {
    from: subDays(new Date(), 29),
    to: new Date(),
  } as DateRange | undefined,
  branches: ["Bloomsbury's - Ras Al Khaimah"],
  splitMethod: 'all',
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


export default function SplitBillsReportPage() {
  const [settlementLogs, setSettlementLogs] = useState<SplitSettlementLog[]>(
    []
  );
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState(initialFilterState);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    
      const mockOrders = mockDataStore.orders;
      const logs = generateSettlementLogs(mockOrders);
      setSettlementLogs(logs);
      setAllOrders(mockOrders);
      setIsLoading(false);
    
  }, []);

  const handleViewDetails = (log: SplitSettlementLog) => {
    const order = allOrders.find((o) => o.orderId === log.orderId);
    if (order) {
      setSelectedOrder(order);
      setIsSheetOpen(true);
    } else {
      toast({
        variant: 'destructive',
        title: 'Order not found',
        description: `Details for order ${log.orderId} are not available.`,
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

  const filteredLogs = useMemo(() => {
    return settlementLogs.filter((log) => {
      const logDate = new Date(log.timestamp);
      const matchesDate =
        filters.dateRange?.from && filters.dateRange?.to
          ? isWithinInterval(logDate, {
              start: filters.dateRange.from,
              end: endOfDay(filters.dateRange.to),
            })
          : true;
      const matchesBranch = filters.branches.length > 0 ? filters.branches.includes(log.branch) : true;
      const matchesSplitMethod =
        filters.splitMethod === 'all' || log.splitMethod === filters.splitMethod;

      return matchesDate && matchesBranch && matchesSplitMethod;
    });
  }, [settlementLogs, filters]);
  
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage]);

  const kpiCards: StatCardData[] = useMemo(() => {
    const totalSplits = filteredLogs.length;
    const totalPayers = filteredLogs.reduce((acc, log) => acc + log.splits, 0);
    const avgPayers = totalSplits > 0 ? (totalPayers / totalSplits).toFixed(1) : '0.0';
    // Dummy data for completion and settlement
    const completionRate = '100.0%';
    const avgSettlement = '12m 14s';

    return [
      {
        title: 'Split Orders',
        value: totalSplits.toString(),
        icon: CheckCircle2,
        color: 'green',
        tooltipText: 'Total number of orders where the bill was split.'
      },
      {
        title: 'Avg. Payers',
        value: avgPayers,
        icon: GitFork,
        color: 'blue',
        tooltipText: 'The average number of people per split transaction.'
      },
      {
        title: 'Completion Rate',
        value: completionRate,
        icon: TrendingUp,
        color: 'teal',
        tooltipText: 'Percentage of split bills that were successfully paid in full.'
      },
      {
        title: 'Avg. Settlement',
        value: avgSettlement,
        icon: Clock,
        color: 'orange',
        tooltipText: 'The average time taken from initiating a split to full payment.'
      }
    ];
  }, [filteredLogs]);


  if (isLoading) {
    return <OrdersPageSkeleton view="list" />;
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Split Bill Report</h1>
            <p className="text-muted-foreground">
              Audit trail for shared payments, division methods, and group
              behavior.
            </p>
          </div>
          <Button variant="outline" onClick={() => setIsExportDialogOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        <StatCards cards={kpiCards} />

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
              <Label className="text-xs font-semibold text-muted-foreground px-1">SPLIT METHODS</Label>
              <Select
                value={filters.splitMethod}
                onValueChange={(value) => handleFilterChange('splitMethod', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Split Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="Equal">Equal</SelectItem>
                  <SelectItem value="Item-based">Item-based</SelectItem>
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
            className="lg:justify-self-end"
            title="Refresh Filters"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>

        

        <Card>
          <CardHeader>
            <CardTitle>Split Settlement Logs</CardTitle>
            <CardDescription>
              Detailed overview of division methods and individual payer
              status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <TooltipProvider>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Total Bill</TableHead>
                      <TableHead>Splits</TableHead>
                      <TableHead>Split Method</TableHead>
                      <TableHead>Payer Breakdown</TableHead>
                      <TableHead className="text-right">Settlement Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLogs.map((log) => (
                      <TableRow
                        key={log.orderId}
                        className="cursor-pointer"
                        onClick={() => handleViewDetails(log)}
                      >
                        <TableCell className="font-medium">{log.orderId}</TableCell>
                        <TableCell>AED {log.totalBill.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.splits} Ways</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {log.splitMethod === 'Equal' ? <Users className="h-4 w-4 text-muted-foreground" /> : <Package className="h-4 w-4 text-muted-foreground" />}
                            <span>{log.splitMethod}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.payerBreakdown.length > 2 ? (
                            <UiTooltip>
                              <UiTooltipTrigger asChild>
                                <div className="flex flex-wrap items-center gap-1 cursor-pointer">
                                  {log.payerBreakdown.slice(0, 2).map((amount, i) => (
                                    <Badge
                                      key={i}
                                      className="bg-green-100 text-green-700"
                                    >
                                      AED {amount.toFixed(2)}
                                    </Badge>
                                  ))}
                                  <Badge variant="secondary" className="font-bold">+{log.payerBreakdown.length - 2} more</Badge>
                                </div>
                              </UiTooltipTrigger>
                              <UiTooltipContent className="p-0 border-0 shadow-xl">
                                <Card className="border-0">
                                  <CardHeader className="p-4 bg-muted rounded-t-lg">
                                    <CardTitle className="text-sm">Full Breakdown</CardTitle>
                                  </CardHeader>
                                  <CardContent className="p-4">
                                      <ul className="space-y-2">
                                        {log.payerBreakdown.map((amount, i) => (
                                          <li key={i} className="flex justify-between items-center text-xs gap-4">
                                            <span className="text-muted-foreground font-medium">Payer {i + 1}</span>
                                            <span className="font-mono font-semibold">AED {amount.toFixed(2)}</span>
                                          </li>
                                        ))}
                                      </ul>
                                  </CardContent>
                                </Card>
                              </UiTooltipContent>
                            </UiTooltip>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {log.payerBreakdown.map((amount, i) => (
                                <Badge
                                  key={i}
                                  className="bg-green-100 text-green-700"
                                >
                                  AED {amount.toFixed(2)}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="font-semibold">{log.settlementTime}</p>
                          <p className="text-xs text-muted-foreground">Settled</p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TooltipProvider>
              {paginatedLogs.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                  No split bills found for the selected filters.
                </div>
              )}
            </div>
          </CardContent>
            {totalPages > 1 && (
                <CardFooter className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                        Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</strong> of <strong>{filteredLogs.length}</strong> orders
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                        {[...Array(totalPages)].map((_, i) => (
                            <Button key={i} variant={currentPage === i + 1 ? 'default' : 'outline'} size="sm" className="h-8 w-8 p-0" onClick={() => setCurrentPage(i + 1)}>{i + 1}</Button>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
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
