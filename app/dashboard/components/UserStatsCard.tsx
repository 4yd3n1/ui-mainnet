'use client';
import { useGameData } from '@/contexts/GameDataContext';
import { useAccount, useBalance } from 'wagmi';
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
    isLoading 
  } = useGameData();
  
  // Get ETH balance separately as it's not a contract call
  const { data: ethBalance } = useBalance({
    address: address,
    query: { refetchInterval: 10000 },
  });

  const contributionsEth = userContributions ? Number(userContributions) / 1e18 : 0;
  const megaTokens = userTokenBalance ? Number(userTokenBalance) / 1e18 : 0;
  const tickets = userTickets ? Number(userTickets) : 0;
  const qualified = userQualified || false;

  return (
    <DashboardCard>
      <h3 className="text-lg font-bold flex items-center gap-2 neon-text-yellow mb-2">
        <img src="/personalstats.png" alt="Personal Stats" style={{ width: 40, height: 40 }} /> Your Stats
      </h3>

      {!address ? (
        <div className="bg-bg-card-alt rounded-lg p-6 text-center">
          <p className="text-gray-light">Connect wallet to view personal stats</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-bg-card-alt rounded-lg p-4 flex flex-col gap-2">
            <span className="text-sm font-bold text-white mb-2">Your Wallet</span>
            <div className="flex justify-between items-center">
              <span className="text-gray-light">ETH Balance:</span>
              <span className="font-bold text-white">
                {ethBalance ? parseFloat(ethBalance.formatted).toLocaleString(undefined, { maximumFractionDigits: 8 }) : '0'} ETH
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-light">MEGA Balance:</span>
              <span className="font-bold text-white">
                {isLoading ? <LoadingSpinner /> : megaTokens.toLocaleString(undefined, { maximumFractionDigits: 8 })} MEGA
              </span>
            </div>
          </div>

          <div className="bg-bg-card-alt rounded-lg p-4 flex flex-col gap-2">
            <span className="text-sm font-bold text-white mb-2">Your Participation</span>
            <div className="flex justify-between items-center">
              <span className="text-gray-light">Total Contributed:</span>
              <span className="font-bold text-white">
                {isLoading ? <LoadingSpinner /> : contributionsEth.toLocaleString(undefined, { maximumFractionDigits: 8 })} ETH
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-light">Lottery Tickets:</span>
              <span className="font-bold neon-text-yellow">
                {isLoading ? <LoadingSpinner /> : tickets}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-light">Qualified:</span>
              <span className={`font-bold ${qualified ? 'text-green-400' : 'text-red-400'}`}>
                {isLoading ? <LoadingSpinner /> : (qualified ? 'Yes' : 'No')}
              </span>
            </div>
          </div>

          <div className="bg-bg-card-alt rounded-lg p-4 flex flex-col gap-2">
            <span className="text-sm font-bold text-white mb-2">Qualification Status</span>
            <span className={`font-bold text-lg ${qualified ? 'neon-text-yellow' : 'text-gray-light'}`}>
              {isLoading ? <LoadingSpinner /> : 
                (qualified ? 'You\'re in the lottery!' : 'Contribute 0.1+ ETH to qualify')}
            </span>
          </div>
        </div>
      )}
    </DashboardCard>
  );
} 