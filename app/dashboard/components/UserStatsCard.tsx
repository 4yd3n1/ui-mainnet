'use client';
import { useAccount, useContractRead } from 'wagmi';
import MEGA_ABI from '@/contracts/MEGA_ABI.json';
import { MEGA_CONTRACT_ADDRESS } from '@/contracts/mega';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import DashboardCard from '@/components/common/DashboardCard';
import { useEffect, useState } from 'react';

export default function UserStatsCard() {
  const { address } = useAccount();

  // Fetch user stats
  const { data: megaBalance, isLoading: loadingBalance } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: { refetchInterval: 5000 },
  });
  const { data: ethContribution, isLoading: loadingContribution } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'contributions',
    args: [address],
    query: { refetchInterval: 5000 },
  });
  const { data: qualified, isLoading: loadingQualified } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'isQualified',
    args: [address],
    query: { refetchInterval: 5000 },
  });
  const { data: tickets, isLoading: loadingTickets } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'lotteryTickets',
    args: [address],
    query: { refetchInterval: 5000 },
  });

  // Read global freezeEndTime
  const { data: freezeEndTime } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'freezeEndTime',
    query: { refetchInterval: 5000 },
  });
  // Read personal lastFreeze
  const { data: lastFreeze } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'lastFreeze',
    args: [address],
    query: { refetchInterval: 5000 },
  });
  // Timer for live countdown
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  useEffect(() => {
    const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);
  const globalFreezeActive = freezeEndTime && Number(freezeEndTime) > now;
  const globalFreezeLeft = globalFreezeActive ? Number(freezeEndTime) - now : 0;
  const cooldownEnds = lastFreeze ? Number(lastFreeze) + 24 * 3600 : 0;
  const onCooldown = cooldownEnds > now;
  const cooldownLeft = onCooldown ? cooldownEnds - now : 0;
  function formatDuration(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
  }

  const loading = loadingBalance || loadingContribution || loadingQualified || loadingTickets;

  return (
    <DashboardCard>
      <h3 className="text-lg font-bold flex items-center gap-2 neon-text-yellow mb-2">
        <img src="/playerstats.png" alt="Player Stats" style={{ width: 40, height: 40 }} /> Your Stats
      </h3>
      <div className="space-y-3 flex-1 flex flex-col justify-between min-w-0">
        <div className="bg-bg-card-alt rounded-lg p-4 flex flex-col gap-2 overflow-x-auto min-w-0">
          <span className="text-sm font-bold text-white mb-2">MEGA Token Balance</span>
          <span className="font-bold text-white text-xs sm:text-sm md:text-base lg:text-lg break-words truncate whitespace-normal">{
              megaBalance
                ? (Number(megaBalance) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })
                : '0.00'
            } MEGA</span>
        </div>
        <div className="bg-bg-card-alt rounded-lg p-4 flex flex-col gap-2 overflow-x-auto min-w-0">
          <span className="text-sm font-bold text-white mb-2">Your Contribution</span>
          <span className="font-bold text-white text-xs sm:text-sm md:text-base lg:text-lg break-words truncate whitespace-normal">{
              ethContribution
                ? (Number(ethContribution) / 1e18) < 0.0001
                  ? '0.00'
                  : (Number(ethContribution) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })
                : '0.00'
            } ETH</span>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${qualified ? 'bg-accent-orange' : 'bg-gray-400'}`}></span>
            <span className="text-xs text-gray-400">{qualified ? 'Qualified' : 'Not Qualified'}</span>
          </div>
        </div>
        <div className="bg-bg-card-alt rounded-lg p-4 flex flex-col gap-2 overflow-x-auto min-w-0">
          <span className="text-sm font-bold text-white mb-2">Your Lottery Tickets</span>
          <span className="font-bold text-white text-xs sm:text-sm md:text-base lg:text-lg break-words truncate whitespace-normal">{tickets ? Number(tickets) : 0}</span>
          <div className="text-xs text-gray-400 mt-1">
            Tickets are based on ETH spent (10 tickets per ETH) with early buyer multipliers
          </div>
        </div>
        <div className="bg-bg-card-alt rounded-lg p-4 flex flex-col gap-2 overflow-x-auto min-w-0">
          <span className="text-sm font-bold text-white mb-2">Selling Freeze Cooldown</span>
            <span className={`px-3 py-1 rounded font-bold text-xs ${onCooldown ? 'bg-accent-orange' : globalFreezeActive ? 'bg-accent-orange' : 'bg-green-600'} text-white`}>
              {onCooldown
                ? `You can freeze again in ${formatDuration(cooldownLeft)}`
                : globalFreezeActive
                  ? `Market is frozen for ${formatDuration(globalFreezeLeft)}`
                  : 'Ready to Freeze'}
            </span>
        </div>
      </div>
    </DashboardCard>
  );
} 