'use client';

import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlugZap, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PosIntegrationPage() {
  return (
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 lg:p-8 bg-muted/30 min-h-[calc(100vh-4rem)]">
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">POS Integration</h1>
                    <p className="text-muted-foreground">Sync your menu and orders directly with your Point of Sale system.</p>
                </div>
                <Button className="gap-2">
                    <PlugZap className="h-4 w-4" />
                    Add Integration
                </Button>
            </div>

            <Card className="text-center py-12">
                <CardHeader>
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <PlugZap className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Connect Your POS</CardTitle>
                    <CardDescription className="max-w-md mx-auto">
                        We support major POS systems like Toast, Square, Revel, and more. 
                        Integration allows for real-time inventory updates and automatic order injection.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                        <div className="p-4 rounded-xl border bg-background shadow-sm space-y-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                            <p className="font-bold text-sm">Real-time Sync</p>
                        </div>
                        <div className="p-4 rounded-xl border bg-background shadow-sm space-y-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                            <p className="font-bold text-sm">Inventory Tracking</p>
                        </div>
                        <div className="p-4 rounded-xl border bg-background shadow-sm space-y-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                            <p className="font-bold text-sm">Auto-Billing</p>
                        </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 flex items-start gap-3 max-w-lg mx-auto text-left">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                        <p className="text-sm text-blue-800 italic">
                            This section is currently being finalized. Our engineering team is testing the direct sync protocols for enhanced security.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
    </>
  );
}
