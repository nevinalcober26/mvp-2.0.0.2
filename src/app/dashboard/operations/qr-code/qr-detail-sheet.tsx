'use client';

import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  UploadCloud,
  Download,
  FileCode,
  X,
  QrCode,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface QrDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: any | null;
}

export function QrDetailSheet({ open, onOpenChange, table }: QrDetailSheetProps) {
  const [logoSize, setLogoSize] = useState([250]);
  const [qrSize, setQrSize] = useState([250]);
  const [qrMargin, setQrMargin] = useState([250]);
  const [qrColor, setQrColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (table) {
      setIsActive(table.status === 'Active');
    }
  }, [table]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-5xl w-full p-0 flex flex-col bg-white overflow-hidden border-l shadow-2xl">
        {/* Absolute top-left close button as per design */}
        <button 
          onClick={() => onOpenChange(false)}
          className="absolute top-6 left-6 z-50 h-10 w-10 rounded-full bg-[#18B4A6] flex items-center justify-center text-white shadow-lg hover:bg-[#149d94] transition-all"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Side: Form Controls */}
          <div className="flex-1 flex flex-col border-r bg-white pl-20">
            <SheetHeader className="p-8 pb-4 text-left">
              <SheetTitle className="text-2xl font-black text-[#142424]">Generate New QR Code</SheetTitle>
              <SheetDescription className="text-sm font-medium text-muted-foreground">Create a new QR code for the table.</SheetDescription>
            </SheetHeader>

            <ScrollArea className="flex-1 px-8">
              <div className="space-y-10 pb-20">
                {/* Table Details Section */}
                <section className="space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-[0.15em] text-[#142424]">Table Details</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500">Table Name/Number</Label>
                      <Select defaultValue={table?.name || ""}>
                        <SelectTrigger className="h-12 bg-white border-muted rounded-xl px-4 font-medium">
                          <SelectValue placeholder="Select a table or Create New" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="T1">Table 1</SelectItem>
                          <SelectItem value="T2">Table 2</SelectItem>
                          <SelectItem value="T12">Table 12</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border-2 border-blue-50 flex items-center justify-between shadow-sm">
                      <div className="space-y-1">
                        <p className="text-[15px] font-bold text-[#142424]">Status</p>
                        <p className="text-xs text-muted-foreground font-medium">Active tables can be scanned by customers.</p>
                      </div>
                      <Switch 
                        checked={isActive} 
                        onCheckedChange={setIsActive}
                        className="data-[state=checked]:bg-[#18B4A6]"
                      />
                    </div>
                  </div>
                </section>

                {/* QR Customization Section */}
                <section className="space-y-8">
                  <h3 className="text-sm font-black uppercase tracking-[0.15em] text-[#142424]">QR Customization</h3>
                  
                  {/* Logo Upload */}
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-gray-500">Logo</Label>
                    <div className="h-40 w-full rounded-2xl border-2 border-dashed border-blue-100 bg-[#f8fbff] flex flex-col items-center justify-center gap-3 group hover:border-[#18B4A6] cursor-pointer transition-all">
                      <div className="h-10 w-10 rounded-full bg-[#18B4A6] flex items-center justify-center text-white shadow-md">
                        <UploadCloud className="h-5 w-5" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-[#142424]">Click to upload logo</p>
                        <p className="text-[11px] text-gray-400 font-medium">PNG, JPG or SVG (max. 2MB)</p>
                      </div>
                    </div>
                  </div>

                  {/* Sliders */}
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold text-gray-500">Logo Size</Label>
                        <span className="text-xs font-black text-[#18B4A6] bg-teal-50 px-3 py-1 rounded-md border border-teal-100">{logoSize}px</span>
                      </div>
                      <Slider 
                        value={logoSize} 
                        onValueChange={setLogoSize} 
                        max={500} 
                        step={1} 
                        className="[&_[role=slider]]:bg-[#18B4A6] [&_[role=slider]]:border-[#18B4A6]" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500">Logo Background Color</Label>
                      <div className="flex h-12 w-full items-center gap-3 px-3 border border-muted rounded-xl bg-white">
                        <div className="h-7 w-12 rounded border" style={{ backgroundColor: '#FFFFFF' }} />
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">#FFFFFF</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold text-gray-500">QR Size</Label>
                        <span className="text-xs font-black text-[#18B4A6] bg-teal-50 px-3 py-1 rounded-md border border-teal-100">{qrSize}px</span>
                      </div>
                      <Slider 
                        value={qrSize} 
                        onValueChange={setQrSize} 
                        max={1000} 
                        step={10} 
                        className="[&_[role=slider]]:bg-[#18B4A6] [&_[role=slider]]:border-[#18B4A6]" 
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold text-gray-500">QR Margin</Label>
                        <span className="text-xs font-black text-[#18B4A6] bg-teal-50 px-3 py-1 rounded-md border border-teal-100">{qrMargin}px</span>
                      </div>
                      <Slider 
                        value={qrMargin} 
                        onValueChange={setQrMargin} 
                        max={500} 
                        step={1} 
                        className="[&_[role=slider]]:bg-[#18B4A6] [&_[role=slider]]:border-[#18B4A6]" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2 text-left">
                        <Label className="text-xs font-bold text-gray-500">QR Color</Label>
                        <div className="flex h-12 items-center gap-3 px-3 border border-muted rounded-xl bg-white overflow-hidden">
                          <input 
                            type="color" 
                            value={qrColor} 
                            onChange={(e) => setQrColor(e.target.value)}
                            className="h-7 w-8 shrink-0 cursor-pointer p-0 border-0 bg-transparent"
                          />
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{qrColor}</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-left">
                        <Label className="text-xs font-bold text-gray-500">QR Background Color</Label>
                        <div className="flex h-12 items-center gap-3 px-3 border border-muted rounded-xl bg-white overflow-hidden">
                          <input 
                            type="color" 
                            value={bgColor} 
                            onChange={(e) => setBgColor(e.target.value)}
                            className="h-7 w-8 shrink-0 cursor-pointer p-0 border-0 bg-transparent"
                          />
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{bgColor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </ScrollArea>

            <SheetFooter className="p-8 border-t bg-gray-50 flex flex-row gap-3">
              <Button 
                variant="outline" 
                className="flex-1 h-12 rounded-xl font-bold border-muted-foreground/20 text-gray-700 bg-white"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-[2] h-12 rounded-xl font-black uppercase tracking-widest bg-[#18B4A6] hover:bg-[#149d94] text-white shadow-xl shadow-[#18B4A6]/20"
              >
                Create QR Code
              </Button>
            </SheetFooter>
          </div>

          {/* Right Side: Live Preview */}
          <div className="w-[400px] bg-[#f8fbff] flex flex-col p-10 gap-10 items-center justify-center shrink-0">
            <h2 className="text-2xl font-black text-[#142424]">Live Preview</h2>
            
            <div className="relative">
              {/* QR Code Container as per design */}
              <Card className="w-72 aspect-square rounded-[32px] bg-white shadow-2xl flex flex-col items-center justify-center p-8 gap-6 border-0">
                <div className="relative w-full aspect-square flex items-center justify-center">
                   <QrCode className="w-full h-full text-black" strokeWidth={1.5} style={{ color: qrColor }} />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-10 w-10 rounded-lg bg-black border-4 border-white flex items-center justify-center text-white">
                         <div className="h-4 w-4 bg-white rounded-sm transform rotate-45 flex items-center justify-center">
                            <div className="h-2 w-2 bg-black rounded-full" />
                         </div>
                      </div>
                   </div>
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#142424]">Scan for Menu</span>
              </Card>
            </div>

            <div className="w-72 flex gap-3">
              <Button className="flex-1 h-12 rounded-xl bg-[#18B4A6] text-white font-bold gap-2 text-xs">
                <Download className="h-4 w-4" /> PNG
              </Button>
              <Button variant="outline" className="flex-1 h-12 rounded-xl bg-white border-muted font-bold gap-2 text-xs text-gray-700">
                <FileCode className="h-4 w-4" /> SVG
              </Button>
            </div>

            <p className="text-[11px] text-gray-400 font-medium text-center max-w-[200px] leading-relaxed">
              Preview updates automatically as you make changes.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
