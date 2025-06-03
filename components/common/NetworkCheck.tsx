'use client';

import { useChainId, useAccount } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Determine which network we're using based on environment
const isMainnet = process.env.NEXT_PUBLIC_NETWORK === 'mainnet';
const TARGET_CHAIN_ID = isMainnet ? mainnet.id : sepolia.id;

export function useIsOnMainnet() {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  
  // Allow access to the target network (mainnet in production, sepolia in development)
  const isOnTargetNetwork = isConnected && chainId === TARGET_CHAIN_ID;
  
  return isOnTargetNetwork;
}

export function useMainnetRedirect() {
  const isOnTargetNetwork = useIsOnMainnet();
  const router = useRouter();

  useEffect(() => {
    if (!isOnTargetNetwork) {
      router.push('/');
    }
  }, [isOnTargetNetwork, router]);

  return isOnTargetNetwork;
}

export default function NetworkCheck({ children }: { children: React.ReactNode }) {
  const isOnTargetNetwork = useIsOnMainnet();
  
  if (!isOnTargetNetwork) {
    return null;
  }
  
  return <>{children}</>;
} 