'use client';

import { useChainId, useAccount } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useIsOnSepolia() {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  
  const isOnSepolia = isConnected && chainId === sepolia.id;
  
  console.log('[useIsOnSepolia] Network check:', {
    chainId,
    isConnected,
    sepoliaId: sepolia.id,
    isOnSepolia
  });
  
  return isOnSepolia;
}

export function useSepoliaRedirect() {
  const isOnSepolia = useIsOnSepolia();
  const router = useRouter();

  useEffect(() => {
    if (!isOnSepolia) {
      console.log('[useSepoliaRedirect] Not on Sepolia, redirecting to landing page');
      router.push('/');
    }
  }, [isOnSepolia, router]);

  return isOnSepolia;
}

export default function NetworkCheck({ children }: { children: React.ReactNode }) {
  const isOnSepolia = useIsOnSepolia();
  
  if (!isOnSepolia) {
    return null;
  }
  
  return <>{children}</>;
} 