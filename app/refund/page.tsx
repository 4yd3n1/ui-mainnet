'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import TermsModal from '@/components/TermsModal';

const RefundContent = dynamic(
  () => import('./RefundContent'),
  {
    ssr: false,
    loading: () => (
      <main className="min-h-screen flex items-center justify-center bg-bg-main text-white">
        <p>Loading refund page...</p>
      </main>
    )
  }
);

export default function RefundPage() {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    // check localStorage flag
    setAccepted(localStorage.getItem('termsAccepted') === 'true');
  }, []);

  const handleAccept = () => {
    localStorage.setItem('termsAccepted', 'true');
    setAccepted(true);
  };

  return (
    <>
      {!accepted && <TermsModal onAccept={handleAccept} />}
      {accepted && <RefundContent />}
    </>
  );
} 