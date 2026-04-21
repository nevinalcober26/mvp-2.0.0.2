'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  ListFilter,
  Tag,
  Edit,
  Save,
  Cog,
  Terminal
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  type PosConnection,
  type PosStatus,
} from '@/app/dashboard/integration/pos/types';
import { GitErrorDialog } from '@/components/dashboard/git-error-dialog';


const SUPPORTED_POS = [
  { id: 'oracle-simphony', name: 'Oracle Micros Simphony', description: 'Enterprise hospitality platform', color: 'bg-red-50 text-red-600' },
  { id: 'toast', name: 'Toast', description: 'Cloud-based restaurant platform', color: 'bg-orange-50 text-orange-600' },
  { id: 'square', name: 'Square', description: 'Universal payment & POS solution', color: 'bg-blue-50 text-blue-600' },
  { id: 'revel', name: 'Revel Systems', description: 'iPad-based POS for high volume', color: 'bg-indigo-50 text-indigo-600' },
  { id: 'clover', name: 'Clover', description: 'Integrated merchant services', color: 'bg-green-50 text-green-600' },
];

// Reflecting the provided Simphony JSON Schema
interface SimphonyProduct {
  id: string;
  name: string;
  subtitle: string;
  machineIdentifier: string;
  basePrice: number;
  currency: string;
  isVisible: boolean;
  category: string; // Mapping "Section" title here
}

