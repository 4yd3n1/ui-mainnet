'use client';

import { useGameData } from '@/contexts/GameDataContext';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { MEGA_CONTRACT_ADDRESS } from '@/contracts/mega';
import MEGA_ABI from '@/contracts/MEGA_ABI.json';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useState } from 'react';

export default function AdminDistributionPanel() {
  const { address } = useAccount();
  const { 
    owner,
    gameEnded,
    grandPrizeDistributed,
    runnerUpsDistributed,
    earlyBirdsDistributed,
    ownerPaid,
    failed,
    randomWordRequested,
    randomWordReceived
  } = useGameData();

  const [activeStep, setActiveStep] = useState<string | null>(null);

  // Check if current user is owner
  const isOwner = owner && address && owner.toLowerCase() === address.toLowerCase();

  // VRF Request
  const { writeContract: requestVRF, data: vrfTxHash } = useWriteContract();
  const { isLoading: isVRFLoading } = useWaitForTransactionReceipt({ hash: vrfTxHash });

  // Grand Prize
  const { writeContract: distributeGrand, data: grandTxHash } = useWriteContract();
  const { isLoading: isGrandLoading } = useWaitForTransactionReceipt({ hash: grandTxHash });

  // Runner-ups
  const { writeContract: distributeRunners, data: runnersTxHash } = useWriteContract();
  const { isLoading: isRunnersLoading } = useWaitForTransactionReceipt({ hash: runnersTxHash });

  // Early Birds
  const { writeContract: distributeEarly, data: earlyTxHash } = useWriteContract();
  const { isLoading: isEarlyLoading } = useWaitForTransactionReceipt({ hash: earlyTxHash });

  // Owner Funds
  const { writeContract: distributeOwner, data: ownerTxHash } = useWriteContract();
  const { isLoading: isOwnerLoading } = useWaitForTransactionReceipt({ hash: ownerTxHash });

  // Failed Pool Distribution
  const { writeContract: distributeFailedPool, data: failedTxHash } = useWriteContract();
  const { isLoading: isFailedLoading } = useWaitForTransactionReceipt({ hash: failedTxHash });

  // Don't show if not owner or game hasn't ended
  if (!isOwner || !gameEnded) {
    return null;
  }

  const handleRequestVRF = () => {
    setActiveStep('vrf');
    requestVRF({
      address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
      abi: MEGA_ABI,
      functionName: 'requestRandomWords',
    });
  };

  const handleDistributeGrand = () => {
    setActiveStep('grand');
    distributeGrand({
      address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
      abi: MEGA_ABI,
      functionName: 'distributeGrandPrize',
    });
  };

  const handleDistributeRunners = () => {
    setActiveStep('runners');
    distributeRunners({
      address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
      abi: MEGA_ABI,
      functionName: 'distributeRunnerUps',
    });
  };

  const handleDistributeEarly = () => {
    setActiveStep('early');
    distributeEarly({
      address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
      abi: MEGA_ABI,
      functionName: 'distributeEarlyBirds',
    });
  };

  const handleDistributeOwner = () => {
    setActiveStep('owner');
    distributeOwner({
      address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
      abi: MEGA_ABI,
      functionName: 'distributeOwnerFunds',
    });
  };

  const handleDistributeFailedPool = () => {
    setActiveStep('failed');
    distributeFailedPool({
      address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
      abi: MEGA_ABI,
      functionName: 'distributeFailedPool',
    });
  };

  const allDistributed = grandPrizeDistributed && runnerUpsDistributed && 
                        earlyBirdsDistributed && ownerPaid;

  if (failed) {
    return (
      <div className="p-6 rounded-xl shadow-card bg-red-900/20 border border-red-500/30">
        <h3 className="text-xl font-bold text-red-400 mb-4">
          ⚠️ Game Failed - Manual Distribution Required
        </h3>
        <p className="text-gray-light mb-4">
          The game failed to reach the market cap target. Distribute the pool to the owner.
        </p>
        <button
          onClick={handleDistributeFailedPool}
          disabled={isFailedLoading || activeStep === 'failed'}
          className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg 
                   hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200"
        >
          {isFailedLoading || activeStep === 'failed' ? <LoadingSpinner /> : 'Distribute Failed Pool'}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl shadow-card">
      <h3 className="text-xl font-bold neon-text-yellow mb-6">
        🛡️ Admin Distribution Panel
      </h3>
      
      <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <div className="text-sm text-blue-300">
          <strong>Note:</strong> This is a manual failsafe system. The automatic distribution script 
          should handle all distributions. Use these controls only if the automatic process fails.
        </div>
      </div>

      <div className="space-y-4">
        {/* VRF Request */}
        <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
          <div>
            <div className="font-semibold flex items-center gap-2">
              1. Request VRF Random Word
              {randomWordReceived && <span className="text-green-400">✅</span>}
              {randomWordRequested && !randomWordReceived && <span className="text-yellow-400">⏳</span>}
            </div>
            <div className="text-sm text-gray-400">
              {randomWordReceived ? 'VRF fulfilled - ready to distribute' : 
               randomWordRequested ? 'Waiting for VRF fulfillment...' : 
               'Required before distribution'}
            </div>
          </div>
          <button
            onClick={handleRequestVRF}
            disabled={isVRFLoading || activeStep === 'vrf' || randomWordRequested}
            className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg 
                     hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200 min-w-[140px]"
          >
            {isVRFLoading || activeStep === 'vrf' ? <LoadingSpinner /> : 
             randomWordReceived ? 'VRF Ready' :
             randomWordRequested ? 'Pending...' : 'Request VRF'}
          </button>
        </div>

        {/* Grand Prize */}
        <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
          <div>
            <div className="font-semibold flex items-center gap-2">
              2. Grand Prize (25%)
              {grandPrizeDistributed && <span className="text-green-400">✅</span>}
            </div>
            <div className="text-sm text-gray-400">Distribute to 1 winner</div>
          </div>
          <button
            onClick={handleDistributeGrand}
            disabled={grandPrizeDistributed || isGrandLoading || activeStep === 'grand' || !randomWordReceived}
            className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg 
                     hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200 min-w-[140px]"
          >
            {isGrandLoading || activeStep === 'grand' ? <LoadingSpinner /> : 
             grandPrizeDistributed ? 'Distributed' : 'Distribute'}
          </button>
        </div>

        {/* Runner-ups */}
        <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
          <div>
            <div className="font-semibold flex items-center gap-2">
              3. Runner-ups (20%)
              {runnerUpsDistributed && <span className="text-green-400">✅</span>}
            </div>
            <div className="text-sm text-gray-400">Distribute to 10 winners</div>
          </div>
          <button
            onClick={handleDistributeRunners}
            disabled={runnerUpsDistributed || isRunnersLoading || activeStep === 'runners' || !grandPrizeDistributed}
            className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg 
                     hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200 min-w-[140px]"
          >
            {isRunnersLoading || activeStep === 'runners' ? <LoadingSpinner /> : 
             runnerUpsDistributed ? 'Distributed' : 'Distribute'}
          </button>
        </div>

        {/* Early Birds */}
        <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
          <div>
            <div className="font-semibold flex items-center gap-2">
              4. Early Birds (15%)
              {earlyBirdsDistributed && <span className="text-green-400">✅</span>}
            </div>
            <div className="text-sm text-gray-400">Distribute to early players</div>
          </div>
          <button
            onClick={handleDistributeEarly}
            disabled={earlyBirdsDistributed || isEarlyLoading || activeStep === 'early' || !runnerUpsDistributed}
            className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg 
                     hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200 min-w-[140px]"
          >
            {isEarlyLoading || activeStep === 'early' ? <LoadingSpinner /> : 
             earlyBirdsDistributed ? 'Distributed' : 'Distribute'}
          </button>
        </div>

        {/* Owner Funds */}
        <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
          <div>
            <div className="font-semibold flex items-center gap-2">
              5. Owner Funds (40%)
              {ownerPaid && <span className="text-green-400">✅</span>}
            </div>
            <div className="text-sm text-gray-400">Distribute to owner</div>
          </div>
          <button
            onClick={handleDistributeOwner}
            disabled={ownerPaid || isOwnerLoading || activeStep === 'owner' || !earlyBirdsDistributed}
            className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg 
                     hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200 min-w-[140px]"
          >
            {isOwnerLoading || activeStep === 'owner' ? <LoadingSpinner /> : 
             ownerPaid ? 'Distributed' : 'Distribute'}
          </button>
        </div>
      </div>

      {allDistributed && (
        <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
          <div className="text-green-400 font-semibold">
            ✅ All distributions completed successfully!
          </div>
        </div>
      )}
    </div>
  );
} 