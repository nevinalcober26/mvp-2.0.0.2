'use client';

import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
  Users,
  Image as ImageIcon,
  Clock,
  CalendarCheck,
  Palette,
  Upload,
  ArrowLeft,
  Globe,
  MapPin,
  ExternalLink,
  Edit2,
  Check,
  Save,
  Rocket
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface BranchConfigSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: any | null;
}

const cuisines = ['Italian', 'Boutique Café', 'Signature Store', 'Japanese', 'Mexican', 'Indian', 'French'];

export function BranchConfigSheet({
  open,
  onOpenChange,
  branch,
}: BranchConfigSheetProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');

  const handleSave = () => {
    toast({
      title: "Changes Saved",
      description: "Branch configuration has been updated successfully.",
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-5xl w-full p-0 flex flex-col overflow-hidden bg-background shadow-2xl border-l">
        {/* Custom Header matching the design */}
        <div className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-xl font-bold">Restaurant Configuration</h2>
              <p className="text-sm text-muted-foreground">Manage your restaurant details and reservation settings</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 font-semibold" onClick={handleSave}>
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold" onClick={handleSave}>
              <Rocket className="h-4 w-4" />
              Publish
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-muted/5">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-background px-6 h-14 sticky top-0 z-20">
              <TabsTrigger 
                value="basic" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-full gap-2 text-xs font-bold uppercase tracking-wider"
              >
                <Info className="h-4 w-4" /> Basic Information
              </TabsTrigger>
              <TabsTrigger value="seating" className="rounded-none h-full gap-2 text-xs font-bold uppercase tracking-wider">
                <Users className="h-4 w-4" /> Seating & Capacity
              </TabsTrigger>
              <TabsTrigger value="photos" className="rounded-none h-full gap-2 text-xs font-bold uppercase tracking-wider">
                <ImageIcon className="h-4 w-4" /> Photos & Gallery
              </TabsTrigger>
              <TabsTrigger value="hours" className="rounded-none h-full gap-2 text-xs font-bold uppercase tracking-wider">
                <Clock className="h-4 w-4" /> Opening Hours
              </TabsTrigger>
              <TabsTrigger value="reservations" className="rounded-none h-full gap-2 text-xs font-bold uppercase tracking-wider">
                <CalendarCheck className="h-4 w-4" /> Reservation Settings
              </TabsTrigger>
              <TabsTrigger value="customization" className="rounded-none h-full gap-2 text-xs font-bold uppercase tracking-wider">
                <Palette className="h-4 w-4" /> Customization
              </TabsTrigger>
            </TabsList>

            {/* Basic Information Content */}
            <TabsContent value="basic" className="p-8 space-y-10 focus-visible:ring-0 mt-0">
              {/* Restaurant Details */}
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
                    <Input defaultValue={branch?.name || "Bloomsbury's"} placeholder="e.g. Bella Cucina Italian" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Cuisine Type</Label>
                    <Select defaultValue={branch?.type || "Boutique Café"}>
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
                    defaultValue="Authentic experience in a cozy atmosphere. Our menu features handmade treats, signature coffee, and an extensive tea selection."
                  />
                </div>
              </section>

              {/* Address & Location */}
              <section className="space-y-6">
                <h3 className="text-lg font-bold border-t pt-8">Address & Location</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Street Address</Label>
                    <Input defaultValue={branch?.address || ""} placeholder="e.g. 123 Main Street" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">City</Label>
                    <Input defaultValue={branch?.location || ""} placeholder="e.g. San Francisco" className="bg-background" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">State</Label>
                    <Input placeholder="e.g. California" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">ZIP Code</Label>
                    <Input placeholder="e.g. 94103" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Country</Label>
                    <Input defaultValue="United Arab Emirates" className="bg-background" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Google Maps URL</Label>
                  <div className="relative">
                    <Input placeholder="https://maps.google.com/..." className="pr-10 bg-background" />
                    <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">Copy the Google Maps URL for your restaurant location</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="show-maps" defaultChecked />
                  <label htmlFor="show-maps" className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Show Google Maps link on reservation page
                  </label>
                </div>

                <Card className="bg-muted/30 border-2">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold">{branch?.name || "Restaurant Name"}</p>
                        <p className="text-sm text-muted-foreground">{branch?.address || "Address not set"}</p>
                        <Button variant="link" size="sm" className="p-0 h-auto text-xs font-semibold text-primary">View on Google Maps</Button>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2 bg-background">
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit Location
                    </Button>
                  </CardContent>
                </Card>
              </section>

              {/* Contact Information */}
              <section className="space-y-6">
                <h3 className="text-lg font-bold border-t pt-8">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Phone Number</Label>
                    <Input placeholder="(415) 555-1234" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Email</Label>
                    <Input placeholder="info@restaurant.com" className="bg-background" />
                  </div>
                </div>
              </section>
            </TabsContent>

            {/* Opening Hours Content */}
            <TabsContent value="hours" className="p-8 space-y-6 focus-visible:ring-0 mt-0">
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

              <section className="pt-8 border-t space-y-4">
                <h3 className="text-lg font-bold">Special Dates & Holidays</h3>
                <p className="text-sm text-muted-foreground">Add specific dates where your hours differ from standard operation.</p>
                <Button variant="outline" className="gap-2 bg-background">
                  <CalendarCheck className="h-4 w-4" />
                  Add Special Date
                </Button>
              </section>
            </TabsContent>

            {/* Placeholder Tabs */}
            {['seating', 'photos', 'reservations', 'customization'].map(tab => (
              <TabsContent key={tab} value={tab} className="p-20 text-center space-y-4 focus-visible:ring-0 mt-0">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Edit2 className="h-8 w-8 text-muted-foreground opacity-20" />
                </div>
                <div>
                  <h3 className="text-xl font-bold capitalize">{tab.replace('-', ' ')}</h3>
                  <p className="text-muted-foreground">This section is currently under development.</p>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="p-6 border-t bg-background flex justify-end gap-3 sticky bottom-0 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Button variant="outline" className="gap-2 font-semibold" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="outline" className="gap-2 font-semibold" onClick={handleSave}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
          <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold" onClick={handleSave}>
            <Rocket className="h-4 w-4" />
            Publish
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
