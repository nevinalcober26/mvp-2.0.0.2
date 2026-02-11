'use client';
import { useSearchParams } from 'next/navigation';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { OnboardingWizard } from '@/components/dashboard/onboarding-wizard';
import { BranchIndicator } from '@/components/dashboard/branch-indicator';
import React from 'react';

function OnboardingWrapper({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const showOnboarding = searchParams.get('onboarding') === 'true';

  return (
    <>
      <div className={showOnboarding ? 'blur-sm' : ''}>{children}</div>
      {showOnboarding && <OnboardingWizard />}
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ProtectedRoute>
        <AppSidebar />
        <SidebarInset>
          <BranchIndicator />
          <React.Suspense fallback={<div>Loading...</div>}>
            <OnboardingWrapper>{children}</OnboardingWrapper>
          </React.Suspense>
        </SidebarInset>
      </ProtectedRoute>
    </SidebarProvider>
  );
}
