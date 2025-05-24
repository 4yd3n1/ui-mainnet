'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import TermsModal from '@/components/TermsModal';

export default function HomePage() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const termsAccepted = localStorage.getItem('termsAccepted') === 'true';
    setAccepted(termsAccepted);
    if (termsAccepted) {
      if (isConnected) {
        setRedirecting(true);
        router.push('/dashboard');
      }
    }
  }, [isConnected, router]);

  const handleAccept = () => {
    localStorage.setItem('termsAccepted', 'true');
    setAccepted(true);
    if (isConnected) {
      setRedirecting(true);
      router.push('/dashboard');
    }
  };

  if (!accepted) {
    return <div className="landing-bg"><TermsModal onAccept={handleAccept} /></div>;
  }

  if (redirecting) {
    return (
      <div className="landing-bg">
      <main className="min-h-screen flex items-center justify-center bg-[#10182A] text-white">
        <p className="text-lg">Preparing your dashboard...</p>
      </main>
      </div>
    );
  }

  return (
    <div className="landing-bg">
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#10182A] text-white">
      <div className="text-center flex flex-col items-center justify-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          <span className="neon-text-yellow block">Make Ethereum</span>
          <span className="neon-text-yellow block">Great Again</span>
        </h1>
        <p className="mt-4 text-lg md:text-2xl text-gray-300 mb-8">
          The race to $10M player market cap is on. Connect your wallet to play!
        </p>
        <div className="flex justify-center">
          <ConnectButton label="Connect Wallet" />
        </div>
      </div>
    </main>
    </div>
  );
} 