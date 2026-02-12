'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { DashboardHeader } from '@/components/dashboard/header';
import { Breadcrumbs } from '@/components/dashboard/breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  QrCode, 
  Download, 
  ExternalLink, 
  CheckCircle2,
  Printer,
  FileText,
  Upload,
  X,
  FileImage,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const BRAND_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Teal', value: '#18B4A6' },
  { name: 'Deep Forest', value: '#142424' },
  { name: 'Orange', value: '#fb923c' },
  { name: 'Purple', value: '#9333ea' },
];

export default function QrCodePage() {
  const { toast } = useToast();
  const [qrColor, setQrColor] = useState('#000000');
  const [qrType, setQrType] = useState('NORMAL QR');
  const [isHighErrorCorrection, setIsHighErrorCorrection] = useState(false);
  const [isBrandingEnabled, setIsBrandingEnabled] = useState(true);
  const [coupon, setCoupon] = useState('none');
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const breadcrumbItems = [
    { label: 'Operations' },
    { label: 'QR Studio' }
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const clearLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomLogo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = (format: string) => {
    setIsDownloadModalOpen(false);
    toast({
      title: "Exporting QR Code",
      description: `Your QR code is being prepared in ${format} format.`,
    });
  };

  return (
    <>
      <DashboardHeader />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/20 min-h-[calc(100vh-4rem)]">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <Breadcrumbs items={breadcrumbItems} />
              <h1 className="text-3xl font-bold tracking-tight text-foreground">QR Studio</h1>
              <p className="text-muted-foreground">
                Generate high-resolution QR codes for tables and menus.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-full border shadow-sm">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Live Preview Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Controls */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Step 1: Destination */}
              <Card className="shadow-sm border">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                      1
                    </div>
                    <div>
                      <CardTitle className="text-lg">Destination & Offers</CardTitle>
                      <CardDescription>Select where the QR leads and auto-apply deals.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">QR Type</Label>
                      <Select value={qrType} onValueChange={setQrType}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NORMAL QR">Normal QR</SelectItem>
                          <SelectItem value="TABLE QR">Table QR</SelectItem>
                          <SelectItem value="ROOM QR">Room QR</SelectItem>
                          <SelectItem value="ALPHANUMERIC QR">Alphanumeric QR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Auto Apply Coupon</Label>
                      <Select value={coupon} onValueChange={setCoupon}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select a coupon" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">---------</SelectItem>
                          <SelectItem value="welcome10">WELCOME10 - 10% Off</SelectItem>
                          <SelectItem value="summer25">SUMMER25 - 25% Off</SelectItem>
                          <SelectItem value="free_drink">FREEDRINK - Free Beverage</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Select a coupon that you'd like to auto apply when using the QR code.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Styling */}
              <Card className="shadow-sm border">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                      2
                    </div>
                    <div>
                      <CardTitle className="text-lg">Style & Quality</CardTitle>
                      <CardDescription>Customize the appearance and resolution durability.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Brand Palette</Label>
                    <div className="flex flex-wrap items-center gap-3">
                      {BRAND_COLORS.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setQrColor(color.value)}
                          className={cn(
                            "group relative flex items-center justify-center h-10 w-10 rounded-full transition-all border-2",
                            qrColor === color.value ? "border-primary scale-110 shadow-md" : "border-transparent hover:border-muted-foreground/30"
                          )}
                          style={{ backgroundColor: color.value }}
                        >
                          {qrColor === color.value && <CheckCircle2 className="h-4 w-4 text-white" />}
                        </button>
                      ))}
                      
                      <div className="h-6 w-px bg-border mx-1" />
                      
                      <div className="flex items-center gap-2 bg-muted/50 pl-2 pr-3 py-1 rounded-full border transition-all">
                        <div className="relative h-6 w-6 rounded-full overflow-hidden border shadow-sm">
                          <input 
                            type="color" 
                            value={qrColor}
                            onChange={(e) => setQrColor(e.target.value)}
                            className="absolute inset-[-50%] h-[200%] w-[200%] cursor-pointer bg-transparent"
                          />
                        </div>
                        <span className="font-mono text-[10px] font-bold uppercase">{qrColor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div 
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer",
                        isHighErrorCorrection ? "bg-primary/5 border-primary/20" : "bg-background border-border hover:border-muted-foreground/20"
                      )}
                      onClick={() => setIsHighErrorCorrection(!isHighErrorCorrection)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center transition-colors", isHighErrorCorrection ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                          <Printer className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">High Error Correction</p>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase">Maximum Durability</p>
                        </div>
                      </div>
                      <Switch checked={isHighErrorCorrection} />
                    </div>

                    <div 
                      className={cn(
                        "flex flex-col gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer",
                        isBrandingEnabled ? "bg-primary/5 border-primary/20" : "bg-background border-border hover:border-muted-foreground/20"
                      )}
                      onClick={() => setIsBrandingEnabled(!isBrandingEnabled)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center transition-colors", isBrandingEnabled ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                            <FileImage className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">Add Branding</p>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase">Overlay Logo</p>
                          </div>
                        </div>
                        <Switch checked={isBrandingEnabled} />
                      </div>

                      {isBrandingEnabled && (
                        <div className="pt-3 border-t flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-md border bg-white flex items-center justify-center overflow-hidden">
                              {customLogo ? (
                                <Image src={customLogo} alt="Custom Logo" width={40} height={40} className="object-contain" />
                              ) : (
                                <Upload className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <p className="text-xs font-bold text-foreground">
                              {customLogo ? 'Custom Logo Loaded' : 'No custom logo set'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="file" 
                              ref={fileInputRef} 
                              className="hidden" 
                              accept="image/*" 
                              onChange={handleLogoUpload} 
                            />
                            <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase" onClick={triggerUpload}>
                              {customLogo ? 'Change' : 'Upload Logo'}
                            </Button>
                            {customLogo && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={clearLogo}>
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button 
                  onClick={() => setIsDownloadModalOpen(true)}
                  className="h-12 px-8 rounded-xl font-bold transition-all shadow-md flex-1 w-full sm:w-auto"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download QR Code
                </Button>
              </div>

            </div>

            {/* Preview */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 space-y-6">
                <Card className="overflow-hidden border shadow-lg">
                  <div className="bg-muted/30 p-4 border-b flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Live Preview</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-primary">{isHighErrorCorrection ? '300 DPI' : '72 DPI'}</span>
                    </div>
                  </div>
                  <CardContent className="p-10 flex flex-col items-center gap-8 bg-background">
                    
                    <div className="relative p-8 bg-white rounded-2xl border shadow-sm group transition-all hover:shadow-md">
                      <QrCode 
                        className="h-56 w-56 transition-colors duration-300" 
                        style={{ color: qrColor }}
                        strokeWidth={1.5}
                      />
                      {/* Logo Branding Overlay */}
                      {isBrandingEnabled && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white p-1 rounded-full shadow-sm border border-muted animate-in fade-in zoom-in duration-300">
                            <div className="h-12 w-12 rounded-full overflow-hidden relative">
                              <Image
                                src={customLogo || "https://picsum.photos/seed/brand/100/100"}
                                fill
                                alt="Brand logo"
                                className={cn("object-cover", !customLogo && "grayscale brightness-110")}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="w-full space-y-3">
                      <div className="flex items-center gap-2 px-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wide text-foreground">Verified Destination</span>
                      </div>
                      <div className="flex items-center bg-muted/50 rounded-lg border px-4 h-11">
                        <ExternalLink className="h-4 w-4 text-primary shrink-0 mr-3" />
                        <p className="text-xs font-semibold truncate text-muted-foreground">
                          bloomsburys.menu/table/rak-05{coupon !== 'none' ? `?c=${coupon}` : ''}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="p-4 rounded-xl border bg-primary/5 border-primary/10 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">Pro Tip</p>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      Use **High Error Correction** for stickers or tabletop displays that may experience wear and tear over time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Download Format Modal */}
      <Dialog open={isDownloadModalOpen} onOpenChange={setIsDownloadModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold">Download QR Code</DialogTitle>
            <DialogDescription>
              Select your preferred high-resolution format for menu integration or physical printing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-3 gap-4 py-6">
            <button 
              onClick={() => handleDownload('PNG')}
              className="flex flex-col items-center gap-4 p-6 rounded-2xl border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all group shadow-sm hover:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                <FileImage className="h-7 w-7" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">PNG</p>
                <p className="text-[10px] uppercase font-black tracking-[0.1em] text-muted-foreground/60 mt-1">Image</p>
              </div>
            </button>

            <button 
              onClick={() => handleDownload('SVG')}
              className="flex flex-col items-center gap-4 p-6 rounded-2xl border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all group shadow-sm hover:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                <Layers className="h-7 w-7" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">SVG</p>
                <p className="text-[10px] uppercase font-black tracking-[0.1em] text-muted-foreground/60 mt-1">Vector</p>
              </div>
            </button>

            <button 
              onClick={() => handleDownload('PDF')}
              className="flex flex-col items-center gap-4 p-6 rounded-2xl border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all group shadow-sm hover:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-7 w-7" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">PDF</p>
                <p className="text-[10px] uppercase font-black tracking-[0.1em] text-muted-foreground/60 mt-1">Document</p>
              </div>
            </button>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="ghost" className="w-full font-bold uppercase tracking-widest text-[10px] h-11" onClick={() => setIsDownloadModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
