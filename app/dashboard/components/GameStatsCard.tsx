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
      <h3 className="text-lg font-bold flex items-center gap-2 neon-text-yellow mb-2">
        <img src="/gamestats.png" alt="Game Stats" style={{ width: 40, height: 40 }} /> Game Stats
      </h3>
      <div className="space-y-3">
        <div className="bg-bg-card-alt rounded-lg p-4 flex flex-col gap-2">
          <span className="text-sm font-bold text-white mb-2">Current Token Price</span>
          <span className="font-bold text-white text-lg">
            {isLoading ? <LoadingSpinner /> : 
              (tokenPrice ? (Number(tokenPrice) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 8 }) : 0)} ETH
          </span>
        </div>
        <div className="bg-bg-card-alt rounded-lg p-4 flex flex-col gap-2">
          <span className="text-sm font-bold text-white mb-2">Liquidity Pool</span>
          <div className="flex justify-between items-center">
            <span className="text-gray-light">ETH Reserve:</span>
            <span className="font-bold text-white">
              {isLoading ? <LoadingSpinner /> : 
                (ethReserve ? (Number(ethReserve) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 8 }) : 0)} ETH
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-light">Token Reserve:</span>
            <span className="font-bold text-white">
              {isLoading ? <LoadingSpinner /> : 
                (tokenReserve ? (Number(tokenReserve) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 8 }) : 0)} MEGA
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-light">Market Cap:</span>
            <span className="font-bold neon-text-yellow">
              {isLoading ? <LoadingSpinner /> : marketCapDisplay || '$0'}
            </span>
          </div>
        </div>
        <div className="bg-bg-card-alt rounded-lg p-4 flex flex-col gap-2">
          <span className="text-sm font-bold text-white mb-2">Player Stats</span>
          <div className="flex justify-between items-center">
            <span className="text-gray-light">Players Qualified:</span>
            <span className="font-bold text-white">
              {isLoading ? <LoadingSpinner /> : (qualifiedCount ? Number(qualifiedCount) : 0)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-light">Total Tickets:</span>
            <span className="font-bold text-white">
              {isLoading ? <LoadingSpinner /> : (totalTickets ? Number(totalTickets) : 0)}
            </span>
          </div>
        </div>
        <div className="bg-bg-card-alt rounded-lg p-4 flex flex-col gap-2">
          <span className="text-sm font-bold text-white mb-2">Total Contract Balance</span>
          <span className="font-bold neon-text-yellow text-lg">
            {isLoading ? <LoadingSpinner /> : 
              (ethReserve ? (Number(ethReserve) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 8 }) : 0)} ETH
          </span>
        </div>
        <div className="bg-bg-card-alt rounded-lg p-4 flex flex-col gap-2">
          <span className="text-sm font-bold text-white mb-2">Market Freeze Status</span>
          <span className={`font-bold text-lg ${isFrozen ? 'neon-text-yellow' : 'text-green-400'}`}>
            {isFrozen ? `Jeeting disabled (${formatDuration(remaining)})` : 'Jeeting Allowed'}
          </span>
        </div>
      </div>
    </DashboardCard>
  );
} 