const SIMPHONY_MOCK_DATA: SimphonyProduct[] = [
  { id: "prd_sim_1013", name: "Pastas Selection #1", subtitle: "DIRECT FROM YOUR MACHINE", machineIdentifier: "SIM-1013", basePrice: 21.65, currency: "USD", isVisible: true, category: "Main Courses" },
  { id: "prd_sim_1014", name: "Pastas Selection #2", subtitle: "DIRECT FROM YOUR MACHINE", machineIdentifier: "SIM-1014", basePrice: 24.95, currency: "USD", isVisible: true, category: "Main Courses" },
  { id: "prd_sim_1015", name: "Pastas Selection #3", subtitle: "DIRECT FROM YOUR MACHINE", machineIdentifier: "SIM-1015", basePrice: 28.8, currency: "USD", isVisible: true, category: "Main Courses" },
  { id: "prd_sim_1016", name: "Pastas Selection #4", subtitle: "DIRECT FROM YOUR MACHINE", machineIdentifier: "SIM-1016", basePrice: 32.2, currency: "USD", isVisible: true, category: "Main Courses" },
  { id: "prd_sim_1017", name: "Pastas Selection #5", subtitle: "DIRECT FROM YOUR MACHINE", machineIdentifier: "SIM-1017", basePrice: 30.15, currency: "USD", isVisible: true, category: "Main Courses" },
  { id: "prd_sim_1018", name: "Pastas Selection #6", subtitle: "DIRECT FROM YOUR MACHINE", machineIdentifier: "SIM-1018", basePrice: 33.45, currency: "USD", isVisible: true, category: "Main Courses" },
  { id: "prd_sim_1019", name: "Pastas Selection #7", subtitle: "DIRECT FROM YOUR MACHINE", machineIdentifier: "SIM-1019", basePrice: 49.85, currency: "USD", isVisible: true, category: "Main Courses" },
  { id: "prd_sim_1020", name: "Pastas Selection #8", subtitle: "DIRECT FROM YOUR MACHINE", machineIdentifier: "SIM-1020", basePrice: 32.85, currency: "USD", isVisible: true, category: "Main Courses" },
  { id: "prd_sim_1021", name: "Pastas Selection #9", subtitle: "DIRECT FROM YOUR MACHINE", machineIdentifier: "SIM-1021", basePrice: 17.15, currency: "USD", isVisible: true, category: "Main Courses" },
  { id: "prd_sim_1022", name: "Pastas Selection #10", subtitle: "DIRECT FROM YOUR MACHINE", machineIdentifier: "SIM-1022", basePrice: 48.57, currency: "USD", isVisible: true, category: "Main Courses" },
  { id: "prd_sim_1023", name: "Pastas Selection #11", subtitle: "DIRECT FROM YOUR MACHINE", machineIdentifier: "SIM-1023", basePrice: 45.65, currency: "USD", isVisible: false, category: "Main Courses" },
  { id: "prd_sim_1024", name: "Pastas Selection #12", subtitle: "DIRECT FROM YOUR MACHINE", machineIdentifier: "SIM-1024", basePrice: 20.3, currency: "USD", isVisible: true, category: "Main Courses" },
  { id: "prd_sim_1025", name: "Pastas Selection #13", subtitle: "DIRECT FROM YOUR MACHINE", machineIdentifier: "SIM-1025", basePrice: 23.7, currency: "USD", isVisible: true, category: "Main Courses" },
  { id: "prd_sim_1026", name: "Pastas Selection #14", subtitle: "DIRECT FROM YOUR MACHINE", machineIdentifier: "SIM-1026", basePrice: 27.25, currency: "USD", isVisible: true, category: "Main Courses" },
  { id: "prd_sim_1027", name: "Pastas Selection #15", subtitle: "DIRECT FROM YOUR MACHINE", machineIdentifier: "SIM-1027", basePrice: 25.4, currency: "USD", isVisible: true, category: "Main Courses" },
  { id: "prd_sim_1028", name: "Pastas Selection #16", subtitle: "DIRECT FROM YOUR MACHINE", machineIdentifier: "SIM-1028", basePrice: 28.9, currency: "USD", isVisible: true, category: "Main Courses" },
  { id: "prd_sim_1029", name: "Pastas Selection #17", subtitle: "DIRECT FROM YOUR MACHINE", machineIdentifier: "SIM-1029", basePrice: 32.8, currency: "USD", isVisible: true, category: "Main Courses" },
  { id: "prd_sim_1030", name: "Pastas Selection #18", subtitle: "DIRECT FROM YOUR MACHINE", machineIdentifier: "SIM-1030", basePrice: 35.45, currency: "USD", isVisible: true, category: "Main Courses" },
  { id: "prd_sim_1031", name: "Pastas Selection #19", subtitle: "DIRECT FROM YOUR MACHINE", machineIdentifier: "SIM-1031", basePrice: 39.75, currency: "USD", isVisible: true, category: "Main Courses" },
  { id: "prd_sim_1032", name: "Pastas Selection #20", subtitle: "DIRECT FROM YOUR MACHINE", machineIdentifier: "SIM-1032", basePrice: 37.15, currency: "USD", isVisible: true, category: "Main Courses" },
  { id: "prd_sim_1033", name: "Pastas Selection #21", subtitle: "DIRECT FROM YOUR MACHINE", machineIdentifier: "SIM-1033", basePrice: 41.15, currency: "USD", isVisible: true, category: "Main Courses" },
  { id: "prd_sim_1034", name: "Pastas Selection #22", subtitle: "DIRECT FROM YOUR MACHINE", machineIdentifier: "SIM-1034", basePrice: 44.4, currency: "USD", isVisible: false, category: "Main Courses" },
  { id: "prd_sim_1035", name: "Pastas Selection #23", subtitle: "DIRECT FROM YOUR MACHINE", machineIdentifier: "SIM-1035", basePrice: 47.55, currency: "USD", isVisible: true, category: "Main Courses" },
  // Adding variety categories
  { id: "prd_sim_2001", name: "Cappuccino", subtitle: "DIRECT FROM YOUR MACHINE", machineIdentifier: "SIM-2001", basePrice: 4.50, currency: "USD", isVisible: true, category: "Beverages" },
  { id: "prd_sim_2002", name: "Iced Latte", subtitle: "DIRECT FROM YOUR MACHINE", machineIdentifier: "SIM-2002", basePrice: 5.25, currency: "USD", isVisible: true, category: "Beverages" },
];

