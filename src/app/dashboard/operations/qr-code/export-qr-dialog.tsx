'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExportQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableCount: number;
  onExport: (format: 'PDF' | 'ZIP') => void;
}

const PDFIcon = () => (
  <div className="relative h-16 w-16 rounded-xl flex items-center justify-center bg-[#E54D47] shadow-lg shadow-red-500/20 transition-all duration-300 group-hover:scale-110">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
    </svg>
    <span className="absolute bottom-2 right-2 text-[8px] font-black bg-white text-[#E54D47] px-1 rounded-sm">PDF</span>
  </div>
);

const ZIPIcon = () => (
  <div className="relative h-16 w-16 rounded-xl flex items-center justify-center bg-[#F79E1B] shadow-lg shadow-orange-500/20 transition-all duration-300 group-hover:scale-110">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <circle cx="12" cy="18" r="2" />
        <line x1="12" y1="12" x2="12" y2="16" />
    </svg>
    <div className="absolute bottom-2 right-2 bg-white rounded-sm px-0.5">
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#F79E1B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        </svg>
    </div>
  </div>
);

export function ExportQrDialog({ open, onOpenChange, tableCount, onExport }: ExportQrDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-visible border-0 shadow-2xl rounded-[32px] bg-white">
        {/* Top Teal Accent Bar */}
        <div className="h-2 w-full bg-[#0CB5A8] shrink-0 rounded-t-[32px]" />
        
        {/* Floating Top-Left Close Button */}
        <button 
          onClick={() => onOpenChange(false)}
          className="absolute -top-5 -left-5 z-50 h-12 w-12 rounded-full bg-[#0CB5A8] flex items-center justify-center text-white shadow-xl hover:bg-[#0aa392] transition-all border-4 border-white"
        >
          <X className="h-6 w-6" strokeWidth={3} />
        </button>

        <div className="px-10 pt-12 pb-8 space-y-8 text-left">
          <div className="space-y-3">
            <DialogTitle className="text-3xl font-black tracking-tight text-[#142424]">
              Choose Download Format
            </DialogTitle>
            <DialogDescription className="text-[15px] font-medium text-gray-500 leading-relaxed">
              You are about to download QR codes for <span className="inline-flex items-center justify-center bg-[#E6F7F6] text-[#0CB5A8] px-2.5 py-0.5 rounded-md font-black text-sm mx-0.5">{tableCount} table(s)</span>. Select your preferred format to continue.
            </DialogDescription>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Download as PDF Card */}
            <button
              onClick={() => onExport('PDF')}
              className="group flex flex-col items-center gap-4 p-12 rounded-[28px] border-2 border-gray-100 bg-white hover:border-primary/20 hover:shadow-xl transition-all duration-300 outline-none"
            >
              <PDFIcon />
              <div className="space-y-1 text-center">
                <p className="text-lg font-black text-[#142424]">Download as PDF</p>
                <p className="text-sm font-medium text-gray-400">Perfect for printing & sharing</p>
              </div>
            </button>

            {/* Download as ZIP Card */}
            <button
              onClick={() => onExport('ZIP')}
              className="group flex flex-col items-center gap-4 p-12 rounded-[28px] border-2 border-gray-100 bg-white hover:border-primary/20 hover:shadow-xl transition-all duration-300 outline-none"
            >
              <ZIPIcon />
              <div className="space-y-1 text-center">
                <p className="text-lg font-black text-[#142424]">Download as ZIP</p>
                <p className="text-sm font-medium text-gray-400">Individual PNG image files</p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-6 bg-[#F7F9FB] rounded-b-[32px] flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-[#0CB5A8] flex items-center justify-center">
                <Info className="h-3 w-3 text-white fill-white" />
            </div>
            <span className="text-sm font-medium text-gray-400">Select a format to proceed</span>
          </div>
          <Button 
            variant="outline" 
            className="h-12 px-10 bg-white border-gray-200 text-gray-700 font-black rounded-xl hover:bg-gray-50 text-sm shadow-sm transition-all"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
