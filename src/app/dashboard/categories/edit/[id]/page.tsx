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
import { Card, CardContent } from '@/components/ui/card';
import {
  Info,
  Image as ImageIcon,
  Clock,
  Palette,
  Upload,
  ExternalLink,
  Rocket,
  Save,
  ArrowLeft
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const cuisines = ['Italian', 'Boutique Café', 'Signature Store', 'Japanese', 'Mexican', 'Indian', 'French'];

// This would typically come from an API based on the ID
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
              <div>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <div className="space-y-2">
                    <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Description</Label>
                    <Textarea 
                      placeholder="Enter restaurant description..." 
                      className="min-h-[120px] resize-none bg-background"
                      defaultValue="Updated description for this branch."
                    />
                  </div>
                </section>

                <section className="space-y-6">
                  <h3 className="text-lg font-bold border-t pt-8">Address & Location</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Street Address</Label>
                      <Input defaultValue={branch.address} className="bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">City</Label>
                      <Input defaultValue={branch.location} className="bg-background" />
                    </div>
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="hours" className="p-8 space-y-6 focus-visible:ring-0 mt-0 bg-background">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Standard Opening Hours</h3>
                  <Button variant="outline" size="sm" className="bg-background">Apply to All Days</Button>
                </div>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <Card key={day} className="border shadow-none bg-background">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 min-w-[120px]">
                        <Switch defaultChecked={!['Sunday'].includes(day)} />
                        <span className="font-bold">{day}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Input type="time" defaultValue="09:00" className="w-32 h-9" />
                        <Input type="time" defaultValue="22:00" className="w-32 h-9" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="customization" className="p-20 text-center space-y-4 focus-visible:ring-0 mt-0 bg-background">
                <Palette className="mx-auto h-8 w-8 text-muted-foreground opacity-20" />
                <h3 className="text-xl font-bold">Customization</h3>
                <p className="text-muted-foreground">Tailor the look and feel of this specific branch.</p>
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
