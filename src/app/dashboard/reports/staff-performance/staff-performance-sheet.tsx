'use client';

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

import { StaffPerformanceSidebar } from './sidebar';
import { AiInsightsStrip } from './ai-insights-strip';
import { AiOverview } from './ai-overview';
import { WaiterSales } from './waiter-sales';
import { Tips } from './tips';
import { Turnover } from './turnover';
import { Balances } from './balances';
import { ShiftSummary } from './shift-summary';
import { Leakage } from './leakage';

interface StaffPerformanceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StaffPerformanceSheet({ open, onOpenChange }: StaffPerformanceSheetProps) {
  const [activeSection, setActiveSection] = useState('ai-overview');

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-[90vw] sm:max-w-[90vw] p-0"
        side="right"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 border-b">
            <div className="flex justify-between items-center">
                <div>
                    <SheetTitle className="text-2xl">Staff Performance</SheetTitle>
                    <SheetDescription>Real-time staff metrics, payment behavior, and AI insights.</SheetDescription>
                </div>
                 <SheetClose asChild>
                    <Button variant="ghost" size="icon">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                    </Button>
                </SheetClose>
            </div>
          </SheetHeader>

          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar */}
            <div className="w-[220px] flex-shrink-0 border-r bg-muted/20 overflow-y-auto">
              <StaffPerformanceSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            </div>
            
            {/* Right Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="sticky top-0 bg-background/95 backdrop-blur z-10 p-6 border-b">
                <AiInsightsStrip />
              </div>
              <div className="p-6 space-y-6">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
