'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/header';
import { useSidebar } from '@/components/ui/sidebar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wand2, 
  TrendingUp, 
  ShieldAlert, 
  BarChart as BarChartIcon, 
  CircleDollarSign, 
  RotateCcw, 
  FileWarning, 
  Clock, 
  Eye, 
  Info,
  User,
  Search,
  Download,
  ZapIcon,
  Scale,
  RefreshCcw,
  Trophy,
  FileText,
  AlertCircle,
  DollarSign,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Flame,
  MessageSquare,
  Star,
  X,
  File as FileIcon,
  Sheet as SheetIcon,
  Lock,
  ThumbsUp,
  History,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell as RechartsCell,
} from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ScrollArea } from '@/components/ui/scroll-area';

const navigationItems = [
  { id: 'ai-overview', label: 'AI Overview', icon: Wand2 },
  { id: 'waiter-sales', label: 'Waiter Sales', icon: BarChartIcon },
  { id: 'tips', label: 'Tips', icon: CircleDollarSign },
  { id: 'guest-feedback', label: 'Guest Feedback', icon: MessageSquare },
  { id: 'turnover', label: 'Turnover', icon: RotateCcw },
  { id: 'balances', label: 'Balances', icon: FileWarning },
  { id: 'shift-summary', label: 'Shift Summary', icon: Clock },
  { id: 'leakage', label: 'Leakage', icon: ShieldAlert },
];

const alerts = [
  {
    type: 'High-risk Table',
    timestamp: '2m ago',
    reference: 'Waiter: John, Table: T5',
    severity: 'High',
  },
  {
    type: 'Unusual Tip Drop',
    timestamp: '1h ago',
    reference: 'Waiter: Maria',
    severity: 'Medium',
  },
  {
    type: 'Ending Shift with Open Balance',
    timestamp: '8h ago',
    reference: 'Waiter: David',
    severity: 'Low',
  },
];

const waiterSalesData = [
  { name: 'Alex', tables: 12, orders: 15, gross: 450.75, collected: 450.75, outstanding: 0.00, avg: 30.05, split: '10%' },
  { name: 'Maria', tables: 10, orders: 12, gross: 380.20, collected: 380.20, outstanding: 0.00, avg: 31.68, split: '25%' },
  { name: 'John', tables: 14, orders: 18, gross: 512.50, collected: 490.00, outstanding: 22.50, avg: 28.47, split: '40%' },
  { name: 'Sarah', tables: 11, orders: 13, gross: 410.00, collected: 410.00, outstanding: 0.00, avg: 31.54, split: '15%' },
  { name: 'David', tables: 9, orders: 10, gross: 290.80, collected: 250.00, outstanding: 40.80, avg: 29.08, split: '50%' },
];

const topStaffTips = [
  { name: 'Sarah', avgTip: '20.1%', total: '$60.80', ratio: '95/5', rank: 1 },
  { name: 'Alex', avgTip: '18.2%', total: '$55.20', ratio: '80/20', rank: 2 },
  { name: 'John', avgTip: '15.1%', total: '$50.10', ratio: '70/30', rank: 3 },
  { name: 'Maria', avgTip: '19.5%', total: '$45.50', ratio: '90/10', rank: 4 },
  { name: 'David', avgTip: '12.5%', total: '$25.40', ratio: '60/40', rank: 5 },
];

const tipsBreakdownData = [
  { name: 'Alex', totalTips: '$55.20', tipsPerTable: '$4.60', avgTipPercent: '18.2%', ratio: '80/20' },
  { name: 'Maria', totalTips: '$45.50', tipsPerTable: '$4.55', avgTipPercent: '19.5%', ratio: '90/10' },
  { name: 'John', totalTips: '$50.10', tipsPerTable: '$3.58', avgTipPercent: '15.1%', ratio: '70/30' },
  { name: 'Sarah', totalTips: '$60.80', tipsPerTable: '$5.53', avgTipPercent: '20.1%', ratio: '95/5' },
  { name: 'David', totalTips: '$25.40', tipsPerTable: '$2.82', avgTipPercent: '12.5%', ratio: '60/40' },
];

const turnoverChartData = [
  { name: 'Alex', minutes: 18 },
  { name: 'Maria', minutes: 15 },
  { name: 'John', minutes: 22 },
  { name: 'Sarah', minutes: 16 },
  { name: 'David', minutes: 25 },
];

const turnoverDetailsData = [
  { name: 'Alex', tables: 12, avgTurnover: '18m', dwellTime: '45m', splitImpact: '-5m' },
  { name: 'Maria', tables: 10, avgTurnover: '15m', dwellTime: '42m', splitImpact: '+2m' },
  { name: 'John', tables: 14, avgTurnover: '22m', dwellTime: '55m', splitImpact: '+8m' },
  { name: 'Sarah', tables: 11, avgTurnover: '16m', dwellTime: '40m', splitImpact: '-3m' },
  { name: 'David', tables: 9, avgTurnover: '25m', dwellTime: '60m', splitImpact: '+10m' },
];

const balancesAgingData = [
  { label: '0-10 min', value: '$5.50', status: 'green' },
  { label: '10-30 min', value: '$0.00', status: 'orange' },
  { label: '30+ min', value: '$63.30', status: 'pink' },
];

const balancesTableData = [
  { name: 'John', outstanding: 22.50, openTables: 1, oldestAge: '45m', recoveredLost: '$50 / $5', risk: 'low' },
  { name: 'David', outstanding: 40.80, openTables: 2, oldestAge: '1h 15m', recoveredLost: '$20 / $15', risk: 'high' },
  { name: 'Maria', outstanding: 5.50, openTables: 1, oldestAge: '8m', recoveredLost: '$10 / $0', risk: 'low' },
];

const shiftSummaryData = [
  { name: 'Alex', shift: 'Morning', tables: 12, sales: '$450.75', tips: '$55.20', balances: '$0.00', voids: 0, notes: 'All tables closed.' },
  { name: 'Maria', shift: 'Morning', tables: 10, sales: '$380.20', tips: '$45.50', balances: '$0.00', voids: 1, notes: 'T5 disputed charge.' },
  { name: 'John', shift: 'Afternoon', tables: 14, sales: '$512.50', tips: '$50.10', balances: '$22.50', voids: 0, notes: 'T12 waiting for payment.' },
];

