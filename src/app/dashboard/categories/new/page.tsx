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
import { Card, CardContent } from '@/components/ui/card';
import {
  Info,
  Image as ImageIcon,
  Clock,
  Palette,
  Upload,
  ExternalLink,
  Save,
  Rocket,
  ArrowLeft
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const cuisines = ['Italian', 'Boutique Café', 'Signature Store', 'Japanese', 'Mexican', 'Indian', 'French'];

export default function AddNewBranchPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');

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
              <div>
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
              <TabsList className="w-full justify-start rounded-none border-b bg-background px-6 h-14 sticky top-0 z-20">
                <TabsTrigger 
                  value="basic" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-full gap-2 text-xs font-bold uppercase tracking-wider"
                >
                  <Info className="h-4 w-4" /> Basic Information
                </TabsTrigger>
                <TabsTrigger value="hours" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-full gap-2 text-xs font-bold uppercase tracking-wider">
                  <Clock className="h-4 w-4" /> Opening Hours
                </TabsTrigger>
                <TabsTrigger value="customization" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-full gap-2 text-xs font-bold uppercase tracking-wider">
                  <Palette className="h-4 w-4" /> Customization
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
                    <div className="space-y-1.5">
                      <Button variant="outline" className="gap-2" size="sm">
                        <Upload className="h-4 w-4" />
                        Upload Logo
                      </Button>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">PNG, JPG, GIF up to 1MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Restaurant Name</Label>
                      <Input placeholder="e.g. Bella Cucina Italian" className="bg-background" />
                    </div>
                    <div className="space-y-2">
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

                  <div className="space-y-2">
                    <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Description</Label>
                    <Textarea 
                      placeholder="Enter restaurant description..." 
                      className="min-h-[120px] resize-none bg-background"
                    />
                  </div>
                </section>

                <section className="space-y-6">
                  <h3 className="text-lg font-bold border-t pt-8">Address & Location</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Street Address</Label>
                      <Input placeholder="e.g. 123 Main Street" className="bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">City</Label>
                      <Input placeholder="e.g. San Francisco" className="bg-background" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Google Maps URL</Label>
                    <div className="relative">
                      <Input placeholder="https://maps.google.com/..." className="pr-10 bg-background" />
                      <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="show-maps" defaultChecked />
                    <label htmlFor="show-maps" className="text-sm font-medium leading-none cursor-pointer">
                      Show Google Maps link on reservation page
                    </label>
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="hours" className="p-8 space-y-6 focus-visible:ring-0 mt-0 bg-background">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">Standard Opening Hours</h3>
                    <p className="text-sm text-muted-foreground">Set your weekly operating schedule</p>
                  </div>
                  <Button variant="outline" size="sm" className="bg-background">Apply to All Days</Button>
                </div>

                <div className="space-y-3">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <Card key={day} className="border shadow-none bg-background">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 min-w-[120px]">
                          <Switch defaultChecked={!['Sunday'].includes(day)} />
                          <span className="font-bold">{day}</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Label className="text-[10px] uppercase text-muted-foreground font-bold">Open</Label>
                            <Input type="time" defaultValue="09:00" className="w-32 h-9" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-[10px] uppercase text-muted-foreground font-bold">Close</Label>
                            <Input type="time" defaultValue="22:00" className="w-32 h-9" />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="text-primary hover:text-primary font-semibold">Add Period</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="customization" className="p-20 text-center space-y-4 focus-visible:ring-0 mt-0 bg-background">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Palette className="h-8 w-8 text-muted-foreground opacity-20" />
                </div>
                <div>
                  <h3 className="text-xl font-bold capitalize">Customization</h3>
                  <p className="text-muted-foreground">Tailor the look and feel of this specific branch.</p>
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
