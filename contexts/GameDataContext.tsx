'use client';

import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useReadContracts, useAccount } from 'wagmi';
import { MEGA_CONTRACT_ADDRESS } from '@/contracts/mega';
import MEGA_ABI from '@/contracts/MEGA_ABI.json';

// Define the shape of our game data
interface GameData {
  // Core game data
  marketCapUSD?: bigint;
  tokenPrice?: bigint;
  ethReserve?: bigint;
  tokenReserve?: bigint;
  qualifiedCount?: bigint;
  totalTickets?: bigint;
  gameEnded?: boolean;
  gameStartTime?: bigint;
  freezeEndTime?: bigint;
  failed?: boolean;
  
  // Distribution states
  grandPrizeDistributed?: boolean;
  runnerUpsDistributed?: boolean;
  earlyBirdsDistributed?: boolean;
  ownerPaid?: boolean;
  lastGrandWinner?: string;
  
  // Refund states
  refundsEnabled?: boolean;
  refundPool?: bigint;
  refundSupply?: bigint;
  seedWithdrawn?: boolean;
  
  // Contract metadata
  owner?: string;
  gameDuration?: bigint;
  
  // User-specific data
  userBalance?: bigint;
  userContributions?: bigint;
  userTickets?: bigint;
  userQualified?: boolean;
  userTokenBalance?: bigint;
  userLastFreeze?: bigint;
  
  // Loading states
  isLoading: boolean;
  isError: boolean;
  
  // Calculated values
  marketCapProgress?: number;
  marketCapDisplay?: string;
  timeRemaining?: number;
  isFrozen?: boolean;
}

const GameDataContext = createContext<GameData | undefined>(undefined);

