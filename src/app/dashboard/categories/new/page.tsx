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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  ExternalLink
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
    toast({ title: "Schedule Synced", description: "Hours from Monday have been applied to all days." });
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
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Add New Branch</h1>
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

                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed">
                      <ImageIcon className="h-8 w-8 text-muted-foreground opacity-40" />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <Button variant="outline" className="gap-2" size="sm">
                        <Upload className="h-4 w-4" />
                        Upload Logo
                      </Button>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">PNG, JPG, GIF up to 1MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 text-left">
                      <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Restaurant Name</Label>
                      <Input placeholder="e.g. Bella Cucina Italian" className="bg-background" />
                    </div>
                    <div className="space-y-2 text-left">
                      <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Cuisine Type</Label>
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
                    <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Description</Label>
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
                      <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Street Address</Label>
                      <Input placeholder="e.g. 123 Main Street" className="bg-background" />
                    </div>
                    <div className="space-y-2 text-left">
                      <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">City</Label>
                      <Input placeholder="e.g. San Francisco" className="bg-background" />
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Google Maps URL</Label>
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

              <TabsContent value="hours" className="p-8 space-y-8 focus-visible:ring-0 mt-0 bg-background">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 text-left">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      Opening Hours <HelpCircle className="h-5 w-5 text-muted-foreground/50" />
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Set your restaurant&apos;s regular operating hours. These hours will be displayed to customers and determine when digital menu orders can be accepted.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2 font-bold text-xs uppercase tracking-wider" onClick={handleCopyToAllDays}>
                      <Copy className="h-3.5 w-3.5" /> Copy to All Days
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 font-bold text-xs uppercase tracking-wider" onClick={handleResetHours}>
                      <RotateCcw className="h-3.5 w-3.5" /> Reset Hours
                    </Button>
                  </div>
                </div>

                {/* Regular Hours Section */}
                <Card className="border shadow-none overflow-hidden">
                  <CardHeader className="bg-muted/30 border-b py-3 px-6 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Regular Hours</CardTitle>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground">24-hour format</span>
                      <Switch className="scale-75" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 divide-y">
                    {regularHours.map((hour, index) => (
                      <div key={hour.day} className="flex items-center gap-8 py-4 px-6 group hover:bg-muted/10 transition-colors">
                        <div className="w-28 shrink-0 text-left">
                          <span className="font-bold text-sm">{hour.day}</span>
                        </div>
                        
                        <div className="flex-1 flex flex-col gap-3">
                          <div className={cn("flex items-center gap-4 transition-opacity", hour.closed && "opacity-30 pointer-events-none")}>
                            <Select value={hour.open} onValueChange={(val) => handleUpdateRegularHour(index, 'open', val)}>
                              <SelectTrigger className="w-32 h-10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <span className="text-xs font-bold text-muted-foreground uppercase">to</span>
                            <Select value={hour.close} onValueChange={(val) => handleUpdateRegularHour(index, 'close', val)}>
                              <SelectTrigger className="w-32 h-10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              id={`closed-${hour.day}`} 
                              checked={hour.closed} 
                              onCheckedChange={(checked) => handleUpdateRegularHour(index, 'closed', !!checked)} 
                            />
                            <label htmlFor={`closed-${hour.day}`} className="text-xs font-bold text-muted-foreground cursor-pointer">Closed</label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Special Hours Section */}
                <div className="space-y-4 pt-4">
                  <div className="space-y-1 text-left">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      Special Hours & Holidays <HelpCircle className="h-4 w-4 text-muted-foreground/50" />
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Set special operating hours for holidays or specific dates when your regular hours don&apos;t apply.
                    </p>
                  </div>

                  <Card className="border shadow-none overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b py-3 px-6 flex flex-row items-center justify-between space-y-0">
                      <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Special Dates</CardTitle>
                      <Button size="sm" className="bg-primary text-primary-foreground font-bold h-8 px-4 rounded-lg text-xs" onClick={handleAddSpecialHour}>
                        <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Special Hours
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0 divide-y">
                      {specialHours.map((item) => (
                        <div key={item.id} className="flex items-center gap-8 py-4 px-6 group hover:bg-muted/10 transition-colors">
                          <div className="w-40 shrink-0 text-left">
                            <Input 
                              value={item.date} 
                              onChange={(e) => handleUpdateSpecialHour(item.id, 'date', e.target.value)}
                              className="h-8 font-bold text-sm bg-transparent border-none p-0 focus-visible:ring-0" 
                            />
                            <Input 
                              value={item.name} 
                              onChange={(e) => handleUpdateSpecialHour(item.id, 'name', e.target.value)}
                              className="h-6 text-[10px] uppercase font-bold text-muted-foreground tracking-wider bg-transparent border-none p-0 focus-visible:ring-0" 
                            />
                          </div>
                          
                          <div className="flex-1 flex items-center gap-4">
                            {item.closed ? (
                              <span className="text-sm font-medium text-muted-foreground italic">Closed all day</span>
                            ) : (
                              <>
                                <Select value={item.from} onValueChange={(val) => handleUpdateSpecialHour(item.id, 'from', val)}>
                                  <SelectTrigger className="w-32 h-10">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                                <span className="text-xs font-bold text-muted-foreground uppercase">to</span>
                                <Select value={item.to} onValueChange={(val) => handleUpdateSpecialHour(item.id, 'to', val)}>
                                  <SelectTrigger className="w-32 h-10">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <Checkbox 
                                checked={item.closed} 
                                onCheckedChange={(checked) => handleUpdateSpecialHour(item.id, 'closed', !!checked)} 
                              />
                              <span className="text-xs font-bold text-muted-foreground">Closed</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveSpecialHour(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          <div className="mt-8 flex justify-end gap-3">
            <Button variant="outline" className="px-8 font-bold" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button variant="outline" className="px-8 font-bold gap-2" onClick={handleSave}>
              <Save className="h-4 w-4" />
              Save
            </Button>
            <Button className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-2" onClick={handlePublish}>
              <Rocket className="h-4 w-4" />
              Publish
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
