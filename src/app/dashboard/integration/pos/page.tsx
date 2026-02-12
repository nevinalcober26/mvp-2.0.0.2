'use client';

import React, { useState, useEffect } from 'react';
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
  Info,
  Monitor,
  ArrowRight,
  Database,
  Lock,
  Globe,
  User,
  Hash,
  ArrowLeft,
  ChevronRight
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

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

export default function PosIntegrationPage() {
  const { toast } = useToast();
  const [isConnectDrawerOpen, setIsConnectDrawerOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  
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

  useEffect(() => {
    if (!isConnectDrawerOpen) {
      setCurrentStep(1);
      setSelectedProvider(null);
    }
  }, [isConnectDrawerOpen]);

  const handleSyncAll = () => {
    toast({
      title: "Global Sync Initiated",
      description: "Refreshing data from all connected POS systems.",
    });
  };

  const handleRemoveConnection = (id: string) => {
    setConnections(prev => prev.filter(c => c.id !== id));
    toast({
      title: "Connection Removed",
      description: "The POS system has been successfully disconnected.",
    });
  };

  const handleNextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleConnect = () => {
    setIsConnectDrawerOpen(false);
    toast({
      title: "Connection Established",
      description: "Your POS system has been successfully verified and linked.",
    });
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

  return (
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 lg:p-10 bg-muted/20 min-h-[calc(100vh-4rem)]">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">POS Integration</h1>
              <p className="text-muted-foreground">Manage your venue terminals and real-time menu synchronization.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2 font-semibold shadow-sm" onClick={handleSyncAll}>
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
                <SheetContent className="sm:max-w-xl p-0 overflow-hidden flex flex-col border-l shadow-2xl">
                  <div className="bg-primary p-8 text-primary-foreground shrink-0 relative">
                    <SheetHeader className="text-left space-y-2">
                      <SheetTitle className="text-2xl font-bold text-white">Add POS Connection</SheetTitle>
                      <SheetDescription className="text-primary-foreground/80 font-medium">
                        {currentStep === 1 
                          ? "Select a provider and enter your credentials." 
                          : "Complete your POS configuration to enable syncing."}
                      </SheetDescription>
                    </SheetHeader>
                    {selectedProvider === 'oracle-simphony' && (
                      <div className="mt-6 flex items-center gap-2">
                        <div className={cn("h-1.5 flex-1 rounded-full transition-colors", currentStep >= 1 ? "bg-white" : "bg-white/20")} />
                        <div className={cn("h-1.5 flex-1 rounded-full transition-colors", currentStep >= 2 ? "bg-white" : "bg-white/20")} />
                      </div>
                    )}
                  </div>
                  
                  <ScrollArea className="flex-1">
                    <div className="p-8 space-y-8">
                      {currentStep === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Select Provider</Label>
                            <Select value={selectedProvider || ""} onValueChange={setSelectedProvider}>
                              <SelectTrigger className="h-12 text-base font-semibold">
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
                              <div className="flex items-center gap-2 mb-4">
                                <div className="h-px flex-1 bg-border" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2 whitespace-nowrap">Step 1: Simphony Credentials</span>
                                <div className="h-px flex-1 bg-border" />
                              </div>
                              
                              <div className="grid gap-6">
                                <div className="space-y-2">
                                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Globe className="h-3.5 w-3.5" /> OIDC URL
                                  </Label>
                                  <Input placeholder="https://act-omra-idm.oracleindustry.com" className="h-11 font-medium bg-muted/30 border-muted-foreground/20" />
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Globe className="h-3.5 w-3.5" /> STS URL
                                  </Label>
                                  <Input placeholder="https://act-sts.oraclecloud.com" className="h-11 font-medium bg-muted/30 border-muted-foreground/20" />
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Lock className="h-3.5 w-3.5" /> Client ID
                                  </Label>
                                  <Input placeholder="Enter your Client ID..." className="h-11 font-mono text-sm bg-muted/30 border-muted-foreground/20" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                      <User className="h-3.5 w-3.5" /> Username
                                    </Label>
                                    <Input placeholder="KPTAC" className="h-11 font-medium bg-muted/30 border-muted-foreground/20" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                      <Lock className="h-3.5 w-3.5" /> Password
                                    </Label>
                                    <Input type="password" placeholder="••••••••••••" className="h-11 font-medium bg-muted/30 border-muted-foreground/20" />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Hash className="h-3.5 w-3.5" /> Org Short Name
                                  </Label>
                                  <Input placeholder="ACT" className="h-11 font-medium bg-muted/30 border-muted-foreground/20" />
                                </div>
                              </div>
                            </div>
                          )}

                          {selectedProvider && selectedProvider !== 'oracle-simphony' && (
                            <div className="space-y-6">
                              <div className="grid gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Internal Label</Label>
                                    <Input placeholder="e.g. Bar Terminal" className="h-11 font-medium" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Machine / Zone ID</Label>
                                    <Input placeholder="e.g. BAR-01" className="h-11 font-medium" />
                                  </div>
                                </div>
                                <div className="space-y-2 pt-2">
                                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Lock className="h-3.5 w-3.5" /> Secure API Key
                                  </Label>
                                  <Input placeholder="Access Token" type="password" className="h-11" />
                                  <p className="text-[10px] text-muted-foreground italic">Required for secure real-time data sync.</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {!selectedProvider && (
                            <div className="py-20 text-center space-y-4 bg-muted/20 rounded-2xl border-2 border-dashed border-muted-foreground/10">
                              <Monitor className="h-12 w-12 text-muted-foreground mx-auto opacity-20" />
                              <p className="text-sm text-muted-foreground font-semibold px-12 leading-relaxed">Please select a POS provider from the list above to configure your connection.</p>
                            </div>
                          )}
                        </div>
                      )}

                      {currentStep === 2 && selectedProvider === 'oracle-simphony' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                          <div className="text-center space-y-2">
                            <h3 className="text-2xl font-bold tracking-tight">Configuration</h3>
                            <p className="text-sm text-muted-foreground">Complete your POS configuration to enable syncing.</p>
                          </div>

                          <div className="rounded-2xl border border-muted-foreground/10 bg-card p-8 shadow-sm space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold">Location</Label>
                                <Select>
                                  <SelectTrigger className="h-11 bg-muted/20 border-muted-foreground/10">
                                    <SelectValue placeholder="Select a location" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="main">Main Outlet</SelectItem>
                                    <SelectItem value="annex">Annex Lounge</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sm font-semibold">Revenue Center</Label>
                                <Select>
                                  <SelectTrigger className="h-11 bg-muted/20 border-muted-foreground/10">
                                    <SelectValue placeholder="Select Revenue Center" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="food">Dine-in Food</SelectItem>
                                    <SelectItem value="bar">Bar Revenue</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold">Tender</Label>
                                <Select>
                                  <SelectTrigger className="h-11 bg-muted/20 border-muted-foreground/10">
                                    <SelectValue placeholder="Select Tender" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="visa">Visa/Mastercard</SelectItem>
                                    <SelectItem value="cash">Cash Tender</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sm font-semibold">Employee ID</Label>
                                <Input placeholder="Enter Employee's ID" className="h-11 bg-muted/20 border-muted-foreground/10" />
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
                          onClick={selectedProvider === 'oracle-simphony' ? handleNextStep : handleConnect}
                        >
                          {selectedProvider === 'oracle-simphony' ? (
                            <>Next <ChevronRight className="h-4 w-4" /></>
                          ) : "Verify & Connect"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" className="font-bold px-8 h-11 gap-2" onClick={handlePreviousStep}>
                          <ArrowLeft className="h-4 w-4" /> Back
                        </Button>
                        <Button 
                          className="font-bold bg-primary text-primary-foreground px-10 h-11 shadow-lg" 
                          onClick={handleConnect}
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
                        <p className="text-xs font-bold text-destructive">Handshake Failed</p>
                        <p className="text-[10px] leading-tight text-destructive/80">Credentials for this terminal have expired. Re-authentication is required to restore sync.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-muted/20 border-t p-3 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-lg">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10 rounded-lg" onClick={() => handleRemoveConnection(conn.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" className="h-9 text-[10px] font-bold uppercase tracking-widest px-4 gap-2 border-muted-foreground/20 rounded-lg">
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
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Connect another POS machine to your digital management hub.</p>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t">
            <div className="space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-3">
                <Database className="h-5 w-5 text-primary" />
                Data Integrity & Syncing
              </h3>
              <div className="space-y-4">
                {[
                  { title: "Universal Mapping", desc: "Our system automatically maps Simphony's menu hierarchy into digital categories." },
                  { title: "Inventory Guard", desc: "Real-time stock depletion tracking across all connected terminal types." },
                  { title: "Direct Injection", desc: "Customer orders bypass manual entry and go straight to the kitchen display." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-muted/10 border border-transparent hover:border-border transition-colors group">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold shrink-0 group-hover:bg-primary group-hover:text-white transition-all">{i+1}</div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold">{item.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <Card className="bg-primary/5 border-primary/10 shadow-none rounded-2xl overflow-hidden flex flex-col">
              <CardContent className="p-10 flex flex-col items-center text-center justify-center flex-grow space-y-6">
                <div className="h-16 w-16 rounded-2xl bg-white shadow-md flex items-center justify-center">
                  <Info className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-bold">POS Technical Support</p>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">Our implementation specialists can help map complex menu structures or troubleshoot enterprise API connections.</p>
                </div>
                <Button variant="link" className="text-primary font-bold gap-2 text-base">
                  Implementation Guide
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
