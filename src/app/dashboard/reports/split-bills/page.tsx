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
} from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/header';
import { cn } from '@/lib/utils';
import { OrdersPageSkeleton } from '@/components/dashboard/skeletons';
import { isWithinInterval, subDays, endOfDay } from 'date-fns';
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
import {
  TooltipProvider,
  Tooltip as UiTooltip,
  TooltipContent as UiTooltipContent,
  TooltipTrigger as UiTooltipTrigger,
} from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { StatCards, type StatCardData } from '@/components/dashboard/stat-cards';

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
        splitMethod: order.splitType,
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
  branch: 'all',
  splitMethod: 'all',
};

export default function SplitBillsReportPage() {
  const [settlementLogs, setSettlementLogs] = useState<SplitSettlementLog[]>(
    []
  );
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilterState);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const mockOrders = mockDataStore.orders;
      const logs = generateSettlementLogs(mockOrders);
      setSettlementLogs(logs);
      setAllOrders(mockOrders);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
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

  const handleFilterChange = (
    filterName: string,
    value: string | DateRange | undefined
  ) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
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
      const matchesBranch =
        filters.branch === 'all' || log.branch === filters.branch;
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
          <Button variant="outline" disabled>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border bg-card p-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground px-1">OUTLET</Label>
              <Select
                value={filters.branch}
                onValueChange={(value) => handleFilterChange('branch', value)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Branch/Venue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="Ras Al Khaimah">Ras Al Khaimah</SelectItem>
                  <SelectItem value="Dubai Mall">Dubai Mall</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground px-1">SPLIT METHODS</Label>
              <Select
                value={filters.splitMethod}
                onValueChange={(value) => handleFilterChange('splitMethod', value)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
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
              <Label className="text-xs text-muted-foreground px-1">REPORT PERIOD</Label>
              <DateRangePicker
                dateRange={filters.dateRange}
                onDateRangeChange={(range) => handleFilterChange('dateRange', range)}
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={resetAllFilters}
            className="self-end"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <StatCards cards={kpiCards} />

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
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="font-semibold">{log.settlementTime}</p>
                        <p className="text-xs text-muted-foreground">Settled</p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
      <OrderDetailsSheet
        order={selectedOrder}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </>
  );
}
