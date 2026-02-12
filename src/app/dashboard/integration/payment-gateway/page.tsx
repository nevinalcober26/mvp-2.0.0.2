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
  ShieldCheck, 
  Zap, 
  WalletCards, 
  Settings, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ArrowLeft,
  ChevronRight,
  Loader2,
  Check,
  Globe,
  Lock,
  CreditCard,
  Building2,
  RefreshCw,
  Power,
  PowerOff,
  Network
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

type GatewayStatus = 'active' | 'sandbox' | 'error' | 'disabled';

interface GatewayConnection {
  id: string;
  brand: string;
  status: GatewayStatus;
  lastSync: string;
  merchantId: string;
  environment: 'live' | 'sandbox';
  isEnabled: boolean;
  providerId: string;
}

const SUPPORTED_GATEWAYS = [
  { 
    id: 'stripe', 
    name: 'Stripe', 
    description: 'Accept Apple Pay, Google Pay, and major credit cards globally.', 
    color: 'bg-blue-50 text-blue-600',
    icon: Zap
  },
  { 
    id: 'network-international', 
    name: 'Network International', 
    description: 'Leading enabler of digital commerce in the Middle East and Africa.', 
    color: 'bg-orange-50 text-orange-600',
    icon: Network
  },
  { 
    id: 'adyen', 
    name: 'Adyen', 
    description: 'Enterprise-grade payment processing for high-volume venues.', 
    color: 'bg-green-50 text-green-600',
    icon: Building2
  },
];