const leakageLogData = [
  { id: '#3215', waiter: 'John', type: 'Closed w/o Settlement', amount: 22.50, status: 'Unresolved' },
  { id: '#3211', waiter: 'David', type: 'Order w/o Payment', amount: 18.30, status: 'Unresolved' },
  { id: '#3205', waiter: 'Maria', type: 'Tip Discrepancy', amount: 2.50, status: 'Reviewed' },
];

const guestFeedbackSummary = [
  { name: 'Sarah', avgRating: 5.0, reviewCount: 42, topKeyword: 'Attentive', sentiment: 'Positive' },
  { name: 'Alex', avgRating: 4.8, reviewCount: 35, topKeyword: 'Quick', sentiment: 'Positive' },
  { name: 'Maria', avgRating: 4.7, reviewCount: 28, topKeyword: 'Friendly', sentiment: 'Positive' },
  { name: 'John', avgRating: 4.5, reviewCount: 31, topKeyword: 'Polite', sentiment: 'Mixed' },
  { name: 'David', avgRating: 3.9, reviewCount: 15, topKeyword: 'Slow', sentiment: 'Neutral' },
];

const recentReviews = [
  { id: 1, orderId: '#ORD-9912', waiter: 'Sarah', customer: 'Mark R.', rating: 5, comment: 'Sarah was incredibly attentive and made our anniversary special.', date: '15m ago', fullTimestamp: '2023-11-20 14:32' },
  { id: 2, orderId: '#ORD-9884', waiter: 'Alex', customer: 'Emily T.', rating: 4, comment: 'Very fast service, though the steak was a bit rare.', date: '1h ago', fullTimestamp: '2023-11-20 13:15' },
  { id: 3, orderId: '#ORD-9821', waiter: 'David', customer: 'Chris P.', rating: 2, comment: 'Had to wait 20 minutes just to get the bill.', date: '3h ago', fullTimestamp: '2023-11-20 11:20' },
  { id: 4, orderId: '#ORD-9755', waiter: 'Maria', customer: 'Jessica W.', rating: 5, comment: 'Best dining experience in a long time. Maria is a gem!', date: 'Yesterday', fullTimestamp: '2023-11-19 20:05' },
  { id: 5, orderId: '#ORD-9955', waiter: 'Sarah', customer: 'Lars O.', rating: 5, comment: 'Flawless service, very knowledgeable about the menu.', date: '30m ago', fullTimestamp: '2023-11-20 14:15' },
  { id: 6, orderId: '#ORD-9940', waiter: 'Sarah', customer: 'Nina K.', rating: 5, comment: 'Always a pleasure being served by Sarah. Quick and kind!', date: '45m ago', fullTimestamp: '2023-11-20 14:00' },
];

