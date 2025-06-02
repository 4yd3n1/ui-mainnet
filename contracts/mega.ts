import MEGA_ABI from './MEGA_ABI.json';

export { MEGA_ABI };
export const MEGA_CONTRACT_ADDRESS = '0xEfa769908B3292166a8aDcCd7389BEd6b040A01C';

// Game Parameters (matching MEGA.sol)
export const GAME_PARAMETERS = {
  INITIAL_TOKENS: 10_000_000,
  SEED_ETH: 6.0,
  MARKETCAP_USD_CAP: 600_000,
  GAME_DURATION: 30 * 60, // 30 minutes in seconds
  QUALIFY_THRESHOLD: 0.1,
  MAX_PER_ADDRESS: 1.0,
  TICKETS_PER_ETH: 10,
  REFUND_DELAY: 5 * 60, // 5 minutes in seconds
  PRIZE_DISTRIBUTION: {
    GRAND_PRIZE: 25, // 25%
    RUNNER_UPS: 20,  // 20%
    EARLY_BIRDS: 15, // 15%
    OWNER: 40        // 40%
  },
  EARLY_BIRD_MULTIPLIERS: {
    FIRST_50: 5,     // 5x tickets
    NEXT_20: 2       // 2x tickets
  }
};

// Contract deployment info
export const DEPLOYMENT_INFO = {
  address: '0xEfa769908B3292166a8aDcCd7389BEd6b040A01C',
  chainId: 11155111, // Sepolia
  deployedAt: '2025-06-02T09:59:02.174Z',
  deployer: '0x1113C54cdb2EF5b41D6f48280CEA00205415E6b3'
};
