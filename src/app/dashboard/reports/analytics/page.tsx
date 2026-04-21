'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { DashboardHeader } from "@/components/dashboard/header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  BarChart as RechartsBarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Info,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  WalletCards,
  HandCoins,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { type StatCardData, StatCards } from '@/components/dashboard/stat-cards';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  subDays,
  startOfDay,
  endOfDay,
  isWithinInterval,
  format,
  addDays,
} from 'date-fns';

import type { Order } from '@/app/dashboard/orders/types';
import { mockOrders, mockBranches } from '@/lib/mock-data-store';
import { OrdersPageSkeleton } from '@/components/dashboard/skeletons';
import { useToast } from '@/hooks/use-toast';

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
  branch: 'Ras Al Khaimah' | 'Dubai Mall' | string;
  table: string;
  splitMethod?: 'Equal' | 'Item-based' | 'Custom';
  lastPaymentAttempt: number;
  closeType: 'Auto' | 'Manual';
  staffName: string;
  tipAmount?: number;
  tipType?: 'Preset' | 'Custom';
  serviceChargeAmount?: number;
};

const generateTransactionsFromOrders = (orders: Order[]): Transaction[] => {
    return orders.map(order => {
        const paymentStatusMap = {
            'Fully Paid': 'Paid',
            'Partial': 'Partial',
            'Unpaid': 'Unpaid',
            'Voided': 'Unpaid',
            'Returned': 'Refunded',
        };

        const tipAmount = order.payments.reduce((acc, p) => acc + (p.tip || 0), 0);

        return {
            id: `txn_${order.orderId.replace('#', '')}`,
            orderId: order.orderId,
            timestamp: order.orderTimestamp,
            totalAmount: order.totalAmount,
            paidAmount: order.paidAmount,
            outstandingAmount: order.totalAmount - order.paidAmount,
            paymentStatus: paymentStatusMap[order.paymentState] as Transaction['paymentStatus'] || 'Unpaid',
            paymentMethod: order.payments[0]?.method || 'Credit Card',
            payers: order.payments.length > 0 ? order.payments.length : 1,
            branch: order.branch,
            table: order.table,
            splitMethod: order.splitType === 'equally' ? 'Equal' : order.splitType === 'byItem' ? 'Item-based' : undefined,
            lastPaymentAttempt: order.orderTimestamp + Math.random() * 3600000,
            closeType: Math.random() > 0.5 ? 'Auto' : 'Manual',
            staffName: order.staffName,
            tipAmount: tipAmount > 0 ? tipAmount : undefined,
            tipType: 'Custom',
            serviceChargeAmount: Math.random() > 0.5 ? order.totalAmount * 0.1 : undefined,
        };
    });
};

const paymentPulseConfig = {
  Paid: { label: 'Paid' },
  Partial: { label: 'Partial' },
  Pending: { label: 'Pending' },
  Failed: { label: 'Failed' },
};
const volumeConfig = { 
  volume: { label: 'Volume' },
  prevVolume: { label: 'Previous Period' },
};
const revenueConfig = { 
  revenue: { label: 'Revenue' },
  prevRevenue: { label: 'Previous Period' }
};
const osConfig = {
  iOS: { label: 'iOS' },
  Android: { label: 'Android' },
  macOS: { label: 'macOS' },
  Windows: { label: 'Windows' },
};
const webEntryConfig = {
  Safari: { label: 'Safari' },
  Chrome: { label: 'Chrome' },
  Firefox: { label: 'Firefox' },
  Edge: { label: 'Edge' },
};

function getAdjustedTransactions(orders: Order[]): Transaction[] {
  const now = new Date();
  if (orders.length === 0) return [];
  
  const latestTimestampInMock = Math.max(...orders.map(o => o.orderTimestamp));
  const timeDiff = now.getTime() - latestTimestampInMock;
  
  const freshOrders = orders.map(order => ({
    ...order,
    orderTimestamp: order.orderTimestamp + timeDiff,
  }));

  return generateTransactionsFromOrders(freshOrders);
}

