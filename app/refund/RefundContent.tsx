'use client';
import { useState, useEffect } from 'react';
import { useAccount, useContractRead, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { MEGA_ABI, MEGA_CONTRACT_ADDRESS } from '@/contracts/mega';
import { formatEther, parseEther } from 'viem';
import Link from 'next/link';

// Type assertion for contract address to satisfy wagmi
const CONTRACT_ADDRESS = MEGA_CONTRACT_ADDRESS as `0x${string}`;

interface RefundState {
  refundsEnabled: boolean;
  refundPool: bigint;
  refundSupply: bigint;
  seedWithdrawn: boolean;
  userTokenBalance: bigint;
  gameEnded: boolean;
  isOwner: boolean;
}

export default function RefundContent() {
  const { address, isConnected } = useAccount();
  const [refundState, setRefundState] = useState<RefundState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Contract reads
  const { data: refundsEnabled } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'refundsEnabled',
    query: { refetchInterval: 5000 },
  });

  const { data: gameEnded } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'gameEnded',
    query: { refetchInterval: 5000 },
  });

  const { data: refundPool } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'refundPool',
    query: { refetchInterval: 5000 },
  });

  const { data: refundSupply } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'refundSupply',
    query: { refetchInterval: 5000 },
  });

  const { data: seedWithdrawn } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'seedWithdrawn',
    query: { refetchInterval: 5000 },
  });

  const { data: userTokenBalance } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
    query: { refetchInterval: 5000, enabled: !!address },
  });

  const { data: owner } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'owner',
    query: { refetchInterval: 5000 },
  });

  // Contract writes
  const {
    writeContract: enableRefundsWriteContract,
    data: enableRefundsData,
    isPending: isEnablingRefunds,
    isError: isEnableRefundsError,
    error: enableRefundsError,
  } = useWriteContract();

  const {
    writeContract: withdrawSeedWriteContract,
    data: withdrawSeedData,
    isPending: isWithdrawingSeed,
    isError: isWithdrawSeedError,
    error: withdrawSeedError,
  } = useWriteContract();

  const {
    writeContract: claimRefundWriteContract,
    data: claimRefundData,
    isPending: isClaimingRefund,
    isError: isClaimRefundError,
    error: claimRefundError,
  } = useWriteContract();

  // Transaction confirmations
  const { isLoading: isEnableRefundsPending } = useWaitForTransactionReceipt({
    hash: enableRefundsData,
    query: { enabled: !!enableRefundsData },
  });

  const { isLoading: isWithdrawSeedPending } = useWaitForTransactionReceipt({
    hash: withdrawSeedData,
    query: { enabled: !!withdrawSeedData },
  });

  const { isLoading: isClaimRefundPending } = useWaitForTransactionReceipt({
    hash: claimRefundData,
    query: { enabled: !!claimRefundData },
  });

  useEffect(() => {
    if (
      refundsEnabled !== undefined &&
      gameEnded !== undefined &&
      refundPool !== undefined &&
      refundSupply !== undefined &&
      seedWithdrawn !== undefined &&
      userTokenBalance !== undefined &&
      owner !== undefined
    ) {
      setRefundState({
        refundsEnabled: refundsEnabled as boolean,
        refundPool: refundPool as bigint,
        refundSupply: refundSupply as bigint,
        seedWithdrawn: seedWithdrawn as boolean,
        userTokenBalance: userTokenBalance as bigint,
        gameEnded: gameEnded as boolean,
        isOwner: address?.toLowerCase() === (owner as string)?.toLowerCase(),
      });
      setLoading(false);
    }
  }, [refundsEnabled, gameEnded, refundPool, refundSupply, seedWithdrawn, userTokenBalance, owner, address]);

  const handleEnableRefunds = async () => {
    try {
      setError(null);
      enableRefundsWriteContract({
        address: CONTRACT_ADDRESS,
        abi: MEGA_ABI,
        functionName: 'enableRefunds',
      });
    } catch (err) {
      setError('Failed to enable refunds');
    }
  };

  const handleWithdrawSeed = async () => {
    try {
      setError(null);
      withdrawSeedWriteContract({
        address: CONTRACT_ADDRESS,
        abi: MEGA_ABI,
        functionName: 'withdrawSeed',
      });
    } catch (err) {
      setError('Failed to withdraw seed');
    }
  };

  const handleClaimRefund = async () => {
    if (!refundState || refundState.userTokenBalance === 0n) return;
    
    try {
      setError(null);
      claimRefundWriteContract({
        address: CONTRACT_ADDRESS,
        abi: MEGA_ABI,
        functionName: 'claimRefund',
        args: [refundState.userTokenBalance],
      });
    } catch (err) {
      setError('Failed to claim refund');
    }
  };

  const calculateRefundAmount = (tokenAmount: bigint): bigint => {
    if (!refundState || refundState.refundSupply === 0n) return 0n;
    return (tokenAmount * refundState.refundPool) / refundState.refundSupply;
  };

  // Handle errors from contract writes
  useEffect(() => {
    if (isEnableRefundsError && enableRefundsError) {
      setError('Failed to enable refunds: ' + enableRefundsError.message);
    }
    if (isWithdrawSeedError && withdrawSeedError) {
      setError('Failed to withdraw seed: ' + withdrawSeedError.message);
    }
    if (isClaimRefundError && claimRefundError) {
      setError('Failed to claim refund: ' + claimRefundError.message);
    }
  }, [isEnableRefundsError, enableRefundsError, isWithdrawSeedError, withdrawSeedError, isClaimRefundError, claimRefundError]);

  if (!isConnected) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg-main text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Emergency Refunds</h1>
          <p className="text-lg mb-8">Please connect your wallet to access the refund system.</p>
          <Link href="/dashboard" className="bg-gold text-bg-main px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors">
            Go to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg-main text-white">
        <p>Loading refund information...</p>
      </main>
    );
  }

  if (!refundState) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg-main text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error</h1>
          <p className="text-lg mb-8">Unable to load refund information.</p>
          <Link href="/dashboard" className="bg-gold text-bg-main px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors">
            Go to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-main text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 text-gold">🚨 Emergency Refunds</h1>
          <p className="text-lg text-gray-300">
            Safety mechanism for fair fund recovery when lottery distributions are delayed
          </p>
          <Link href="/dashboard" className="inline-block mt-4 text-gold hover:text-yellow-400 transition-colors">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Game Status</h3>
            <p className={`text-lg ${refundState.gameEnded ? 'text-green-400' : 'text-red-400'}`}>
              {refundState.gameEnded ? '✅ Game Ended' : '❌ Game Active'}
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Refunds Status</h3>
            <p className={`text-lg ${refundState.refundsEnabled ? 'text-green-400' : 'text-yellow-400'}`}>
              {refundState.refundsEnabled ? '✅ Enabled' : '⏰ Waiting'}
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Refund Pool</h3>
            <p className="text-lg text-gold">
              {formatEther(refundState.refundPool)} ETH
            </p>
          </div>
        </div>

        {/* Refund Actions */}
        {!refundState.gameEnded && (
          <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-bold mb-4">⏰ Game Still Active</h2>
            <p className="text-gray-300 mb-4">
              The emergency refund system is only available after the game ends and a 30-minute delay period.
            </p>
            <Link href="/dashboard" className="bg-gold text-bg-main px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors">
              Continue Playing
            </Link>
          </div>
        )}

        {refundState.gameEnded && !refundState.refundsEnabled && (
          <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-bold mb-4">🕐 Enable Emergency Refunds</h2>
            <p className="text-gray-300 mb-4">
              The game has ended but refunds haven't been enabled yet. Anyone can enable refunds after the 30-minute delay period.
            </p>
            <button
              onClick={handleEnableRefunds}
              disabled={isEnablingRefunds || isEnableRefundsPending}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isEnablingRefunds || isEnableRefundsPending ? 'Enabling...' : 'Enable Refunds'}
            </button>
          </div>
        )}

        {refundState.refundsEnabled && (
          <>
            {/* Owner Actions */}
            {refundState.isOwner && (
              <div className="bg-blue-900 p-6 rounded-lg mb-8">
                <h2 className="text-2xl font-bold mb-4">👑 Owner Actions</h2>
                <div className="mb-4">
                  <p className="text-gray-300 mb-2">
                    Seed Status: {refundState.seedWithdrawn ? '✅ Withdrawn' : '💰 Available (0.1 ETH)'}
                  </p>
                </div>
                {!refundState.seedWithdrawn && (
                  <button
                    onClick={handleWithdrawSeed}
                    disabled={isWithdrawingSeed || isWithdrawSeedPending}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isWithdrawingSeed || isWithdrawSeedPending ? 'Withdrawing...' : 'Withdraw Seed (0.1 ETH)'}
                  </button>
                )}
              </div>
            )}

            {/* Player Refund Actions */}
            <div className="bg-green-900 p-6 rounded-lg mb-8">
              <h2 className="text-2xl font-bold mb-4">💸 Your Refund</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-300">Your Token Balance:</p>
                  <p className="text-xl font-bold text-gold">
                    {formatEther(refundState.userTokenBalance)} MEGA
                  </p>
                </div>
                <div>
                  <p className="text-gray-300">Claimable ETH:</p>
                  <p className="text-xl font-bold text-green-400">
                    {formatEther(calculateRefundAmount(refundState.userTokenBalance))} ETH
                  </p>
                </div>
              </div>

              {refundState.userTokenBalance > 0n ? (
                <div>
                  <p className="text-gray-300 mb-4">
                    You can claim your proportional share of the refund pool by burning your MEGA tokens.
                  </p>
                  <button
                    onClick={handleClaimRefund}
                    disabled={isClaimingRefund || isClaimRefundPending}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isClaimingRefund || isClaimRefundPending ? 'Claiming...' : 'Claim Full Refund'}
                  </button>
                </div>
              ) : (
                <div className="text-gray-400">
                  <p>You don't have any MEGA tokens to refund.</p>
                </div>
              )}
            </div>

            {/* Refund Information */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">ℹ️ How Refunds Work</h2>
              <ul className="space-y-2 text-gray-300">
                <li>• <span className="text-green-400">Proportional Distribution:</span> ETH is distributed based on your token holdings</li>
                <li>• <span className="text-blue-400">Token Burning:</span> Your tokens are burned when you claim your refund</li>
                <li>• <span className="text-yellow-400">Fair & Safe:</span> No admin can steal funds, everyone gets their fair share</li>
                <li>• <span className="text-purple-400">Emergency Only:</span> This system activates when normal lottery distributions fail</li>
              </ul>
            </div>
          </>
        )}

        {error && (
          <div className="bg-red-800 p-4 rounded-lg mt-4">
            <p className="text-white">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-200 hover:text-white underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </main>
  );
} 