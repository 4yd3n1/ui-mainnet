import MEGA_ABI from './MEGA_ABI.json';

export { MEGA_ABI };

// Network-specific contract addresses
const ADDRESSES = {
  mainnet: '0x0000000000000000000000000000000000000000', // Will be updated after mainnet deployment
  sepolia: '0x3dd00005a48E50326Ddd20935d7F4901cc7A32d8',
} as const;

// Get network from environment or default to sepolia
const NETWORK = (process.env.NEXT_PUBLIC_NETWORK || 'sepolia') as keyof typeof ADDRESSES;

export const MEGA_CONTRACT_ADDRESS = ADDRESSES[NETWORK];

// Export for debugging
export const CURRENT_NETWORK = NETWORK;
