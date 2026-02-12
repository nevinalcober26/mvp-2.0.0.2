'use client';

import React from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { Breadcrumbs } from '@/components/dashboard/breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Download, Printer, Plus, Settings } from 'lucide-react';

export default function QrCodePage() {
  const breadcrumbItems = [
    { label: 'Operations' },
    { label: 'QR Code' }
  ];

  return (
    <>
      <DashboardHeader />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/30 min-h-[calc(100vh-4rem)]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Breadcrumbs items={breadcrumbItems} />
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">QR Code Management</h1>
              <p className="text-muted-foreground mt-1">
                Generate and manage QR codes for tables and digital menus.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2 font-semibold">
                <Settings className="h-4 w-4" />
                Configure
              </Button>
              <Button className="gap-2 font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-5 w-5" />
                Generate New Code
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Digital Menu QR</CardTitle>
                <CardDescription>Main QR code for customers to view the menu on their devices.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12 bg-background rounded-b-lg border-t">
                <div className="relative p-8 bg-white border-8 border-gray-100 rounded-[2rem] shadow-xl mb-8 group transition-all hover:scale-105">
                  <QrCode className="h-48 w-48 text-gray-900" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-[1.5rem]">
                    <Button variant="outline" size="sm" className="font-bold">Preview</Button>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download PNG
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Printer className="h-4 w-4" />
                    Print Sticker
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Quick Insights</CardTitle>
                <CardDescription>QR code performance today.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 flex-grow">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary/60 mb-1">Total Scans Today</p>
                  <p className="text-3xl font-black text-primary">1,284</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 border">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Active Table QRs</p>
                  <p className="text-3xl font-black text-foreground">24</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 border">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Top Performing Table</p>
                  <p className="text-3xl font-black text-foreground">T5</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
