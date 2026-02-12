'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronRight, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type Step = {
  targetId: string;
  title: string;
  content: string;
  placement: 'right' | 'left' | 'top' | 'bottom';
};

const TUTORIAL_STEPS: Step[] = [
  {
    targetId: 'sidebar-nav',
    title: 'Navigation Modules',
    content: 'Explore all your management modules from Settings to Integrations right here.',
    placement: 'right',
  },
  {
    targetId: 'branch-switcher',
    title: 'Multi-Outlet Control',
    content: 'Switch between your different branches instantly using our premium switcher.',
    placement: 'right',
  },
  {
    targetId: 'global-search',
    title: 'Universal Search',
    content: 'Find any order, customer, or menu item across your entire workspace in seconds.',
    placement: 'bottom',
  },
  {
    targetId: 'header-actions',
    title: 'Stay Updated',
    content: 'Access real-time alerts, system notifications, and manage your account profile here.',
    placement: 'left',
  },
  {
    targetId: 'welcome-banner',
    title: 'AI Pulse',
    content: 'Your AI assistant provides a daily summary of outlet performance and operational health.',
    placement: 'bottom',
  },
  {
    targetId: 'stat-cards',
    title: 'Metrics at a Glance',
    content: 'Monitor your key performance indicators and sales trends in real-time.',
    placement: 'top',
  },
];

export function OnboardingTutorial() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1); // -1 is welcome dialog
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Show tutorial only if tutorial=true is in URL
    if (searchParams.get('tutorial') === 'true') {
      setIsOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (currentStep >= 0 && currentStep < TUTORIAL_STEPS.length) {
      updatePopoverPosition();
      // Listen for window resize to reposition
      window.addEventListener('resize', updatePopoverPosition);
      return () => window.removeEventListener('resize', updatePopoverPosition);
    }
  }, [currentStep]);

  const updatePopoverPosition = () => {
    if (currentStep < 0) return;
    const step = TUTORIAL_STEPS[currentStep];
    const element = document.getElementById(step.targetId);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      let top = 0;
      let left = 0;
      const offset = 16;

      switch (step.placement) {
        case 'right':
          top = rect.top + scrollY + rect.height / 2;
          left = rect.right + scrollX + offset;
          break;
        case 'left':
          top = rect.top + scrollY + rect.height / 2;
          left = rect.left + scrollX - offset;
          break;
        case 'bottom':
          top = rect.bottom + scrollY + offset;
          left = rect.left + scrollX + rect.width / 2;
          break;
        case 'top':
          top = rect.top + scrollY - offset;
          left = rect.left + scrollX + rect.width / 2;
          break;
      }

      setPopoverStyle({
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        transform: step.placement === 'right' || step.placement === 'left' 
          ? 'translateY(-50%)' 
          : 'translateX(-50%)',
        zIndex: 100,
      });

      // Scroll element into view if needed
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsOpen(false);
    setCurrentStep(-1);
    // Remove query param from URL
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('tutorial');
    router.replace(`/dashboard?${newParams.toString()}`);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Welcome Dialog */}
      <Dialog open={isOpen && currentStep === -1} onOpenChange={handleSkip}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl rounded-[32px] bg-white text-center">
          <div className="bg-primary/5 p-10 flex flex-col items-center space-y-6">
            <div className="h-20 w-20 rounded-[24px] bg-primary flex items-center justify-center shadow-lg transform rotate-3">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Welcome to eMenu Dashboard
              </DialogTitle>
              <p className="text-sm font-medium text-gray-400">
                Let's take a quick 1-minute tour of your new workspace.
              </p>
            </div>
          </div>

          <div className="p-10 space-y-4">
            <Button 
              className="w-full h-14 font-black uppercase tracking-widest bg-primary text-white hover:bg-primary/90 shadow-xl rounded-2xl text-base group"
              onClick={() => setCurrentStep(0)}
            >
              Start the Tour
              <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="ghost" className="w-full font-bold text-muted-foreground" onClick={handleSkip}>
              Skip, I'm an expert
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tutorial Popover */}
      {currentStep >= 0 && currentStep < TUTORIAL_STEPS.length && (
        <div style={popoverStyle} ref={popoverRef} className="animate-in fade-in zoom-in duration-300">
          <div className="w-72 bg-[#142424] text-white p-6 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 relative">
            {/* Arrow indicator */}
            <div className={cn(
              "absolute w-4 h-4 bg-[#142424] rotate-45 border-white/10",
              TUTORIAL_STEPS[currentStep].placement === 'right' && "-left-2 top-1/2 -translate-y-1/2 border-l border-b",
              TUTORIAL_STEPS[currentStep].placement === 'left' && "-right-2 top-1/2 -translate-y-1/2 border-r border-t",
              TUTORIAL_STEPS[currentStep].placement === 'bottom' && "-top-2 left-1/2 -translate-x-1/2 border-l border-t",
              TUTORIAL_STEPS[currentStep].placement === 'top' && "-bottom-2 left-1/2 -translate-x-1/2 border-r border-b",
            )} />
            
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#18B4A6]">
                Step {currentStep + 1} of {TUTORIAL_STEPS.length}
              </span>
              <button onClick={handleSkip} className="text-white/40 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <h3 className="text-lg font-bold mb-2 tracking-tight">
              {TUTORIAL_STEPS[currentStep].title}
            </h3>
            <p className="text-sm text-gray-400 font-medium leading-relaxed mb-6">
              {TUTORIAL_STEPS[currentStep].content}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {TUTORIAL_STEPS.map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-1 rounded-full transition-all", 
                      i === currentStep ? "w-4 bg-[#18B4A6]" : "w-1.5 bg-white/20"
                    )} 
                  />
                ))}
              </div>
              <Button 
                size="sm" 
                className="bg-[#18B4A6] hover:bg-[#149d94] text-white font-bold rounded-xl px-4"
                onClick={handleNext}
              >
                {currentStep === TUTORIAL_STEPS.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for tutorial */}
      {currentStep >= 0 && (
        <div className="fixed inset-0 z-[90] bg-black/20 pointer-events-none" />
      )}
    </>
  );
}
