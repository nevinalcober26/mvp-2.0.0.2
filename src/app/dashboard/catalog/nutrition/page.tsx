'use client';

import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function NutritionPage() {
  return (
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
            <Card className="text-center">
                <CardHeader>
                    <CardTitle className="text-2xl">Nutrition Information</CardTitle>
                    <CardDescription>
                        This page is currently under construction.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Come back soon to manage nutrition details for your products.
                    </p>
                </CardContent>
            </Card>
        </div>
      </main>
    </>
  );
}
