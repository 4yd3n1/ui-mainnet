'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAccount, usePublicClient, useContractRead } from 'wagmi';
import { MEGA_ABI, MEGA_CONTRACT_ADDRESS } from '@/contracts/mega';

interface WinnerInfo {
  category: 'grand' | 'runnerUp' | 'earlyBird';
  amount: bigint;
}

export function useWinnerCheck() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [showPopup, setShowPopup] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState<WinnerInfo | null>(null);
  const [checkingWinners, setCheckingWinners] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Read contract state for distribution flags with longer intervals and conditional polling
  const { data: grandPrizeDistributed } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'grandPrizeDistributed',
    query: { 
      refetchInterval: 30000, // Increased to 30 seconds
      enabled: !!address, // Only poll when user is connected
    },
  });

  const { data: runnerUpsDistributed } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'runnerUpsDistributed',
    query: { 
      refetchInterval: 30000,
      enabled: !!address,
    },
  });

  const { data: earlyBirdsDistributed } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'earlyBirdsDistributed',
    query: { 
      refetchInterval: 30000,
      enabled: !!address,
    },
  });

  // Read winner state variables from contract - only when distributions have happened
  const anyDistributionHappened = grandPrizeDistributed || runnerUpsDistributed || earlyBirdsDistributed;

  const { data: lastGrandWinner } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'lastGrandWinner',
    query: { 
      refetchInterval: 60000, // Increased to 1 minute
      enabled: !!address && !!grandPrizeDistributed,
    },
  });

  const { data: finalPool } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'finalPool',
    query: { 
      refetchInterval: 60000,
      enabled: !!address && !!anyDistributionHappened,
    },
  });

  // Function to get runner-ups array with caching
  const getRunnerUps = async () => {
    if (!publicClient) return [];
    try {
      const runnerUps: string[] = [];
      let index = 0;
      
      // Read array elements one by one until we get an error (array end)
      while (true) {
        try {
          const winner = await publicClient.readContract({
            address: MEGA_CONTRACT_ADDRESS,
            abi: MEGA_ABI,
            functionName: 'lastRunnerUps',
            args: [index],
          });
          if (winner && typeof winner === 'string') {
            runnerUps.push(winner);
            index++;
          } else {
            break;
          }
        } catch {
          break; // End of array
        }
      }
      return runnerUps;
    } catch (error) {
      console.warn('Error reading runner-ups:', error);
      return [];
    }
  };

  // Function to get early birds array with caching
  const getEarlyBirds = async () => {
    if (!publicClient) return [];
    try {
      const earlyBirds: string[] = [];
      let index = 0;
      
      // Read array elements one by one until we get an error (array end)
      while (true) {
        try {
          const winner = await publicClient.readContract({
            address: MEGA_CONTRACT_ADDRESS,
            abi: MEGA_ABI,
            functionName: 'lastEarlyBirds',
            args: [index],
          });
          if (winner && typeof winner === 'string') {
            earlyBirds.push(winner);
            index++;
          } else {
            break;
          }
        } catch {
          break; // End of array
        }
      }
      return earlyBirds;
    } catch (error) {
      console.warn('Error reading early birds:', error);
      return [];
    }
  };

  // Debounced winner check function
  const debouncedWinnerCheck = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      checkWinnerFromContractState();
    }, 1000); // 1 second debounce
  }, []);

  const checkWinnerFromContractState = async () => {
    if (!address || !publicClient || checkingWinners) return;
    
    console.log('🔍 WinnerCheck: Starting check for', address);
    setCheckingWinners(true);
    const cancelled = false;

    try {
      // Type check for address
      if (!address || typeof address !== 'string') return;
      
      const addrLower = address.toLowerCase();
      console.log('🔍 WinnerCheck: Checking address', addrLower);

      // Check Grand Prize Winner
      if (grandPrizeDistributed && lastGrandWinner && typeof lastGrandWinner === 'string') {
        console.log('🔍 WinnerCheck: Checking grand prize winner', lastGrandWinner.toLowerCase());
        if (lastGrandWinner.toLowerCase() === addrLower) {
          // Grand prize is 25% of final pool
          const amount = finalPool && typeof finalPool === 'bigint' ? (finalPool * 25n) / 100n : 0n;
          console.log('🎉 WinnerCheck: GRAND PRIZE WINNER DETECTED!', amount);
          if (!cancelled) {
            setWinnerInfo({ category: 'grand', amount });
            setShowPopup(true);
          }
          return;
        }
      }

      // Check Runner-ups
      if (runnerUpsDistributed) {
        console.log('🔍 WinnerCheck: Checking runner-ups...');
        const runnerUps = await getRunnerUps();
        console.log('🔍 WinnerCheck: Found', runnerUps.length, 'runner-ups');
        const isRunnerUp = runnerUps.some(winner => 
          winner.toLowerCase() === addrLower
        );
        
        if (isRunnerUp) {
          // Runner-ups share 20% of final pool
          const totalShare = finalPool && typeof finalPool === 'bigint' ? (finalPool * 20n) / 100n : 0n;
          const amount = runnerUps.length > 0 ? totalShare / BigInt(runnerUps.length) : 0n;
          console.log('🎉 WinnerCheck: RUNNER-UP WINNER DETECTED!', amount);
          if (!cancelled) {
            setWinnerInfo({ category: 'runnerUp', amount });
            setShowPopup(true);
          }
          return;
        }
      }

      // Check Early Birds
      if (earlyBirdsDistributed) {
        console.log('🔍 WinnerCheck: Checking early birds...');
        const earlyBirds = await getEarlyBirds();
        console.log('🔍 WinnerCheck: Found', earlyBirds.length, 'early birds');
        console.log('🔍 WinnerCheck: Early birds list:', earlyBirds);
        const isEarlyBird = earlyBirds.some(winner => 
          winner.toLowerCase() === addrLower
        );
        
        console.log('🔍 WinnerCheck: Is early bird?', isEarlyBird);
        
        if (isEarlyBird) {
          // Early birds share 15% of final pool
          const totalShare = finalPool && typeof finalPool === 'bigint' ? (finalPool * 15n) / 100n : 0n;
          const amount = earlyBirds.length > 0 ? totalShare / BigInt(earlyBirds.length) : 0n;
          console.log('🎉 WinnerCheck: EARLY BIRD WINNER DETECTED!', amount);
          if (!cancelled) {
            setWinnerInfo({ category: 'earlyBird', amount });
            setShowPopup(true);
          }
          return;
        }
      }

      // Not a winner
      console.log('🔍 WinnerCheck: No winner detected');
      if (!cancelled) {
        setWinnerInfo(null);
        setShowPopup(false);
      }
    } catch (error) {
      console.error('❌ WinnerCheck: Error checking winner status:', error);
      // Fail silently - don't show popup if there's an error
      if (!cancelled) {
        setWinnerInfo(null);
        setShowPopup(false);
      }
    } finally {
      setCheckingWinners(false);
    }
  };

  useEffect(() => {
    console.log('🔄 WinnerCheck: useEffect triggered');
    console.log('  - address:', address);
    console.log('  - publicClient:', !!publicClient);
    console.log('  - grandPrizeDistributed:', grandPrizeDistributed);
    console.log('  - runnerUpsDistributed:', runnerUpsDistributed);
    console.log('  - earlyBirdsDistributed:', earlyBirdsDistributed);
    console.log('  - anyDistributionHappened:', anyDistributionHappened);
    
    if (!address || !publicClient) {
      console.log('🔄 WinnerCheck: No address or publicClient, resetting state');
      setWinnerInfo(null);
      setShowPopup(false);
      return;
    }

    // Only check if any distributions have happened
    if (anyDistributionHappened) {
      console.log('🔄 WinnerCheck: Distributions detected, starting check...');
      debouncedWinnerCheck();
    } else {
      // No distributions yet, set default state
      console.log('🔄 WinnerCheck: No distributions yet, resetting state');
      setWinnerInfo(null);
      setShowPopup(false);
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [address, publicClient, grandPrizeDistributed, runnerUpsDistributed, earlyBirdsDistributed, lastGrandWinner, finalPool, anyDistributionHappened]);

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