'use client';
import React from 'react';
import { useGameData } from '@/contexts/GameDataContext';
import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import DashboardCard from '@/components/common/DashboardCard';

export default function UserStatsCard() {
  const { address } = useAccount();
  
  // Get consolidated user data from context
  const { 
    userContributions, 
    userTickets, 
    userQualified, 
    userTokenBalance,
    userLastFreeze,
    isLoading 
  } = useGameData();

  // Timer for freeze cooldown
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const contributionsEth = userContributions ? Number(userContributions) / 1e18 : 0;
  const megaTokens = userTokenBalance ? Number(userTokenBalance) / 1e18 : 0;
  const tickets = userTickets ? Number(userTickets) : 0;
  const qualified = userQualified || false;
  
  // Calculate freeze cooldown
  const lastFreezeTime = userLastFreeze ? Number(userLastFreeze) : 0;
  const freezeCooldownSeconds = 24 * 60 * 60; // 24 hours
  const nextFreezeTime = lastFreezeTime + freezeCooldownSeconds;
  const freezeCooldownRemaining = Math.max(0, nextFreezeTime - now);
  const canFreeze = freezeCooldownRemaining === 0 && qualified;
  
  // Format cooldown time
  const formatCooldown = (seconds: number) => {
    if (seconds <= 0) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <DashboardCard>
      <h3 className="text-lg md:text-lg font-bold flex items-center gap-2 neon-text-yellow mb-2">
        <img src="/playerstats.png" alt="Personal Stats" className="w-8 h-8 md:w-8 md:h-8 lg:w-10 lg:h-10 flex-shrink-0" /> 
        <span className="truncate">Your Stats</span>
      </h3>

      {!address ? (
        <div className="bg-bg-card-alt rounded-lg p-4 md:p-4 lg:p-6 text-center">
          <p className="text-gray-light text-sm md:text-sm lg:text-base">Connect wallet to view personal stats</p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-3 w-full flex-1 overflow-hidden">
          {/* MEGA Token Balance */}
          <div className="bg-bg-card-alt rounded-lg p-4 md:p-3 lg:p-4 flex flex-col gap-2 md:gap-2 min-h-0 overflow-hidden">
            <span className="text-sm md:text-sm font-bold text-white mb-1 truncate">MEGA Token Balance</span>
            <span className="font-bold text-white text-sm md:text-base break-words">
              {isLoading ? <LoadingSpinner /> : `${megaTokens.toLocaleString(undefined, { maximumFractionDigits: 2 })} MEGA`}
            </span>
          </div>

          {/* Your Participation */}
          <div className="bg-bg-card-alt rounded-lg p-4 md:p-3 lg:p-4 flex flex-col gap-2 md:gap-2 min-h-0 overflow-hidden">
            <span className="text-sm md:text-sm font-bold text-white mb-1 truncate">Your Participation</span>
            <div className="flex justify-between items-center gap-2 min-w-0">
              <span className="text-gray-light text-xs md:text-xs truncate flex-shrink-0">Total Contributed:</span>
              <span className="font-bold text-white text-xs md:text-xs text-right break-words">
                {isLoading ? <LoadingSpinner /> : `${contributionsEth.toFixed(2)} ETH`}
              </span>
            </div>
            <div className="flex justify-between items-center gap-2 min-w-0">
              <span className="text-gray-light text-xs md:text-xs truncate flex-shrink-0">Lottery Tickets:</span>
              <span className="font-bold text-white text-xs md:text-xs text-right">
                {isLoading ? <LoadingSpinner /> : tickets}
              </span>
            </div>
            <div className="flex justify-between items-center gap-2 min-w-0">
              <span className="text-gray-light text-xs md:text-xs truncate flex-shrink-0">Qualified:</span>
              <span className={`font-bold text-xs md:text-xs text-right ${qualified ? 'text-green-400' : 'text-red-400'}`}>
                {isLoading ? <LoadingSpinner /> : (qualified ? 'Yes' : 'No')}
              </span>
            </div>
          </div>

          {/* Your Lottery Tickets */}
          <div className="bg-bg-card-alt rounded-lg p-4 md:p-3 lg:p-4 flex flex-col gap-2 md:gap-2 min-h-0 overflow-hidden">
            <span className="text-sm md:text-sm font-bold text-white mb-1 truncate">Your Lottery Tickets</span>
            <span className="font-bold neon-text-yellow text-sm md:text-base break-words">
              {isLoading ? <LoadingSpinner /> : tickets}
            </span>
          </div>

          {/* Qualification Status */}
          <div className="bg-bg-card-alt rounded-lg p-4 md:p-3 lg:p-4 flex flex-col gap-2 md:gap-2 min-h-0 overflow-hidden">
            <span className="text-sm md:text-sm font-bold text-white mb-1 truncate">Qualification Status</span>
            <span className={`font-bold text-sm md:text-sm break-words ${qualified ? 'neon-text-yellow' : 'text-gray-400'}`}>
              {isLoading ? <LoadingSpinner /> : 
                (qualified ? "You're in the lottery!" : 'Contribute 0.1+ ETH to qualify')}
            </span>
          </div>

          {/* Selling Freeze Cooldown */}
          <div className="bg-bg-card-alt rounded-lg p-4 md:p-3 lg:p-4 flex flex-col gap-2 md:gap-2 min-h-0 overflow-hidden">
            <span className="text-sm md:text-sm font-bold text-white mb-1 truncate">Selling Freeze Cooldown</span>
            <span className={`font-bold text-sm md:text-sm break-words ${!qualified ? 'text-gray-400' : (canFreeze ? 'text-green-400' : 'neon-text-yellow')}`}>
              {!qualified ? 'Must be qualified to freeze' : 
                (canFreeze ? 'Ready To Freeze' : formatCooldown(freezeCooldownRemaining))}
            </span>
          </div>
        </div>
      )}
    </DashboardCard>
  );
} 