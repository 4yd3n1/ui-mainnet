'use client';

import { useEffect, useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { MEGA_ABI, MEGA_CONTRACT_ADDRESS } from '@/contracts/mega';
import { parseAbiItem } from 'viem';

interface WinnerInfo {
  category: 'grand' | 'runnerUp' | 'earlyBird';
  amount: bigint;
}

export function useWinnerCheck() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [showPopup, setShowPopup] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState<WinnerInfo | null>(null);

  useEffect(() => {
    if (!address || !publicClient) return;

    // Non-null local copies for TypeScript
    const pc = publicClient;
    const addrLower = address.toLowerCase();

    let cancelled = false;

    async function checkWinnerFromEvents() {
      // Determine block range (last 5000 blocks)
      const latestBlock = await pc.getBlockNumber();
      const fromBlock = latestBlock > 5000n ? latestBlock - 5000n : 0n;

      // Grand Prize
      const grandEvent = parseAbiItem('event GrandPrizeDistributed(address winner, uint256 amount)');
      const grandLogs = await pc.getLogs({
        address: MEGA_CONTRACT_ADDRESS,
        event: grandEvent,
        fromBlock,
        toBlock: latestBlock,
      });
      const grand = (grandLogs as any[]).find((log) => log.args && log.args.winner?.toLowerCase() === addrLower);
      if (grand) {
        const amount = grand.args.amount as bigint;
        if (!cancelled) {
          setWinnerInfo({ category: 'grand', amount });
          setShowPopup(true);
        }
        return;
      }
      // Runner-up
      const runnerEvent = parseAbiItem('event RunnerUpsDistributed(address[] winners, uint256 amountPerWinner)');
      const runnerLogs = await pc.getLogs({
        address: MEGA_CONTRACT_ADDRESS,
        event: runnerEvent,
        fromBlock,
        toBlock: latestBlock,
      });
      for (const log of runnerLogs as any[]) {
        if (Array.isArray(log.args.winners) && log.args.winners.map((w:any) => w.toLowerCase()).includes(addrLower)) {
          const amount = log.args.amountPerWinner as bigint;
          if (!cancelled) {
            setWinnerInfo({ category: 'runnerUp', amount });
            setShowPopup(true);
          }
          return;
        }
      }
      // Early Bird
      const earlyEvent = parseAbiItem('event EarlyBirdsDistributed(address[] winners, uint256 amountPerWinner)');
      const earlyLogs = await pc.getLogs({
        address: MEGA_CONTRACT_ADDRESS,
        event: earlyEvent,
        fromBlock,
        toBlock: latestBlock,
      });
      for (const log of earlyLogs as any[]) {
        if (Array.isArray(log.args.winners) && log.args.winners.map((w:any) => w.toLowerCase()).includes(addrLower)) {
          const amount = log.args.amountPerWinner as bigint;
          if (!cancelled) {
            setWinnerInfo({ category: 'earlyBird', amount });
            setShowPopup(true);
          }
          return;
        }
      }
      // Not a winner
      if (!cancelled) {
        setWinnerInfo(null);
        setShowPopup(false);
      }
    }

    checkWinnerFromEvents();
    return () => { cancelled = true; };
  }, [address, publicClient]);

  return {
    showPopup,
    setShowPopup,
    winnerInfo,
  };
} 