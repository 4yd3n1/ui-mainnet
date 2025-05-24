// lib/wagmiConfig.ts
import { http } from 'viem';
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

export const config = createConfig({
  chains: [sepolia, mainnet],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
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
    }
  ),
});

// Add contract configuration
export const megaContractConfig = {
  address: MEGA_CONTRACT_ADDRESS,
  abi: MEGA_ABI,
};