const createSeededRandom = (seed: number) => () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
};

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [branchFilter, setBranchFilter] = useState("Bloomsbury's - Ras Al Khaimah");
  const [isComparing, setIsComparing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const mockTransactions = getAdjustedTransactions(mockOrders);
    setTransactions(mockTransactions);
    setIsLoading(false);
  }, []);
  
  const { filteredTransactions, previousPeriodFilteredTransactions } = useMemo(() => {
    const now = new Date();
    let daysToSubtract = 7;
    if (timeRange === '30d') daysToSubtract = 30;
    if (timeRange === '90d') daysToSubtract = 90;

    const currentEndDate = endOfDay(now);
    const currentStartDate = startOfDay(subDays(now, daysToSubtract - 1));
    const currentInterval = { start: currentStartDate, end: currentEndDate };
    
    const filterFn = (t: Transaction) => {
        const matchesBranch = branchFilter === 'all' || t.branch === branchFilter;
        return matchesBranch;
    }

    const currentPeriodTxns = transactions.filter(t => {
      const transactionDate = new Date(t.timestamp);
      return isWithinInterval(transactionDate, currentInterval) && filterFn(t);
    });

    let previousPeriodTxns: Transaction[] = [];
    if (isComparing) {
        const previousEndDate = endOfDay(subDays(now, daysToSubtract));
        const previousStartDate = startOfDay(subDays(now, daysToSubtract * 2 - 1));
        const previousInterval = { start: previousStartDate, end: previousEndDate };
        
        previousPeriodTxns = transactions.filter(t => {
          const transactionDate = new Date(t.timestamp);
          return isWithinInterval(transactionDate, previousInterval) && filterFn(t);
        });
    }

    return { filteredTransactions: currentPeriodTxns, previousPeriodFilteredTransactions: previousPeriodTxns };
}, [transactions, timeRange, branchFilter, isComparing]);

  const kpiData: StatCardData[] = useMemo(() => {
    const calculateMetrics = (txns: Transaction[]) => {
        const totalOrders = txns.length;
        const totalRevenue = txns.reduce((acc, t) => acc + t.totalAmount, 0);
        const pendingAmount = txns.reduce((acc, t) => acc + t.outstandingAmount, 0);
        const billPaid = txns.reduce((acc, t) => acc + t.paidAmount, 0);
        const tipsCollected = txns.reduce((acc, t) => acc + (t.tipAmount || 0), 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        return { totalOrders, totalRevenue, pendingAmount, billPaid, tipsCollected, avgOrderValue };
    };

    const currentMetrics = calculateMetrics(filteredTransactions);
    
    if (isComparing) {
      const previousMetrics = calculateMetrics(previousPeriodFilteredTransactions);
      
      const calculateChange = (current: number, previous: number) => {
          if (previous === 0) return current > 0 ? '+100%' : '+0.0%';
          const percentageChange = ((current - previous) / previous) * 100;
          return `${percentageChange >= 0 ? '+' : ''}${percentageChange.toFixed(1)}%`;
      };
      
      const periodLabel = `vs. previous ${timeRange.replace('d', '')} days`;

      return [
        { title: 'Total Orders', value: currentMetrics.totalOrders.toLocaleString(), icon: ShoppingCart, color: 'teal', change: calculateChange(currentMetrics.totalOrders, previousMetrics.totalOrders), changeDescription: periodLabel, tooltipText: "Total number of orders placed." },
        { title: 'Average Order Value', value: `AED ${currentMetrics.avgOrderValue.toFixed(2)}`, icon: DollarSign, color: 'orange', change: calculateChange(currentMetrics.avgOrderValue, previousMetrics.avgOrderValue), changeDescription: periodLabel, tooltipText: "Average amount spent per order." },
        { title: 'Pending Amount', value: `AED ${currentMetrics.pendingAmount.toFixed(2)}`, icon: AlertTriangle, color: 'pink', change: calculateChange(currentMetrics.pendingAmount, previousMetrics.pendingAmount), changeDescription: periodLabel, tooltipText: "Total amount from orders that are not fully paid." },
        { title: 'Bill Paid', value: `AED ${currentMetrics.billPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: WalletCards, color: 'green', change: calculateChange(currentMetrics.billPaid, previousMetrics.billPaid), changeDescription: periodLabel, tooltipText: "Total amount collected from customers." },
        { title: 'Tips Collected', value: `AED ${currentMetrics.tipsCollected.toFixed(2)}`, icon: HandCoins, color: 'purple', change: calculateChange(currentMetrics.tipsCollected, previousMetrics.tipsCollected), changeDescription: periodLabel, tooltipText: "Total tips collected from customers." },
      ];
    }

    return [
        { title: 'Total Orders', value: currentMetrics.totalOrders.toLocaleString(), icon: ShoppingCart, color: 'teal', changeDescription: `Last ${timeRange.replace('d', '')} days`, tooltipText: "Total number of orders placed." },
        { title: 'Average Order Value', value: `AED ${currentMetrics.avgOrderValue.toFixed(2)}`, icon: DollarSign, color: 'orange', changeDescription: `Last ${timeRange.replace('d', '')} days`, tooltipText: "Average amount spent per order." },
        { title: 'Pending Amount', value: `AED ${currentMetrics.pendingAmount.toFixed(2)}`, icon: AlertTriangle, color: 'pink', changeDescription: 'from open orders', tooltipText: "Total amount from orders that are not fully paid." },
        { title: 'Bill Paid', value: `AED ${currentMetrics.billPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: WalletCards, color: 'green', changeDescription: `Last ${timeRange.replace('d', '')} days`, tooltipText: "Total amount collected from customers." },
        { title: 'Tips Collected', value: `AED ${currentMetrics.tipsCollected.toFixed(2)}`, icon: HandCoins, color: 'purple', changeDescription: `Last ${timeRange.replace('d', '')} days`, tooltipText: "Total tips collected from customers." },
    ];
  }, [filteredTransactions, previousPeriodFilteredTransactions, timeRange, isComparing]);
  
  const { paymentPulseData, successRate, volumeAndRevenueData, totalVolume, totalGrossRevenue, osDistributionData, webEntryData } = useMemo(() => {
    const pulseData: Record<string, number> = { 'Paid': 0, 'Partial': 0, 'Pending': 0, 'Failed': 0 };
    filteredTransactions.forEach(t => {
      let status: string = t.paymentStatus;
      if (status === 'Unpaid') status = 'Pending';
      if (status === 'Refunded') status = 'Failed';
      if(status in pulseData) pulseData[status]++;
    });
    
    const finalPulseData = [
      { name: 'Paid', value: pulseData['Paid'], color: '#14b8a6' },
      { name: 'Partial', value: pulseData['Partial'], color: '#f59e0b' },
      { name: 'Pending', value: pulseData['Pending'], color: '#f97316' },
      { name: 'Failed', value: pulseData['Failed'], color: '#ef4444' },
    ];
    
    const totalPayments = finalPulseData.reduce((acc, item) => acc + item.value, 0);
    const successRateNum = totalPayments > 0 ? ((pulseData['Paid'] / totalPayments) * 100) : 0;
    const finalSuccessRate = successRateNum.toFixed(0);

    let dataMap: { [key: string]: { volume: number; revenue: number; prevVolume: number; prevRevenue: number } } = {};
    const now = new Date();
    let days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = startOfDay(subDays(now, days - 1));
    
    const formatLabel = timeRange === '7d' ? (d: Date) => format(d, 'eee') : (d: Date) => format(d, 'd');

    const processTransactions = (txns: Transaction[], period: 'current' | 'previous') => {
        txns.forEach(t => {
            const transactionDate = new Date(t.timestamp);
            const keyDate = period === 'previous' ? addDays(transactionDate, days) : transactionDate;
            const dateKey = format(keyDate, 'yyyy-MM-dd');
            if (!(dateKey in dataMap)) {
                dataMap[dateKey] = { volume: 0, revenue: 0, prevVolume: 0, prevRevenue: 0 };
            }
            if (period === 'current') {
                dataMap[dateKey].volume++;
                dataMap[dateKey].revenue += t.totalAmount;
            } else {
                dataMap[dateKey].prevVolume++;
                dataMap[dateKey].prevRevenue += t.totalAmount;
            }
        });
    };

    for (let i = 0; i < days; i++) {
        const date = addDays(startDate, i);
        dataMap[format(date, 'yyyy-MM-dd')] = { volume: 0, revenue: 0, prevVolume: 0, prevRevenue: 0 };
    }

    processTransactions(filteredTransactions, 'current');
    if (isComparing) {
        processTransactions(previousPeriodFilteredTransactions, 'previous');
    }
    
    const sortedData = Object.entries(dataMap)
        .map(([dateStr, data]) => ({ date: new Date(dateStr), ...data }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    const finalVolumeAndRevenueData = sortedData.map((d) => ({
        name: formatLabel(d.date),
        volume: d.volume,
        prevVolume: d.prevVolume,
        revenue: d.revenue,
        prevRevenue: d.prevRevenue,
    }));

    const totalVol = filteredTransactions.length;
    const totalGrossRev = filteredTransactions.reduce((sum, item) => sum + item.totalAmount, 0);

    const seed = filteredTransactions.length + timeRange.length + branchFilter.length;
    const random = createSeededRandom(seed);
    const generateDistribution = (base: {name: string, color: string}[]) => {
      let remaining = 100;
      if (filteredTransactions.length === 0) {
        return base.map(item => ({...item, value: 0}));
      }
      const data = base.map((item, index) => {
        if (index === base.length - 1) return { ...item, value: remaining };
        const value = Math.floor(random() * (remaining / 1.5)) + 10;
        remaining -= value;
        return { ...item, value: Math.max(0, value) };
      });
      return data.sort((a,b) => b.value - a.value);
    }
    
    const dynamicOsData = generateDistribution([
        { name: 'iOS', color: '#14b8a6' }, { name: 'Android', color: '#3b82f6' },
        { name: 'macOS', color: '#f59e0b' }, { name: 'Windows', color: '#ef4444' },
    ]);
    const dynamicWebData = generateDistribution([
        { name: 'Safari', color: '#14b8a6' }, { name: 'Chrome', color: '#3b82f6' },
        { name: 'Firefox', color: '#f59e0b' }, { name: 'Edge', color: '#ef4444' },
    ]);


    return { paymentPulseData: finalPulseData, successRate: finalSuccessRate, volumeAndRevenueData: finalVolumeAndRevenueData, totalVolume: totalVol, totalGrossRevenue: totalGrossRev, osDistributionData: dynamicOsData, webEntryData: dynamicWebData };
}, [filteredTransactions, previousPeriodFilteredTransactions, isComparing, timeRange, branchFilter]);

 const dynamicInfoText = useMemo(() => {
    const branchName = branchFilter === 'all' 
      ? 'all outlets' 
      : branchFilter.replace("Bloomsbury's - ", "");
    const timeWindow = `last ${timeRange.replace('d', '')} days`;
    
    return `Visualizing performance for ${branchName} within the ${timeWindow} window. Data is updated in real-time from your linked POS terminals.`;
  }, [branchFilter, timeRange]);

  const handleExport = () => {
    toast({
        title: "Export Initiated",
        description: "Preparing your analytics report for download...",
    });
  };

  if (isLoading) {
      return <OrdersPageSkeleton view="list"/>
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 lg:p-8 space-y-8 bg-muted/30 min-h-screen text-left">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics</h1>
                <p className="text-muted-foreground mt-1">
                Monitor your outlet's real-time performance, track sales trends, and analyze customer payment behavior.
                </p>
            </div>
            <Button variant="outline" className="gap-2 font-bold" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Export Report
            </Button>
          </div>

          <Card className="p-4 mb-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="space-y-1">
                    <Label className="text-xs font-semibold text-muted-foreground px-1">OUTLET</Label>
                    <Select value={branchFilter} onValueChange={setBranchFilter}>
                        <SelectTrigger className="w-[200px] bg-background border-border font-semibold">
                            <SelectValue placeholder="Select Outlet" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Outlets</SelectItem>
                            {mockBranches.map(branch => (
                              <SelectItem key={branch.id} value={branch.name}>{branch.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                <Button variant={timeRange === '7d' ? 'default' : 'ghost'} size="sm" className={cn("shadow-sm font-semibold", timeRange === '7d' && "bg-white text-foreground hover:bg-white")} onClick={() => setTimeRange('7d')}>1W</Button>
                <Button variant={timeRange === '30d' ? 'default' : 'ghost'} size="sm" className={cn("shadow-sm font-semibold", timeRange === '30d' && "bg-white text-foreground hover:bg-white")} onClick={() => setTimeRange('30d')}>1M</Button>
                <Button variant={timeRange === '90d' ? 'default' : 'ghost'} size="sm" className={cn("shadow-sm font-semibold", timeRange === '90d' && "bg-white text-foreground hover:bg-white")} onClick={() => setTimeRange('90d')}>3M</Button>
                <div className="flex items-center gap-2 pl-4">
                  <Label htmlFor="compare-switch" className="text-xs font-semibold text-muted-foreground">COMPARE</Label>
                  <Switch id="compare-switch" checked={isComparing} onCheckedChange={setIsComparing} />
                </div>
              </div>
            </div>
          </Card>
          
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Performance Metrics</h2>
                <span className="text-xs font-medium text-muted-foreground">LAST {timeRange.replace('d', '')} DAYS</span>
            </div>
            <StatCards cards={kpiData} />
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            <div className="xl:col-span-1 text-left">
              <Card className="h-full shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold">Payment Pulse</CardTitle>
                      <CardDescription className="text-xs">Distribution by transaction state</CardDescription>
                    </div>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <ChartContainer config={paymentPulseConfig} className="h-48 w-48 relative">
                    <PieChart>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Pie data={paymentPulseData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="75%" outerRadius="95%" startAngle={90} endAngle={450} paddingAngle={4}>
                        {paymentPulseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Success Rate</p>
                      <p className="text-4xl font-bold text-foreground mt-1">{successRate}%</p>
                    </div>
                  </ChartContainer>
                  <div className="w-full mt-6 text-left">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                      {paymentPulseData.map(item => (
                        <div key={item.name} className="flex items-center text-sm">
                          <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                        {paymentPulseData.map(item => (
                            <div key={`${item.name}-value`}>
                                <p className="text-xs text-muted-foreground uppercase">{item.name}</p>
                                <p className="text-lg font-bold">{item.value.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="xl:col-span-2 text-left">
                <Card className="h-full shadow-sm">
                    <CardHeader>
                         <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold">Growth Trends</CardTitle>
                                <CardDescription className="text-xs">Volume and revenue analysis</CardDescription>
                            </div>
                            <Badge variant="outline" className="text-xs">RANGE: {timeRange.replace('d', '')}D</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                            <div>
                                <div className="flex justify-between items-baseline mb-4">
                                    <h3 className="font-semibold text-sm">Volume (Orders)</h3>
                                    <p className="text-xl font-bold">{totalVolume} <span className="text-xs font-semibold text-muted-foreground">UNITS</span></p>
                                </div>
                                <ChartContainer config={volumeConfig} className="h-[200px] w-full">
                                    <RechartsBarChart data={volumeAndRevenueData} margin={{ top: 5, right: 0, left: -20, bottom: -10 }}>
                                        <ChartTooltip
                                            cursor={{ fill: "hsl(var(--muted))" }}
                                            content={<ChartTooltipContent />}
                                        />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} interval="auto" />
                                        <Bar dataKey="volume" radius={[4, 4, 0, 0]} fill="hsl(var(--chart-1))" />
                                        {isComparing && <Bar dataKey="prevVolume" radius={[4, 4, 0, 0]} fill="hsl(var(--chart-1))" opacity={0.3} />}
                                    </RechartsBarChart>
                                </ChartContainer>
                            </div>
                            <div>
                                <div className="flex justify-between items-baseline mb-4">
                                    <h3 className="font-semibold text-sm">Gross Revenue</h3>
                                    <p className="text-xl font-bold">AED <span className="text-xl font-bold">{totalGrossRevenue.toLocaleString('en-US', {maximumFractionDigits: 0})}</span></p>
                                </div>
                                <ChartContainer config={revenueConfig} className="h-[200px] w-full">
                                    <AreaChart data={volumeAndRevenueData} margin={{ top: 5, right: 0, left: -20, bottom: -10 }}>
                                        <defs>
                                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <ChartTooltip
                                            cursor={{ fill: "hsl(var(--muted))" }}
                                            content={<ChartTooltipContent />}
                                        />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} interval="auto" />
                                        <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#revenueGradient)" />
                                        {isComparing && <Area type="monotone" dataKey="prevRevenue" stroke="hsl(var(--chart-1))" fill="transparent" strokeDasharray="3 3" />}
                                    </AreaChart>
                                </ChartContainer>
                            </div>
                        </div>
                        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3 text-xs text-yellow-800 text-left">
                            <Info className="h-4 w-4 shrink-0" />
                            <p>{dynamicInfoText}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
          </div>
          
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
              <Card className="shadow-sm">
                  <CardHeader className="flex flex-row items-start justify-between">
                      <div>
                          <CardTitle className="text-base font-bold">OS Distribution</CardTitle>
                          <CardDescription className="text-xs">Breakdown of guest operating systems</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs">DEVICE USAGE</Badge>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 items-center">
                      <ChartContainer config={osConfig} className="h-48 relative">
                          <PieChart>
                                <ChartTooltip
                                  cursor={false}
                                  content={<ChartTooltipContent hideLabel />}
                                />
                              <Pie data={osDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="70%" outerRadius="90%" startAngle={90} endAngle={450} paddingAngle={2}>
                                  {osDistributionData.map((entry) => (
                                      <Cell key={`cell-${entry.name}`} fill={entry.color} stroke={entry.color} />
                                  ))}
                              </Pie>
                          </PieChart>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-left">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">MOBILE</p>
                              <p className="text-xl font-bold">{osDistributionData[0]?.name || 'N/A'}</p>
                          </div>
                      </ChartContainer>
                      <div>
                          <ul className="space-y-2 text-sm text-left">
                              {osDistributionData.map(item => (
                                  <li key={item.name} className="flex items-center justify-between">
                                      <div className="flex items-center">
                                          <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                                          <span>{item.name}</span>
                                      </div>
                                      <span className="font-semibold">{item.value}%</span>
                                  </li>
                              ))}
                          </ul>
                      </div>
                  </CardContent>
              </Card>
              <Card className="shadow-sm">
                  <CardHeader className="flex flex-row items-start justify-between">
                      <div>
                          <CardTitle className="text-base font-bold">Web Entry</CardTitle>
                          <CardDescription className="text-xs">Breakdown of guest web browsers</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs">TOP BROWSER</Badge>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 items-center">
                      <ChartContainer config={webEntryConfig} className="h-48 relative">
                          <PieChart>
                              <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                              />
                              <Pie data={webEntryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="70%" outerRadius="90%" startAngle={90} endAngle={450} paddingAngle={2}>
                                  {webEntryData.map((entry) => (
                                      <Cell key={`cell-${entry.name}`} fill={entry.color} stroke={entry.color} />
                                  ))}
                              </Pie>
                          </PieChart>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">TOP</p>
                              <p className="text-xl font-bold">{webEntryData[0]?.name || 'N/A'}</p>
                          </div>
                      </ChartContainer>
                      <div>
                          <ul className="space-y-2 text-sm text-left">
                              {webEntryData.map(item => (
                                  <li key={item.name} className="flex items-center justify-between">
                                      <div className="flex items-center">
                                          <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                                          <span>{item.name}</span>
                                      </div>
                                      <span className="font-semibold">{item.value}%</span>
                                  </li>
                              ))}
                          </ul>
                      </div>
                  </CardContent>
              </Card>
            </div>
        </div>
      </main>
    </>
  );
}
