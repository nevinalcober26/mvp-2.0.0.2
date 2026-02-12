'use client';

import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WalletCards, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentGatewayPage() {
  return (
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 lg:p-8 bg-muted/30 min-h-[calc(100vh-4rem)]">
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Payment Gateway</h1>
                    <p className="text-muted-foreground">Securely process customer payments via web and QR codes.</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Security Settings
                </Button>
            </div>

            <Card className="overflow-hidden border-0 shadow-smooth">
                <div className="bg-gradient-to-r from-teal-500 to-emerald-600 p-8 text-white">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <WalletCards className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Configure Payments</h2>
                            <p className="text-teal-50/80">Connect your merchant account to start accepting digital payments.</p>
                        </div>
                    </div>
                </div>
                <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                            <CardHeader>
                                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
                                    <Zap className="h-5 w-5 text-blue-600" />
                                </div>
                                <CardTitle className="text-lg">Stripe Integration</CardTitle>
                                <CardDescription>Accept Apple Pay, Google Pay, and major credit cards.</CardDescription>
                            </CardHeader>
                        </Card>
                        
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                            <CardHeader>
                                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center mb-2">
                                    <WalletCards className="h-5 w-5 text-orange-600" />
                                </div>
                                <CardTitle className="text-lg">PayPal Hub</CardTitle>
                                <CardDescription>Enable global payments with PayPal and Venmo.</CardDescription>
                            </CardHeader>
                        </Card>
                    </div>

                    <div className="text-center p-10 border-2 border-dashed rounded-2xl bg-muted/20">
                        <p className="text-muted-foreground font-medium mb-4">
                            Detailed transaction reports and payout schedules will appear here once a gateway is connected.
                        </p>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8">
                            Get Started
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
    </>
  );
}
