'use client';
import dynamic from 'next/dynamic';

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
  return (
    <>
      <RefundContent />
    </>
  );
} 