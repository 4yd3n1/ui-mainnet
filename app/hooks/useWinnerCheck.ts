'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAccount, usePublicClient, useContractRead } from 'wagmi';
import { MEGA_ABI, MEGA_CONTRACT_ADDRESS } from '@/contracts/mega';

interface WinnerInfo {
  category: 'grand' | 'runnerUp' | 'earlyBird';
  amount: bigint;
  details: {
    isGrandWinner: boolean;
    isRunnerUp: boolean;
    isEarlyBird: boolean;
    grandPrizeAmount: bigint;
    runnerUpAmount: bigint;
    earlyBirdAmount: bigint;
    totalWinnings: bigint;
  };
}

// Manual test function for debugging
export const manualContractTest = async (publicClient: any, address: string) => {
  try {
    // Read distribution flags directly with fresh queries
    const grandPrizeDistributed = await publicClient.readContract({
      address: MEGA_CONTRACT_ADDRESS,
      abi: MEGA_ABI,
      functionName: 'grandPrizeDistributed',
    });
    
    const runnerUpsDistributed = await publicClient.readContract({
      address: MEGA_CONTRACT_ADDRESS,
      abi: MEGA_ABI,
      functionName: 'runnerUpsDistributed',
    });
    
    const earlyBirdsDistributed = await publicClient.readContract({
      address: MEGA_CONTRACT_ADDRESS,
      abi: MEGA_ABI,
      functionName: 'earlyBirdsDistributed',
    });
    
    const finalPool = await publicClient.readContract({
      address: MEGA_CONTRACT_ADDRESS,
      abi: MEGA_ABI,
      functionName: 'finalPool',
    });
    
    // If early birds are distributed, check the array
    if (earlyBirdsDistributed) {
      const earlyBirds: string[] = [];
      let index = 0;
      
      try {
        while (index < 100) { // Safety limit
          const winner = await publicClient.readContract({
            address: MEGA_CONTRACT_ADDRESS,
            abi: MEGA_ABI,
            functionName: 'lastEarlyBirds',
            args: [index],
          });
          if (winner && typeof winner === 'string' && winner !== '0x0000000000000000000000000000000000000000') {
            earlyBirds.push(winner);
            index++;
          } else {
            break;
          }
        }
      } catch {
        // End of array
      }
      
      const isEarlyBird = earlyBirds.some(winner => 
        winner.toLowerCase() === address?.toLowerCase()
      );
      
      if (isEarlyBird) {
        const totalShare = finalPool ? (finalPool * 15n) / 100n : 0n;
        const amount = earlyBirds.length > 0 ? totalShare / BigInt(earlyBirds.length) : 0n;
      }
    }
    
    return {
      grandPrizeDistributed,
      runnerUpsDistributed,
      earlyBirdsDistributed,
      finalPool
    };
    
  } catch (error) {
    return null;
  }
};

