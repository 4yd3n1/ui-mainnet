'use client';
import { useGameData } from '@/contexts/GameDataContext';
import { usePublicClient } from 'wagmi';
import { MEGA_CONTRACT_ADDRESS } from '@/contracts/mega';
import { useEffect } from 'react';

export default function ContractStateChecker() {
  const publicClient = usePublicClient();
  
  // Get consolidated game data from context
  const { 
    gameEnded,
    grandPrizeDistributed,
    runnerUpsDistributed,
    earlyBirdsDistributed,
    lastGrandWinner,
    marketCapUSD,
    ethReserve 
  } = useGameData();

  // Check contract balance when game ends (for monitoring purposes)
  useEffect(() => {
    const checkBalance = async () => {
      if (publicClient) {
        try {
          const balance = await publicClient.getBalance({
            address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
          });
          // Balance check complete - could be used for internal state tracking if needed
        } catch (error) {
          // Handle balance check error silently
        }
      }
    };

    if (gameEnded) {
      checkBalance();
    }
  }, [gameEnded, publicClient]);

  return null; // This component doesn't render anything
} 