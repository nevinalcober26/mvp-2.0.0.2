'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, FileText, FolderArchive, Info, FileCode } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExportQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableCount: number;
  onExport: (format: 'PDF' | 'ZIP') => void;
}

/**
 * A pixel-perfect implementation of the QR Export Format selector.
 * Replicates the teal header, floating close button, and card-based format selection.
 */
export function ExportQrDialog({ open, onOpenChange, tableCount, onExport }: ExportQrDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden border-0 shadow-2xl rounded-[32px] bg-white">
        {/* Top Teal Accent Bar */}
        <div className="h-2 w-full bg-[#18B4A6] shrink-0" />
        
        {/* Floating Top-Left Close Button */}
        <button 
          onClick={() => onOpenChange(false)}
          className="absolute -top-3 -left-3 z-50 h-12 w-12 rounded-full bg-[#18B4A6] flex items-center justify-center text-white shadow-lg hover:bg-[#149d94] transition-all border-4 border-white"
        >
          <X className="h-6 w-6" strokeWidth={3} />
        </button>

        <div className="p-10 pt-12 space-y-10 text-left">
          <div className="space-y-3">
            <DialogTitle className="text-[32px] font-black tracking-tight text-[#142424]">
              Choose Download Format
            </DialogTitle>
            <DialogDescription className="text-base font-medium text-gray-500 leading-relaxed flex items-center flex-wrap gap-x-1.5">
              You are about to download QR codes for 
              <span className="bg-[#f0fdfa] text-[#18B4A6] px-2.5 py-0.5 rounded-md font-black text-sm">
                {tableCount} table(s)
              </span>
              . Select your preferred format to continue.
            </DialogDescription>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Download as PDF Card */}
            <button
              onClick={() => onExport('PDF')}
              className="group flex flex-col items-center gap-5 p-10 rounded-[28px] border-2 border-gray-100 bg-white hover:border-[#18B4A6]/20 hover:shadow-xl transition-all duration-300 outline-none text-center"
            >
              <div className="relative h-20 w-20 rounded-2xl flex items-center justify-center bg-[#E54D47] shadow-lg shadow-red-500/20 transition-all duration-300 group-hover:scale-110">
                <FileText className="h-10 w-10 text-white" />
                <span className="absolute bottom-1.5 right-1.5 text-[10px] font-black bg-white text-[#E54D47] px-1 rounded-sm">PDF</span>
              </div>
              <div className="space-y-1">
                <p className="text-xl font-black text-[#142424]">Download as PDF</p>
                <p className="text-sm font-medium text-gray-400">Perfect for printing & sharing</p>
              </div>
            </button>

            {/* Download as ZIP Card */}
            <button
              onClick={() => onExport('ZIP')}
              className="group flex flex-col items-center gap-5 p-10 rounded-[28px] border-2 border-gray-100 bg-white hover:border-[#18B4A6]/20 hover:shadow-xl transition-all duration-300 outline-none text-center"
            >
              <div className="relative h-20 w-20 rounded-2xl flex items-center justify-center bg-[#F39C12] shadow-lg shadow-orange-500/20 transition-all duration-300 group-hover:scale-110">
                <div className="relative flex items-center justify-center">
                   <FolderArchive className="h-10 w-10 text-white" />
                   <FileCode className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-[#F39C12]" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xl font-black text-[#142424]">Download as ZIP</p>
                <p className="text-sm font-medium text-gray-400">Individual PNG image files</p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer with info and cancel */}
        <div className="p-8 pt-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#18B4A6]">
            <Info className="h-4 w-4" fill="currentColor" className="text-white bg-[#18B4A6] rounded-full p-0.5" />
            <span className="text-gray-500 font-medium">Select a format to proceed</span>
          </div>
          <Button 
            variant="outline" 
            className="h-12 px-10 bg-white border-gray-200 text-gray-700 font-black rounded-xl hover:bg-gray-50 text-sm shadow-sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
