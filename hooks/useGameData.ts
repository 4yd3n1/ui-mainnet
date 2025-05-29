import { useEffect, useMemo, useState } from 'react';
import { useContractReads } from 'wagmi';
import { MEGA_ABI, MEGA_CONTRACT_ADDRESS } from '@/contracts/mega';

// Type assertion for the contract address
const CONTRACT_ADDRESS = MEGA_CONTRACT_ADDRESS as `0x${string}`;

interface GameData {
  priceEth: number;          // Current token price in ETH
  ethReserve: number;        // ETH in the pool
  tokenReserve: number;      // MEGA in the pool
  marketCapUsd: number;      // Fully-diluted market-cap in USD
  playersQualified: bigint;  // # of qualified wallets
  totalTickets: bigint;      // Total lottery tickets
  freezeEndTime: bigint;     // Timestamp when freeze ends (0 if not frozen)
  isFrozen: boolean;         // Convenience boolean
  gameEnded: boolean;        // Game end flag
  now: number;               // Local wall-clock (seconds)
}

/**
 * Aggregates on-chain game metrics into a single object.
 * Polls the contract once every 5 s (multicall) and provides a
 * ticking `now` value so timers can update without extra RPC calls.
 */
const useGameData = () => {
  // Local timer for countdowns (updates every second)
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  // Multicall: fetch all required values in one shot
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useContractReads({
    contracts: [
      { address: CONTRACT_ADDRESS, abi: MEGA_ABI, functionName: 'getPrice' },
      { address: CONTRACT_ADDRESS, abi: MEGA_ABI, functionName: 'ethReserve' },
      { address: CONTRACT_ADDRESS, abi: MEGA_ABI, functionName: 'tokenReserve' },
      { address: CONTRACT_ADDRESS, abi: MEGA_ABI, functionName: 'getMarketCapUSD' },
      { address: CONTRACT_ADDRESS, abi: MEGA_ABI, functionName: 'qualifiedCount' },
      { address: CONTRACT_ADDRESS, abi: MEGA_ABI, functionName: 'totalTickets' },
      { address: CONTRACT_ADDRESS, abi: MEGA_ABI, functionName: 'freezeEndTime' },
      { address: CONTRACT_ADDRESS, abi: MEGA_ABI, functionName: 'gameEnded' },
    ],
    allowFailure: false,
    query: { refetchInterval: 5000 },
  });

  // Transform raw BigInt values -> friendly numbers/booleans
  const parsed: GameData | null = useMemo(() => {
    if (!data) return null;

    const [
      priceRaw,
      ethResRaw,
      tokenResRaw,
      mcapRaw,
      qualifiedRaw,
      ticketsRaw,
      freezeEndRaw,
      endedRaw,
    ] = data as readonly unknown[];

    const priceEth = priceRaw ? Number(priceRaw) / 1e18 : 0;
    const ethReserve = ethResRaw ? Number(ethResRaw) / 1e18 : 0;
    const tokenReserve = tokenResRaw ? Number(tokenResRaw) / 1e18 : 0;
    const marketCapUsd = mcapRaw ? Number(mcapRaw) / 1e18 : 0;

    const freezeEndTime = freezeEndRaw ? BigInt(freezeEndRaw as bigint) : 0n;
    const isFrozen = freezeEndTime > 0n && Number(freezeEndTime) > now;

    return {
      priceEth,
      ethReserve,
      tokenReserve,
      marketCapUsd,
      playersQualified: qualifiedRaw as bigint,
      totalTickets: ticketsRaw as bigint,
      freezeEndTime,
      isFrozen,
      gameEnded: Boolean(endedRaw),
      now,
    };
  }, [data, now]);

  return {
    data: parsed,
    isLoading,
    isError,
    error,
    refetch,
  } as const;
};

export default useGameData; 