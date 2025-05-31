'use client';

import { useChainId, useAccount } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useIsOnSepolia() {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  
  const isOnSepolia = isConnected && chainId === sepolia.id;
  
  return isOnSepolia;
}

export function useSepoliaRedirect() {
  const isOnSepolia = useIsOnSepolia();
  const router = useRouter();

  useEffect(() => {
    if (!isOnSepolia) {
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