export default function PosIntegrationPage() {
  const { toast } = useToast();
  const [isConnectDrawerOpen, setIsConnectDrawerOpen] = useState(false);
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Connection Flow States
  const [connections, setConnections] = useState<PosConnection[]>([]);
  const [terminalLabel, setTerminalLabel] = useState('');
  const [locationValue, setLocationValue] = useState<string | null>(null);
  const [revenueCenterValue, setRevenueCenterValue] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncComplete, setIsSyncComplete] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isGitErrorDialogOpen, setIsGitErrorDialogOpen] = useState(false);
  
  // Verification List States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedItemIds, setSelectedItems] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<SimphonyProduct[]>(SIMPHONY_MOCK_DATA);
  const [editingItem, setEditingItem] = useState<SimphonyProduct | null>(null);

  // Settings Temp State
  const [tempSettings, setTempSettings] = useState<Partial<PosConnection>>({});

  useEffect(() => {
    try {
        const storedConnections = localStorage.getItem('posConnections');
        if (storedConnections) {
            setConnections(JSON.parse(storedConnections));
        }
    } catch (e) {
        console.error("Failed to parse POS connections from localStorage", e);
    }
  }, []);

  const updateConnections = (newConnections: PosConnection[] | ((prev: PosConnection[]) => PosConnection[])) => {
    const updated = typeof newConnections === 'function' ? newConnections(connections) : newConnections;
    setConnections(updated);
    try {
        localStorage.setItem('posConnections', JSON.stringify(updated));
    } catch (e) {
        console.error("Failed to save POS connections to localStorage", e);
    }
  }

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
                           item.machineIdentifier.toLowerCase().includes(query);
      
      const matchesStatus = statusFilter === 'all' 
        ? true 
        : statusFilter === 'visible' ? item.isVisible : !item.isVisible;
      
      const matchesCategory = categoryFilter === 'all' 
        ? true 
        : item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [items, searchQuery, statusFilter, categoryFilter]);

  const itemsByCategory = useMemo(() => {
    const groups: Record<string, typeof items> = {};
    filteredItems.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
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
        return { ...item, isVisible: action === 'enable' };
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

  const handleSaveItemEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    
    const updatedItems = items.map(item => item.id === editingItem.id ? editingItem : item);
    setItems(updatedItems);
    setEditingItem(null);
    toast({
      title: "Item Updated",
      description: `${editingItem.name} has been updated successfully.`
    });
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
    const providerName = SUPPORTED_POS.find(p => p.id === selectedProvider)?.name || 'New POS';
    
    let finalLabel = terminalLabel.trim();
    if (!finalLabel) {
      const locationName = locationValue === 'main' ? 'Main Outlet' : locationValue === 'annex' ? 'Annex Lounge' : 'Terminal';
      const centerName = revenueCenterValue === 'food' ? 'Food' : revenueCenterValue === 'bar' ? 'Bar' : '';
      finalLabel = centerName ? `${locationName} - ${centerName}` : locationName;
    }
    
    const newConnection: PosConnection = {
      id: Date.now().toString(),
      brand: providerName,
      label: finalLabel,
      status: 'active',
      lastSync: 'just now',
      terminalId: `${selectedProvider?.substring(0, 3).toUpperCase() || 'POS'}-${Math.floor(1000 + Math.random() * 9000)}`,
      location: locationValue || undefined,
      revenueCenter: revenueCenterValue || undefined,
      providerId: selectedProvider || undefined,
    };

    updateConnections([newConnection]);
    setIsVerificationModalOpen(false);
    setShowSuccessDialog(true);
    resetWorkflow();
  };

  const resetWorkflow = () => {
    setSelectedProvider(null);
    setCurrentStep(1);
    setTerminalLabel('');
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
    updateConnections([]);
    toast({
      title: "Connection Removed",
      description: "The POS terminal has been disconnected."
    });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  const handleOpenSettings = (conn: PosConnection) => {
    setTempSettings({ ...conn });
    setIsSettingsDrawerOpen(true);
  };

  const handleSaveSettings = () => {
    if (connections.length > 0) {
      const updated = { ...connections[0], ...tempSettings };
      updateConnections([updated]);
      setIsSettingsDrawerOpen(false);
      toast({
        title: "Configuration Saved",
        description: "Your terminal settings have been updated successfully."
      });
    }
  };

  return (
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 lg:p-10 bg-muted/20 min-h-[calc(100vh-4rem)]">
        <div className="max-w-6xl mx-auto space-y-8 text-left">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">POS Integration</h1>
              <p className="text-muted-foreground text-sm font-medium">Link your physical terminal to automate your digital menu.</p>
            </div>
          </div>

          {connections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-background rounded-3xl border-2 border-dashed border-muted-foreground/20 space-y-8 animate-in fade-in zoom-in duration-500 w-full text-center px-6">
               <div className="h-24 w-24 rounded-[2rem] bg-muted/50 flex items-center justify-center">
                  <Monitor className="h-12 w-12 text-muted-foreground opacity-30" />
               </div>
               <div className="space-y-3 max-w-md">
                  <h3 className="text-2xl font-bold tracking-tight">No POS Connected</h3>
                  <p className="text-muted-foreground text-base font-medium leading-relaxed">
                    Your digital menu is currently static. Connect your physical terminal to unlock real-time pricing and automated stock management.
                  </p>
               </div>
               <Sheet open={isConnectDrawerOpen} onOpenChange={setIsConnectDrawerOpen}>
                <SheetTrigger asChild>
                  <Button className="gap-2 font-bold bg-primary hover:bg-primary/90 shadow-xl px-10 h-14 rounded-2xl text-base">
                    <Plus className="h-5 w-5" />
                    Connect Your POS
                  </Button>
                </SheetTrigger>
                <SheetContent className="sm:max-w-xl p-0 overflow-hidden flex flex-col border-l shadow-2xl bg-white text-left">
                  <div className="bg-muted/30 p-8 border-b shrink-0">
                    <SheetHeader className="text-left space-y-2">
                      <SheetTitle className="text-2xl font-bold text-foreground">Add POS Connection</SheetTitle>
                      <SheetDescription className="text-muted-foreground font-medium">
                        {currentStep === 1 && "Step 1: Select your provider to begin."}
                        {currentStep === 2 && "Step 2: Enter your machine credentials."}
                        {currentStep === 3 && "Step 3: Map your terminal to your venue."}
                      </SheetDescription>
                    </SheetHeader>
                    {selectedProvider && (
                      <div className="mt-6 flex items-center gap-2">
                        <div className={cn("h-1 flex-1 rounded-full transition-colors", currentStep >= 1 ? "bg-primary" : "bg-muted")} />
                        <div className={cn("h-1 flex-1 rounded-full transition-colors", currentStep >= 2 ? "bg-primary" : "bg-muted")} />
                        <div className={cn("h-1 flex-1 rounded-full transition-colors", currentStep >= 3 ? "bg-primary" : "bg-muted")} />
                      </div>
                    )}
                  </div>
                  
                  <ScrollArea className="flex-1">
                    <div className="p-8 space-y-8">
                      {currentStep === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                          <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Select Provider</Label>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {SUPPORTED_POS.map((pos) => (
                                <div
                                  key={pos.id}
                                  onClick={() => setSelectedProvider(pos.id)}
                                  className={cn(
                                    "cursor-pointer flex flex-col p-5 rounded-2xl border-2 transition-all duration-300 group",
                                    selectedProvider === pos.id
                                      ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                                      : "border-muted hover:border-accent-foreground/20 bg-background"
                                  )}
                                >
                                  <div className="flex items-center justify-between mb-4">
                                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center font-black text-sm shadow-sm transition-transform group-hover:scale-110", pos.color)}>
                                      {pos.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    {selectedProvider === pos.id && (
                                      <CheckCircle2 className="h-6 w-6 text-primary animate-in zoom-in duration-300" />
                                    )}
                                  </div>
                                  <div className="space-y-1.5">
                                    <p className="font-bold text-base text-foreground">{pos.name}</p>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider leading-tight">
                                      {pos.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {currentStep === 2 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                          {selectedProvider === 'oracle-simphony' && (
                            <section className="space-y-6">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Machine Configuration</h3>
                              </div>
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
                                  <div className="space-y-2 text-left">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                      <User className="h-3.5 w-3.5" /> Username
                                    </Label>
                                    <Input placeholder="KPTAC" className="h-11 font-medium bg-background border-muted-foreground/20" />
                                  </div>
                                  <div className="space-y-2 text-left">
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
                            </section>
                          )}
                        </div>
                      )}

                      {currentStep === 3 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                          <section className="space-y-6">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Terminal Mapping</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-8">
                              <div className="space-y-2 text-left">
                                <Label className="text-sm font-bold flex items-center gap-2">
                                  <Tag className="h-3.5 w-3.5 text-muted-foreground" /> Terminal Label
                                </Label>
                                <Input 
                                  placeholder="e.g. Main Kitchen, Bar Hub" 
                                  value={terminalLabel}
                                  onChange={(e) => setTerminalLabel(e.target.value)}
                                  className="h-11 bg-background font-medium"
                                />
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">How this terminal appears on your integration grid.</p>
                              </div>

                              <div className="space-y-2 text-left">
                                <Label className="text-sm font-bold">Location</Label>
                                <Select 
                                  value={locationValue || ""} 
                                  onValueChange={(val) => {
                                    setLocationValue(val);
                                    setRevenueCenterValue(null);
                                  }}
                                >
                                  <SelectTrigger className="h-11 bg-background font-medium">
                                    <SelectValue placeholder="Select a location" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="main">Main Outlet</SelectItem>
                                    <SelectItem value="annex">Annex Lounge</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2 text-left">
                                <Label className={cn("text-sm font-bold transition-opacity", !locationValue && "opacity-50")}>Revenue Center</Label>
                                <Select 
                                  disabled={!locationValue}
                                  value={revenueCenterValue || ""}
                                  onValueChange={setRevenueCenterValue}
                                >
                                  <SelectTrigger className={cn("h-11 transition-colors font-medium", !locationValue ? "bg-muted cursor-not-allowed" : "bg-background")}>
                                    <SelectValue placeholder={!locationValue ? "Select location first" : "Select Revenue Center"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="food">Dine-in Food</SelectItem>
                                    <SelectItem value="bar">Bar Revenue</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2 text-left">
                                  <Label className={cn("text-sm font-bold transition-opacity", !revenueCenterValue && "opacity-50")}>Tender Type</Label>
                                  <Select disabled={!revenueCenterValue}>
                                    <SelectTrigger className={cn("h-11 transition-colors font-medium", !revenueCenterValue ? "bg-muted cursor-not-allowed" : "bg-background")}>
                                      <SelectValue placeholder={!revenueCenterValue ? "..." : "Select Tender"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="visa">Visa/Mastercard</SelectItem>
                                      <SelectItem value="cash">Cash Tender</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2 text-left">
                                  <Label className={cn("text-sm font-bold transition-opacity", !revenueCenterValue && "opacity-50")}>Employee ID</Label>
                                  <Input 
                                    disabled={!revenueCenterValue}
                                    placeholder="Employee ID" 
                                    className={cn("h-11 transition-colors", !revenueCenterValue ? "bg-muted cursor-not-allowed" : "bg-background")} 
                                  />
                                </div>
                              </div>
                            </div>
                          </section>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  <SheetFooter className="p-6 bg-muted/30 border-t shrink-0 flex flex-row items-center justify-between gap-4">
                    {currentStep === 1 && (
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
                    )}
                    {currentStep === 2 && (
                      <>
                        <Button variant="outline" className="font-bold px-8 h-11 gap-2" onClick={() => setCurrentStep(1)}>
                          <ArrowLeft className="h-4 w-4" /> Back
                        </Button>
                        <Button 
                          className="font-bold bg-primary text-primary-foreground px-10 h-11 shadow-lg gap-2" 
                          onClick={() => setCurrentStep(3)}
                        >
                          Next <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {currentStep === 3 && (
                      <>
                        <Button variant="outline" className="font-bold px-8 h-11 gap-2" onClick={() => setCurrentStep(2)}>
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
          ) : (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-4 duration-500">
              {connections.map((conn) => (
                <Card key={conn.id} className={cn(
                  "overflow-hidden border-2 transition-all hover:shadow-xl rounded-3xl w-full max-w-xl",
                  conn.status === 'error' ? "border-destructive/20" : "border-border"
                )}>
                  <CardHeader className="pb-4 bg-muted/10 border-b text-left">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-white shadow-md border flex items-center justify-center">
                          <Monitor className="h-6 w-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-xl font-bold truncate">{conn.label}</CardTitle>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.1em]">{conn.brand}</p>
                        </div>
                      </div>
                      {getStatusBadge(conn.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-8 space-y-6 text-left">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-muted/30 border space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Operational</p>
                        <p className="text-sm font-bold capitalize">{conn.status}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-muted/30 border space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Last Data Sync</p>
                        <p className="text-sm font-bold">{conn.lastSync}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-6 px-1">
                      <span className="font-semibold uppercase tracking-wider">Machine Identifier</span>
                      <span className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded">{conn.terminalId}</span>
                    </div>

                    {conn.status === 'error' && (
                      <div 
                        className="p-4 rounded-2xl bg-destructive/5 border border-destructive/20 flex items-start gap-3 animate-in fade-in zoom-in duration-300 cursor-pointer hover:bg-destructive/10 transition-colors"
                        onClick={() => setIsGitErrorDialogOpen(true)}
                      >
                        <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-destructive">Connection Failed</p>
                          <p className="text-[10px] leading-tight text-destructive/80 font-medium italic underline decoration-dotted">Click to view diagnostic sync log</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="bg-muted/20 border-t p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-xl"
                        onClick={() => handleOpenSettings(conn)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 text-muted-foreground hover:text-primary rounded-xl"
                        onClick={() => toast({ title: "Manual Refresh", description: "Fetching latest data from terminal..." })}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10 rounded-xl" onClick={() => handleDeleteConnection(conn.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-10 text-xs font-bold uppercase tracking-wide px-4 gap-2 border-primary/20 text-primary hover:bg-primary/5 rounded-xl bg-background shadow-sm flex-shrink-0" 
                      onClick={() => setIsVerificationModalOpen(true)}
                    >
                      <Database className="h-4 w-4" />
                      Manage Sync Menu
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Git Error Diagnostic Dialog */}
      <GitErrorDialog 
        open={isGitErrorDialogOpen}
        onOpenChange={setIsGitErrorDialogOpen}
        message="Git: From https://github.com/nevinalcober26/mvp"
        onShowOutput={() => toast({ title: "Sync Output", description: "OIDC response: 401 Unauthorized for node SIM-4410."})}
        onOpenLog={() => toast({ title: "Opening Log", description: "Accessing integration version history..."})}
      />

      {/* Connection Settings Drawer */}
      <Sheet open={isSettingsDrawerOpen} onOpenChange={setIsSettingsDrawerOpen}>
        <SheetContent className="sm:max-w-xl p-0 overflow-hidden flex flex-col border-l shadow-2xl bg-white text-left">
          <div className="bg-muted/30 p-8 border-b shrink-0">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Cog className="h-5 w-5 text-primary" />
              </div>
              <SheetHeader className="text-left p-0">
                <SheetTitle className="text-2xl font-bold text-foreground">Connection Settings</SheetTitle>
                <SheetDescription className="text-muted-foreground font-medium">Manage operational mappings for your active POS terminal.</SheetDescription>
              </SheetHeader>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-8 space-y-10">
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Identity & Label</h3>
                </div>
                
                <div className="space-y-2 text-left">
                  <Label className="text-sm font-bold flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground" /> Terminal Label
                  </Label>
                  <Input 
                    value={tempSettings.label || ""} 
                    onChange={(e) => setTempSettings(prev => ({ ...prev, label: e.target.value }))}
                    className="h-11 bg-background font-medium"
                  />
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">How this terminal appears on your integration grid.</p>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2 text-left">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">POS Provider</Label>
                    <div className="h-11 flex items-center px-4 rounded-xl bg-muted/30 border border-dashed font-bold text-xs">
                      {tempSettings.brand}
                    </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Machine ID</Label>
                    <div className="h-11 flex items-center px-4 rounded-xl bg-muted/30 border border-dashed font-mono text-xs font-bold">
                      {tempSettings.terminalId}
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-6 pt-4 border-t border-muted">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Venue Mapping</h3>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2 text-left">
                    <Label className="text-sm font-bold">Location</Label>
                    <Select 
                      value={tempSettings.location || ""} 
                      onValueChange={(val) => setTempSettings(prev => ({ ...prev, location: val }))}
                    >
                      <SelectTrigger className="h-11 bg-background font-medium">
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">Main Outlet</SelectItem>
                        <SelectItem value="annex">Annex Lounge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 text-left">
                    <Label className="text-sm font-bold">Revenue Center</Label>
                    <Select 
                      value={tempSettings.revenueCenter || ""} 
                      onValueChange={(val) => setTempSettings(prev => ({ ...prev, revenueCenter: val }))}
                    >
                      <SelectTrigger className="h-11 bg-background font-medium">
                        <SelectValue placeholder="Select Revenue Center" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="food">Dine-in Food</SelectItem>
                        <SelectItem value="bar">Bar Revenue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2 text-left">
                      <Label className="text-sm font-bold">Tender Type</Label>
                      <Select defaultValue="visa">
                        <SelectTrigger className="h-11 bg-background font-medium">
                          <SelectValue placeholder="Select Tender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="visa">Visa/Mastercard</SelectItem>
                          <SelectItem value="cash">Cash Tender</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 text-left">
                      <Label className="text-sm font-bold">Employee ID</Label>
                      <Input defaultValue="1001" className="h-11 bg-background font-medium" />
                    </div>
                  </div>
                </div>
              </section>

              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-orange-800 font-medium leading-tight text-left">
                  Note: Changes to Venue Mapping may affect how transactions are recorded in your POS. Consult your terminal administrator before making changes.
                </p>
              </div>
            </div>
          </ScrollArea>

          <SheetFooter className="p-6 bg-muted/30 border-t shrink-0 flex flex-row items-center justify-end gap-3">
            <Button variant="ghost" className="font-bold px-8 h-11" onClick={() => setIsSettingsDrawerOpen(false)}>Cancel</Button>
            <Button className="font-bold bg-primary text-primary-foreground px-10 h-11 shadow-lg" onClick={handleSaveSettings}>
              Save Changes
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Syncing Progress Dialog */}
      <Dialog open={isSyncing} onOpenChange={(open) => !open && setIsSyncing(false)}>
        <DialogContent className="sm:max-w-md p-8 border-0 shadow-2xl bg-white text-left">
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

            <div className="space-y-2 w-full text-center">
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

      {/* BIG Center Verification Modal */}
      <Dialog open={isVerificationModalOpen} onOpenChange={setIsVerificationModalOpen}>
        <DialogContent 
          className={cn(
            "p-0 overflow-hidden flex flex-col border shadow-2xl transition-all duration-500 ease-in-out bg-white rounded-2xl text-left",
            isExpanded ? "max-w-full w-[100vw] h-[100vh] rounded-none m-0" : "max-w-7xl w-[95vw] h-[90vh]"
          )}
        >
          <DialogTitle className="sr-only">POS Menu Review & Management</DialogTitle>
          <DialogDescription className="sr-only">Verify and manage menu items imported from your connected POS machine. You can edit names, prices, and visibility.</DialogDescription>

          <div className="bg-white border-b p-6 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-0.5">
                <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">Manage Sync Menu</DialogTitle>
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

          <div className="p-4 border-b bg-muted/20 flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-4 flex-1 w-full sm:max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  placeholder="Find a product by name or ID..." 
                  className="w-full pl-10 h-11 bg-white border border-muted-foreground/20 shadow-sm rounded-xl font-medium px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className={cn(
                    "h-11 gap-2 text-[10px] font-bold uppercase tracking-widest bg-white rounded-xl shadow-sm border-muted-foreground/20",
                    categoryFilter !== 'all' && "border-primary bg-primary/5 text-primary"
                  )}>
                    <Layers className="h-4 w-4" /> 
                    {categoryFilter === 'all' ? 'Sections' : categoryFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 rounded-xl shadow-xl border-muted-foreground/10">
                  <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">Menu Sections</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <ScrollArea className="h-[280px]">
                    <DropdownMenuRadioGroup value={categoryFilter} onValueChange={setCategoryFilter}>
                      <DropdownMenuRadioItem value="all" className="font-bold py-2.5">All Sections</DropdownMenuRadioItem>
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
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                
                {Object.entries(itemsByCategory).map(([category, catItems]) => (
                  <TableBody key={category} className="border-t-0">
                    <TableRow className="bg-[#f4fbf9] hover:bg-[#ebf7f5] border-y sticky top-[48px] z-30 transition-colors">
                      <TableCell colSpan={6} className="py-4 px-6">
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
                            {catItems.length} PRODUCTS
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>

                    {catItems.map((item) => (
                      <TableRow key={item.id} className={cn(
                        "group transition-colors border-b last:border-0",
                        selectedItemIds.has(item.id) ? "bg-primary/[0.02] hover:bg-primary/[0.04]" : "hover:bg-muted/5",
                        !item.isVisible && "opacity-60 grayscale-[0.5]"
                      )}>
                        <TableCell className="px-6">
                          <Checkbox 
                            checked={item.id && selectedItemIds.has(item.id)}
                            onCheckedChange={() => toggleItemSelection(item.id)}
                          />
                        </TableCell>
                        <TableCell className="pl-6">
                          <div className="flex flex-col py-2">
                            <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors text-left">{item.name}</span>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight flex items-center gap-1.5 mt-0.5 text-left">
                              <CheckCircle2 className="h-3 w-3 text-green-500/60" /> {item.subtitle}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="bg-muted px-2 py-1 rounded text-[10px] font-bold text-muted-foreground border shadow-inner">
                            {item.machineIdentifier}
                          </code>
                        </TableCell>
                        <TableCell className="text-right font-bold font-mono text-sm text-foreground">
                          ${item.basePrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right pr-10">
                          <div className="flex justify-end items-center gap-4">
                            <span className={cn(
                              "text-[9px] font-bold uppercase tracking-widest",
                              item.isVisible ? "text-primary" : "text-muted-foreground"
                            )}>
                              {item.isVisible ? 'Visible' : 'Hidden'}
                            </span>
                            <Switch 
                              checked={item.isVisible} 
                              onCheckedChange={(checked) => {
                                const newItems = items.map(i => i.id === item.id ? { ...i, isVisible: checked } : i);
                                setItems(newItems);
                              }} 
                            />
                          </div>
                        </TableCell>
                        <TableCell className="pr-6">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingItem(item);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
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

          <div className="p-6 bg-muted/10 border-t shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-1">Total Imported</span>
                <span className="text-2xl font-bold text-foreground tabular-nums">{items.length}</span>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-primary/70 uppercase tracking-[0.15em] mb-1">Ready to Publish</span>
                <span className="text-2xl font-bold text-primary tabular-nums">{items.filter(i => i.isVisible).length}</span>
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

      {/* Item Quick Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white rounded-2xl border shadow-2xl text-left">
          <form onSubmit={handleSaveItemEdit}>
            <div className="p-6 border-b bg-muted/10">
              <DialogTitle className="text-xl font-bold text-foreground">Edit Synced Item</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm font-medium">Update the local display name or price for this product.</DialogDescription>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2 text-left">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Product Name</Label>
                <Input 
                  value={editingItem?.name || ""} 
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="h-11 font-medium bg-background"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 text-left">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Base Price ($)</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={editingItem?.basePrice || ""} 
                    onChange={(e) => setEditingItem(prev => prev ? { ...prev, basePrice: parseFloat(e.target.value) } : null)}
                    className="h-11 font-mono font-bold bg-background"
                  />
                </div>
                <div className="space-y-2 text-left">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">POS Identifier</Label>
                  <div className="h-11 flex items-center px-4 rounded-md bg-muted/50 border border-dashed font-mono text-[10px] font-bold text-muted-foreground">
                    {editingItem?.machineIdentifier}
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-orange-800 font-medium leading-tight text-left">
                  Note: Changes made here only affect the digital menu. Your POS machine data will remain unchanged.
                </p>
              </div>
            </div>
            <DialogFooter className="p-6 bg-muted/10 border-t flex flex-row items-center justify-end gap-3">
              <Button type="button" variant="ghost" className="font-bold" onClick={() => setEditingItem(null)}>Cancel</Button>
              <Button type="submit" className="font-bold bg-primary text-primary-foreground px-8 shadow-md gap-2">
                <Save className="h-4 w-4" /> Save Overrides
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
              <DialogDescription className="text-muted-foreground text-base font-medium leading-relaxed max-w-[280px] mx-auto text-center">
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

