'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface GitErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
  onShowOutput?: () => void;
  onCancel?: () => void;
  onOpenLog?: () => void;
}

/**
 * A specialized dialog component that replicates the UI of a Git error modal.
 * Used for integration diagnostics in the dashboard.
 */
export function GitErrorDialog({
  open,
  onOpenChange,
  message = "Git: From https://github.com/nevinalcober26/mvp",
  onShowOutput,
  onCancel,
  onOpenLog,
}: GitErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-0 shadow-2xl rounded-2xl bg-white sm:rounded-2xl">
        <div className="p-12 flex items-start gap-8">
          {/* Error Icon: Red circle with white X */}
          <div className="shrink-0 pt-1">
            <div className="h-16 w-16 rounded-full bg-[#E54D47] flex items-center justify-center shadow-lg shadow-red-500/10">
              <X className="h-10 w-10 text-white" strokeWidth={3} />
            </div>
          </div>
          
          {/* Message Text Area */}
          <div className="flex-1 pt-3">
            <p className="text-[17px] font-medium text-gray-800 leading-snug">
              {message}
            </p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-12 pb-10 flex flex-row items-center justify-end gap-3">
          <Button 
            variant="outline" 
            className="h-11 px-6 bg-gray-100/40 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-100 transition-colors"
            onClick={onShowOutput}
          >
            Show Command Output
          </Button>
          <Button 
            variant="outline" 
            className="h-11 px-6 bg-gray-100/40 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-100 transition-colors"
            onClick={onCancel || (() => onOpenChange(false))}
          >
            Cancel
          </Button>
          <Button 
            className="h-11 px-8 bg-[#3460D1] hover:bg-[#2B50BF] text-white font-bold text-sm shadow-md ring-offset-white focus:ring-2 ring-[#3460D1] ring-offset-2 transition-all border-b-2 border-[#1E3A8A]"
            onClick={onOpenLog}
          >
            Open Git Log
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
