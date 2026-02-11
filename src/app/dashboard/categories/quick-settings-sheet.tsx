'use client';

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Store, 
  ShoppingBag, 
  QrCode, 
  Gift, 
  Bell, 
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuickSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: {
    id: string;
    name: string;
    status: 'Open' | 'Closed';
  } | null;
}

export function QuickSettingsSheet({
  open,
  onOpenChange,
  restaurant,
}: QuickSettingsSheetProps) {
  const { toast } = useToast();

  if (!restaurant) return null;

  const handleSave = () => {
    toast({
      title: "Settings Updated",
      description: `Quick settings for ${restaurant.name} have been saved successfully.`,
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 border-b bg-muted/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <SheetTitle className="text-xl">Quick Settings</SheetTitle>
            </div>
            <SheetDescription className="text-base font-medium text-foreground">
              {restaurant.name}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Operational Status</h3>
              
              <Card className="border-2">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Store className="h-5 w-5 text-muted-foreground" />
                      <div className="grid gap-0.5">
                        <Label htmlFor="status" className="font-bold">Branch Open</Label>
                        <p className="text-xs text-muted-foreground">Set if this branch is currently taking orders.</p>
                      </div>
                    </div>
                    <Switch id="status" defaultChecked={restaurant.status === 'Open'} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Order Channels</h3>
              
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                    <div className="grid gap-0.5">
                      <Label htmlFor="online-orders" className="font-bold">Online Ordering</Label>
                      <p className="text-xs text-muted-foreground">Enable web & mobile app ordering.</p>
                    </div>
                  </div>
                  <Switch id="online-orders" defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <QrCode className="h-5 w-5 text-muted-foreground" />
                    <div className="grid gap-0.5">
                      <Label htmlFor="table-orders" className="font-bold">Table Ordering</Label>
                      <p className="text-xs text-muted-foreground">Allow customers to order via QR codes.</p>
                    </div>
                  </div>
                  <Switch id="table-orders" defaultChecked />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Features & Alerts</h3>
              
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <Gift className="h-5 w-5 text-muted-foreground" />
                    <div className="grid gap-0.5">
                      <Label htmlFor="loyalty" className="font-bold">Loyalty Program</Label>
                      <p className="text-xs text-muted-foreground">Enable points collection at this branch.</p>
                    </div>
                  </div>
                  <Switch id="loyalty" defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <div className="grid gap-0.5">
                      <Label htmlFor="notifications" className="font-bold">Staff Notifications</Label>
                      <p className="text-xs text-muted-foreground">Alert staff for new incoming orders.</p>
                    </div>
                  </div>
                  <Switch id="notifications" defaultChecked />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-orange-50 border border-orange-100 flex items-start gap-3">
              <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-orange-900">Auto-Close Warning</p>
                <p className="text-xs text-orange-800">
                  This branch is set to automatically close orders at 11:30 PM. You can change this in full settings.
                </p>
              </div>
            </div>
          </div>

          <SheetFooter className="p-6 border-t bg-background">
            <div className="flex gap-3 w-full">
              <SheetClose asChild>
                <Button variant="outline" className="flex-1">Cancel</Button>
              </SheetClose>
              <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                Save Changes
              </Button>
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
