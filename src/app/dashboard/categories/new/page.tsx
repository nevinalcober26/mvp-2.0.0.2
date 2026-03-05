
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Info,
  Clock,
  Upload,
  Save,
  Rocket,
  ArrowLeft,
  Copy,
  RotateCcw,
  Plus,
  Trash2,
  HelpCircle,
  Image as ImageIcon,
  ExternalLink,
  CalendarDays,
  HandCoins,
  X,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const cuisines = ['Italian', 'Boutique Café', 'Signature Store', 'Japanese', 'Mexican', 'Indian', 'French'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TIME_OPTIONS = [
  '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM',
  '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM', '12:00 AM'
];

export default function AddNewBranchPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');

  // State for Opening Hours
  const [regularHours, setRegularHours] = useState(
    DAYS.map(day => ({
      day,
      open: '11:00 AM',
      close: '10:00 PM',
      closed: day === 'Sunday'
    }))
  );

  const [specialHours, setSpecialHours] = useState<any[]>([]);

  const [tipFeeEnabled, setTipFeeEnabled] = useState(true);
  const [currency, setCurrency] = useState('AED');
  const [feeType, setFeeType] = useState('Percentage');
  const [maxRate, setMaxRate] = useState('100');
  const [customEntryEnabled, setCustomEntryEnabled] = useState(false);
  const [suggestedRates, setSuggestedRates] = useState([20, 10, 30]);
  const [quickTagSearch, setQuickTagSearch] = useState('');

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
      title: "Draft Saved",
      description: "Branch details have been saved as a draft.",
    });
  };

  const handlePublish = () => {
    toast({
      title: "Branch Published",
      description: "New branch has been published successfully.",
    });
    router.push('/dashboard/categories');
  };

  const breadcrumbItems = [
    { label: 'Manage Branches', href: '/dashboard/categories' },
    { label: 'Add New Branch' }
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
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Add New Branch</h1>
                <p className="text-muted-foreground mt-1">Configure your new outlet details and operating hours</p>
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
              <TabsList className="w-full grid grid-cols-3 rounded-none border-b bg-background p-0 h-14 sticky top-0 z-20">
                <TabsTrigger 
                  value="basic" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-full gap-2 text-sm font-semibold"
                >
                  <Info className="h-4 w-4" /> Basic Information
                </TabsTrigger>
                <TabsTrigger value="hours" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-full gap-2 text-sm font-semibold">
                  <Clock className="h-4 w-4" /> Opening Hours
                </TabsTrigger>
                <TabsTrigger value="tip-fee" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-full gap-2 text-sm font-semibold">
                  <HandCoins className="h-4 w-4" /> Tip Fee
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="p-8 space-y-10 focus-visible:ring-0 mt-0 bg-background">
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Restaurant Details</h3>
                    <div className="flex items-center gap-3">
                      <Label htmlFor="branch-active" className="text-sm font-medium">Active Status</Label>
                      <Switch id="branch-active" defaultChecked />
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed">
                      <ImageIcon className="h-8 w-8 text-muted-foreground opacity-40" />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <Button variant="outline" className="gap-2" size="sm">
                        <Upload className="h-4 w-4" />
                        Upload Logo
                      </Button>
                      <p className="text-xs text-muted-foreground">PNG, JPG, or GIF up to 1MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 text-left">
                      <Label className="font-semibold text-muted-foreground text-xs">Restaurant Name</Label>
                      <Input placeholder="e.g. Bella Cucina Italian" className="bg-background" />
                    </div>
                    <div className="space-y-2 text-left">
                      <Label className="font-semibold text-muted-foreground text-xs">Cuisine Type</Label>
                      <Select>
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
                    <Label className="font-semibold text-muted-foreground text-xs">Description</Label>
                    <Textarea 
                      placeholder="Enter restaurant description..." 
                      className="min-h-[120px] resize-none bg-background"
                    />
                  </div>
                </section>

                <section className="space-y-6">
                  <h3 className="text-lg font-bold border-t pt-8 text-left">Address & Location</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 text-left">
                      <Label className="font-semibold text-muted-foreground text-xs">Street Address</Label>
                      <Input placeholder="e.g. 123 Main Street" className="bg-background" />
                    </div>
                    <div className="space-y-2 text-left">
                      <Label className="font-semibold text-muted-foreground text-xs">City</Label>
                      <Input placeholder="e.g. San Francisco" className="bg-background" />
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <Label className="font-semibold text-muted-foreground text-xs">Google Maps URL</Label>
                    <div className="relative">
                      <Input placeholder="https://maps.google.com/..." className="pr-10 bg-background" />
                      <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="show-maps" defaultChecked />
                    <label htmlFor="show-maps" className="text-sm font-medium leading-none cursor-pointer">
                      Show Google Maps link on menu page
                    </label>
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="hours" className="p-8 space-y-12 focus-visible:ring-0 mt-0 bg-background">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
                  <div className="space-y-1.5 text-left max-w-2xl">
                    <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                      Operating Schedule <HelpCircle className="h-4 w-4 text-muted-foreground/40" />
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Define when your branch is open. These hours dictate when customers can view and place orders from your Digital eMenu.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <Button variant="outline" size="sm" className="gap-2 font-semibold text-xs h-10 px-4" onClick={handleCopyToAllDays}>
                      <Copy className="h-3.5 w-3.5" /> Apply Monday to All Days
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 font-semibold text-xs h-10 px-4 text-muted-foreground" onClick={handleResetHours}>
                      <RotateCcw className="h-3.5 w-3.5" /> Reset Schedule
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <h4 className="text-sm font-bold text-foreground">Weekly Routine</h4>
                  </div>

                  <Card className="border shadow-none overflow-hidden bg-muted/10">
                    <CardHeader className="bg-white border-b py-4 px-8 flex flex-row items-center justify-between space-y-0">
                      <div className="space-y-0.5">
                        <CardTitle className="text-sm font-bold text-foreground">Standard Hours</CardTitle>
                        <p className="text-xs text-muted-foreground font-medium">Set your recurring weekly availability</p>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 divide-y bg-white">
                      {regularHours.map((hour, index) => (
                        <div key={hour.day} className={cn(
                          "flex flex-col sm:flex-row sm:items-center gap-6 py-5 px-8 transition-colors",
                          hour.closed ? "bg-muted/20 opacity-60" : "hover:bg-muted/5"
                        )}>
                          <div className="w-32 shrink-0 text-left">
                            <span className="font-bold text-base text-foreground">{hour.day}</span>
                          </div>
                          
                          <div className="flex-1 flex flex-wrap items-center gap-4">
                            <div className={cn("flex items-center gap-3 transition-opacity", hour.closed && "pointer-events-none")}>
                              <div className="space-y-1.5 text-left">
                                <Label className="text-xs font-semibold text-muted-foreground ml-1">Open At</Label>
                                <Select value={hour.open} onValueChange={(val) => handleUpdateRegularHour(index, 'open', val)}>
                                  <SelectTrigger className="w-36 h-10 bg-background font-medium">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                              <span className="text-xs font-medium text-muted-foreground mt-6">until</span>
                              <div className="space-y-1.5 text-left">
                                <Label className="text-xs font-semibold text-muted-foreground ml-1">Close At</Label>
                                <Select value={hour.close} onValueChange={(val) => handleUpdateRegularHour(index, 'close', val)}>
                                  <SelectTrigger className="w-36 h-10 bg-background font-medium">
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
                                id={`closed-${hour.day}`} 
                                checked={hour.closed} 
                                onCheckedChange={(checked) => handleUpdateRegularHour(index, 'closed', !!checked)} 
                                className="h-5 w-5 rounded-md"
                              />
                              <label htmlFor={`closed-${hour.day}`} className={cn(
                                "text-xs font-bold cursor-pointer",
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

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                        <CalendarDays className="h-4 w-4 text-orange-600" />
                      </div>
                      <h4 className="text-sm font-bold text-foreground">Holiday Exceptions</h4>
                    </div>
                    <Button size="sm" className="bg-primary text-primary-foreground font-bold h-10 px-5 rounded-xl text-xs shadow-lg shadow-primary/20" onClick={handleAddSpecialHour}>
                      <Plus className="h-4 w-4 mr-2" /> Add Holiday Date
                    </Button>
                  </div>

                  <Card className="border shadow-none overflow-hidden bg-muted/10">
                    <CardHeader className="bg-white border-b py-4 px-8">
                      <div className="space-y-0.5">
                        <CardTitle className="text-sm font-bold text-foreground">Specific Dates</CardTitle>
                        <p className="text-xs text-muted-foreground font-medium">Override regular hours for public holidays or events</p>
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
                              className="h-9 font-bold text-base bg-transparent border-none p-0 focus-visible:ring-0 text-foreground" 
                            />
                            <Input 
                              value={item.name} 
                              onChange={(e) => handleUpdateSpecialHour(item.id, 'name', e.target.value)}
                              className="h-6 text-xs font-semibold text-muted-foreground bg-transparent border-none p-0 focus-visible:ring-0" 
                            />
                          </div>
                          
                          <div className="flex-1 flex items-center gap-4">
                            {item.closed ? (
                              <div className="flex items-center gap-3 px-4 py-2 bg-destructive/10 rounded-xl border border-destructive/20">
                                <span className="text-xs font-bold text-destructive italic">Closed All Day</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <div className="space-y-1.5 text-left">
                                  <Label className="text-xs font-semibold text-muted-foreground ml-1">From</Label>
                                  <Select value={item.from} onValueChange={(val) => handleUpdateSpecialHour(item.id, 'from', val)}>
                                    <SelectTrigger className="w-36 h-10 bg-background font-medium">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <span className="text-xs font-medium text-muted-foreground mt-6">to</span>
                                <div className="space-y-1.5 text-left">
                                  <Label className="text-xs font-semibold text-muted-foreground ml-1">Until</Label>
                                  <Select value={item.to} onValueChange={(val) => handleUpdateSpecialHour(item.id, 'to', val)}>
                                    <SelectTrigger className="w-36 h-10 bg-background font-medium">
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
                              <label htmlFor={`special-closed-${item.id}`} className="text-xs font-bold text-muted-foreground cursor-pointer">Closed</label>
                            </div>
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-xl" onClick={() => handleRemoveSpecialHour(item.id)}>
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      )) : (
                        <div className="p-16 text-center">
                          <p className="text-sm font-medium text-muted-foreground">No holiday overrides added yet.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="tip-fee" className="p-8 space-y-10 focus-visible:ring-0 mt-0 bg-background">
                <section className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Tip Fee Settings</h3>
                    <Switch id="tip-fee-enabled" checked={tipFeeEnabled} onCheckedChange={setTipFeeEnabled} />
                  </div>

                  <div className={cn(!tipFeeEnabled && "opacity-50 pointer-events-none", "space-y-6")}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 text-left">
                        <Label>Currency</Label>
                        <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AED">AED</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 text-left">
                        <Label>Fee Type</Label>
                        <Select value={feeType} onValueChange={setFeeType}>
                          <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Percentage">Percentage</SelectItem>
                            <SelectItem value="Fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      <div className="space-y-2 text-left">
                        <Label>Max Rate</Label>
                        <Input value={maxRate} onChange={(e) => setMaxRate(e.target.value)} placeholder="100" className="bg-background"/>
                      </div>
                      <div className="space-y-2 text-left">
                        <Label>Custom Entry</Label>
                        <div className="flex items-center h-[44px]">
                          <Switch id="custom-entry-enabled" checked={customEntryEnabled} onCheckedChange={setCustomEntryEnabled} />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4 text-left">
                      <Label>Suggested Rates</Label>
                      <div className="flex flex-wrap items-center gap-2">
                        {suggestedRates.map((rate, index) => (
                          <Badge key={index} className="bg-primary/80 hover:bg-primary/70 text-white text-sm p-2 rounded-md font-semibold">
                            {rate}
                            <button type="button" onClick={() => setSuggestedRates(rates => rates.filter((_, i) => i !== index))} className="ml-2 rounded-full hover:bg-black/20 p-0.5">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                        <Button type="button" variant="ghost" onClick={() => setSuggestedRates([])}>Clear All</Button>
                      </div>
                      <Input placeholder="Search or select quick tags" value={quickTagSearch} onChange={(e) => setQuickTagSearch(e.target.value)} className="bg-background"/>
                    </div>
                  </div>
                </section>
              </TabsContent>
            </Tabs>
          </Card>

          <div className="mt-8 flex justify-end gap-3">
            <Button variant="outline" className="px-8 h-12 font-bold rounded-xl" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button variant="outline" className="px-8 h-12 font-bold gap-2 rounded-xl" onClick={handleSave}>
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button className="px-10 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-2 rounded-xl shadow-xl shadow-primary/20" onClick={handlePublish}>
              <Rocket className="h-4 w-4" />
              Publish Branch
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
