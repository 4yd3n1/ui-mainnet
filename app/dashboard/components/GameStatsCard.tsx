'use client';
import { useGameData } from '@/contexts/GameDataContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import DashboardCard from '@/components/common/DashboardCard';
import { useEffect, useState } from 'react';

export default function GameStatsCard() {
  // Get consolidated game data from context
  const { 
    tokenPrice, 
    ethReserve, 
    tokenReserve, 
    marketCapDisplay,
    qualifiedCount, 
    totalTickets,
    freezeEndTime,
    isLoading 
  } = useGameData();
  
  // Timer for live countdown
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  useEffect(() => {
    const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);
  
  const isFrozen = freezeEndTime && Number(freezeEndTime) > now;
  const remaining = isFrozen ? Number(freezeEndTime) - now : 0;
  
  function formatDuration(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
  }

  return (
    <DashboardCard>
      <h3 className="text-lg md:text-lg font-bold flex items-center gap-2 text-white mb-2">
        <img src="/gamestats.png" alt="Game Stats" className="w-8 h-8 md:w-10 md:h-10" /> 
        <span className="truncate">Game Stats</span>
      </h3>
      <div className="space-y-3 md:space-y-3 flex-1 overflow-hidden">
        <div className="bg-bg-card-alt rounded-lg p-4 md:p-4 flex flex-col gap-2 md:gap-2">
          <span className="text-sm md:text-sm font-bold text-white mb-2 truncate">Current Token Price</span>
          <span className="font-bold text-white text-sm md:text-base break-words">
            {isLoading ? <LoadingSpinner /> : 
              (tokenPrice ? (Number(tokenPrice) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 8 }) : 0)} ETH
          </span>
        </div>
        <div className="bg-bg-card-alt rounded-lg p-4 md:p-4 flex flex-col gap-2 md:gap-2">
          <span className="text-sm md:text-sm font-bold text-white mb-2 truncate">Liquidity Pool</span>
          <div className="flex justify-between items-center gap-2 min-w-0">
            <span className="text-gray-light text-xs md:text-xs truncate flex-shrink-0">ETH Reserve:</span>
            <span className="font-bold text-white text-xs md:text-xs text-right break-words">
              {isLoading ? <LoadingSpinner /> : 
                (ethReserve ? (Number(ethReserve) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 4 }) : 0)} ETH
            </span>
          </div>
          <div className="flex justify-between items-center gap-2 min-w-0">
            <span className="text-gray-light text-xs md:text-xs truncate flex-shrink-0">Token Reserve:</span>
            <span className="font-bold text-white text-xs md:text-xs text-right break-words">
              {isLoading ? <LoadingSpinner /> : 
                (tokenReserve ? (Number(tokenReserve) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 2 }) : 0)} MEGA
            </span>
          </div>
          <div className="flex justify-between items-center gap-2 min-w-0">
            <span className="text-gray-light text-xs md:text-xs truncate flex-shrink-0">Market Cap:</span>
            <span className="font-bold neon-text-yellow text-xs md:text-xs text-right break-words">
              {isLoading ? <LoadingSpinner /> : marketCapDisplay || '$0'}
            </span>
          </div>
        </div>
        <div className="bg-bg-card-alt rounded-lg p-4 md:p-4 flex flex-col gap-2 md:gap-2">
          <span className="text-sm md:text-sm font-bold text-white mb-2 truncate">Player Stats</span>
          <div className="flex justify-between items-center gap-2 min-w-0">
            <span className="text-gray-light text-xs md:text-xs truncate flex-shrink-0">Players Qualified:</span>
            <span className="font-bold text-white text-xs md:text-xs text-right">
              {isLoading ? <LoadingSpinner /> : (qualifiedCount ? Number(qualifiedCount) : 0)}
            </span>
          </div>
          <div className="flex justify-between items-center gap-2 min-w-0">
            <span className="text-gray-light text-xs md:text-xs truncate flex-shrink-0">Total Tickets:</span>
            <span className="font-bold text-white text-xs md:text-xs text-right">
              {isLoading ? <LoadingSpinner /> : (totalTickets ? Number(totalTickets) : 0)}
            </span>
          </div>
        </div>
        <div className="bg-bg-card-alt rounded-lg p-4 md:p-4 flex flex-col gap-2 md:gap-2">
          <span className="text-sm md:text-sm font-bold text-white mb-2 truncate">Total Contract Balance</span>
          <span className="font-bold neon-text-yellow text-sm md:text-base break-words">
            {isLoading ? <LoadingSpinner /> : 
              (ethReserve ? (Number(ethReserve) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 4 }) : 0)} ETH
          </span>
        </div>
        <div className="bg-bg-card-alt rounded-lg p-4 md:p-4 flex flex-col gap-2 md:gap-2">
          <span className="text-sm md:text-sm font-bold text-white mb-2 truncate">Market Freeze Status</span>
          <span className={`font-bold text-sm md:text-base break-words ${isFrozen ? 'neon-text-yellow' : 'text-green-400'}`}>
            {isFrozen ? `Jeeting disabled (${formatDuration(remaining)})` : 'Jeeting Allowed'}
          </span>
        </div>
      </div>
    </DashboardCard>
  );
} 