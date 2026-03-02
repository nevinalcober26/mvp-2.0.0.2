'use client';

import React from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
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
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { 
  ChevronDown, 
  Info, 
  Apple, 
  Smartphone, 
  Monitor,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  WalletCards,
  HandCoins,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { StatCards, type StatCardData } from '@/components/dashboard/stat-cards';

// --- Data Mocks ---

const kpiData: StatCardData[] = [
  {
    title: 'Total Orders',
    value: '159',
    icon: ShoppingCart,
    color: 'teal',
    changeDescription: 'Last 7 days',
  },
  {
    title: 'Average Order Value',
    value: 'AED 114.00',
    icon: DollarSign,
    color: 'orange',
    changeDescription: 'Last 7 days',
  },
  {
    title: 'Pending Amount',
    value: 'AED 18.00',
    icon: AlertTriangle,
    color: 'pink',
    changeDescription: 'from open orders',
  },
  {
    title: 'Bill Paid',
    value: 'AED 12,509',
    icon: WalletCards,
    color: 'green',
    changeDescription: 'Last 7 days',
  },
  {
    title: 'Tips Collected',
    value: 'AED 859',
    icon: HandCoins,
    color: 'purple',
    changeDescription: 'Last 7 days',
  },
];


const paymentPulseData = [
  { name: 'Paid', value: 1248, color: '#14b8a6' },
  { name: 'Partial', value: 84, color: '#f59e0b' },
  { name: 'Pending', value: 12, color: '#f59e0b' },
  { name: 'Failed', value: 2, color: '#ef4444' },
];

const totalPayments = paymentPulseData.reduce((acc, item) => acc + item.value, 0);
const successRate = ((paymentPulseData.find(d => d.name === 'Paid')?.value || 0) / totalPayments * 100).toFixed(0);

const volumeData = [
  { name: 'Mon', value: 180 }, { name: 'Tue', value: 220 }, { name: 'Wed', value: 150 },
  { name: 'Thu', value: 130 }, { name: 'Fri', value: 250 }, { name: 'Sat', value: 280 },
  { name: 'Sun', value: 190 },
];

const revenueData = [
  { name: 'Mon', value: 15000 }, { name: 'Tue', value: 18000 }, { name: 'Wed', value: 16000 },
  { name: 'Thu', value: 19000 }, { name: 'Fri', value: 22000 }, { name: 'Sat', value: 19865 },
  { name: 'Sun', value: 21000 },
];

const osDistributionData = [
  { name: 'iOS', value: 52, color: '#14b8a6' },
  { name: 'Android', value: 38, color: '#3b82f6' },
  { name: 'macOS', value: 6, color: '#f59e0b' },
  { name: 'Windows', value: 4, color: '#ef4444' },
];

const webEntryData = [
  { name: 'Safari', value: 62, color: '#14b8a6' },
  { name: 'Chrome', value: 38, color: '#3b82f6' },
  { name: 'Firefox', value: 6, color: '#f59e0b' },
  { name: 'Edge', value: 4, color: '#ef4444' },
];

// --- Main Page Component ---
export default function AnalyticsPage() {
  return (
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 lg:p-8 space-y-8 bg-muted/30 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Monitor your outlet's real-time performance, track sales trends, and analyze customer payment behavior.
            </p>
          </div>

          {/* Filter Bar */}
          <Card className="p-4 mb-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="space-y-1">
                    <Label className="text-xs font-semibold text-muted-foreground px-1">OUTLET</Label>
                    <Select defaultValue="all">
                        <SelectTrigger className="w-[200px] bg-background border-border font-semibold">
                            <SelectValue placeholder="Select Outlet" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Outlets</SelectItem>
                            <SelectItem value="rak">Ras Al Khaimah</SelectItem>
                            <SelectItem value="dubai">Dubai Mall</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                <Button variant="ghost" size="sm" className="bg-white shadow-sm font-semibold">1W</Button>
                <Button variant="ghost" size="sm">1M</Button>
                <Button variant="ghost" size="sm">3M</Button>
                <div className="flex items-center gap-2 pl-4">
                  <Label htmlFor="compare-switch" className="text-xs font-semibold text-muted-foreground">COMPARE</Label>
                  <Switch id="compare-switch" />
                </div>
              </div>
            </div>
          </Card>
          
          {/* Performance Metrics */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Performance Metrics</h2>
                <span className="text-xs font-medium text-muted-foreground">LAST 7 DAYS</span>
            </div>
            <StatCards cards={kpiData} />
          </div>
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            <div className="xl:col-span-1">
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
                  <div className="h-48 w-48 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={paymentPulseData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="75%" outerRadius="95%" startAngle={90} endAngle={450} paddingAngle={4}>
                          {paymentPulseData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Success Rate</p>
                      <p className="text-4xl font-bold text-foreground mt-1">{successRate}%</p>
                    </div>
                  </div>
                  <div className="w-full mt-6">
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

            <div className="xl:col-span-2">
                <Card className="h-full shadow-sm">
                    <CardHeader>
                         <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold">Growth Trends</CardTitle>
                                <CardDescription className="text-xs">Volume and revenue analysis</CardDescription>
                            </div>
                            <Badge variant="outline" className="text-xs">RANGE: 1W</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <div className="flex justify-between items-baseline mb-4">
                                    <h3 className="font-semibold text-sm">Volume (Orders)</h3>
                                    <p className="text-xl font-bold">155 <span className="text-xs font-semibold text-muted-foreground">UNITS</span></p>
                                </div>
                                <ResponsiveContainer width="100%" height={200}>
                                    <RechartsBarChart data={volumeData} margin={{ top: 5, right: 0, left: -20, bottom: -10 }}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {volumeData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={'#14b8a6'} />
                                            ))}
                                        </Bar>
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            </div>
                            <div>
                                <div className="flex justify-between items-baseline mb-4">
                                    <h3 className="font-semibold text-sm">Gross Revenue</h3>
                                    <p className="text-xl font-bold">AED <span className="text-xl font-bold">19,865</span></p>
                                </div>
                                <ResponsiveContainer width="100%" height={200}>
                                    <AreaChart data={revenueData} margin={{ top: 5, right: 0, left: -20, bottom: -10 }}>
                                        <defs>
                                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} />
                                        <Area type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={2} fill="url(#revenueGradient)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3 text-xs text-yellow-800">
                            <Info className="h-4 w-4 shrink-0" />
                            <p>Visualizing performance for Al Quoz within the TW window. Data is updated in real-time from your linked POS terminals.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
          </div>
          
          {/* Bottom Grid */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-sm">
                  <CardHeader className="flex flex-row items-start justify-between">
                      <div>
                          <CardTitle className="text-base font-bold">OS Distribution</CardTitle>
                          <CardDescription className="text-xs">Breakdown of guest operating systems</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs">DEVICE USAGE</Badge>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 items-center">
                      <div className="h-48 relative">
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie data={osDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="70%" outerRadius="90%" startAngle={90} endAngle={450} paddingAngle={2}>
                                      {osDistributionData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
                                      ))}
                                  </Pie>
                              </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">MOBILE</p>
                              <p className="text-xl font-bold">{osDistributionData.reduce((max, item) => item.value > max.value ? item : max, osDistributionData[0]).name}</p>
                          </div>
                      </div>
                      <div>
                          <ul className="space-y-2 text-sm">
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
                      <div className="h-48 relative">
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie data={webEntryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="70%" outerRadius="90%" startAngle={90} endAngle={450} paddingAngle={2}>
                                      {webEntryData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
                                      ))}
                                  </Pie>
                              </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">TOP</p>
                              <p className="text-xl font-bold">{webEntryData.reduce((max, item) => item.value > max.value ? item : max, webEntryData[0]).name}</p>
                          </div>
                      </div>
                      <div>
                          <ul className="space-y-2 text-sm">
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