export default function PaymentGatewayPage() {
  const { toast } = useToast();
  
  // Initialize with 2 default gateways as requested
  const [connections, setConnections] = useState<GatewayConnection[]>([
    {
      id: '1',
      brand: 'Stripe',
      status: 'active',
      lastSync: '2 minutes ago',
      merchantId: 'mch_STR_882910',
      environment: 'live',
      isEnabled: true,
      providerId: 'stripe'
    },
    {
      id: '2',
      brand: 'Network International',
      status: 'sandbox',
      lastSync: '1 hour ago',
      merchantId: 'mch_NI_441029',
      environment: 'sandbox',
      isEnabled: true,
      providerId: 'network-international'
    }
  ]);

  const [isConnectDrawerOpen, setIsConnectDrawerOpen] = useState(false);
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Connection Flow States
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncComplete, setIsSyncComplete] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Settings Temp State
  const [editingGateway, setEditingGateway] = useState<GatewayConnection | null>(null);
  const [tempSettings, setTempSettings] = useState<Partial<GatewayConnection>>({});

  const startSyncProcess = () => {
    setIsSyncing(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 5;
      if (progress >= 100) {
        progress = 100;
        setSyncProgress(100);
        setIsSyncComplete(true);
        clearInterval(interval);
      } else {
        setSyncProgress(progress);
      }
    }, 400);
  };

  const handleFinishConnection = () => {
    const provider = SUPPORTED_GATEWAYS.find(p => p.id === selectedProvider);
    
    const newConnection: GatewayConnection = {
      id: Date.now().toString(),
      brand: provider?.name || 'Gateway',
      status: 'active',
      lastSync: 'just now',
      merchantId: `mch_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      environment: 'live',
      isEnabled: true,
      providerId: selectedProvider || 'custom'
    };

    setConnections(prev => [...prev, newConnection]);
    setIsSyncing(false);
    setIsConnectDrawerOpen(false);
    setShowSuccessDialog(true);
    resetWorkflow();
  };

  const resetWorkflow = () => {
    setSelectedProvider(null);
    setCurrentStep(1);
    setIsSyncComplete(false);
    setSyncProgress(0);
  };

  const getStatusBadge = (gateway: GatewayConnection) => {
    if (!gateway.isEnabled) {
      return <Badge variant="secondary" className="gap-1.5 font-bold opacity-60"><PowerOff className="h-3 w-3" /> Deactivated</Badge>;
    }
    switch (gateway.status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none gap-1.5 font-bold"><CheckCircle2 className="h-3 w-3" /> Live</Badge>;
      case 'sandbox':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none gap-1.5 font-bold">Sandbox</Badge>;
      case 'error':
        return <Badge variant="destructive" className="gap-1.5 font-bold"><AlertCircle className="h-3 w-3" /> Error</Badge>;
      default:
        return <Badge variant="secondary" className="font-bold">Disconnected</Badge>;
    }
  };

  const handleDeleteConnection = (id: string) => {
    setConnections(prev => prev.filter(c => c.id !== id));
    toast({
      title: "Connection Removed",
      description: "The payment gateway has been disconnected."
    });
  };

  const toggleGatewayStatus = (id: string, enabled: boolean) => {
    setConnections(prev => prev.map(c => c.id === id ? { ...c, isEnabled: enabled } : c));
    toast({
      title: enabled ? "Gateway Enabled" : "Gateway Disabled",
      description: `The gateway is now ${enabled ? 'accepting' : 'no longer accepting'} payments.`
    });
  };

  const handleOpenSettings = (gateway: GatewayConnection) => {
    setEditingGateway(gateway);
    setTempSettings({ ...gateway });
    setIsSettingsDrawerOpen(true);
  };

  const handleSaveSettings = () => {
    if (editingGateway) {
      setConnections(prev => prev.map(c => c.id === editingGateway.id ? { ...c, ...tempSettings } : c));
      setIsSettingsDrawerOpen(false);
      toast({
        title: "Configuration Saved",
        description: "Your gateway settings have been updated successfully."
      });
    }
  };

  return (
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 lg:p-10 bg-muted/20 min-h-[calc(100vh-4rem)]">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground text-left">Payment Gateways</h1>
              <p className="text-muted-foreground text-sm font-medium text-left">Securely process customer payments via web and QR codes.</p>
            </div>
            <Sheet open={isConnectDrawerOpen} onOpenChange={setIsConnectDrawerOpen}>
              <SheetTrigger asChild>
                <Button className="gap-2 font-bold bg-primary hover:bg-primary/90 shadow-sm">
                  <Plus className="h-4 w-4" />
                  Connect New Gateway
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-xl p-0 overflow-hidden flex flex-col border-l shadow-2xl bg-white text-left">
                <div className="bg-muted/30 p-8 border-b shrink-0">
                  <SheetHeader className="text-left space-y-2">
                    <SheetTitle className="text-2xl font-bold text-foreground">Connect Gateway</SheetTitle>
                    <SheetDescription className="text-muted-foreground font-medium">
                      {currentStep === 1 && "Step 1: Select your payment provider."}
                      {currentStep === 2 && "Step 2: Enter your merchant credentials."}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 flex items-center gap-2">
                    <div className={cn("h-1 flex-1 rounded-full transition-colors", currentStep >= 1 ? "bg-primary" : "bg-muted")} />
                    <div className={cn("h-1 flex-1 rounded-full transition-colors", currentStep >= 2 ? "bg-primary" : "bg-muted")} />
                  </div>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="p-8 space-y-8">
                    {currentStep === 1 && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Select Provider</Label>
                          <div className="grid grid-cols-1 gap-4">
                            {SUPPORTED_GATEWAYS.map((gateway) => (
                              <div
                                key={gateway.id}
                                onClick={() => setSelectedProvider(gateway.id)}
                                className={cn(
                                  "cursor-pointer flex items-center gap-5 p-5 rounded-2xl border-2 transition-all duration-300 group",
                                  selectedProvider === gateway.id
                                    ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                                    : "border-muted hover:border-accent-foreground/20 bg-background"
                                )}
                              >
                                <div className={cn("h-14 w-14 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110", gateway.color)}>
                                  <gateway.icon className="h-7 w-7" />
                                </div>
                                <div className="flex-1 space-y-1">
                                  <p className="font-bold text-lg text-foreground">{gateway.name}</p>
                                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">{gateway.description}</p>
                                </div>
                                {selectedProvider === gateway.id && (
                                  <CheckCircle2 className="h-6 w-6 text-primary animate-in zoom-in duration-300 mr-2" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                        <section className="space-y-6">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">API Credentials</h3>
                          </div>
                          <div className="grid gap-6">
                            <div className="space-y-2 text-left">
                              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Globe className="h-3.5 w-3.5" /> Publishable Key
                              </Label>
                              <Input placeholder={selectedProvider === 'stripe' ? 'pk_live_...' : 'Enter key...'} className="h-11 font-mono text-sm bg-background border-muted-foreground/20" />
                            </div>
                            <div className="space-y-2 text-left">
                              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Lock className="h-3.5 w-3.5" /> Secret Key
                              </Label>
                              <Input type="password" placeholder="••••••••••••••••" className="h-11 font-mono text-sm bg-background border-muted-foreground/20" />
                            </div>
                          </div>
                        </section>
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
                      >
                        Verify & Connect
                      </Button>
                    </>
                  )}
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>

          {connections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-background rounded-3xl border-2 border-dashed border-muted-foreground/20 space-y-8 animate-in fade-in zoom-in duration-500 w-full text-center px-6">
               <div className="h-24 w-24 rounded-[2rem] bg-muted/50 flex items-center justify-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground opacity-30" />
               </div>
               <div className="space-y-3 max-w-md">
                  <h3 className="text-2xl font-bold tracking-tight">No Gateways Connected</h3>
                  <p className="text-muted-foreground text-base font-medium leading-relaxed">
                    Connect a gateway to enable seamless digital guest checkouts and start accepting digital payments.
                  </p>
               </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {connections.map((conn) => {
                const provider = SUPPORTED_GATEWAYS.find(p => p.id === conn.providerId);
                return (
                  <Card key={conn.id} className={cn(
                    "overflow-hidden border-2 transition-all hover:shadow-xl rounded-3xl border-border",
                    !conn.isEnabled && "opacity-75 grayscale-[0.5] border-muted bg-muted/5"
                  )}>
                    <CardHeader className="pb-4 bg-muted/10 border-b text-left">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "h-12 w-12 rounded-2xl bg-white shadow-md border flex items-center justify-center",
                            !conn.isEnabled && "opacity-50"
                          )}>
                            {provider ? <provider.icon className={cn("h-6 w-6", provider.color.split(' ')[1])} /> : <CreditCard className="h-6 w-6 text-muted-foreground" />}
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-xl font-bold truncate">{conn.brand}</CardTitle>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.1em]">Payment Provider</p>
                          </div>
                        </div>
                        {getStatusBadge(conn)}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-6">
                      <div className="flex items-center justify-between p-4 rounded-2xl border bg-card/50">
                        <div className="space-y-0.5 text-left">
                          <Label htmlFor={`status-${conn.id}`} className="text-sm font-bold">Gateway Operational</Label>
                          <p className="text-[10px] text-muted-foreground font-medium">Toggle this gateway on or off for guests.</p>
                        </div>
                        <Switch 
                          id={`status-${conn.id}`}
                          checked={conn.isEnabled} 
                          onCheckedChange={(checked) => toggleGatewayStatus(conn.id, checked)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="p-4 rounded-2xl bg-muted/30 border space-y-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Environment</p>
                          <p className="text-sm font-bold capitalize">{conn.environment}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-muted/30 border space-y-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Status</p>
                          <p className={cn("text-sm font-bold capitalize", conn.isEnabled ? "text-primary" : "text-muted-foreground")}>
                            {conn.isEnabled ? 'Active' : 'Disabled'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-6 px-1">
                        <span className="font-semibold uppercase tracking-wider">Merchant Identifier</span>
                        <span className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded">{conn.merchantId}</span>
                      </div>
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
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10 rounded-xl" onClick={() => handleDeleteConnection(conn.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-10 text-xs font-bold uppercase tracking-wide px-4 gap-2 border-primary/20 text-primary hover:bg-primary/5 rounded-xl bg-background shadow-sm flex-shrink-0" 
                        asChild
                      >
                        <a href={`https://dashboard.${conn.providerId}.com`} target="_blank" rel="noopener noreferrer">
                          Go to {conn.brand}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Gateway Settings Drawer */}
      <Sheet open={isSettingsDrawerOpen} onOpenChange={setIsSettingsDrawerOpen}>
        <SheetContent className="sm:max-w-xl p-0 overflow-hidden flex flex-col border-l shadow-2xl bg-white text-left">
          <div className="bg-muted/30 p-8 border-b shrink-0">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <SheetHeader className="text-left p-0">
                <SheetTitle className="text-2xl font-bold text-foreground">Gateway Settings</SheetTitle>
                <SheetDescription className="text-muted-foreground font-medium">Manage active configuration for {tempSettings.brand}.</SheetDescription>
              </SheetHeader>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-8 space-y-10">
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Operational Mode</h3>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-2xl border bg-card">
                  <div className="space-y-0.5 text-left">
                    <Label className="text-sm font-bold">Production Mode</Label>
                    <p className="text-[10px] text-muted-foreground font-medium leading-none">Toggle between sandbox and live environments.</p>
                  </div>
                  <Switch 
                    checked={tempSettings.environment === 'live'} 
                    onCheckedChange={(checked) => setTempSettings(prev => ({ ...prev, environment: checked ? 'live' : 'sandbox', status: checked ? 'active' : 'sandbox' }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2 text-left">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Gateway Provider</Label>
                    <div className="h-11 flex items-center px-4 rounded-xl bg-muted/30 border border-dashed font-bold text-xs">
                      {tempSettings.brand}
                    </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Merchant ID</Label>
                    <div className="h-11 flex items-center px-4 rounded-xl bg-muted/30 border border-dashed font-mono text-[10px] font-bold text-muted-foreground">
                      {tempSettings.merchantId}
                    </div>
                  </div>
                </div>
              </section>

              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-orange-800 font-medium leading-tight text-left">
                  Note: Switching environments will instantly affect how payments are processed. Always verify your keys in Sandbox before going Live.
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
                {isSyncComplete ? "Account Linked" : "Verifying Merchant"}
              </DialogTitle>
              <DialogDescription className="font-medium text-muted-foreground text-sm">
                {isSyncComplete 
                  ? `Secure connection established with ${SUPPORTED_GATEWAYS.find(p => p.id === selectedProvider)?.name}.` 
                  : "We are validating your API keys and setting up secure webhooks."}
              </DialogDescription>
            </div>

            {!isSyncComplete && (
              <div className="w-full space-y-2">
                <Progress value={syncProgress} className="h-2" />
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <span>Securing Connection...</span>
                  <span>{syncProgress}%</span>
                </div>
              </div>
            )}

            {isSyncComplete && (
              <Button 
                className="w-full h-12 font-bold bg-primary hover:bg-primary/90 text-primary-foreground animate-in slide-in-from-bottom-2"
                onClick={handleFinishConnection}
              >
                Complete Integration
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md p-10 border-0 shadow-2xl overflow-hidden bg-white text-center">
          <div className="absolute -top-10 -right-10 p-8 opacity-10 pointer-events-none rotate-12">
            <CreditCard className="h-48 w-48 text-primary" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center space-y-6">
            <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center shadow-sm border border-primary/20">
              <CheckCircle2 className="h-10 w-10 text-primary animate-in zoom-in duration-500" />
            </div>
            
            <div className="space-y-3">
              <DialogTitle className="text-3xl font-bold tracking-tight text-foreground leading-tight">
                Payments Enabled!
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-base font-medium leading-relaxed max-w-[280px] mx-auto text-center">
                Your new gateway is active and ready to process guest transactions.
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
