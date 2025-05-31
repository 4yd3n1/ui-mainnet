'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useContractReads, useAccount } from 'wagmi';
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
  
  // User-specific data
  userBalance?: bigint;
  userContributions?: bigint;
  userTickets?: bigint;
  userQualified?: boolean;
  userTokenBalance?: bigint;
  
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
  
  // Define all contract calls to batch
  const contractCalls = useMemo(() => {
    const baseCalls = [
      {
        address: MEGA_CONTRACT_ADDRESS,
        abi: MEGA_ABI,
        functionName: 'getMarketCapUSD',
      },
      {
        address: MEGA_CONTRACT_ADDRESS,
        abi: MEGA_ABI,
        functionName: 'getPrice',
      },
      {
        address: MEGA_CONTRACT_ADDRESS,
        abi: MEGA_ABI,
        functionName: 'ethReserve',
      },
      {
        address: MEGA_CONTRACT_ADDRESS,
        abi: MEGA_ABI,
        functionName: 'tokenReserve',
      },
      {
        address: MEGA_CONTRACT_ADDRESS,
        abi: MEGA_ABI,
        functionName: 'qualifiedCount',
      },
      {
        address: MEGA_CONTRACT_ADDRESS,
        abi: MEGA_ABI,
        functionName: 'totalTickets',
      },
      {
        address: MEGA_CONTRACT_ADDRESS,
        abi: MEGA_ABI,
        functionName: 'gameEnded',
      },
      {
        address: MEGA_CONTRACT_ADDRESS,
        abi: MEGA_ABI,
        functionName: 'gameStartTime',
      },
      {
        address: MEGA_CONTRACT_ADDRESS,
        abi: MEGA_ABI,
        functionName: 'freezeEndTime',
      },
      {
        address: MEGA_CONTRACT_ADDRESS,
        abi: MEGA_ABI,
        functionName: 'failed',
      },
    ];
    
    // Add user-specific calls if wallet is connected
    if (address) {
      baseCalls.push(
        {
          address: MEGA_CONTRACT_ADDRESS,
          abi: MEGA_ABI,
          functionName: 'contributions',
          args: [address],
        },
        {
          address: MEGA_CONTRACT_ADDRESS,
          abi: MEGA_ABI,
          functionName: 'lotteryTickets',
          args: [address],
        },
        {
          address: MEGA_CONTRACT_ADDRESS,
          abi: MEGA_ABI,
          functionName: 'isQualified',
          args: [address],
        },
        {
          address: MEGA_CONTRACT_ADDRESS,
          abi: MEGA_ABI,
          functionName: 'balanceOf',
          args: [address],
        }
      );
    }
    
    return baseCalls;
  }, [address]);
  
  // Batch all contract reads into a single RPC call
  const { data, isLoading, isError } = useContractReads({
    contracts: contractCalls,
    query: {
      refetchInterval: 10000, // Refetch every 10 seconds
      refetchIntervalInBackground: false,
    },
  });
  
  // Process the data into a usable format
  const gameData = useMemo<GameData>(() => {
    if (!data) {
      return { isLoading, isError };
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
      ...userData
    ] = data;
    
    // Extract user data if available
    const [userContributions, userTickets, userQualified, userTokenBalance] = 
      address ? userData : [undefined, undefined, undefined, undefined];
    
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
      
      // User data
      userContributions: userContributions?.result as bigint | undefined,
      userTickets: userTickets?.result as bigint | undefined,
      userQualified: userQualified?.result as boolean | undefined,
      userTokenBalance: userTokenBalance?.result as bigint | undefined,
      
      // Loading states
      isLoading,
      isError,
      
      // Calculated values
      marketCapProgress,
      marketCapDisplay,
      timeRemaining,
      isFrozen,
    };
  }, [data, isLoading, isError, address]);
  
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