export default function StaffPerformancePage() {
  const router = useRouter();
  const { setOpen } = useSidebar();
  const [activeTab, setActiveTab] = useState('ai-overview');
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setOpen(false);
  }, [setOpen]);

  const handleBack = () => {
    setOpen(true);
    router.push('/dashboard');
  };

  const handleExport = (format: 'CSV' | 'PDF') => {
    let data: any[] = [];
    let headers: string[] = [];
    let title = "";

    switch (activeTab) {
      case 'waiter-sales':
        title = "Waiter Sales Report";
        headers = ['Waiter', 'Tables', 'Orders', 'Gross Sales', 'Collected', 'Outstanding'];
        data = waiterSalesData.map(w => [w.name, w.tables, w.orders, `$${w.gross.toFixed(2)}`, `$${w.collected.toFixed(2)}`, `$${w.outstanding.toFixed(2)}`]);
        break;
      case 'tips':
        title = "Staff Gratuity Report";
        headers = ['Waiter', 'Total Tips', 'Tips Per Table', 'Avg Tip %', 'Ratio'];
        data = tipsBreakdownData.map(t => [t.name, t.totalTips, t.tipsPerTable, t.avgTipPercent, t.ratio]);
        break;
      case 'guest-feedback':
        title = "Guest Feedback Report";
        headers = ['Waiter', 'Avg Rating', 'Reviews', 'Top Keyword'];
        data = guestFeedbackSummary.map(f => [f.name, f.avgRating, f.reviewCount, f.topKeyword]);
        break;
      case 'turnover':
        title = "Table Turnover Report";
        headers = ['Waiter', 'Tables', 'Avg Turnover', 'Dwell Time', 'Split Impact'];
        data = turnoverDetailsData.map(t => [t.name, t.tables, t.avgTurnover, t.dwellTime, t.splitImpact]);
        break;
      default:
        title = "Staff Performance Overview";
        headers = ['Waiter', 'Gross Sales', 'Tips Earned'];
        data = waiterSalesData.map((w, i) => [w.name, `$${w.gross.toFixed(2)}`, tipsBreakdownData[i]?.totalTips || '$0.00']);
    }

    if (format === 'CSV') {
      const csvContent = [
        headers.join(','),
        ...data.map(row => row.join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${title.toLowerCase().replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      link.click();
    } else {
      const doc = new jsPDF();
      doc.text(title, 14, 15);
      autoTable(doc, {
        head: [headers],
        body: data,
        startY: 20,
        theme: 'striped',
        headStyles: { fillColor: [24, 180, 166] }
      });
      doc.save(`${title.toLowerCase().replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    }

    toast({
      title: `${format} Report Generated`,
      description: `Your ${title} has been downloaded successfully.`,
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={cn(
              "h-3.5 w-3.5",
              star <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
            )} 
          />
        ))}
      </div>
    );
  };

  const topRatingValue = useMemo(() => {
    return Math.max(...guestFeedbackSummary.map(s => s.avgRating));
  }, []);

  const handleOpenStaffFeedback = (staff: any) => {
    setSelectedStaff(staff);
  };

  const staffFilteredReviews = useMemo(() => {
    if (!selectedStaff) return [];
    return recentReviews.filter(r => r.waiter === selectedStaff.name);
  }, [selectedStaff]);

  return (
    <>
      <DashboardHeader />
      <main className="flex h-[calc(100vh-4rem)] overflow-hidden bg-muted/30 text-left">
        <aside className="w-64 border-r bg-white/50 backdrop-blur-sm p-4 flex flex-col gap-6 shrink-0">
          <div className="flex flex-col gap-4 px-2">
            <Button 
                variant="ghost" 
                size="sm" 
                className="w-fit -ml-2 text-muted-foreground hover:text-foreground font-bold gap-2"
                onClick={handleBack}
            >
                <ArrowLeft className="h-4 w-4" />
                Back
            </Button>
            <div>
                <h2 className="text-lg font-bold text-gray-900">Performance</h2>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Staff Analytics</p>
            </div>
          </div>
          
          <nav className="flex flex-col gap-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                  activeTab === item.id 
                    ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20" 
                    : "text-gray-500 hover:bg-gray-100"
                )}
              >
                <item.icon className={cn("h-4 w-4", activeTab === item.id ? "text-primary" : "text-gray-400")} />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Staff Performance</h1>
                <p className="text-muted-foreground text-sm">Real-time staff metrics, payment behavior, and AI insights.</p>
              </div>
              <Button 
                variant="outline" 
                className="gap-2 font-bold bg-white text-gray-700 h-10 px-6 rounded-xl border-gray-200 hover:bg-gray-50"
                onClick={() => handleExport('PDF')}
              >
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </div>

            <TooltipProvider delayDuration={100}>
                {/* AI Summary Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="relative overflow-hidden border-2 border-transparent bg-white shadow-sm hover:shadow-md transition-shadow text-left">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                    <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
                            <ShieldAlert className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-sm font-bold">AI Anomalies</CardTitle>
                        </div>
                        <Badge className="bg-red-500 text-white border-0 text-[10px] px-2 h-5 font-black uppercase tracking-wider">High Risk</Badge>
                    </div>
                    </CardHeader>
                    <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Unusual unpaid balances, high refund frequency, and repeated partial payments detected.
                    </p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-2 border-transparent bg-white shadow-sm hover:shadow-md transition-shadow text-left">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#18B4A6]" />
                    <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-sm font-bold">AI Tip Insights</CardTitle>
                        </div>
                    </div>
                    </CardHeader>
                    <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Tip presets can be optimized to increase earnings. Projected improvement: <span className="text-teal-600 font-bold">+8.5%</span>.
                    </p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-2 border-transparent bg-white shadow-sm hover:shadow-md transition-shadow text-left">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                    <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                            <User className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-sm font-bold">AI Waiter Score</CardTitle>
                        </div>
                        <span className="text-lg font-black text-blue-600">8.2/10</span>
                    </div>
                    </CardHeader>
                    <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Top performer: Alex. Needs coaching: David. Based on speed, tips, and balance closure.
                    </p>
                    </CardContent>
                </Card>
                </div>

                {/* TAB CONTENT */}

                {activeTab === 'ai-overview' && (
                <div className="space-y-8 animate-in fade-in duration-500 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="shadow-sm">
                        <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Risky Tables</span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button type="button"><Info className="h-3 w-3 text-muted-foreground opacity-50" /></button>
                                </TooltipTrigger>
                                <TooltipContent>Active tables with high unpaid balances or long dwell times without activity.</TooltipContent>
                            </Tooltip>
                            </div>
                            <div className="p-1.5 rounded-lg bg-pink-50 text-pink-500">
                            <FileWarning className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="text-4xl font-black text-gray-900">3</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Revenue at Risk</span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button type="button"><Info className="h-3 w-3 text-muted-foreground opacity-50" /></button>
                                </TooltipTrigger>
                                <TooltipContent>Potential loss from open tables that have exceeded the standard dining duration.</TooltipContent>
                            </Tooltip>
                            </div>
                            <div className="p-1.5 rounded-lg bg-orange-50 text-orange-500">
                            <CircleDollarSign className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="text-4xl font-black text-gray-900">$245.50</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tips Trend (7d)</span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button type="button"><Info className="h-3 w-3 text-muted-foreground opacity-50" /></button>
                                </TooltipTrigger>
                                <TooltipContent>Growth or decline in digital tips compared to the previous week.</TooltipContent>
                            </Tooltip>
                            </div>
                            <div className="p-1.5 rounded-lg bg-green-50 text-green-500">
                            <TrendingUp className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="flex items-end gap-2">
                            <p className="text-4xl font-black text-gray-900">+5.2%</p>
                            <span className="text-green-600 font-bold text-xs mb-1">↑ +5.2%</span>
                        </div>
                        </CardContent>
                    </Card>
                    </div>

                    <Card className="shadow-sm overflow-hidden border-0">
                    <CardHeader className="bg-white border-b py-6 px-8">
                        <CardTitle className="text-xl font-bold text-gray-900">Notable AI Alerts</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 text-left">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                            <TableRow className="border-b">
                                <TableHead className="px-8 h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    Type <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 opacity-50" /></button></TooltipTrigger><TooltipContent>Category of the identified anomaly.</TooltipContent></Tooltip>
                                </div>
                                </TableHead>
                                <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Timestamp</TableHead>
                                <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    Reference <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 opacity-50" /></button></TooltipTrigger><TooltipContent>Specific staff or table associated with this alert.</TooltipContent></Tooltip>
                                </div>
                                </TableHead>
                                <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                    Severity <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 opacity-50" /></button></TooltipTrigger><TooltipContent>Impact level of the detected issue.</TooltipContent></Tooltip>
                                </div>
                                </TableHead>
                                <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right px-8">Actions</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {alerts.map((alert, idx) => (
                                <TableRow key={idx} className="group hover:bg-muted/30 transition-colors h-16">
                                <TableCell className="px-8 font-bold text-sm text-gray-900">{alert.type}</TableCell>
                                <TableCell className="text-xs text-muted-foreground font-medium">{alert.timestamp}</TableCell>
                                <TableCell className="text-xs text-gray-600 font-semibold">{alert.reference}</TableCell>
                                <TableCell className="text-center">
                                    <Badge 
                                    className={cn(
                                        "text-[10px] font-black px-3 h-6 rounded-full border-0 shadow-none",
                                        alert.severity === 'High' ? "bg-red-500 text-white" :
                                        alert.severity === 'Medium' ? "bg-gray-200 text-gray-700" :
                                        "bg-white border-2 border-gray-100 text-gray-500"
                                    )}
                                    >
                                    {alert.severity}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right px-8">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg group-hover:bg-white transition-colors">
                                    <Eye className="h-4 w-4 text-gray-400" />
                                    </Button>
                                </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    </Card>
                </div>
                )}

                {activeTab === 'waiter-sales' && (
                <div className="space-y-6 animate-in fade-in duration-500 text-left">
                    <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between p-6">
                        <div className="space-y-1">
                        <CardTitle className="text-xl font-bold">Waiter Sales Performance</CardTitle>
                        <CardDescription className="text-sm font-medium">Review sales metrics for each waiter.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search waiter..." className="pl-10 h-11 bg-muted/20 border-border" />
                        </div>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-full sm:w-[180px] h-11 bg-muted/20">
                            <SelectValue placeholder="All Branches" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="all">All Branches</SelectItem>
                            <SelectItem value="rak">Ras Al Khaimah</SelectItem>
                            <SelectItem value="dubai">Dubai Mall</SelectItem>
                            </SelectContent>
                        </Select>
                        </div>

                        <div className="border rounded-xl overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50/50 text-left">
                            <TableRow>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground h-12 px-4">Waiter</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground h-12">Tables</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground h-12">Orders</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground h-12">
                                <div className="flex items-center gap-1">Gross Sales <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 opacity-40" /></button></TooltipTrigger><TooltipContent>Total bill amounts handled by this waiter.</TooltipContent></Tooltip></div>
                                </TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground h-12">
                                <div className="flex items-center gap-1">Collected <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 opacity-40" /></button></TooltipTrigger><TooltipContent>Total amount successfully settled by guests.</TooltipContent></Tooltip></div>
                                </TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground h-12">
                                <div className="flex items-center gap-1">Outstanding <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 opacity-40" /></button></TooltipTrigger><TooltipContent>Amount currently unpaid at this waiter's tables.</TooltipContent></Tooltip></div>
                                </TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground h-12">
                                <div className="flex items-center gap-1">Avg. Bill <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 opacity-40" /></button></TooltipTrigger><TooltipContent>Average order value for this staff member.</TooltipContent></Tooltip></div>
                                </TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground h-12">
                                <div className="flex items-center gap-1">% Split Bills <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 opacity-40" /></button></TooltipTrigger><TooltipContent>Percentage of orders where guests utilized bill splitting.</TooltipContent></Tooltip></div>
                                </TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {waiterSalesData.map((waiter) => (
                                <TableRow key={waiter.name} className="hover:bg-muted/5 transition-colors h-14">
                                <TableCell className="font-bold text-sm text-gray-900 px-4">{waiter.name}</TableCell>
                                <TableCell className="text-sm font-medium text-gray-600">{waiter.tables}</TableCell>
                                <TableCell className="text-sm font-medium text-gray-600">{waiter.orders}</TableCell>
                                <TableCell className="text-sm font-bold text-gray-900">${waiter.gross.toFixed(2)}</TableCell>
                                <TableCell className="text-sm font-bold text-gray-900">${waiter.collected.toFixed(2)}</TableCell>
                                <TableCell className={cn("text-sm font-bold", waiter.outstanding > 0 ? "text-red-500" : "text-gray-900")}>
                                    ${waiter.outstanding.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-sm font-bold text-gray-900">${waiter.avg.toFixed(2)}</TableCell>
                                <TableCell className="text-sm font-bold text-gray-900">{waiter.split}</TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        </div>
                    </CardContent>
                    </Card>
                </div>
                )}

                {activeTab === 'tips' && (
                <div className="space-y-8 animate-in fade-in duration-500 text-left">
                    <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Advanced Metrics</h3>
                        <p className="text-xs text-muted-foreground font-medium">Metrics on tip normalization, volatility, and fairness.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tip Volatility</span>
                                <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 text-muted-foreground opacity-50" /></button></TooltipTrigger><TooltipContent>Standard deviation of tip percentages; lower indicates more consistent service.</TooltipContent></Tooltip>
                            </div>
                            <div className="p-1.5 rounded-lg bg-pink-50 text-pink-500">
                                <ZapIcon className="h-4 w-4" />
                            </div>
                            </div>
                            <p className="text-3xl font-black text-gray-900">12.5%</p>
                            <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
                            <span className="text-[10px] font-bold text-red-500">-2.1%</span>
                            <span className="text-[10px] font-medium text-muted-foreground ml-1">Lower is better</span>
                            </div>
                        </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Normalization Index</span>
                                <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 text-muted-foreground opacity-50" /></button></TooltipTrigger><TooltipContent>How closely a waiter's tip average matches the restaurant's overall average.</TooltipContent></Tooltip>
                            </div>
                            <div className="p-1.5 rounded-lg bg-orange-50 text-orange-500">
                                <Scale className="h-4 w-4" />
                            </div>
                            </div>
                            <p className="text-3xl font-black text-gray-900">8.5/10</p>
                            <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-teal-500" />
                            <span className="text-[10px] font-bold text-teal-500">+0.5</span>
                            <span className="text-[10px] font-medium text-muted-foreground ml-1">vs. restaurant avg.</span>
                            </div>
                        </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fairness Score</span>
                                <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 text-muted-foreground opacity-50" /></button></TooltipTrigger><TooltipContent>A measure of tip distribution equality among staff.</TooltipContent></Tooltip>
                            </div>
                            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-500">
                                <RefreshCcw className="h-4 w-4" />
                            </div>
                            </div>
                            <p className="text-3xl font-black text-gray-900">92%</p>
                            <span className="text-[10px] font-medium text-muted-foreground mt-1 block">Based on Gini Coefficient</span>
                        </CardContent>
                        </Card>
                    </div>
                    </div>

                    <Card className="shadow-sm border-0">
                    <CardHeader className="bg-white border-b py-6 px-8">
                        <CardTitle className="text-xl font-bold text-gray-900">Top 5 Staff by Tips</CardTitle>
                        <p className="text-xs text-muted-foreground font-medium">Leaderboard of top-earning waiters.</p>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                        {topStaffTips.map((staff) => (
                            <div 
                            key={staff.name} 
                            className={cn(
                                "flex items-center justify-between py-5 px-8 transition-all duration-300",
                                staff.rank === 1 ? "bg-yellow-50/50 border-y border-yellow-100 shadow-[inset_0_0_20px_rgba(234,179,8,0.05)]" : "hover:bg-muted/5 border-y border-transparent"
                            )}
                            >
                            <div className="flex items-center gap-6">
                                <div className="w-8 flex justify-center">
                                {staff.rank <= 3 ? (
                                    <Trophy className={cn(
                                    "transition-all duration-300",
                                    staff.rank === 1 ? "h-8 w-8 text-yellow-500 drop-shadow-sm" : "h-6 w-6",
                                    staff.rank === 2 && "text-gray-400",
                                    staff.rank === 3 && "text-amber-600"
                                    )} />
                                ) : (
                                    <span className="text-lg font-bold text-gray-300">{staff.rank}</span>
                                )}
                                </div>
                                <div className="text-left">
                                <div className={cn(
                                    "font-bold text-gray-900 flex items-center",
                                    staff.rank === 1 ? "text-lg" : "text-sm"
                                )}>
                                    {staff.name}
                                    {staff.rank === 1 && <Badge className="ml-2 bg-yellow-100 text-yellow-700 border-yellow-200 text-[10px] font-black uppercase h-5 px-2">Top Performer</Badge>}
                                </div>
                                <p className="text-xs text-muted-foreground">Avg Tip: {staff.avgTip}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={cn(
                                    "font-black text-gray-900",
                                    staff.rank === 1 ? "text-2xl" : "text-lg"
                                )}>{staff.total}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{staff.ratio} (Digital/Cash)</p>
                            </div>
                            </div>
                        ))}
                        </div>
                    </CardContent>
                    </Card>

                    <Card className="shadow-sm border-0">
                    <CardHeader className="bg-white border-b py-6 px-8 flex flex-row items-center justify-between text-left">
                        <div className="space-y-1">
                        <CardTitle className="text-xl font-bold text-gray-900">Tips Breakdown</CardTitle>
                        <p className="text-xs text-muted-foreground font-medium">Analyze tip performance for each waiter.</p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex mb-6">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search waiter..." className="pl-10 h-11 bg-muted/20 border-border" />
                        </div>
                        </div>

                        <div className="border rounded-xl overflow-hidden text-left">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="px-6 h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Waiter</TableHead>
                                <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Tips</TableHead>
                                <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    Tips/Table <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 opacity-40" /></button></TooltipTrigger><TooltipContent>Total tips divided by total tables served.</TooltipContent></Tooltip>
                                </div>
                                </TableHead>
                                <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    Avg Tip % <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 opacity-40" /></button></TooltipTrigger><TooltipContent>Average percentage of tip relative to the total bill.</TooltipContent></Tooltip>
                                </div>
                                </TableHead>
                                <div className="flex items-center gap-1.5">
                                    Digital vs Cash <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 opacity-40" /></button></TooltipTrigger><TooltipContent>Ratio of digital tips collected via QR/App versus physical cash tips.</TooltipContent></Tooltip>
                                </div>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {tipsBreakdownData.map((row) => (
                                <TableRow key={row.name} className="hover:bg-muted/5 transition-colors h-14">
                                <TableCell className="px-6 font-bold text-sm text-gray-900">{row.name}</TableCell>
                                <TableCell className="font-bold text-sm text-gray-900">{row.totalTips}</TableCell>
                                <TableCell className="text-sm font-semibold text-gray-600">{row.tipsPerTable}</TableCell>
                                <TableCell className="text-sm font-bold text-gray-900">{row.avgTipPercent}</TableCell>
                                <TableCell className="text-sm font-bold text-gray-900">{row.ratio}</TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        </div>
                    </CardContent>
                    </Card>
                </div>
                )}

                {activeTab === 'guest-feedback' && (
                <div className="space-y-8 animate-in fade-in duration-500 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="shadow-sm">
                        <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Overall Rating</span>
                            </div>
                            <div className="p-1.5 rounded-lg bg-yellow-50 text-yellow-500">
                            <Star className="h-4 w-4 fill-current" />
                            </div>
                        </div>
                        <div className="flex items-end gap-2 text-left">
                            <p className="text-4xl font-black text-gray-900">4.8</p>
                            <div className="mb-1">{renderStars(5)}</div>
                        </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Reviews</span>
                            </div>
                            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-500">
                            <MessageSquare className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="text-4xl font-black text-gray-900">124</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Top Rated Waiter</span>
                            </div>
                            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-500">
                            <Trophy className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-gray-900">Sarah (5.0)</p>
                        </CardContent>
                    </Card>
                    </div>

                    <Card className="shadow-sm border-0">
                    <CardHeader className="bg-white border-b py-6 px-8 text-left">
                        <CardTitle className="text-xl font-bold text-gray-900">Waiter Rating Reports</CardTitle>
                        <p className="text-xs text-muted-foreground font-medium">Aggregated customer ratings per staff member. Click a name for timeline.</p>
                    </CardHeader>
                    <CardContent className="p-0 text-left">
                        <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                            <TableHead className="px-8 h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Waiter</TableHead>
                            <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Average Rating</TableHead>
                            <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Review Count</TableHead>
                            <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Top Feedback</TableHead>
                            <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right px-8">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {guestFeedbackSummary.map((staff) => {
                            const isTop = staff.avgRating === topRatingValue;
                            return (
                                <TableRow 
                                key={staff.name} 
                                className={cn(
                                    "h-16 transition-colors",
                                    isTop ? "bg-yellow-50/50 hover:bg-yellow-50" : "hover:bg-muted/5"
                                )}
                                >
                                <TableCell className="px-8 font-bold text-sm text-gray-900">
                                    <button 
                                    onClick={() => handleOpenStaffFeedback(staff)}
                                    className="flex items-center gap-2 hover:text-primary transition-colors text-left"
                                    >
                                    {staff.name}
                                    {isTop && (
                                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-[10px] font-black uppercase h-5 px-2">
                                        Top Rated
                                        </Badge>
                                    )}
                                    </button>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                    <span className="font-bold text-sm">{staff.avgRating.toFixed(1)}</span>
                                    {renderStars(Math.round(staff.avgRating))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm font-medium text-gray-600">{staff.reviewCount} reviews</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-100 font-bold text-[10px] uppercase tracking-wider">
                                    "{staff.topKeyword}"
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right px-8">
                                    <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-lg hover:bg-white transition-colors"
                                    onClick={() => handleOpenStaffFeedback(staff)}
                                    >
                                    <Eye className="h-4 w-4 text-gray-400" />
                                    </Button>
                                </TableCell>
                                </TableRow>
                            );
                            })}
                        </TableBody>
                        </Table>
                    </CardContent>
                    </Card>

                    <Card className="shadow-sm border-0">
                    <CardHeader className="bg-white border-b py-6 px-8 text-left">
                        <CardTitle className="text-xl font-bold text-gray-900">Recent Customer Reviews</CardTitle>
                        <p className="text-xs text-muted-foreground font-medium">Categorized by waiter and star system.</p>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                        {recentReviews.map((review) => (
                            <div key={review.id} className="p-4 rounded-xl border bg-white flex flex-col gap-3 transition-shadow hover:shadow-md">
                            <div className="flex items-center justify-between text-left">
                                <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs">
                                    {review.customer.charAt(0)}
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-gray-900">{review.customer}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Waiter: {review.waiter}</p>
                                </div>
                                </div>
                                <div className="text-right">
                                {renderStars(review.rating)}
                                <p className="text-[10px] font-medium text-gray-400 mt-1">{review.date}</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed italic text-left">
                                "{review.comment}"
                            </p>
                            </div>
                        ))}
                        </div>
                    </CardContent>
                    </Card>
                </div>
                )}

                {activeTab === 'turnover' && (
                <div className="space-y-8 animate-in fade-in duration-500 text-left">
                    <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Table Turnover Performance</h3>
                        <p className="text-xs text-muted-foreground font-medium">Analyze how quickly tables are being turned over by staff.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        <Card className="shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">Avg. Time to First Payment</span>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                    <button type="button"><Info className="h-3 w-3 text-muted-foreground opacity-50" /></button>
                                    </TooltipTrigger>
                                    <TooltipContent>The average time from guest arrival to the first partial payment.</TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                                <Clock className="h-4 w-4" />
                            </div>
                            </div>
                            <p className="text-4xl font-black text-gray-900">8m 30s</p>
                        </CardContent>
                        </Card>

                        <Card className="shadow-sm text-left">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">Avg. Time to Fully Paid</span>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                    <button type="button"><Info className="h-3 w-3 text-muted-foreground opacity-50" /></button>
                                    </TooltipTrigger>
                                    <TooltipContent>The average time from guest arrival until the bill is 100% settled.</TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
                                <Clock className="h-4 w-4" />
                            </div>
                            </div>
                            <p className="text-4xl font-black text-gray-900">18m 15s</p>
                        </CardContent>
                        </Card>
                    </div>
                    </div>

                    <Card className="shadow-sm border-0">
                    <CardHeader className="bg-white border-b py-6 px-8 text-left">
                        <CardTitle className="text-xl font-bold text-gray-900">Average Turnover Time by Waiter</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={turnoverChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={true} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fontWeight: 500, fill: '#6b7280' }} 
                                dy={10}
                            />
                            <YAxis 
                                label={{ value: 'Minutes', angle: -90, position: 'insideLeft', offset: 15, style: { fill: '#6b7280', fontSize: 12, fontWeight: 500 } }}
                                axisLine={true}
                                tickLine={false}
                                tick={{ fontSize: 12, fontWeight: 500, fill: '#6b7280' }}
                                domain={[0, 28]}
                                ticks={[0, 7, 14, 21, 28]}
                            />
                            <RechartsTooltip 
                                cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Bar 
                                dataKey="minutes" 
                                fill="#18B4A6" 
                                radius={[4, 4, 0, 0]} 
                                barSize={120}
                            >
                                {turnoverChartData.map((entry, index) => (
                                <RechartsCell key={`cell-${index}`} fill="#18B4A6" />
                                ))}
                            </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        </div>
                    </CardContent>
                    </Card>

                    <Card className="shadow-sm border-0">
                    <CardHeader className="bg-white border-b py-6 px-8 text-left">
                        <CardTitle className="text-xl font-bold text-gray-900">Turnover Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                            <TableRow className="border-b">
                                <TableHead className="px-8 h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Waiter</TableHead>
                                <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tables Served</TableHead>
                                <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    Avg. Turnover Time <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 opacity-40" /></button></TooltipTrigger><TooltipContent>Average time from table opening to final payment settlement.</TooltipContent></Tooltip>
                                </div>
                                </TableHead>
                                <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    Avg. Dwell Time <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 opacity-40" /></button></TooltipTrigger><TooltipContent>Average total time a table is occupied by a guest party.</TooltipContent></Tooltip>
                                </div>
                                </TableHead>
                                <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground px-8">
                                <div className="flex items-center gap-1.5">
                                    Split Impact <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 opacity-40" /></button></TooltipTrigger><TooltipContent>Change in turnover efficiency when guests use bill-splitting features.</TooltipContent></Tooltip>
                                </div>
                                </TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {turnoverDetailsData.map((row) => (
                                <TableRow key={row.name} className="hover:bg-muted/5 transition-colors h-16 text-left">
                                <TableCell className="px-8 font-bold text-sm text-gray-900">{row.name}</TableCell>
                                <TableCell className="text-sm font-medium text-gray-600">{row.tables}</TableCell>
                                <TableCell className="text-sm font-bold text-gray-900">{row.avgTurnover}</TableCell>
                                <TableCell className="text-sm font-bold text-gray-900">{row.dwellTime}</TableCell>
                                <TableCell className="px-8">
                                    <span className={cn(
                                    "text-sm font-bold",
                                    row.splitImpact.startsWith('-') ? "text-green-500" : "text-red-500"
                                    )}>
                                    {row.splitImpact}
                                    </span>
                                </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    </Card>
                </div>
                )}

                {activeTab === 'balances' && (
                <div className="space-y-8 animate-in fade-in duration-500 text-left">
                    <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="text-left">
                        <h3 className="text-xl font-bold text-gray-900">Outstanding Balances by Waiter</h3>
                        <p className="text-sm text-muted-foreground font-medium">Monitor waiters with open balances.</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {balancesAgingData.map((bucket) => (
                        <Card key={bucket.label} className="shadow-sm overflow-hidden border-0 bg-white">
                            <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-1.5 text-left">
                                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{bucket.label}</span>
                                <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 text-muted-foreground opacity-50" /></button></TooltipTrigger><TooltipContent>Total unpaid revenue currently aging in this time bracket.</TooltipContent></Tooltip>
                                </div>
                                <div className={cn(
                                "p-1.5 rounded-lg",
                                bucket.status === 'green' ? "bg-green-50 text-green-500" :
                                bucket.status === 'orange' ? "bg-orange-50 text-orange-500" :
                                "bg-pink-50 text-pink-500"
                                )}>
                                <Clock className="h-4 w-4" />
                                </div>
                            </div>
                            <p className="text-4xl font-black text-gray-900 text-left">{bucket.value}</p>
                            </CardContent>
                        </Card>
                        ))}
                    </div>
                    </div>

                    <Card className="shadow-sm border-0 overflow-hidden text-left">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                            <TableRow className="border-b">
                                <TableHead className="px-8 h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Waiter</TableHead>
                                <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    Outstanding Amount <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 opacity-40" /></button></TooltipTrigger><TooltipContent>Current total of all unpaid orders assigned to this waiter.</TooltipContent></Tooltip>
                                </div>
                                </TableHead>
                                <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    # Open Tables <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 opacity-40" /></button></TooltipTrigger><TooltipContent>Number of tables currently active and not fully settled.</TooltipContent></Tooltip>
                                </div>
                                </TableHead>
                                <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    Oldest Balance Age <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 opacity-40" /></button></TooltipTrigger><TooltipContent>Time elapsed since the oldest unpaid item was ordered.</TooltipContent></Tooltip>
                                </div>
                                </TableHead>
                                <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    Recovered vs Lost <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 opacity-40" /></button></TooltipTrigger><TooltipContent>Total revenue recovered from long-open tables versus revenue marked as lost (e.g., walkouts).</TooltipContent></Tooltip>
                                </div>
                                </TableHead>
                                <TableHead className="h-14 px-8 text-right"></TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {balancesTableData.map((row) => (
                                <TableRow 
                                key={row.name} 
                                className={cn(
                                    "transition-colors h-16 text-left",
                                    row.risk === 'high' ? "bg-red-50/60 hover:bg-red-50" : "hover:bg-muted/5"
                                )}
                                >
                                <TableCell className="px-8 font-bold text-sm text-gray-900">{row.name}</TableCell>
                                <TableCell className={cn("font-bold text-sm", row.risk === 'high' ? "text-red-600" : "text-red-500")}>
                                    ${row.outstanding.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-sm font-semibold text-gray-600">{row.openTables}</TableCell>
                                <TableCell className="text-sm font-semibold text-gray-600">{row.oldestAge}</TableCell>
                                <TableCell className="text-sm font-bold text-gray-900">{row.recoveredLost}</TableCell>
                                <TableCell className="px-8 text-right">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg group-hover:bg-white transition-colors">
                                    <Eye className="h-4 w-4 text-gray-400" />
                                    </Button>
                                </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    </Card>
                </div>
                )}

                {activeTab === 'shift-summary' && (
                <div className="space-y-6 animate-in fade-in duration-500 text-left">
                    <Card className="shadow-sm border-0">
                    <CardHeader className="bg-white border-b py-6 px-8 text-left">
                        <CardTitle className="text-xl font-bold">Waiter Shift Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="flex flex-wrap items-center gap-4">
                        <Select defaultValue="today">
                            <SelectTrigger className="w-[180px] h-11 bg-muted/20">
                            <SelectValue placeholder="Period" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="yesterday">Yesterday</SelectItem>
                            <SelectItem value="this-week">This Week</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-[180px] h-11 bg-muted/20">
                            <SelectValue placeholder="Shift" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="all">All Shifts</SelectItem>
                            <SelectItem value="morning">Morning</SelectItem>
                            <SelectItem value="afternoon">Afternoon</SelectItem>
                            <SelectItem value="evening">Evening</SelectItem>
                            </SelectContent>
                        </Select>
                        </div>

                        <div className="border rounded-xl overflow-hidden mt-6 text-left">
                        <Table>
                            <TableHeader className="bg-gray-50/50 text-left">
                            <TableRow>
                                <TableHead className="px-6 h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Waiter</TableHead>
                                <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Shift</TableHead>
                                <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tables</TableHead>
                                <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sales</TableHead>
                                <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tips</TableHead>
                                <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    Open Balances <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 opacity-40" /></button></TooltipTrigger><TooltipContent>Total unpaid amount remaining at the end of the shift.</TooltipContent></Tooltip>
                                </div>
                                </TableHead>
                                <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    Voids/Refunds <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 opacity-40" /></button></TooltipTrigger><TooltipContent>Count of orders cancelled or refunded during this shift.</TooltipContent></Tooltip>
                                </div>
                                </TableHead>
                                <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Notes</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {shiftSummaryData.map((row) => (
                                <TableRow key={row.name} className="hover:bg-muted/5 transition-colors h-14">
                                <TableCell className="px-6 font-bold text-sm text-gray-900">{row.name}</TableCell>
                                <TableCell className="text-sm font-medium text-gray-600">{row.shift}</TableCell>
                                <TableCell className="text-sm font-medium text-gray-600">{row.tables}</TableCell>
                                <TableCell className="text-sm font-bold text-gray-900">{row.sales}</TableCell>
                                <TableCell className="text-sm font-bold text-gray-900">{row.tips}</TableCell>
                                <TableCell className={cn("text-sm font-bold", row.balances !== '$0.00' ? "text-red-500" : "text-gray-900")}>
                                    {row.balances}
                                </TableCell>
                                <TableCell className="text-sm font-medium text-gray-600">{row.voids}</TableCell>
                                <TableCell className="text-sm font-medium text-gray-500 max-w-[200px] truncate">{row.notes}</TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        </div>
                    </CardContent>
                    </Card>
                </div>
                )}

                {activeTab === 'leakage' && (
                <div className="space-y-8 animate-in fade-in duration-500 text-left">
                    <div className="space-y-4">
                    <div className="text-left">
                        <h3 className="text-xl font-bold text-gray-900">Revenue Leakage</h3>
                        <p className="text-sm text-muted-foreground font-medium">Identify and track potential revenue loss.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="shadow-lg border-0 bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1.5 text-left">
                                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Estimated Leakage</span>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                    <button type="button"><Info className="h-3 w-3 text-muted-foreground opacity-50" /></button>
                                    </TooltipTrigger>
                                    <TooltipContent>Total revenue identified as lost due to operational issues.</TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="p-1.5 rounded-lg bg-pink-50 text-pink-500">
                                <DollarSign className="h-4 w-4" />
                            </div>
                            </div>
                            <p className="text-4xl font-black text-gray-900 text-left">$40.80</p>
                        </CardContent>
                        </Card>

                        <Card className="shadow-lg border-0 bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1.5 text-left">
                                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Tickets Involved</span>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                    <button type="button"><Info className="h-3 w-3 text-muted-foreground opacity-50" /></button>
                                    </TooltipTrigger>
                                    <TooltipContent>The number of unique orders affected by leakage incidents.</TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="p-1.5 rounded-lg bg-orange-50 text-orange-500">
                                <FileText className="h-4 w-4" />
                            </div>
                            </div>
                            <p className="text-4xl font-black text-gray-900 text-left">2</p>
                        </CardContent>
                        </Card>

                        <Card className="shadow-lg border-0 bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1.5 text-left">
                                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Leakage Types</span>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                    <button type="button"><Info className="h-3 w-3 text-muted-foreground opacity-50" /></button>
                                    </TooltipTrigger>
                                    <TooltipContent>Distinct categories of leakage detected in the system.</TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="p-1.5 rounded-lg bg-green-50 text-green-500">
                                <AlertCircle className="h-4 w-4" />
                            </div>
                            </div>
                            <p className="text-4xl font-black text-gray-900 text-left">2</p>
                        </CardContent>
                        </Card>
                    </div>
                    </div>

                    <Card className="shadow-sm border-0 overflow-hidden text-left">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                            <TableRow className="border-b">
                                <TableHead className="px-8 h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order ID</TableHead>
                                <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Waiter</TableHead>
                                <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    Leak Type <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 opacity-40" /></button></TooltipTrigger><TooltipContent>The specific way revenue was lost (e.g., unpaid table closure).</TooltipContent></Tooltip>
                                </div>
                                </TableHead>
                                <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    Amount at Risk <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 opacity-40" /></button></TooltipTrigger><TooltipContent>The financial value associated with this leakage event.</TooltipContent></Tooltip>
                                </div>
                                </TableHead>
                                <TableHead className="h-14 px-8 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                    Status <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 opacity-40" /></button></TooltipTrigger><TooltipContent>Current resolution status of the leakage investigation.</TooltipContent></Tooltip>
                                </div>
                                </TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {leakageLogData.map((row) => (
                                <TableRow key={row.id} className="hover:bg-muted/5 transition-colors h-16 text-left">
                                <TableCell className="px-8 font-bold text-sm text-gray-900">{row.id}</TableCell>
                                <TableCell className="text-sm font-medium text-gray-600">{row.waiter}</TableCell>
                                <TableCell className="text-sm font-bold text-gray-900">{row.type}</TableCell>
                                <TableCell className="text-sm font-bold text-red-500">
                                    ${row.amount.toFixed(2)}
                                </TableCell>
                                <TableCell className="px-8 text-right">
                                    <Badge 
                                    className={cn(
                                        "text-[10px] font-black px-3 h-6 rounded-full border-0 shadow-none",
                                        row.status === 'Unresolved' ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700"
                                    )}
                                    >
                                    {row.status}
                                    </Badge>
                                </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    </Card>
                </div>
                )}
            </TooltipProvider>
          </div>
        </div>
      </main>

      <ExportDialog 
        open={isExportDialogOpen} 
        onOpenChange={(open) => !open && setIsExportDialogOpen} 
        onExport={handleExport} 
      />

      <StaffFeedbackDrawer 
        staff={selectedStaff}
        reviews={staffFilteredReviews}
        isOpen={!!selectedStaff}
        onClose={() => setSelectedStaff(null)}
      />
    </>
  );
}

const StaffFeedbackDrawer = ({ staff, reviews, isOpen, onClose }: { staff: any | null; reviews: any[]; isOpen: boolean; onClose: () => void }) => {
  if (!staff) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl w-full p-0 flex flex-col border-l shadow-2xl bg-[#F7F9FB] text-left">
        <div className="bg-white p-8 border-b shrink-0 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20 shadow-inner">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-1">
                <SheetTitle className="text-3xl font-black tracking-tight text-gray-900">{staff.name}</SheetTitle>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 font-black text-[10px] uppercase h-6 px-3 tracking-widest shadow-none">
                    {staff.sentiment} Sentiment
                  </Badge>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{staff.reviewCount} Reviews</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-primary leading-none">{staff.avgRating.toFixed(1)}</p>
              <div className="flex items-center gap-0.5 mt-2 justify-end">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={cn("h-4 w-4", s <= Math.round(staff.avgRating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-100 text-gray-200")} />
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-teal-600">
                  <ThumbsUp className="h-5 w-5" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Top Trait</p>
                   <p className="text-sm font-bold text-gray-900">{staff.topKeyword}</p>
                </div>
             </div>
             <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-orange-600">
                  <History className="h-5 w-5" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recency</p>
                   <p className="text-sm font-bold text-gray-900">Today</p>
                </div>
             </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-8 space-y-6">
             <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Review Timeline</h3>
                <Badge variant="outline" className="font-bold text-[10px] border-border/50">LATEST FIRST</Badge>
             </div>

             <div className="space-y-4">
                {reviews.length > 0 ? reviews.map((review) => (
                  <Card key={review.id} className="border-0 shadow-sm rounded-[24px] overflow-hidden group hover:shadow-md transition-all duration-300">
                    <CardContent className="p-0">
                       <div className="p-6 space-y-4">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-500">
                                   {review.customer.charAt(0)}
                                </div>
                                <div className="text-left">
                                   <p className="text-sm font-bold text-gray-900">{review.customer}</p>
                                   <div className="flex items-center gap-2 mt-0.5">
                                      <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                          <Star key={s} className={cn("h-3 w-3", s <= review.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-100 text-gray-200")} />
                                        ))}
                                      </div>
                                      <span className="h-1 w-1 rounded-full bg-gray-200" />
                                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{review.date}</span>
                                   </div>
                                </div>
                             </div>
                             <Badge variant="secondary" className="bg-muted/50 text-gray-400 font-mono text-[10px] h-6 px-2 border-0">
                               {review.orderId}
                             </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 leading-relaxed font-medium italic text-left pl-12 border-l-2 border-primary/10 py-1">
                             "{review.comment}"
                          </p>

                          <div className="pt-2 flex items-center gap-4 pl-12">
                             <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-gray-300" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{review.fullTimestamp}</span>
                             </div>
                             <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
                                View Order
                             </button>
                          </div>
                       </div>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="py-20 text-center space-y-4">
                     <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto opacity-20">
                        <MessageSquare className="h-8 w-8" />
                     </div>
                     <p className="text-sm font-bold text-gray-400">No specific reviews found for this filter.</p>
                  </div>
                )}
             </div>
          </div>
        </ScrollArea>

        <div className="p-6 bg-white border-t shrink-0 flex items-center justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
           <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reporting Period: Last 30 Days</span>
           </div>
           <Button variant="ghost" className="font-bold text-gray-400 hover:text-gray-900" onClick={onClose}>
             Close Details
           </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
