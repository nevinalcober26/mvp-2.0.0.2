'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/header';
import { Breadcrumbs } from '@/components/dashboard/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Info,
  Clock,
  Rocket,
  Save,
  ArrowLeft,
  Copy,
  RotateCcw,
  Plus,
  Trash2,
  HelpCircle,
  CalendarDays
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const cuisines = ['Italian', 'Boutique Café', 'Signature Store', 'Japanese', 'Mexican', 'Indian', 'French'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TIME_OPTIONS = [
  '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM',
  '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM', '12:00 AM'
];

const mockBranchData: any = {
  '1': { name: "Bloomsbury's - Ras Al Khaimah", type: 'Boutique Café', location: 'RAK Mall', address: 'Level 1, RAK Mall, Ras Al Khaimah' },
  '2': { name: "Bloomsbury's - Dubai Mall", type: 'Signature Store', location: 'Downtown', address: 'Lower Ground, Dubai Mall, Dubai' },
};

export default function EditBranchPage() {
  const router = useRouter();
  const params = useParams();
  const branchId = params.id as string;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');

  const branch = useMemo(() => mockBranchData[branchId] || { name: 'Unknown Branch' }, [branchId]);

  // State for Opening Hours
  const [regularHours, setRegularHours] = useState(
    DAYS.map(day => ({
      day,
      open: '11:00 AM',
      close: '10:00 PM',
      closed: day === 'Sunday'
    }))
  );

  const [specialHours, setSpecialHours] = useState([
    { id: '1', date: 'Jul 4, 2025', name: 'Independence Day', from: '11:00 AM', to: '10:00 PM', closed: false },
    { id: '2', date: 'Dec 24, 2025', name: 'Christmas Eve', from: '11:00 AM', to: '10:00 PM', closed: false },
    { id: '3', date: 'Dec 25, 2025', name: 'Christmas Day', from: '11:00 AM', to: '10:00 PM', closed: true }
  ]);

  const handleUpdateRegularHour = (index: number, field: string, value: any) => {
    const updated = [...regularHours];
    updated[index] = { ...updated[index], [field]: value };
    setRegularHours(updated);
  };

  const handleCopyToAllDays = () => {
    const firstDay = regularHours[0];
    const synced = regularHours.map(h => ({
      ...h,
      open: firstDay.open,
      close: firstDay.close,
      closed: firstDay.closed
    }));
    setRegularHours(synced);
    toast({ title: "Schedule Synced", description: "Monday's schedule has been applied to all days." });
  };

  const handleResetHours = () => {
    setRegularHours(DAYS.map(day => ({
      day,
      open: '11:00 AM',
      close: '10:00 PM',
      closed: false
    })));
  };

  const handleAddSpecialHour = () => {
    setSpecialHours([
      ...specialHours,
      { id: Date.now().toString(), date: 'New Date', name: 'Holiday Name', from: '11:00 AM', to: '10:00 PM', closed: false }
    ]);
  };

  const handleRemoveSpecialHour = (id: string) => {
    setSpecialHours(specialHours.filter(sh => sh.id !== id));
  };

  const handleUpdateSpecialHour = (id: string, field: string, value: any) => {
    setSpecialHours(specialHours.map(sh => sh.id === id ? { ...sh, [field]: value } : sh));
  };

  const handleSave = () => {
    toast({
      title: "Changes Saved",
      description: "Branch details have been saved successfully.",
    });
  };

  const handlePublish = () => {
    toast({
      title: "Branch Published",
      description: "Changes have been published to the live menu.",
    });
    router.push('/dashboard/categories');
  };

  const breadcrumbItems = [
    { label: 'Manage Branches', href: '/dashboard/categories' },
    { label: `Edit ${branch.name}` }
  ];

  return (
    <>
      <DashboardHeader />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/30 min-h-[calc(100vh-4rem)]">
        <div className="max-w-5xl mx-auto">
          <Breadcrumbs items={breadcrumbItems} />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="text-left">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Edit Branch</h1>
                <p className="text-muted-foreground mt-1">Update details for {branch.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2 font-semibold" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button variant="outline" className="gap-2 font-semibold" onClick={handleSave}>
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold" onClick={handlePublish}>
                <Rocket className="h-4 w-4" />
                Publish
              </Button>
            </div>
          </div>

          <Card className="shadow-smooth border-0 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2 rounded-none border-b bg-background p-0 h-14 sticky top-0 z-20">
                <TabsTrigger 
                  value="basic" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-full gap-2 text-xs font-bold uppercase tracking-wider"
                >
                  <Info className="h-4 w-4" /> Basic Information
                </TabsTrigger>
                <TabsTrigger value="hours" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-full gap-2 text-xs font-bold uppercase tracking-wider">
                  <Clock className="h-4 w-4" /> Opening Hours
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="p-8 space-y-10 focus-visible:ring-0 mt-0 bg-background">
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Restaurant Details</h3>
                    <div className="flex items-center gap-3">
                      <Label htmlFor="branch-active" className="text-sm font-medium">Active?</Label>
                      <Switch id="branch-active" defaultChecked />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div className="space-y-2">
                      <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Restaurant Name</Label>
                      <Input defaultValue={branch.name} className="bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Cuisine Type</Label>
                      <Select defaultValue={branch.type}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select cuisine" />
                        </SelectTrigger>
                        <SelectContent>
                          {cuisines.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Description</Label>
                    <Textarea 
                      placeholder="Enter restaurant description..." 
                      className="min-h-[120px] resize-none bg-background"
                      defaultValue="Updated description for this branch."
                    />
                  </div>
                </section>

                <section className="space-y-6">
                  <h3 className="text-lg font-bold border-t pt-8 text-left">Address & Location</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 text-left">
                      <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Street Address</Label>
                      <Input defaultValue={branch.address} className="bg-background" />
                    </div>
                    <div className="space-y-2 text-left">
                      <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">City</Label>
                      <Input defaultValue={branch.location} className="bg-background" />
                    </div>
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="hours" className="p-8 space-y-12 focus-visible:ring-0 mt-0 bg-background">
                {/* Header Information */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
                  <div className="space-y-1.5 text-left max-w-2xl">
                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
                      Operating Schedule <HelpCircle className="h-5 w-5 text-muted-foreground/40" />
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Define when your branch is open. These hours dictate when customers can view and place orders from your Digital eMenu.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <Button variant="outline" size="sm" className="gap-2 font-bold text-[10px] uppercase tracking-widest h-10 px-4" onClick={handleCopyToAllDays}>
                      <Copy className="h-3.5 w-3.5" /> Apply Monday to All Days
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 font-bold text-[10px] uppercase tracking-widest h-10 px-4 text-muted-foreground" onClick={handleResetHours}>
                      <RotateCcw className="h-3.5 w-3.5" /> Reset Schedule
                    </Button>
                  </div>
                </div>

                {/* Section 1: Weekly Routine */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-[0.15em] text-foreground">Weekly Routine</h4>
                  </div>

                  <Card className="border shadow-none overflow-hidden bg-muted/10">
                    <CardHeader className="bg-white border-b py-4 px-8 flex flex-row items-center justify-between space-y-0">
                      <div className="space-y-0.5">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Standard Hours</CardTitle>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase">Set your recurring weekly availability</p>
                      </div>
                      <div className="flex items-center gap-3 bg-muted/30 px-3 py-1.5 rounded-full border">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Time Format: 12h</span>
                        <Switch className="scale-75" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 divide-y bg-white">
                      {regularHours.map((hour, index) => (
                        <div key={hour.day} className={cn(
                          "flex flex-col sm:flex-row sm:items-center gap-6 py-5 px-8 transition-colors",
                          hour.closed ? "bg-muted/20 opacity-60" : "hover:bg-muted/5"
                        )}>
                          <div className="w-32 shrink-0 text-left">
                            <span className="font-black text-lg tracking-tight text-foreground">{hour.day}</span>
                          </div>
                          
                          <div className="flex-1 flex flex-wrap items-center gap-4">
                            <div className={cn("flex items-center gap-3 transition-opacity", hour.closed && "pointer-events-none")}>
                              <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">Open At</Label>
                                <Select value={hour.open} onValueChange={(val) => handleUpdateRegularHour(index, 'open', val)}>
                                  <SelectTrigger className="w-36 h-11 bg-background font-bold">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                              <span className="text-[10px] font-black text-muted-foreground uppercase mt-6">until</span>
                              <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">Close At</Label>
                                <Select value={hour.close} onValueChange={(val) => handleUpdateRegularHour(index, 'close', val)}>
                                  <SelectTrigger className="w-36 h-11 bg-background font-bold">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center pt-2 sm:pt-0">
                            <div className={cn(
                              "flex items-center gap-3 px-4 py-2 rounded-xl border transition-all",
                              hour.closed ? "bg-destructive/5 border-destructive/20" : "bg-green-50/50 border-green-100"
                            )}>
                              <Checkbox 
                                id={`closed-edit-${hour.day}`} 
                                checked={hour.closed} 
                                onCheckedChange={(checked) => handleUpdateRegularHour(index, 'closed', !!checked)} 
                                className="h-5 w-5 rounded-md"
                              />
                              <label htmlFor={`closed-edit-${hour.day}`} className={cn(
                                "text-[11px] font-black uppercase tracking-widest cursor-pointer",
                                hour.closed ? "text-destructive" : "text-green-700"
                              )}>
                                {hour.closed ? 'Closed Today' : 'Store Open'}
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Section 2: Holiday Exceptions */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                        <CalendarDays className="h-4 w-4 text-orange-600" />
                      </div>
                      <h4 className="text-sm font-black uppercase tracking-[0.15em] text-foreground">Holiday Exceptions</h4>
                    </div>
                    <Button size="sm" className="bg-primary text-primary-foreground font-black h-10 px-5 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20" onClick={handleAddSpecialHour}>
                      <Plus className="h-4 w-4 mr-2" /> Add Holiday Date
                    </Button>
                  </div>

                  <Card className="border shadow-none overflow-hidden bg-muted/10">
                    <CardHeader className="bg-white border-b py-4 px-8">
                      <div className="space-y-0.5">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Specific Dates</CardTitle>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase">Override regular hours for public holidays or events</p>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 divide-y bg-white">
                      {specialHours.length > 0 ? specialHours.map((item) => (
                        <div key={item.id} className={cn(
                          "flex flex-col md:flex-row md:items-center gap-8 py-6 px-8 transition-colors",
                          item.closed ? "bg-destructive/[0.02]" : "hover:bg-muted/5"
                        )}>
                          <div className="w-48 shrink-0 text-left space-y-1">
                            <Input 
                              value={item.date} 
                              onChange={(e) => handleUpdateSpecialHour(item.id, 'date', e.target.value)}
                              className="h-9 font-black text-base bg-transparent border-none p-0 focus-visible:ring-0 text-foreground" 
                            />
                            <Input 
                              value={item.name} 
                              onChange={(e) => handleUpdateSpecialHour(item.id, 'name', e.target.value)}
                              className="h-6 text-[10px] uppercase font-black text-muted-foreground tracking-widest bg-transparent border-none p-0 focus-visible:ring-0" 
                            />
                          </div>
                          
                          <div className="flex-1 flex items-center gap-4">
                            {item.closed ? (
                              <div className="flex items-center gap-3 px-4 py-2 bg-destructive/10 rounded-xl border border-destructive/20">
                                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-destructive italic">Closed All Day</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <div className="space-y-1.5 text-left">
                                  <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">From</Label>
                                  <Select value={item.from} onValueChange={(val) => handleUpdateSpecialHour(item.id, 'from', val)}>
                                    <SelectTrigger className="w-36 h-11 bg-background font-bold">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <span className="text-[10px] font-black text-muted-foreground uppercase mt-6">to</span>
                                <div className="space-y-1.5 text-left">
                                  <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">Until</Label>
                                  <Select value={item.to} onValueChange={(val) => handleUpdateSpecialHour(item.id, 'to', val)}>
                                    <SelectTrigger className="w-36 h-11 bg-background font-bold">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-6 self-end md:self-center">
                            <div className="flex items-center gap-3 px-4 py-2 rounded-xl border bg-background">
                              <Checkbox 
                                id={`special-closed-${item.id}`}
                                checked={item.closed} 
                                onCheckedChange={(checked) => handleUpdateSpecialHour(item.id, 'closed', !!checked)} 
                                className="h-5 w-5 rounded-md"
                              />
                              <label htmlFor={`special-closed-${item.id}`} className="text-[11px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer">Closed</label>
                            </div>
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-xl" onClick={() => handleRemoveSpecialHour(item.id)}>
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      )) : (
                        <div className="p-16 text-center">
                          <p className="text-sm font-medium text-gray-400">No holiday overrides added yet.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          <div className="mt-8 flex justify-end gap-3">
            <Button variant="outline" className="px-8 h-12 font-bold rounded-xl" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button variant="outline" className="px-8 h-12 font-bold gap-2 rounded-xl" onClick={handleSave}>
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
            <Button className="px-10 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black gap-2 rounded-xl shadow-xl shadow-primary/20" onClick={handlePublish}>
              <Rocket className="h-4 w-4" />
              Publish
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
