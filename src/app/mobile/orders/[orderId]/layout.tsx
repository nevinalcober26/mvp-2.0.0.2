import React from 'react';

export default function OrderDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout wrapper ensures no bottom navigation is applied to the order detail page.
  return <>{children}</>;
}
