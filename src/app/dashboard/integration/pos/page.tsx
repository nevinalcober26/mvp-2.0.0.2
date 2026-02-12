'use client';

import React, { useState, useMemo } from 'react';
import { DashboardHeader } from "@/components/dashboard/header";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { 
  Plus, 
  RefreshCw, 
  Settings, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Monitor,
  ArrowLeft,
  ChevronRight,
  Loader2,
  Check,
  Search,
  Globe,
  Lock,
  User,
  Hash,
  ArrowRight,
  Database,
  Layers,
  ChevronDown,
  Maximize2,
  Minimize2,
  X,
  ListFilter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PosStatus = 'active' | 'error' | 'syncing' | 'disconnected';

interface PosConnection {
  id: string;
  brand: string;
  label: string;
  status: PosStatus;
  lastSync: string;
  terminalId: string;
}

const SUPPORTED_POS = [
  { id: 'oracle-simphony', name: 'Oracle Micros Simphony', description: 'Enterprise hospitality platform' },
  { id: 'toast', name: 'Toast', description: 'Cloud-based restaurant platform' },
  { id: 'square', name: 'Square', description: 'Universal payment & POS solution' },
  { id: 'revel', name: 'Revel Systems', description: 'iPad-based POS for high volume' },
  { id: 'clover', name: 'Clover', description: 'Integrated merchant services' },
];

const generateMockItems = () => {
  const categories = ['Main Courses', 'Appetizers', 'Beverages', 'Sides', 'Desserts', 'Breakfast'];
  const subCategories: Record<string, string[]> = {
    'Main Courses': ['Steaks', 'Pastas', 'Seafood', 'Burgers'],
    'Appetizers': ['Cold Starters', 'Hot Bites', 'Soups'],
    'Beverages': ['Signature Cocktails', 'Wines', 'Draft Beer', 'Soft Drinks', 'Coffee'],
    'Sides': ['Fries', 'Vegetables', 'Salads'],
    'Desserts': ['Cakes', 'Pastries', 'Ice Cream'],
    'Breakfast': ['Eggs', 'Bowls', 'Griddle']
  };

  const items = [];
  let id = 1;

  for (const cat of categories) {
    for (const sub of subCategories[cat]) {
      const numItems = Math.floor(Math.random() * 15) + 10;
      for (let i = 0; i < numItems; i++) {
        items.push({
          id: `item-${id}`,
          posId: `SIM-${1000 + id}`,
          name: `${sub} ${cat === 'Beverages' ? 'Specialty' : 'Selection'} #${i + 1}`,
          category: cat,
          subCategory: sub,
          price: `$${(Math.random() * 40 + 10).toFixed(2)}`,
          enabled: Math.random() > 0.1
        });
        id++;
      }
    }
  }
  return items;
};

const MOCK_ITEMS = generateMockItems();

export default function PosIntegrationPage() {
  const { toast } = useToast();
  const [isConnectDrawerOpen, setIsConnectDrawerOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Connections Grid State
  const [connections, setConnections] = useState<PosConnection[]>([
    { 
      id: '1', 
      brand: 'Oracle Micros Simphony', 
      label: 'Main Kitchen Hub', 
      status: 'active', 
      lastSync: 'just now',
      terminalId: 'ORCL-SYMPH-01'
    },
    { 
      id: '2', 
      brand: 'Square', 
      label: 'Express Bar', 
      status: 'error', 
      lastSync: '1 hour ago',
      terminalId: 'SQ-BAR-99'
    },
  ]);

  // Connection Flow States
  const [locationValue, setLocationValue] = useState<string | null>(null);
  const [revenueCenterValue, setRevenueCenterValue] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncComplete, setIsSyncComplete] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  // Verification List States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedItemIds, setSelectedItems] = useState<Set<string>>(new Set());
  const [items, setItems] = useState(MOCK_ITEMS);

  // Unique categories for filtering
  const uniqueCategories = useMemo(() => {
    const cats = Array.from(new Set(items.map(i => i.category)));
    return cats.sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(query) || 
                           item.category.toLowerCase().includes(query) ||
                           item.subCategory.toLowerCase().includes(query) ||
                           item.posId.toLowerCase().includes(query);
      
      const matchesStatus = statusFilter === 'all' 
        ? true 
        : statusFilter === 'visible' ? item.enabled : !item.enabled;
      
      const matchesCategory = categoryFilter === 'all' 
        ? true 
        : item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [items, searchQuery, statusFilter, categoryFilter]);

  const itemsByCategory = useMemo(() => {
    const groups: Record<string, Record<string, typeof items>> = {};
    filteredItems.forEach(item => {
      if (!groups[item.category]) groups[item.category] = {};
      if (!groups[item.category][item.subCategory]) groups[item.category][item.subCategory] = [];
      groups[item.category][item.subCategory].push(item);
    });
    return groups;
  }, [filteredItems]);

  const toggleItemSelection = (id: string) => {
    const newSelection = new Set(selectedItemIds);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedItems(newSelection);
  };

  const toggleAllVisible = () => {
    if (selectedItemIds.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(i => i.id)));
    }
  };

  const handleBulkAction = (action: 'enable' | 'disable') => {
    const updatedItems = items.map(item => {
      if (selectedItemIds.has(item.id)) {
        return { ...item, enabled: action === 'enable' };
      }
      return item;
    });
    setItems(updatedItems);
    toast({
      title: "Batch Action Completed",
      description: `${selectedItemIds.size} items have been ${action === 'enable' ? 'activated' : 'locked'}.`
    });
    setSelectedItems(new Set());
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  const startSyncProcess = () => {
    setIsSyncing(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 10;
      if (progress >= 100) {
        progress = 100;
        setSyncProgress(100);
        setIsSyncComplete(true);
        clearInterval(interval);
      } else {
        setSyncProgress(progress);
      }
    }, 300);
  };

  const handleReviewMenu = () => {
    setIsSyncing(false);
    setIsConnectDrawerOpen(false);
    setIsVerificationModalOpen(true);
  };

  const handleFinishSync = () => {
    // Determine provider and location names for the display card
    const providerName = SUPPORTED_POS.find(p => p.id === selectedProvider)?.name || 'New POS';
    const locationName = locationValue === 'main' ? 'Main Outlet' : locationValue === 'annex' ? 'Annex Lounge' : 'Terminal';
    
    const newConnection: PosConnection = {
      id: Date.now().toString(),
      brand: providerName,
      label: `${locationName} Hub`,
      status: 'active',
      lastSync: 'just now',
      terminalId: `${selectedProvider?.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
    };

    // Add to dynamic list
    setConnections(prev => [newConnection, ...prev]);

    // Close verification modal and show final success
    setIsVerificationModalOpen(false);
    setShowSuccessDialog(true);

    // Reset workflow states for future additions
    resetWorkflow();
  };

  const resetWorkflow = () => {
    setSelectedProvider(null);
    setCurrentStep(1);
    setLocationValue(null);
    setRevenueCenterValue(null);
    setIsSyncComplete(false);
    setSyncProgress(0);
  };

  const getStatusBadge = (status: PosStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none gap-1.5 font-bold"><CheckCircle2 className="h-3 w-3" /> Live</Badge>;
      case 'error':
        return <Badge variant="destructive" className="gap-1.5 font-bold"><AlertCircle className="h-3 w-3" /> Error</Badge>;
      case 'syncing':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none gap-1.5 font-bold"><RefreshCw className="h-3 w-3 animate-spin" /> Syncing</Badge>;
      default:
        return <Badge variant="secondary" className="font-bold">Offline</Badge>;
    }
  };

  const handleDeleteConnection = (id: string) => {
    setConnections(prev => prev.filter(c => c.id !== id));
    toast({
      title: "Connection Removed",
      description: "The POS terminal has been disconnected."
    });
  };

  return (
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 lg:p-10 bg-muted/20 min-h-[calc(100vh-4rem)]">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">POS Integration</h1>
              <p className="text-muted-foreground text-sm font-medium">Manage your venue terminals and real-time menu synchronization.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2 font-semibold shadow-sm" onClick={() => toast({ title: "Sync Initiated", description: "Global manual refresh started." })}>
                <RefreshCw className="h-4 w-4" />
                Sync All
              </Button>
              <Sheet open={isConnectDrawerOpen} onOpenChange={setIsConnectDrawerOpen}>
                <SheetTrigger asChild>
                  <Button className="gap-2 font-bold bg-primary hover:bg-primary/90 shadow-md">
                    <Plus className="h-5 w-5" />
                    Connect New POS
                  </Button>
                </SheetTrigger>
                <SheetContent className="sm:max-w-xl p-0 overflow-hidden flex flex-col border-l shadow-2xl bg-white">
                  <div className="bg-muted/30 p-8 border-b shrink-0">
                    <SheetHeader className="text-left space-y-2">
                      <SheetTitle className="text-2xl font-bold text-foreground">Add POS Connection</SheetTitle>
                      <SheetDescription className="text-muted-foreground font-medium">
                        {currentStep === 1 
                          ? "Select a provider and enter your terminal credentials." 
                          : "Map your connection to your venue locations and centers."}
                      </SheetDescription>
                    </SheetHeader>
                    {selectedProvider === 'oracle-simphony' && (
                      <div className="mt-6 flex items-center gap-2">
                        <div className={cn("h-1 flex-1 rounded-full transition-colors", currentStep >= 1 ? "bg-primary" : "bg-muted")} />
                        <div className={cn("h-1 flex-1 rounded-full transition-colors", currentStep >= 2 ? "bg-primary" : "bg-muted")} />
                      </div>
                    )}
                  </div>
                  
                  <ScrollArea className="flex-1">
                    <div className="p-8 space-y-8">
                      {currentStep === 1 ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Select Provider</Label>
                            <Select value={selectedProvider || ""} onValueChange={setSelectedProvider}>
                              <SelectTrigger className="h-12 text-base font-bold bg-background">
                                <SelectValue placeholder="Choose POS brand" />
                              </SelectTrigger>
                              <SelectContent>
                                {SUPPORTED_POS.map(pos => (
                                  <SelectItem key={pos.id} value={pos.id}>
                                    <div className="flex flex-col py-1">
                                      <span className="font-bold">{pos.name}</span>
                                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{pos.description}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {selectedProvider === 'oracle-simphony' && (
                            <div className="space-y-6">
                              <div className="grid gap-6">
                                <div className="space-y-2">
                                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Globe className="h-3.5 w-3.5" /> OIDC URL
                                  </Label>
                                  <Input placeholder="https://act-omra-idm.oracleindustry.com" className="h-11 font-medium bg-background border-muted-foreground/20" />
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Globe className="h-3.5 w-3.5" /> STS URL
                                  </Label>
                                  <Input placeholder="https://act-sts.oraclecloud.com" className="h-11 font-medium bg-background border-muted-foreground/20" />
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Lock className="h-3.5 w-3.5" /> Client ID
                                  </Label>
                                  <Input placeholder="Enter your Client ID..." className="h-11 font-mono text-sm bg-background border-muted-foreground/20" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                      <User className="h-3.5 w-3.5" /> Username
                                    </Label>
                                    <Input placeholder="KPTAC" className="h-11 font-medium bg-background border-muted-foreground/20" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                      <Lock className="h-3.5 w-3.5" /> Password
                                    </Label>
                                    <Input type="password" placeholder="••••••••••••" className="h-11 font-medium bg-background border-muted-foreground/20" />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Hash className="h-3.5 w-3.5" /> Org Short Name
                                  </Label>
                                  <Input placeholder="ACT" className="h-11 font-medium bg-background border-muted-foreground/20" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                          <div className="rounded-2xl border border-muted-foreground/10 bg-card p-8 shadow-sm space-y-8">
                            <div className="grid grid-cols-1 gap-8">
                              <div className="space-y-2">
                                <Label className="text-sm font-bold">Location</Label>
                                <Select 
                                  value={locationValue || ""} 
                                  onValueChange={(val) => {
                                    setLocationValue(val);
                                    setRevenueCenterValue(null);
                                  }}
                                >
                                  <SelectTrigger className="h-11 bg-background">
                                    <SelectValue placeholder="Select a location" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="main">Main Outlet</SelectItem>
                                    <SelectItem value="annex">Annex Lounge</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label className={cn("text-sm font-bold transition-opacity", !locationValue && "opacity-50")}>Revenue Center</Label>
                                <Select 
                                  disabled={!locationValue}
                                  value={revenueCenterValue || ""}
                                  onValueChange={setRevenueCenterValue}
                                >
                                  <SelectTrigger className={cn("h-11 transition-colors", !locationValue ? "bg-muted cursor-not-allowed" : "bg-background")}>
                                    <SelectValue placeholder={!locationValue ? "Select location first" : "Select Revenue Center"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="food">Dine-in Food</SelectItem>
                                    <SelectItem value="bar">Bar Revenue</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label className={cn("text-sm font-bold transition-opacity", !revenueCenterValue && "opacity-50")}>Tender</Label>
                                <Select disabled={!revenueCenterValue}>
                                  <SelectTrigger className={cn("h-11 transition-colors", !revenueCenterValue ? "bg-muted cursor-not-allowed" : "bg-background")}>
                                    <SelectValue placeholder={!revenueCenterValue ? "Select center first" : "Select Tender"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="visa">Visa/Mastercard</SelectItem>
                                    <SelectItem value="cash">Cash Tender</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label className={cn("text-sm font-bold transition-opacity", !revenueCenterValue && "opacity-50")}>Employee ID</Label>
                                <Input 
                                  disabled={!revenueCenterValue}
                                  placeholder="Enter Employee's ID" 
                                  className={cn("h-11 transition-colors", !revenueCenterValue ? "bg-muted cursor-not-allowed" : "bg-background")} 
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  <SheetFooter className="p-6 bg-muted/30 border-t shrink-0 flex flex-row items-center justify-between gap-4">
                    {currentStep === 1 ? (
                      <>
                        <Button variant="ghost" className="font-bold px-8 h-11" onClick={() => setIsConnectDrawerOpen(false)}>Cancel</Button>
                        <Button 
                          className="font-bold bg-primary text-primary-foreground px-10 h-11 shadow-lg gap-2" 
                          disabled={!selectedProvider}
                          onClick={() => setCurrentStep(2)}
                        >
                          Next <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" className="font-bold px-8 h-11 gap-2" onClick={() => setCurrentStep(1)}>
                          <ArrowLeft className="h-4 w-4" /> Back
                        </Button>
                        <Button 
                          className="font-bold bg-primary text-primary-foreground px-10 h-11 shadow-lg" 
                          onClick={startSyncProcess}
                          disabled={!revenueCenterValue}
                        >
                          Verify & Connect
                        </Button>
                      </>
                    )}
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {connections.map((conn) => (
              <Card key={conn.id} className={cn(
                "overflow-hidden border-2 transition-all hover:shadow-md",
                conn.status === 'error' ? "border-destructive/20" : "border-border"
              )}>
                <CardHeader className="pb-4 bg-muted/10 border-b">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white shadow-sm border flex items-center justify-center">
                        <Monitor className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg font-bold truncate">{conn.label}</CardTitle>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.1em]">{conn.brand}</p>
                      </div>
                    </div>
                    {getStatusBadge(conn.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-muted/30 border space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Status</p>
                      <p className="text-xs font-bold capitalize">{conn.status}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/30 border space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Last Sync</p>
                      <p className="text-xs font-bold">{conn.lastSync}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t pt-4 px-1">
                    <span className="font-semibold uppercase tracking-wider">Terminal Identifier</span>
                    <span className="font-mono font-bold text-foreground">{conn.terminalId}</span>
                  </div>

                  {conn.status === 'error' && (
                    <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 flex items-start gap-3 animate-in fade-in zoom-in duration-300">
                      <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-destructive">Connection Failed</p>
                        <p className="text-[10px] leading-tight text-destructive/80 font-medium">Credentials for this terminal have expired. Re-authentication is required to restore sync.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-muted/20 border-t p-3 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-lg">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10 rounded-lg" onClick={() => handleDeleteConnection(conn.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" className="h-9 text-[10px] font-bold uppercase tracking-widest px-4 gap-2 border-muted-foreground/20 rounded-lg" onClick={() => toast({ title: "Manual Refresh", description: `Updating ${conn.label} data...` })}>
                    <RefreshCw className="h-3.5 w-3.5" />
                    Manual Refresh
                  </Button>
                </CardFooter>
              </Card>
            ))}

            <button 
              onClick={() => setIsConnectDrawerOpen(true)}
              className="h-full min-h-[280px] rounded-2xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center gap-5 hover:bg-muted/10 hover:border-primary/30 transition-all group relative overflow-hidden"
            >
              <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="text-center px-8">
                <p className="font-bold text-base text-foreground">Add Terminal</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-medium">Connect another POS machine to your digital management hub.</p>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Syncing Progress Dialog */}
      <Dialog open={isSyncing} onOpenChange={(open) => !open && setIsSyncing(false)}>
        <DialogContent className="sm:max-w-md p-8 border-0 shadow-2xl bg-white">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="relative">
              <div className={cn(
                "h-24 w-24 rounded-full border-4 border-muted flex items-center justify-center transition-all duration-500",
                isSyncComplete ? "border-green-500 bg-green-50" : "border-primary/20"
              )}>
                {isSyncComplete ? (
                  <Check className="h-12 w-12 text-green-600 animate-in zoom-in duration-300" />
                ) : (
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                )}
              </div>
              {!isSyncComplete && (
                <div className="absolute inset-0 h-24 w-24 rounded-full border-t-4 border-primary animate-spin" style={{ animationDuration: '1.5s' }} />
              )}
            </div>

            <div className="space-y-2 w-full">
              <DialogTitle className="text-2xl font-bold text-foreground">
                {isSyncComplete ? "Successfully Connected" : "Connecting to Machine"}
              </DialogTitle>
              <DialogDescription className="font-medium text-muted-foreground text-sm">
                {isSyncComplete 
                  ? `Machine verified. ${items.length} food items found.` 
                  : "We are establishing a secure connection and reading your menu data."}
              </DialogDescription>
            </div>

            {!isSyncComplete && (
              <div className="w-full space-y-2">
                <Progress value={syncProgress} className="h-2" />
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <span>Reading Data...</span>
                  <span>{syncProgress}%</span>
                </div>
              </div>
            )}

            {isSyncComplete && (
              <Button 
                className="w-full h-12 font-bold bg-primary hover:bg-primary/90 text-primary-foreground animate-in slide-in-from-bottom-2"
                onClick={handleReviewMenu}
              >
                Review Imported Menu
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* BIG Center Verification Modal - LIGHT THEME */}
      <Dialog open={isVerificationModalOpen} onOpenChange={setIsVerificationModalOpen}>
        <DialogContent 
          className={cn(
            "p-0 overflow-hidden flex flex-col border shadow-2xl transition-all duration-500 ease-in-out bg-white rounded-2xl",
            isExpanded ? "max-w-full w-[100vw] h-[100vh] rounded-none m-0" : "max-w-7xl w-[95vw] h-[90vh]"
          )}
        >
          {/* Accessibility Requirements */}
          <DialogTitle className="sr-only">POS Menu Review</DialogTitle>
          <DialogDescription className="sr-only">Verify and manage menu items imported from your connected POS machine.</DialogDescription>

          {/* Custom Modern Header - LIGHT */}
          <div className="bg-white border-b p-6 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Menu Review</h2>
                <div className="flex items-center gap-2 text-muted-foreground font-medium text-xs">
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest py-0.5">Machine Active</Badge>
                  <span>{SUPPORTED_POS.find(p => p.id === selectedProvider)?.name || 'Machine Connection'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-10 w-10 rounded-xl"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <div className="h-8 w-px bg-border mx-2" />
              <Button variant="ghost" className="h-10 font-bold gap-2 text-muted-foreground hover:text-primary" onClick={resetFilters}>
                <RefreshCw className="h-4 w-4" /> Refresh Data
              </Button>
            </div>
          </div>

          {/* Search & Bulk Actions - LIGHT */}
          <div className="p-4 border-b bg-muted/20 flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-4 flex-1 w-full sm:max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Find a product by name or ID..." 
                  className="pl-10 h-11 bg-white border-muted-foreground/20 shadow-sm rounded-xl font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Status Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className={cn(
                    "h-11 gap-2 text-[10px] font-bold uppercase tracking-widest bg-white rounded-xl shadow-sm border-muted-foreground/20",
                    statusFilter !== 'all' && "border-primary bg-primary/5 text-primary"
                  )}>
                    <ListFilter className="h-4 w-4" /> 
                    {statusFilter === 'all' ? 'Filter Status' : statusFilter === 'visible' ? 'Visible Only' : 'Hidden Only'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 rounded-xl shadow-xl border-muted-foreground/10">
                  <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">Select Visibility</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                    <DropdownMenuRadioItem value="all" className="font-bold py-2.5">Show All Items</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="visible" className="font-bold py-2.5 text-primary">Visible Items</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="hidden" className="font-bold py-2.5 text-muted-foreground">Hidden Items</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Category Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className={cn(
                    "h-11 gap-2 text-[10px] font-bold uppercase tracking-widest bg-white rounded-xl shadow-sm border-muted-foreground/20",
                    categoryFilter !== 'all' && "border-primary bg-primary/5 text-primary"
                  )}>
                    <Layers className="h-4 w-4" /> 
                    {categoryFilter === 'all' ? 'Categories' : categoryFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 rounded-xl shadow-xl border-muted-foreground/10">
                  <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">Menu Sections</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <ScrollArea className="h-[280px]">
                    <DropdownMenuRadioGroup value={categoryFilter} onValueChange={setCategoryFilter}>
                      <DropdownMenuRadioItem value="all" className="font-bold py-2.5">All Categories</DropdownMenuRadioItem>
                      {uniqueCategories.map(cat => (
                        <DropdownMenuRadioItem key={cat} value={cat} className="font-bold py-2.5">
                          {cat}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {selectedItemIds.size > 0 ? (
              <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 px-5 py-2 rounded-xl animate-in zoom-in duration-300 shadow-sm">
                <span className="text-xs font-bold text-primary uppercase tracking-widest">{selectedItemIds.size} Items Selected</span>
                <div className="flex items-center gap-2 border-l border-primary/20 pl-4 ml-2">
                  <Button size="sm" className="h-8 text-[10px] font-bold bg-primary text-white uppercase rounded-lg px-4" onClick={() => handleBulkAction('enable')}>
                    Show on Menu
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-[10px] font-bold text-destructive hover:bg-destructive/5 uppercase rounded-lg border-destructive/20 px-4" onClick={() => handleBulkAction('disable')}>
                    Hide on Menu
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          {/* The Large Table - LIGHT */}
          <div className="flex-1 overflow-hidden flex flex-col bg-white">
            <ScrollArea className="flex-1">
              <Table>
                <TableHeader className="sticky top-0 z-40 bg-white shadow-sm border-b">
                  <TableRow className="hover:bg-transparent border-0 h-12">
                    <TableHead className="w-12 px-6">
                      <Checkbox 
                        checked={selectedItemIds.size === filteredItems.length && filteredItems.length > 0}
                        onCheckedChange={toggleAllVisible}
                      />
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground py-4">Product Details</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground py-4">Machine Identifier</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground text-right py-4">Base Price</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground text-right py-4 pr-10">Status</TableHead>
                  </TableRow>
                </TableHeader>
                
                {Object.entries(itemsByCategory).map(([category, subCats]) => (
                  <TableBody key={category} className="border-t-0">
                    {/* CATEGORY LEVEL HEADER - OPAQUE & STICKY WITHIN TBODY */}
                    <TableRow className="bg-[#f4fbf9] hover:bg-[#ebf7f5] border-y sticky top-[48px] z-30 transition-colors">
                      <TableCell colSpan={5} className="py-4 px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-9 w-9 rounded-xl bg-white border border-primary/20 flex items-center justify-center shadow-sm">
                              <ChevronDown className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/70 leading-none mb-1">Section</span>
                              <span className="text-base font-bold text-foreground leading-none">{category}</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="font-bold text-[9px] px-3 bg-white/50 border-primary/10">
                            {Object.values(subCats).flat().length} PRODUCTS
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>

                    {Object.entries(subCats).map(([subCat, subItems]) => (
                      <React.Fragment key={subCat}>
                        {/* SUBCATEGORY LEVEL HEADER */}
                        <TableRow className="bg-muted/10 hover:bg-muted/20 border-b border-muted/30">
                          <TableCell colSpan={5} className="py-3 pl-16 pr-6">
                            <div className="flex items-center gap-3">
                              <div className="h-4 w-[2px] bg-primary/40 rounded-full" />
                              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em]">{subCat}</span>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* ITEM ROWS */}
                        {subItems.map((item) => (
                          <TableRow key={item.id} className={cn(
                            "group transition-colors border-b last:border-0",
                            selectedItemIds.has(item.id) ? "bg-primary/[0.02] hover:bg-primary/[0.04]" : "hover:bg-muted/5",
                            !item.enabled && "opacity-60 grayscale-[0.5]"
                          )}>
                            <TableCell className="px-6">
                              <Checkbox 
                                checked={selectedItemIds.has(item.id)}
                                onCheckedChange={() => toggleItemSelection(item.id)}
                              />
                            </TableCell>
                            <TableCell className="pl-16">
                              <div className="flex flex-col py-2">
                                <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{item.name}</span>
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight flex items-center gap-1.5 mt-0.5">
                                  <CheckCircle2 className="h-3 w-3 text-green-500/60" /> Direct from your machine
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <code className="bg-muted px-2 py-1 rounded text-[10px] font-bold text-muted-foreground border shadow-inner">
                                {item.posId}
                              </code>
                            </TableCell>
                            <TableCell className="text-right font-bold font-mono text-sm text-foreground">
                              {item.price}
                            </TableCell>
                            <TableCell className="text-right pr-10">
                              <div className="flex justify-end items-center gap-4">
                                <span className={cn(
                                  "text-[9px] font-bold uppercase tracking-widest",
                                  item.enabled ? "text-primary" : "text-muted-foreground"
                                )}>
                                  {item.enabled ? 'Visible' : 'Hidden'}
                                </span>
                                <Switch 
                                  checked={item.enabled} 
                                  onCheckedChange={(checked) => {
                                    const newItems = items.map(i => i.id === item.id ? { ...i, enabled: checked } : i);
                                    setItems(newItems);
                                  }} 
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}
                  </TableBody>
                ))}
              </Table>
              {filteredItems.length === 0 && (
                <div className="py-32 text-center">
                  <div className="h-20 w-20 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-5">
                    <Search className="h-10 w-10 text-muted-foreground opacity-30" />
                  </div>
                  <p className="text-sm font-bold text-muted-foreground">No items found matching current filters</p>
                  <Button variant="link" className="mt-2 text-primary font-bold" onClick={resetFilters}>Clear all filters</Button>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Verification Footer - LIGHT */}
          <div className="p-6 bg-muted/10 border-t shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-1">Total Imported</span>
                <span className="text-2xl font-bold text-foreground tabular-nums">{items.length}</span>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-primary/70 uppercase tracking-[0.15em] mb-1">Ready to Publish</span>
                <span className="text-2xl font-bold text-primary tabular-nums">{items.filter(i => i.enabled).length}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="font-bold px-8 h-12 text-muted-foreground rounded-xl" onClick={() => setIsVerificationModalOpen(false)}>Review Later</Button>
              <Button className="font-bold bg-primary text-primary-foreground px-12 h-12 shadow-lg gap-2 rounded-xl border-b-4 border-primary-foreground/10 active:border-b-0 active:translate-y-1 transition-all" onClick={handleFinishSync}>
                Confirm & Finish
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog - Celebratory */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md p-10 border-0 shadow-2xl overflow-hidden bg-white text-center">
          <div className="absolute -top-10 -right-10 p-8 opacity-10 pointer-events-none rotate-12">
            <Database className="h-48 w-48 text-primary" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center space-y-6">
            <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center shadow-sm border border-primary/20">
              <CheckCircle2 className="h-10 w-10 text-primary animate-in zoom-in duration-500" />
            </div>
            
            <div className="space-y-3">
              <DialogTitle className="text-3xl font-bold tracking-tight text-foreground leading-tight">
                Synchronization Accomplished!
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-base font-medium leading-relaxed max-w-[280px] mx-auto">
                Your digital menu is now connected to your machine. Prices and stock will now stay updated automatically.
              </DialogDescription>
            </div>

            <Button 
              className="w-full h-12 font-bold uppercase tracking-widest bg-primary text-white hover:bg-primary/90 shadow-lg rounded-xl"
              onClick={() => setShowSuccessDialog(false)}
            >
              Back to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
