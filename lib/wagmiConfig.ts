// lib/wagmiConfig.ts
import { http, fallback } from 'viem';
import { createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  coinbaseWallet,
  injectedWallet,
  rainbowWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { MEGA_ABI, MEGA_CONTRACT_ADDRESS } from '../contracts/mega';

const PROJECT_ID = 'f28956e41b00abd23636b5991e97abb5';

// Use Infura RPC for better reliability and higher block query limits
const INFURA_KEY = process.env.NEXT_PUBLIC_INFURA_KEY || 'f83b9d4f9d7f483dbca7680f22c55a8c';

// Determine which network to use
const isMainnet = process.env.NEXT_PUBLIC_NETWORK === 'mainnet';

export const config = createConfig({
  chains: isMainnet ? [mainnet] as const : [sepolia] as const,
  transports: {
    [mainnet.id]: fallback([
      http(`https://mainnet.infura.io/v3/${INFURA_KEY}`, {
        batch: true,
      }),
      http('https://eth.llamarpc.com'),
      http('https://rpc.ankr.com/eth'),
      http(),
    ]),
    [sepolia.id]: fallback([
      http(`https://sepolia.infura.io/v3/${INFURA_KEY}`, {
        batch: true,
      }),
      http('https://rpc.sepolia.org'),
      http('https://sepolia.gateway.tenderly.co'),
      http(),
    ]),
  },
  connectors: connectorsForWallets(
    [
      {
        groupName: 'Recommended',
        wallets: [
          metaMaskWallet,
          coinbaseWallet,
          injectedWallet,
          rainbowWallet,
        ],
      },
    ],
    {
      appName: 'Make Ethereum Great Again',
      projectId: PROJECT_ID,
      appDescription: 'Join the ultimate on-chain rally! Connect your wallet to participate in the race to $15K market cap.',
      appUrl: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001',
      appIcon: typeof window !== 'undefined' ? `${window.location.origin}/favicon-32x32.png` : 'http://localhost:3001/favicon-32x32.png',
    }
  ),
});

// Add contract configuration
export const megaContractConfig = {
  address: MEGA_CONTRACT_ADDRESS,
  abi: MEGA_ABI,
};
