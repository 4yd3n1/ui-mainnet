'use client';
import { useContractRead, usePublicClient } from 'wagmi';
import MEGA_ABI from '@/contracts/MEGA_ABI.json';
import { MEGA_CONTRACT_ADDRESS } from '@/contracts/mega';
import { useEffect, useState } from 'react';

export default function ContractStateChecker() {
  const publicClient = usePublicClient();
  const [contractBalance, setContractBalance] = useState<bigint | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Read all necessary contract states
  const { data: gameEnded } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'gameEnded',
    query: { refetchInterval: 5000 },
  });

  const { data: grandPrizeDistributed } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'grandPrizeDistributed',
    query: { refetchInterval: 5000 },
  });

  const { data: runnerUpsDistributed } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'runnerUpsDistributed',
    query: { refetchInterval: 5000 },
  });

  const { data: earlyBirdsDistributed } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'earlyBirdsDistributed',
    query: { refetchInterval: 5000 },
  });

  const { data: lastGrandWinner } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'lastGrandWinner',
    query: { refetchInterval: 5000 },
  }) as { data: `0x${string}` | undefined };

  const { data: playerCapUSD } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'getMarketCapUSD',
    query: { refetchInterval: 5000 },
  });

  const { data: ethReserve } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'ethReserve',
    query: { refetchInterval: 5000 },
  });

  // Check contract balance
  useEffect(() => {
    const checkBalance = async () => {
      if (!publicClient) return;
      try {
        const balance = await publicClient.getBalance({ address: MEGA_CONTRACT_ADDRESS });
        setContractBalance(balance);
        console.log('Contract ETH balance:', balance.toString());
      } catch (error) {
        console.error('Error checking contract balance:', error);
        setError('Failed to check contract balance');
      }
    };

    checkBalance();
    const interval = setInterval(checkBalance, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [publicClient]);

  // Log all states for debugging
  useEffect(() => {
    console.log('Contract State:', {
      gameEnded,
      grandPrizeDistributed,
      runnerUpsDistributed,
      earlyBirdsDistributed,
      lastGrandWinner,
      playerCapUSD: playerCapUSD?.toString(),
      ethReserve: ethReserve?.toString(),
      contractBalance: contractBalance?.toString(),
    });
  }, [
    gameEnded,
    grandPrizeDistributed,
    runnerUpsDistributed,
    earlyBirdsDistributed,
    lastGrandWinner,
    playerCapUSD,
    ethReserve,
    contractBalance,
  ]);

  return (
    <div className="w-full bg-bg-card-alt rounded-lg p-4 text-left">
      <h4 className="text-sm font-bold text-white mb-2">Contract State Check</h4>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-light">Game Ended:</span>
          <span className="font-mono text-white">{gameEnded ? '✅' : '❌'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-light">Grand Prize Distributed:</span>
          <span className="font-mono text-white">{grandPrizeDistributed ? '✅' : '❌'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-light">Runner-ups Distributed:</span>
          <span className="font-mono text-white">{runnerUpsDistributed ? '✅' : '❌'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-light">Early Birds Distributed:</span>
          <span className="font-mono text-white">{earlyBirdsDistributed ? '✅' : '❌'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-light">Last Grand Winner:</span>
          <span className="font-mono text-white">
            {lastGrandWinner ? `${lastGrandWinner.slice(0, 6)}...${lastGrandWinner.slice(-4)}` : 'None'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-light">Player Cap USD:</span>
          <span className="font-mono text-white">{playerCapUSD ? `${Number(playerCapUSD) / 1e18} USD` : 'Loading...'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-light">ETH Reserve:</span>
          <span className="font-mono text-white">{ethReserve ? `${Number(ethReserve) / 1e18} ETH` : 'Loading...'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-light">Contract Balance:</span>
          <span className="font-mono text-white">
            {contractBalance ? `${Number(contractBalance) / 1e18} ETH` : 'Loading...'}
          </span>
        </div>
      </div>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
} 