export function useWinnerCheck() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [showPopup, setShowPopup] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState<WinnerInfo | null>(null);
  const [checkingWinners, setCheckingWinners] = useState(false);
  const [fallbackData, setFallbackData] = useState<any>(null);
  const [popupShownThisSession, setPopupShownThisSession] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fallbackTriggered = useRef(false);

  // Cache for reducing API calls
  const cacheRef = useRef<{
    runnerUps: string[] | null;
    earlyBirds: string[] | null;
    lastFetch: number;
  }>({
    runnerUps: null,
    earlyBirds: null,
    lastFetch: 0,
  });

  // Read contract state for distribution flags with much longer intervals to reduce spam
  const { data: grandPrizeDistributed, refetch: refetchGrandPrize } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'grandPrizeDistributed',
    query: { 
      refetchInterval: 60000, // Increased to 60 seconds to drastically reduce spam
      enabled: !!address, // Only poll when user is connected
      staleTime: 30000, // Consider data stale after 30 seconds
    },
  });

  const { data: runnerUpsDistributed, refetch: refetchRunnerUps } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'runnerUpsDistributed',
    query: { 
      refetchInterval: 60000, // Increased to 60 seconds
      enabled: !!address,
      staleTime: 30000,
    },
  });

  const { data: earlyBirdsDistributed, refetch: refetchEarlyBirds } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'earlyBirdsDistributed',
    query: { 
      refetchInterval: 60000, // Increased to 60 seconds
      enabled: !!address,
      staleTime: 30000,
    },
  });

  // Read winner state variables from contract - only when distributions have happened
  const anyDistributionHappened = grandPrizeDistributed || runnerUpsDistributed || earlyBirdsDistributed || fallbackData?.earlyBirdsDistributed;

  const { data: lastGrandWinner } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'lastGrandWinner',
    query: { 
      refetchInterval: 120000, // Increased to 2 minutes - grand winner doesn't change often
      enabled: !!address && !!(grandPrizeDistributed || fallbackData?.grandPrizeDistributed),
      staleTime: 60000,
    },
  });

  const { data: finalPool } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'finalPool',
    query: { 
      refetchInterval: 120000, // Increased to 2 minutes - final pool is set once
      enabled: !!address && !!anyDistributionHappened,
      staleTime: 60000,
    },
  });

  // Fallback mechanism - use direct contract reads if wagmi returns undefined
  const tryFallbackRead = useCallback(async () => {
    if (!publicClient || !address || fallbackTriggered.current) return;
    
    fallbackTriggered.current = true;
    
    try {
      const fallbackResult = await manualContractTest(publicClient, address);
      if (fallbackResult) {
        setFallbackData(fallbackResult);
      }
    } catch (error) {
      // Silently handle fallback errors
    }
  }, [publicClient, address]);

  // Trigger fallback if wagmi hooks return undefined for too long
  useEffect(() => {
    if (address && publicClient && !fallbackTriggered.current) {
      // Check if wagmi hooks are returning undefined
      const allUndefined = grandPrizeDistributed === undefined && 
                          runnerUpsDistributed === undefined && 
                          earlyBirdsDistributed === undefined;
                          
      if (allUndefined) {
        // Add delay before triggering fallback to reduce spam
        setTimeout(() => {
          tryFallbackRead();
        }, 5000);
      }
    }
  }, [address, publicClient, grandPrizeDistributed, runnerUpsDistributed, earlyBirdsDistributed, tryFallbackRead]);

  // Manual refresh function
  const manualRefresh = useCallback(async () => {
    fallbackTriggered.current = false;
    setFallbackData(null);
    cacheRef.current = { runnerUps: null, earlyBirds: null, lastFetch: 0 }; // Clear cache
    await Promise.all([
      refetchGrandPrize(),
      refetchRunnerUps(),
      refetchEarlyBirds()
    ]);
  }, [refetchGrandPrize, refetchRunnerUps, refetchEarlyBirds]);

  // Function to get runner-ups array with aggressive caching
  const getRunnerUps = useCallback(async () => {
    if (!publicClient) return [];
    
    // Use cache if recent (within 5 minutes)
    const now = Date.now();
    if (cacheRef.current.runnerUps && (now - cacheRef.current.lastFetch) < 300000) {
      return cacheRef.current.runnerUps;
    }
    
    try {
      const runnerUps: string[] = [];
      let index = 0;
      
      // Read array elements one by one until we get an error (array end)
      while (index < 50) { // Safety limit to prevent infinite loops
        try {
          const winner = await publicClient.readContract({
            address: MEGA_CONTRACT_ADDRESS,
            abi: MEGA_ABI,
            functionName: 'lastRunnerUps',
            args: [index],
          });
          if (winner && typeof winner === 'string' && winner !== '0x0000000000000000000000000000000000000000') {
            runnerUps.push(winner);
            index++;
          } else {
            break;
          }
        } catch {
          break; // End of array
        }
      }
      
      // Update cache
      cacheRef.current.runnerUps = runnerUps;
      cacheRef.current.lastFetch = now;
      
      return runnerUps;
    } catch (error) {
      return cacheRef.current.runnerUps || [];
    }
  }, [publicClient]);

  // Function to get early birds array with aggressive caching
  const getEarlyBirds = useCallback(async () => {
    if (!publicClient) return [];
    
    // Use cache if recent (within 5 minutes)
    const now = Date.now();
    if (cacheRef.current.earlyBirds && (now - cacheRef.current.lastFetch) < 300000) {
      return cacheRef.current.earlyBirds;
    }
    
    try {
      const earlyBirds: string[] = [];
      let index = 0;
      
      // Read array elements one by one until we get an error (array end)
      while (index < 100) { // Safety limit to prevent infinite loops
        try {
          const winner = await publicClient.readContract({
            address: MEGA_CONTRACT_ADDRESS,
            abi: MEGA_ABI,
            functionName: 'lastEarlyBirds',
            args: [index],
          });
          if (winner && typeof winner === 'string' && winner !== '0x0000000000000000000000000000000000000000') {
            earlyBirds.push(winner);
            index++;
          } else {
            break;
          }
        } catch {
          break; // End of array
        }
      }
      
      // Update cache
      cacheRef.current.earlyBirds = earlyBirds;
      if (!cacheRef.current.runnerUps) {
        cacheRef.current.lastFetch = now;
      }
      
      return earlyBirds;
    } catch (error) {
      return cacheRef.current.earlyBirds || [];
    }
  }, [publicClient]);

  const checkWinnerFromContractState = useCallback(async () => {
    if (!address || !publicClient || checkingWinners || popupShownThisSession) return;
    
    // Use fallback data if wagmi hooks return undefined
    const effectiveGrandPrize = grandPrizeDistributed ?? fallbackData?.grandPrizeDistributed;
    const effectiveRunnerUps = runnerUpsDistributed ?? fallbackData?.runnerUpsDistributed; 
    const effectiveEarlyBirds = earlyBirdsDistributed ?? fallbackData?.earlyBirdsDistributed;
    const effectiveFinalPool = finalPool ?? fallbackData?.finalPool;
    
    setCheckingWinners(true);
    let totalWinnings = 0n;
    let highestPrizeCategory: 'grand' | 'runnerUp' | 'earlyBird' | null = null;
    let highestPrizeAmount = 0n;
    
    // Track individual prizes
    let isGrandWinner = false;
    let isRunnerUp = false;
    let isEarlyBird = false;
    let grandPrizeAmount = 0n;
    let runnerUpAmount = 0n;
    let earlyBirdAmount = 0n;

    try {
      // Type check for address
      if (!address || typeof address !== 'string') return;
      
      const addrLower = address.toLowerCase();

      // Check Grand Prize Winner
      if (effectiveGrandPrize && lastGrandWinner && typeof lastGrandWinner === 'string') {
        if (lastGrandWinner.toLowerCase() === addrLower) {
          // Grand prize is 25% of final pool
          const amount = effectiveFinalPool && typeof effectiveFinalPool === 'bigint' ? (effectiveFinalPool * 25n) / 100n : 0n;
          isGrandWinner = true;
          grandPrizeAmount = amount;
          totalWinnings += amount;
          if (amount > highestPrizeAmount) {
            highestPrizeAmount = amount;
            highestPrizeCategory = 'grand';
          }
        }
      }

      // Check Runner-ups
      if (effectiveRunnerUps) {
        try {
          const runnerUps = await getRunnerUps();
          const runnerUpCheck = runnerUps.some(winner => 
            winner.toLowerCase() === addrLower
          );
          
          if (runnerUpCheck) {
            // Runner-ups share 20% of final pool
            const totalShare = effectiveFinalPool && typeof effectiveFinalPool === 'bigint' ? (effectiveFinalPool * 20n) / 100n : 0n;
            const amount = runnerUps.length > 0 ? totalShare / BigInt(runnerUps.length) : 0n;
            isRunnerUp = true;
            runnerUpAmount = amount;
            totalWinnings += amount;
            if (amount > highestPrizeAmount) {
              highestPrizeAmount = amount;
              highestPrizeCategory = 'runnerUp';
            }
          }
        } catch (error) {
          // Silently handle errors
        }
      }

      // Check Early Birds
      if (effectiveEarlyBirds) {
        try {
          const earlyBirds = await getEarlyBirds();
          const earlyBirdCheck = earlyBirds.some(winner => 
            winner.toLowerCase() === addrLower
          );
          
          if (earlyBirdCheck) {
            // Early birds share 15% of final pool
            const totalShare = effectiveFinalPool && typeof effectiveFinalPool === 'bigint' ? (effectiveFinalPool * 15n) / 100n : 0n;
            const amount = earlyBirds.length > 0 ? totalShare / BigInt(earlyBirds.length) : 0n;
            isEarlyBird = true;
            earlyBirdAmount = amount;
            totalWinnings += amount;
            if (amount > highestPrizeAmount) {
              highestPrizeAmount = amount;
              highestPrizeCategory = 'earlyBird';
            }
          }
        } catch (error) {
          // Silently handle errors
        }
      }

      // Show popup if any winnings found AND popup hasn't been shown this session
      if (totalWinnings > 0n && highestPrizeCategory && !popupShownThisSession) {
        setWinnerInfo({ 
          category: highestPrizeCategory, 
          amount: totalWinnings,
          details: {
            isGrandWinner,
            isRunnerUp,
            isEarlyBird,
            grandPrizeAmount,
            runnerUpAmount,
            earlyBirdAmount,
            totalWinnings
          }
        });
        setShowPopup(true);
        setPopupShownThisSession(true); // Mark popup as shown for this session
      } else {
        setWinnerInfo(null);
        setShowPopup(false);
      }
    } catch (error) {
      // Silently handle errors
      setWinnerInfo(null);
      setShowPopup(false);
    } finally {
      setCheckingWinners(false);
    }
  }, [address, publicClient, checkingWinners, popupShownThisSession, grandPrizeDistributed, runnerUpsDistributed, earlyBirdsDistributed, finalPool, fallbackData, lastGrandWinner, getRunnerUps, getEarlyBirds]);

  // Debounced winner check function
  const debouncedWinnerCheck = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      checkWinnerFromContractState();
    }, 1000); // 1 second debounce
  }, [checkWinnerFromContractState]);

  useEffect(() => {
    if (!address || !publicClient) {
      setWinnerInfo(null);
      setShowPopup(false);
      return;
    }

    // Only check if any distributions have happened (including fallback data)
    if (anyDistributionHappened || fallbackData) {
      debouncedWinnerCheck();
    } else {
      // No distributions yet, set default state
      setWinnerInfo(null);
      setShowPopup(false);
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [address, publicClient, anyDistributionHappened, fallbackData, debouncedWinnerCheck]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    showPopup,
    setShowPopup,
    winnerInfo,
  };
} 