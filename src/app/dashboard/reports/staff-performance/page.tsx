
'use client';

import React, { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
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
  Zap, 
  BarChart, 
  CircleDollarSign, 
  RotateCcw, 
  FileWarning, 
  History, 
  Eye, 
  Info,
  Sparkles,
  Clock,
  Activity,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const navigationItems = [
  { id: 'ai-overview', label: 'AI Overview', icon: Wand2 },
  { id: 'waiter-sales', label: 'Waiter Sales', icon: BarChart },
  { id: 'tips', label: 'Tips', icon: CircleDollarSign },
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

export default function StaffPerformancePage() {
  const [activeTab, setActiveTab] = useState('ai-overview');

  return (
    <>
      <DashboardHeader />
      <main className="flex h-[calc(100vh-4rem)] overflow-hidden bg-muted/30">
        {/* Secondary Internal Sidebar */}
        <aside className="w-64 border-r bg-white/50 backdrop-blur-sm p-4 flex flex-col gap-6 shrink-0">
          <div className="px-2">
            <h2 className="text-lg font-bold text-gray-900">Performance</h2>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Staff Analytics</p>
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

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Page Title Section */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Staff Performance</h1>
              <p className="text-muted-foreground text-sm">Real-time staff metrics, payment behavior, and AI insights.</p>
            </div>

            {/* AI Insight Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* AI Anomalies */}
              <Card className="relative overflow-hidden border-2 border-transparent bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
                        <ShieldAlert className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-sm font-bold">AI Anomalies</CardTitle>
                    </div>
                    <Badge className="bg-red-500 text-white border-0 text-[10px] px-2 h-5">High Risk</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Unusual unpaid balances, high refund frequency, and repeated partial payments detected.
                  </p>
                </CardContent>
              </Card>

              {/* AI Tip Insights */}
              <Card className="relative overflow-hidden border-2 border-transparent bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-green-50 text-green-600">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-sm font-bold">AI Tip Insights</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Tip presets can be optimized to increase earnings. Projected improvement: <span className="text-green-600 font-bold">+8.5%</span>.
                  </p>
                </CardContent>
              </Card>

              {/* AI Waiter Score */}
              <Card className="relative overflow-hidden border-2 border-transparent bg-white shadow-sm hover:shadow-md transition-shadow">
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

            {/* Quick Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Risky Tables</span>
                      <Info className="h-3 w-3 text-muted-foreground opacity-50" />
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
                      <Info className="h-3 w-3 text-muted-foreground opacity-50" />
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
                      <Info className="h-3 w-3 text-muted-foreground opacity-50" />
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

            {/* Notable AI Alerts Table Section */}
            <Card className="shadow-sm overflow-hidden border-0">
              <CardHeader className="bg-white border-b py-6 px-8">
                <CardTitle className="text-xl font-bold text-gray-900">Notable AI Alerts</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <TooltipProvider>
                  <Table>
                    <TableHeader className="bg-gray-50/50">
                      <TableRow className="border-b">
                        <TableHead className="px-8 h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            Type <Info className="h-3 w-3 opacity-50" />
                          </div>
                        </TableHead>
                        <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Timestamp</TableHead>
                        <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            Reference <Info className="h-3 w-3 opacity-50" />
                          </div>
                        </TableHead>
                        <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">
                           <div className="flex items-center justify-center gap-1.5">
                            Severity <Info className="h-3 w-3 opacity-50" />
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
                                "text-[10px] font-black px-3 h-6 rounded-full border-0",
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
                </TooltipProvider>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

