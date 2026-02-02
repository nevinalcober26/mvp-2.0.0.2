'use client';

import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { useSidebar } from '@/components/ui/sidebar';

import { StaffPerformanceSidebar } from './sidebar';
import { AiInsightsStrip } from './ai-insights-strip';
import { AiOverview } from './ai-overview';
import { WaiterSales } from './waiter-sales';
import { Tips } from './tips';
import { Turnover } from './turnover';
import { Balances } from './balances';
import { ShiftSummary } from './shift-summary';
import { Leakage } from './leakage';

export default function StaffPerformancePage() {
  const [activeSection, setActiveSection] = useState('ai-overview');
  const { setOpen, isMobile } = useSidebar();

  // Effect to collapse the main sidebar for a focused view on desktop,
  // and restore it when leaving the page.
  useEffect(() => {
    if (!isMobile) {
      setOpen(false);
    }
    return () => {
      if (!isMobile) {
        setOpen(true);
      }
    };
  }, [setOpen, isMobile]);

  const renderContent = () => {
    switch (activeSection) {
      case 'ai-overview':
        return <AiOverview />;
      case 'waiter-sales':
        return <WaiterSales />;
      case 'tips':
        return <Tips />;
      case 'turnover':
        return <Turnover />;
      case 'balances':
        return <Balances />;
      case 'shift-summary':
        return <ShiftSummary />;
      case 'leakage':
        return <Leakage />;
      default:
        return <AiOverview />;
    }
  };

  return (
    <>
      <DashboardHeader />
      <div className="flex">
        {/* Left Sidebar for staff performance sections */}
        <div className="w-[240px] flex-shrink-0 border-r bg-muted/40">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="p-4 pt-6">
                <h2 className="text-lg font-semibold tracking-tight">Performance</h2>
                <p className="text-sm text-muted-foreground">Staff Analytics</p>
            </div>
            <StaffPerformanceSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
          </div>
        </div>
        
        {/* Right Content */}
        <div className="flex-1">
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Staff Performance</h1>
                        <p className="text-muted-foreground">Real-time staff metrics, payment behavior, and AI insights.</p>
                    </div>
                </div>
              <AiInsightsStrip />
              {renderContent()}
            </div>
        </div>
      </div>
    </>
  );
}
