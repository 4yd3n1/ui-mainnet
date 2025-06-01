'use client';
import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { useGameData } from '@/contexts/GameDataContext';
import { MEGA_CONTRACT_ADDRESS } from '@/contracts/mega';
import MEGA_ABI from '@/contracts/MEGA_ABI.json';
import { ethers } from 'ethers';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { parseEther } from 'viem';

export default function RefundContent() {
  const { address } = useAccount();
  const [refundAmount, setRefundAmount] = useState('');
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Get consolidated game data from context
  const {
    refundsEnabled,
    gameEnded,
    refundPool,
    refundSupply,
    seedWithdrawn,
    userTokenBalance,
    owner,
    gameStartTime,
    gameDuration,
    isLoading
  } = useGameData();

  const isOwner = owner && address && owner.toLowerCase() === address.toLowerCase();
  const userBalance = userTokenBalance ? Number(userTokenBalance) / 1e18 : 0;

  // Calculate if game timer has expired - use dynamic duration
  const gameStart = gameStartTime ? Number(gameStartTime) : 0;
  const GAME_DURATION = gameDuration ? Number(gameDuration) : 1800; // Dynamic duration with fallback
  const REFUND_DELAY = 5 * 60; // 5 minutes
  const timerExpired = gameStart > 0 && currentTime >= gameStart + GAME_DURATION;
  const canForceEnd = timerExpired && !gameEnded;
  
  // Calculate refund timing
  const gameEndTime = gameStart + GAME_DURATION;
  const refundEnabledTime = gameEndTime + REFUND_DELAY;
  const timeUntilRefunds = Math.max(0, refundEnabledTime - currentTime);
  const canEnableRefunds = gameEnded && timeUntilRefunds === 0;

  // Format countdown timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Refund claim transaction
  const { writeContract: claimRefund, data: refundTxHash, isPending: isRefundPending } = useWriteContract();
  const { isLoading: isRefundTxLoading } = useWaitForTransactionReceipt({ hash: refundTxHash });

  // Seed withdrawal transaction (owner only)
  const { writeContract: withdrawSeed, data: seedTxHash, isPending: isSeedPending } = useWriteContract();
  const { isLoading: isSeedTxLoading } = useWaitForTransactionReceipt({ hash: seedTxHash });

  // Enable refunds transaction
  const { writeContract: enableRefunds, data: enableTxHash, isPending: isEnablePending } = useWriteContract();
  const { isLoading: isEnableTxLoading } = useWaitForTransactionReceipt({ hash: enableTxHash });

  // Force end game transaction
  const { writeContract: forceEndGame, data: forceEndTxHash, isPending: isForceEndPending } = useWriteContract();
  const { isLoading: isForceEndTxLoading } = useWaitForTransactionReceipt({ hash: forceEndTxHash });

  const handleClaimRefund = () => {
    if (!refundAmount || parseFloat(refundAmount) <= 0) return;
    
    claimRefund({
      address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
      abi: MEGA_ABI,
      functionName: 'claimRefund',
      args: [parseEther(refundAmount)],
    });
  };

  const handleWithdrawSeed = () => {
    withdrawSeed({
      address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
      abi: MEGA_ABI,
      functionName: 'withdrawSeed',
    });
  };

  const handleEnableRefunds = () => {
    enableRefunds({
      address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
      abi: MEGA_ABI,
      functionName: 'enableRefunds',
    });
  };

  const handleForceEndGame = () => {
    forceEndGame({
      address: MEGA_CONTRACT_ADDRESS as `0x${string}`,
      abi: MEGA_ABI,
      functionName: 'forceEndGame',
    });
  };

  // Calculate expected refund
  const expectedRefund = refundAmount && refundPool && refundSupply && Number(refundSupply) > 0
    ? (parseFloat(refundAmount) * Number(refundPool) / Number(refundSupply)) / 1e18
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-yellow-400">Emergency Refund System</h1>
      
      {/* Force End Game Button */}
      {canForceEnd && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-red-400">⚠️ Game Timer Expired</h2>
          <p className="text-gray-light mb-4">
            The {Math.floor(GAME_DURATION / 60)}-minute game timer has expired, but the game hasn&apos;t been officially ended yet. 
            Click below to force end the game and activate the emergency refund system.
          </p>
          <button
            onClick={handleForceEndGame}
            disabled={isForceEndPending || isForceEndTxLoading}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors"
          >
            {isForceEndPending || isForceEndTxLoading ? <LoadingSpinner /> : '⚠️ Force End Game'}
          </button>
        </div>
      )}

      {!gameEnded ? (
        <div className="bg-bg-card rounded-lg p-6">
          <p className="text-gray-light">Game is still active. Refunds are only available after the game ends.</p>
        </div>
      ) : !refundsEnabled ? (
        <div className="bg-bg-card rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Refunds Not Yet Enabled</h2>
          <p className="text-gray-light mb-4">
            The refund system hasn&apos;t been activated yet. If prize distributions fail, anyone can enable refunds after 5 minutes.
          </p>
          
          {/* Countdown Timer */}
          {gameEnded && timeUntilRefunds > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-yellow-400 font-medium">Refunds available in:</span>
                <span className="text-2xl font-bold text-yellow-400 font-mono">
                  {formatTime(timeUntilRefunds)}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${((REFUND_DELAY - timeUntilRefunds) / REFUND_DELAY) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleEnableRefunds}
            disabled={isEnablePending || isEnableTxLoading || !canEnableRefunds}
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black font-bold rounded-lg transition-colors"
          >
            {isEnablePending || isEnableTxLoading ? <LoadingSpinner /> : 
             timeUntilRefunds > 0 ? `Enable Refunds (${formatTime(timeUntilRefunds)})` : 'Enable Refunds'}
          </button>
        </div>
      ) : (
        <>
          {/* Refund Stats */}
          <div className="bg-bg-card rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Refund Pool Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-light">Total Refund Pool:</span>
                <span className="font-bold">{refundPool ? (Number(refundPool) / 1e18).toFixed(4) : '0'} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-light">Total Token Supply:</span>
                <span className="font-bold">{refundSupply ? (Number(refundSupply) / 1e18).toFixed(2) : '0'} MEGA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-light">Seed Withdrawn:</span>
                <span className="font-bold">{seedWithdrawn ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Owner Seed Withdrawal */}
          {isOwner && !seedWithdrawn && (
            <div className="bg-bg-card rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Owner: Withdraw Seed</h2>
              <p className="text-gray-light mb-4">
                As the owner, you can withdraw the initial 6 ETH seed amount.
              </p>
              <button
                onClick={handleWithdrawSeed}
                disabled={isSeedPending || isSeedTxLoading}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors"
              >
                {isSeedPending || isSeedTxLoading ? <LoadingSpinner /> : 'Withdraw 6 ETH Seed'}
              </button>
            </div>
          )}

          {/* User Refund Claim */}
          {address && (
            <div className="bg-bg-card rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Claim Your Refund</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-light mb-2">Your MEGA Balance:</p>
                  <p className="text-2xl font-bold">{userBalance.toFixed(4)} MEGA</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Amount to refund:</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    max={userBalance}
                    className="w-full px-4 py-2 bg-bg-card-alt rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="Enter MEGA amount"
                  />
                  <button
                    onClick={() => setRefundAmount(userBalance.toString())}
                    className="text-sm text-yellow-400 hover:underline mt-1"
                  >
                    Max: {userBalance.toFixed(4)} MEGA
                  </button>
                </div>

                {refundAmount && parseFloat(refundAmount) > 0 && (
                  <div className="bg-bg-card-alt rounded-lg p-4">
                    <p className="text-sm text-gray-light">Expected refund:</p>
                    <p className="text-xl font-bold text-yellow-400">
                      ~{expectedRefund.toFixed(6)} ETH
                    </p>
                  </div>
                )}

                <button
                  onClick={handleClaimRefund}
                  disabled={!refundAmount || parseFloat(refundAmount) <= 0 || parseFloat(refundAmount) > userBalance || isRefundPending || isRefundTxLoading}
                  className="w-full px-6 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black font-bold rounded-lg transition-colors"
                >
                  {isRefundPending || isRefundTxLoading ? <LoadingSpinner /> : 'Claim Refund'}
                </button>
              </div>
            </div>
          )}

          {!address && (
            <div className="bg-bg-card rounded-lg p-6">
              <p className="text-gray-light">Please connect your wallet to claim refunds.</p>
            </div>
          )}
        </>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-yellow-400 mb-2">How Refunds Work</h3>
        <ul className="list-disc list-inside text-gray-light space-y-1">
          <li>Refunds are only available if the game ends and distributions fail</li>
          <li>Anyone can enable refunds {Math.floor(GAME_DURATION / 60)} minutes after game end</li>
          <li>You receive a proportional share of the refund pool based on your token holdings</li>
          <li>Burning tokens for refunds is irreversible</li>
        </ul>
      </div>
    </div>
  );
} 
