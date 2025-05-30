'use client';

import { useChainId } from 'wagmi';
import { sepolia } from 'wagmi/chains';

export default function NetworkWarning() {
  const chainId = useChainId();
  const isWrongNetwork = chainId !== sepolia.id;

  if (!isWrongNetwork) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 px-4 z-50">
      <div className="flex items-center justify-center space-x-2">
        <span className="text-yellow-300">⚠️</span>
        <span className="font-semibold">
          Wrong Network: Please switch to Sepolia testnet to use this app
        </span>
        <span className="text-yellow-300">⚠️</span>
      </div>
    </div>
  );
} 