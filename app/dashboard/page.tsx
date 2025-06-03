'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import WinnerPopupClient from '../components/WinnerPopupClient';
import { useMainnetRedirect } from '@/components/common/NetworkCheck';

const DashboardContent = dynamic(
  () => import('./DashboardContent'),
  {
    ssr: false,
    loading: () => (
      <main className="min-h-screen flex items-center justify-center bg-bg-main text-white">
        <p>Loading dashboard...</p>
      </main>
    )
  }
);

export default function DashboardPage() {
  const isOnMainnet = useMainnetRedirect();

  // Show loading while checking network or redirecting
  if (!isOnMainnet) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg-main text-white">
        <p>Checking network...</p>
      </main>
    );
  }

  return (
    <>
      <DashboardContent />
      <WinnerPopupClient />
    </>
  );
}