export function GameDataProvider({ children }: { children: React.ReactNode }) {
  const { address } = useAccount();
  
  // Cache for last valid data to prevent flickering
  const [cachedData, setCachedData] = useState<any>(null);
  
  // Define all contract calls to batch
  const contractCalls = useMemo(() => {
    const baseCalls: any[] = [
      {
        address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
        abi: MEGA_ABI,
        functionName: 'getMarketCapUSD',
      },
      {
        address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
        abi: MEGA_ABI,
        functionName: 'getPrice',
      },
      {
        address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
        abi: MEGA_ABI,
        functionName: 'ethReserve',
      },
      {
        address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
        abi: MEGA_ABI,
        functionName: 'tokenReserve',
      },
      {
        address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
        abi: MEGA_ABI,
        functionName: 'qualifiedCount',
      },
      {
        address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
        abi: MEGA_ABI,
        functionName: 'totalTickets',
      },
      {
        address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
        abi: MEGA_ABI,
        functionName: 'gameEnded',
      },
      {
        address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
        abi: MEGA_ABI,
        functionName: 'gameStartTime',
      },
      {
        address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
        abi: MEGA_ABI,
        functionName: 'freezeEndTime',
      },
      {
        address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
        abi: MEGA_ABI,
        functionName: 'failed',
      },
      // Distribution states
      {
        address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
        abi: MEGA_ABI,
        functionName: 'grandPrizeDistributed',
      },
      {
        address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
        abi: MEGA_ABI,
        functionName: 'runnerUpsDistributed',
      },
      {
        address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
        abi: MEGA_ABI,
        functionName: 'earlyBirdsDistributed',
      },
      {
        address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
        abi: MEGA_ABI,
        functionName: 'ownerPaid',
      },
      {
        address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
        abi: MEGA_ABI,
        functionName: 'lastGrandWinner',
      },
      // Refund states
      {
        address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
        abi: MEGA_ABI,
        functionName: 'refundsEnabled',
      },
      {
        address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
        abi: MEGA_ABI,
        functionName: 'refundPool',
      },
      {
        address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
        abi: MEGA_ABI,
        functionName: 'refundSupply',
      },
      {
        address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
        abi: MEGA_ABI,
        functionName: 'seedWithdrawn',
      },
      // Contract metadata
      {
        address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
        abi: MEGA_ABI,
        functionName: 'owner',
      },
      {
        address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
        abi: MEGA_ABI,
        functionName: 'GAME_DURATION',
      },
    ];
    
    // Add user-specific calls if wallet is connected
    if (address) {
      baseCalls.push(
        {
          address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
          abi: MEGA_ABI,
          functionName: 'contributions',
          args: [address],
        },
        {
          address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
          abi: MEGA_ABI,
          functionName: 'lotteryTickets',
          args: [address],
        },
        {
          address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
          abi: MEGA_ABI,
          functionName: 'isQualified',
          args: [address],
        },
        {
          address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
          abi: MEGA_ABI,
          functionName: 'balanceOf',
          args: [address],
        },
        {
          address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
          abi: MEGA_ABI,
          functionName: 'lastFreeze',
          args: [address],
        }
      );
    }
    
    return baseCalls;
  }, [address]);
  
  // Batch all contract reads into a single RPC call
  const { data, isLoading, isError } = useReadContracts({
    contracts: contractCalls,
    query: {
      refetchInterval: 10000, // Refetch every 10 seconds
      refetchIntervalInBackground: false,
      staleTime: 5000, // Consider data stale after 5 seconds
      gcTime: 60000, // Keep in cache for 60 seconds
      refetchOnWindowFocus: false, // Don't refetch on window focus
    },
  });
  
  // Update cache only when we have valid new data
  useEffect(() => {
    if (data && !isLoading && !isError) {
      // Check if we have valid data (not all undefined)
      const hasValidData = data.some(result => result?.result !== undefined);
      if (hasValidData) {
        setCachedData(data);
      }
    }
  }, [data, isLoading, isError]);
  
  // Use cached data if current data is loading or invalid
  const dataToUse = (data && !isLoading && data.some(result => result?.result !== undefined)) ? data : cachedData;
  
  // Process the data into a usable format
  const gameData = useMemo<GameData>(() => {
    if (!dataToUse) {
      // Only show loading on initial load, not on refetch
      return { isLoading: isLoading && !cachedData, isError };
    }
    
    // Extract base data (always present)
    const [
      marketCapUSD,
      tokenPrice,
      ethReserve,
      tokenReserve,
      qualifiedCount,
      totalTickets,
      gameEnded,
      gameStartTime,
      freezeEndTime,
      failed,
      grandPrizeDistributed,
      runnerUpsDistributed,
      earlyBirdsDistributed,
      ownerPaid,
      lastGrandWinner,
      refundsEnabled,
      refundPool,
      refundSupply,
      seedWithdrawn,
      owner,
      gameDuration,
      ...userData
    ] = dataToUse;
    
    // Extract user data if available
    const [userContributions, userTickets, userQualified, userTokenBalance, userLastFreeze] = 
      address ? userData : [undefined, undefined, undefined, undefined, undefined];
    
    // Calculate derived values
    const marketCapUSDNum = marketCapUSD?.result ? Number(marketCapUSD.result) / 1e18 : 0;
    const marketCapProgress = Math.min((marketCapUSDNum / 20_000) * 100, 100); // $20k target
    
    // Format market cap display
    let marketCapDisplay = '$0';
    if (marketCapUSDNum > 0) {
      if (marketCapUSDNum < 1_000_000) {
        marketCapDisplay = `$${marketCapUSDNum.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
      } else {
        marketCapDisplay = `$${(marketCapUSDNum / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}M`;
      }
    }
    
    // Calculate time remaining
    const now = Math.floor(Date.now() / 1000);
    const gameStart = gameStartTime?.result ? Number(gameStartTime.result) : 0;
    const gameEndTime = gameStart + 3600; // 1 hour game duration
    const timeRemaining = Math.max(0, gameEndTime - now);
    
    // Check if frozen
    const freezeEnd = freezeEndTime?.result ? Number(freezeEndTime.result) : 0;
    const isFrozen = freezeEnd > now;
    
    return {
      // Core data
      marketCapUSD: marketCapUSD?.result as bigint | undefined,
      tokenPrice: tokenPrice?.result as bigint | undefined,
      ethReserve: ethReserve?.result as bigint | undefined,
      tokenReserve: tokenReserve?.result as bigint | undefined,
      qualifiedCount: qualifiedCount?.result as bigint | undefined,
      totalTickets: totalTickets?.result as bigint | undefined,
      gameEnded: gameEnded?.result as boolean | undefined,
      gameStartTime: gameStartTime?.result as bigint | undefined,
      freezeEndTime: freezeEndTime?.result as bigint | undefined,
      failed: failed?.result as boolean | undefined,
      
      // Distribution states
      grandPrizeDistributed: grandPrizeDistributed?.result as boolean | undefined,
      runnerUpsDistributed: runnerUpsDistributed?.result as boolean | undefined,
      earlyBirdsDistributed: earlyBirdsDistributed?.result as boolean | undefined,
      ownerPaid: ownerPaid?.result as boolean | undefined,
      lastGrandWinner: lastGrandWinner?.result as string | undefined,
      
      // Refund states
      refundsEnabled: refundsEnabled?.result as boolean | undefined,
      refundPool: refundPool?.result as bigint | undefined,
      refundSupply: refundSupply?.result as bigint | undefined,
      seedWithdrawn: seedWithdrawn?.result as boolean | undefined,
      
      // Contract metadata
      owner: owner?.result as string | undefined,
      gameDuration: gameDuration?.result as bigint | undefined,
      
      // User data
      userContributions: userContributions?.result as bigint | undefined,
      userTickets: userTickets?.result as bigint | undefined,
      userQualified: userQualified?.result as boolean | undefined,
      userTokenBalance: userTokenBalance?.result as bigint | undefined,
      userLastFreeze: userLastFreeze?.result as bigint | undefined,
      
      // Loading states
      isLoading: isLoading && !cachedData,
      isError,
      
      // Calculated values
      marketCapProgress,
      marketCapDisplay,
      timeRemaining,
      isFrozen,
    };
  }, [dataToUse, isLoading, isError, address]);
  
  return (
    <GameDataContext.Provider value={gameData}>
      {children}
    </GameDataContext.Provider>
  );
}

// Custom hook to use game data
export function useGameData() {
  const context = useContext(GameDataContext);
  if (context === undefined) {
    throw new Error('useGameData must be used within a GameDataProvider');
  }
  return context;
} 