'use client';
import { useContractRead } from 'wagmi';
import { MEGA_ABI, MEGA_CONTRACT_ADDRESS } from '@/contracts/mega';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import DashboardCard from '@/components/common/DashboardCard';
import { useEffect, useState, useRef } from 'react';

export default function GameStatsCard() {
  // Fetch all stats in parallel
  const { data: tokenPrice, isLoading: loadingPrice } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'getPrice',
    query: { refetchInterval: 5000 },
  });
  const { data: ethReserve, isLoading: loadingEthReserve } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'ethReserve',
    query: { refetchInterval: 5000 },
  });
  const { data: tokenReserve, isLoading: loadingTokenReserve } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'tokenReserve',
    query: { refetchInterval: 5000 },
  });
  const { data: marketCapUSD, isLoading: loadingMarketCapUSD } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'getMarketCapUSD',
    query: { refetchInterval: 5000 },
  });
  const { data: playersQualified, isLoading: loadingQualified } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'qualifiedCount',
    query: { refetchInterval: 5000 },
  });
  const { data: totalTickets, isLoading: loadingTickets } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'totalTickets',
    query: { refetchInterval: 5000 },
  });
  const { data: contractBalance, isLoading: loadingBalance } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'ethReserve', // fallback to ethReserve for contract balance
    query: { refetchInterval: 5000 },
  });
  // Add global freezeEndTime read
  const { data: freezeEndTime } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'freezeEndTime',
    query: { refetchInterval: 5000 },
  });
  // Timer for live countdown
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  const prevFreezeEndTime = useRef(freezeEndTime);
  useEffect(() => {
    const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);
  const isFrozen = freezeEndTime && Number(freezeEndTime) > now;
  useEffect(() => {
    if (freezeEndTime !== prevFreezeEndTime.current) {
      console.log("[GameStatsCard] freezeEndTime changed:", freezeEndTime);
      prevFreezeEndTime.current = freezeEndTime;
    }
  }, [freezeEndTime]);
  const remaining = isFrozen ? Number(freezeEndTime) - now : 0;
  function formatDuration(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
  }

  const loading = loadingPrice || loadingEthReserve || loadingTokenReserve || loadingMarketCapUSD || loadingQualified || loadingTickets || loadingBalance;

  return (
    <DashboardCard>
      <h3 className="text-lg font-bold flex items-center gap-2 neon-text-yellow mb-2">
        <img src="/gamestats.png" alt="Game Stats" style={{ width: 40, height: 40 }} /> Game Stats
      </h3>
      <div className="space-y-3">
        <div className="bg-bg-card-alt rounded-lg p-4 flex flex-col gap-2">
          <span className="text-sm font-bold text-white mb-2">Current Token Price</span>
          <span className="font-bold text-white text-lg">{tokenPrice ? (Number(tokenPrice) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 8 }) : 0} ETH</span>
        </div>
        <div className="bg-bg-card-alt rounded-lg p-4 flex flex-col gap-2">
          <span className="text-sm font-bold text-white mb-2">Liquidity Pool</span>
          <div className="flex justify-between items-center">
            <span className="text-gray-light">ETH Reserve:</span>
            <span className="font-bold text-white">{ethReserve ? (Number(ethReserve) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 8 }) : 0} ETH</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-light">Token Reserve:</span>
            <span className="font-bold text-white">{tokenReserve ? (Number(tokenReserve) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 8 }) : 0} MEGA</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-light">Market Cap:</span>
            <span className="font-bold neon-text-yellow">
              {marketCapUSD !== undefined && marketCapUSD !== null
                ? `$${(typeof marketCapUSD === "bigint"
                    ? Number(marketCapUSD) / 1e18
                    : Number(marketCapUSD) / 1e18
                  ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "Loading..."}
            </span>
          </div>
        </div>
        <div className="bg-bg-card-alt rounded-lg p-4 flex flex-col gap-2">
          <span className="text-sm font-bold text-white mb-2">Player Stats</span>
          <div className="flex justify-between items-center">
            <span className="text-gray-light">Players Qualified:</span>
            <span className="font-bold text-white">{playersQualified ? Number(playersQualified) : 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-light">Total Tickets:</span>
            <span className="font-bold text-white">{totalTickets ? Number(totalTickets) : 0}</span>
          </div>
        </div>
        <div className="bg-bg-card-alt rounded-lg p-4 flex flex-col gap-2">
          <span className="text-sm font-bold text-white mb-2">Total Contract Balance</span>
          <span className="font-bold neon-text-yellow text-lg">{contractBalance ? (Number(contractBalance) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 8 }) : 0} ETH</span>
        </div>
        <div className="bg-bg-card-alt rounded-lg p-4 flex flex-col gap-2">
          <span className="text-sm font-bold text-white mb-2">Market Freeze Status</span>
          <span className={`font-bold text-lg ${isFrozen ? 'neon-text-yellow' : 'text-green-400'}`}>{isFrozen ? `Jeeting disabled (${formatDuration(remaining)})` : 'Jeeting Allowed'}</span>
        </div>
      </div>
    </DashboardCard>
  );
} 