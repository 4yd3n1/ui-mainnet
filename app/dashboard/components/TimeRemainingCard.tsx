'use client';
import { useContractRead, useWriteContract, useWaitForTransactionReceipt, useSimulateContract, usePublicClient, useAccount } from 'wagmi';
import { SimulateContractReturnType } from 'viem';
import { MEGA_ABI, MEGA_CONTRACT_ADDRESS } from '@/contracts/mega';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useEffect, useState } from 'react';

export default function TimeRemainingCard() {
  const publicClient = usePublicClient();
  const [contractBalance, setContractBalance] = useState<bigint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Read contract states
  const { data: start } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'gameStartTime',
    query: { refetchInterval: 5000 },
  });
  const { data: duration } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'GAME_DURATION',
    query: { refetchInterval: 5000 },
  });
  const { data: gameEnded } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'gameEnded',
    query: { refetchInterval: 5000 },
  });
  const { data: marketCap } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'getMarketCapUSD',
    query: { refetchInterval: 5000 },
  });
  const { data: marketCapLimit } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'MARKETCAP_USD_CAP',
    query: { refetchInterval: 5000 },
  });

  // Now log after both are defined
  console.log('TimeRemainingCard rendered', { gameEnded });

  const { data: grandPrizeDistributed, refetch: refetchGrand } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'grandPrizeDistributed',
    query: { refetchInterval: 5000 },
  }) as { data: boolean | undefined, refetch: () => void };
  const { data: runnerUpsDistributed, refetch: refetchRunner } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'runnerUpsDistributed',
    query: { refetchInterval: 5000 },
  }) as { data: boolean | undefined, refetch: () => void };
  const { data: earlyBirdsDistributed, refetch: refetchEarly } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'earlyBirdsDistributed',
    query: { refetchInterval: 5000 },
  }) as { data: boolean | undefined, refetch: () => void };
  const { data: ownerPaid, refetch: refetchOwner } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'ownerPaid',
    query: { refetchInterval: 5000 },
  }) as { data: boolean | undefined, refetch: () => void };

  // Common refetch function to update all flags
  const refetchAll = async () => {
    await Promise.all([
      refetchGrand?.(),
      refetchRunner?.(),
      refetchEarly?.(),
      refetchOwner?.(),
    ]);
  };

  // Timer logic
  const [timeLeft, setTimeLeft] = useState<number | undefined>(undefined);
  const [showGone, setShowGone] = useState(false);
  const [showFailurePopup, setShowFailurePopup] = useState(false);
  const [showTimerPopup, setShowTimerPopup] = useState(false);
  useEffect(() => {
    if (start !== undefined && duration !== undefined) {
      const update = () => {
        const now = Math.floor(Date.now() / 1000);
        const left = Math.max(Number(start) + Number(duration) - now, 0);
        setTimeLeft(left);
      };
      update();
      const interval = setInterval(update, 1000);
      return () => clearInterval(interval);
    }
  }, [start, duration]);

  useEffect(() => {
    if (timeLeft === 0 && gameEnded === false) {
      setShowGone(true);
    }
  }, [timeLeft, gameEnded]);

  useEffect(() => {
    const isValidCap = (val: any) => (typeof val === 'string' || typeof val === 'number' || typeof val === 'bigint') && val !== null;
    if (
      gameEnded &&
      isValidCap(marketCap) &&
      isValidCap(marketCapLimit) &&
      BigInt(marketCap as string) < BigInt(marketCapLimit as string)
    ) {
      setShowFailurePopup(true);
    } else {
      setShowFailurePopup(false);
    }
  }, [gameEnded, marketCap, marketCapLimit]);

  // Timer display calculations
  const days = timeLeft !== undefined ? Math.floor(timeLeft / 86400) : '--';
  const hours = timeLeft !== undefined ? Math.floor((timeLeft % 86400) / 3600) : '--';
  const minutes = timeLeft !== undefined ? Math.floor((timeLeft % 3600) / 60) : '--';
  const seconds = timeLeft !== undefined ? timeLeft % 60 : '--';
  const pad = (n: number | string) => n.toString().padStart(2, '0');
  const timerString = `${pad(days)} : ${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`;

  // Contract write hooks for each distribution step
  const { writeContract: writeGrandPrize, data: txHashGrand, isPending: isPendingGrand, isError: isErrorGrand, error: errorGrand } = useWriteContract();
  const { writeContract: writeRunnerUps, data: txHashRunner, isPending: isPendingRunner, isError: isErrorRunner, error: errorRunner } = useWriteContract();
  const { writeContract: writeEarlyBirds, data: txHashEarly, isPending: isPendingEarly, isError: isErrorEarly, error: errorEarly } = useWriteContract();
  const { writeContract: writeOwner, data: txHashOwner, isPending: isPendingOwner, isError: isErrorOwner, error: errorOwner } = useWriteContract();
  const { writeContract: writeForceEndGame, data: txHashForceEnd, isPending: isPendingForceEnd, isError: isErrorForceEnd, error: errorForceEnd } = useWriteContract();

  // Wait for transaction receipts for loading state
  const { isLoading: isTxLoadingGrand } = useWaitForTransactionReceipt({
    hash: txHashGrand,
    query: { enabled: !!txHashGrand },
  });
  const { isLoading: isTxLoadingRunner } = useWaitForTransactionReceipt({
    hash: txHashRunner,
    query: { enabled: !!txHashRunner },
  });
  const { isLoading: isTxLoadingEarly } = useWaitForTransactionReceipt({
    hash: txHashEarly,
    query: { enabled: !!txHashEarly },
  });
  const { isLoading: isTxLoadingOwner } = useWaitForTransactionReceipt({
    hash: txHashOwner,
    query: { enabled: !!txHashOwner },
  });

  // Error/success handling for grand prize
  useEffect(() => {
    if (isErrorGrand && errorGrand) {
      setError(errorGrand.message);
    }
    if (txHashGrand) {
      setSuccessMsg('Grand Prize distributed successfully!');
      setError(null);
      refetchAll();
    }
  }, [isErrorGrand, errorGrand, txHashGrand]);

  // Error/success handling for runner-ups
  useEffect(() => {
    if (isErrorRunner && errorRunner) {
      setError(errorRunner.message);
    }
    if (txHashRunner) {
      setSuccessMsg('Runner-ups distributed successfully!');
      setError(null);
      refetchAll();
    }
  }, [isErrorRunner, errorRunner, txHashRunner]);

  // Error/success handling for early birds
  useEffect(() => {
    if (isErrorEarly && errorEarly) {
      setError(errorEarly.message);
    }
    if (txHashEarly) {
      setSuccessMsg('Early Birds distributed successfully!');
      setError(null);
      refetchAll();
    }
  }, [isErrorEarly, errorEarly, txHashEarly]);

  // Add simulation for grand prize distribution
  const { data: grandPrizeSimData, isLoading: isGrandPrizeSimLoading } = useSimulateContract({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'distributeGrandPrize',
    query: {
      enabled: Boolean(gameEnded && !grandPrizeDistributed),
    },
  });

  // Add detailed contract state checks
  const { data: contractState } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'grandPrizeDistributed',
    query: { refetchInterval: 5000 },
  });

  // Add debug logging for contract state
  useEffect(() => {
    if (gameEnded) {
      console.log('Contract State:', {
        gameEnded,
        grandPrizeDistributed: contractState,
        runnerUpsDistributed,
        earlyBirdsDistributed,
        isGrandPrizeSimLoading,
        grandPrizeSimData
      });
    }
  }, [gameEnded, contractState, runnerUpsDistributed, earlyBirdsDistributed, isGrandPrizeSimLoading, grandPrizeSimData]);

  // Add function to check contract state
  const checkContractState = async () => {
    if (!publicClient) {
      console.error('Public client not available');
      return null;
    }

    try {
      const [isGrand, isRups, ended] = await Promise.all([
        publicClient.readContract({
          address: MEGA_CONTRACT_ADDRESS,
          abi: MEGA_ABI,
          functionName: 'grandPrizeDistributed',
          args: [],
        }),
        publicClient.readContract({
          address: MEGA_CONTRACT_ADDRESS,
          abi: MEGA_ABI,
          functionName: 'runnerUpsDistributed',
          args: [],
        }),
        publicClient.readContract({
          address: MEGA_CONTRACT_ADDRESS,
          abi: MEGA_ABI,
          functionName: 'gameEnded',
          args: [],
        }),
      ]);
      console.log('Contract State Check:', { isGrand, isRups, ended });
      return { isGrand, isRups, ended };
    } catch (error) {
      console.error('Error checking contract state:', error);
      return null;
    }
  };

  // Add contract balance check
  const checkContractBalance = async () => {
    if (!publicClient) return;
    try {
      const balance = await publicClient.getBalance({ address: MEGA_CONTRACT_ADDRESS });
      setContractBalance(balance);
      console.log('Contract ETH balance:', balance.toString());
      return balance;
    } catch (error) {
      console.error('Error checking contract balance:', error);
      return null;
    }
  };

  // Check balance periodically (always, not just after gameEnded)
  useEffect(() => {
    checkContractBalance();
    const interval = setInterval(checkContractBalance, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fallbackGas = 5000000n; // Fallback gas limit for distribution transactions

  // Handle grand prize distribution with improved error handling and gas estimation
  const handleGrandPrizeDistribution = async () => {
    setSuccessMsg(null);
    setError(null);
    console.log("Grand Prize button clicked");

    if (grandPrizeDistributed || !publicClient) {
      console.log("Early return: already distributed or no public client");
      return;
    }

    try {
      // Check contract state and balance
      const [state, balance] = await Promise.all([
        checkContractState(),
        checkContractBalance()
      ]);
      console.log("State and balance checked:", { state, balance });

      // Log pre-distribution state
      console.log('Pre-distribution state:', {
        gameEnded,
        grandPrizeDistributed: contractState,
        simulationData: grandPrizeSimData,
        contractState: state,
        contractBalance: balance?.toString()
      });

      if (grandPrizeSimData && grandPrizeSimData.request && grandPrizeSimData.request.gas !== undefined) {
        console.log("Simulation succeeded, calling writeGrandPrize");
        const gasLimit = BigInt(grandPrizeSimData.request.gas) * 12n / 10n; // Add 20% buffer
        writeGrandPrize({
          address: MEGA_CONTRACT_ADDRESS,
          abi: MEGA_ABI,
          functionName: 'distributeGrandPrize',
          args: [],
          gas: gasLimit,
          maxFeePerGas: grandPrizeSimData.request.maxFeePerGas,
          maxPriorityFeePerGas: grandPrizeSimData.request.maxPriorityFeePerGas,
        });
        console.log('Distribution transaction sent');
      } else {
        console.warn('Falling back to manual gas limit for grand prize distribution.');
        writeGrandPrize({
          address: MEGA_CONTRACT_ADDRESS,
          abi: MEGA_ABI,
          functionName: 'distributeGrandPrize',
          args: [],
          gas: fallbackGas,
        });
      }
    } catch (error) {
      console.error('Error distributing grand prize:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  // Add simulation for runner-ups distribution
  const { data: runnerUpsSimData, isLoading: isRunnerUpsSimLoading } = useSimulateContract({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'distributeRunnerUps',
    query: {
      enabled: Boolean(gameEnded && grandPrizeDistributed && !runnerUpsDistributed),
    },
  });

  // Add debug logging for runner-ups state
  useEffect(() => {
    if (gameEnded) {
      console.log('Runner-ups State:', {
        gameEnded,
        grandPrizeDistributed,
        runnerUpsDistributed,
        isRunnerUpsSimLoading,
        runnerUpsSimData
      });
    }
  }, [gameEnded, grandPrizeDistributed, runnerUpsDistributed, isRunnerUpsSimLoading, runnerUpsSimData]);

  // Handle runner-ups distribution with improved error handling and gas estimation
  const handleRunnerUpsDistribution = async () => {
    setSuccessMsg(null);
    setError(null);
    console.log("Runner-ups button clicked");

    if (runnerUpsDistributed || !publicClient || !grandPrizeDistributed) {
      console.log("Early return: already distributed, no public client, or grand prize not distributed");
      return;
    }

    try {
      // Check contract state
      const state = await checkContractState();
      console.log("State checked:", state);

      // Log pre-distribution state
      console.log('Pre-distribution state:', {
        gameEnded,
        grandPrizeDistributed,
        runnerUpsDistributed,
        simulationData: runnerUpsSimData,
        contractState: state
      });

      if (runnerUpsSimData && runnerUpsSimData.request && runnerUpsSimData.request.gas !== undefined) {
        console.log("Simulation succeeded, calling writeRunnerUps");
        const gasLimit = BigInt(runnerUpsSimData.request.gas) * 12n / 10n; // Add 20% buffer
        writeRunnerUps({
          address: MEGA_CONTRACT_ADDRESS,
          abi: MEGA_ABI,
          functionName: 'distributeRunnerUps',
          args: [],
          gas: gasLimit,
          maxFeePerGas: runnerUpsSimData.request.maxFeePerGas,
          maxPriorityFeePerGas: runnerUpsSimData.request.maxPriorityFeePerGas,
        });
        console.log('Distribution transaction sent');
      } else {
        console.warn('Falling back to manual gas limit for runner-ups distribution.');
        writeRunnerUps({
          address: MEGA_CONTRACT_ADDRESS,
          abi: MEGA_ABI,
          functionName: 'distributeRunnerUps',
          args: [],
          gas: fallbackGas,
        });
      }
    } catch (error) {
      console.error('Error distributing runner-ups:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  // Add simulation for early birds distribution
  const { data: earlyBirdsSimData, isLoading: isEarlyBirdsSimLoading } = useSimulateContract({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'distributeEarlyBirds',
    query: {
      enabled: Boolean(gameEnded && grandPrizeDistributed && runnerUpsDistributed && !earlyBirdsDistributed),
    },
  });

  // Add debug logging for early birds state
  useEffect(() => {
    if (gameEnded) {
      console.log('Early Birds State:', {
        gameEnded,
        grandPrizeDistributed,
        runnerUpsDistributed,
        earlyBirdsDistributed,
        isEarlyBirdsSimLoading,
        earlyBirdsSimData
      });
    }
  }, [gameEnded, grandPrizeDistributed, runnerUpsDistributed, earlyBirdsDistributed, isEarlyBirdsSimLoading, earlyBirdsSimData]);

  // Handle early birds distribution with improved error handling and gas estimation
  const handleEarlyBirdsDistribution = async () => {
    setSuccessMsg(null);
    setError(null);
    console.log("Early Birds button clicked");

    if (earlyBirdsDistributed || !publicClient || !runnerUpsDistributed) {
      console.log("Early return: already distributed, no public client, or runner-ups not distributed");
      return;
    }

    try {
      // Check contract state and balance
      const [state, balance] = await Promise.all([
        checkContractState(),
        checkContractBalance()
      ]);
      console.log("State and balance checked:", { state, balance });

      // Log pre-distribution state
      console.log('Pre-distribution state:', {
        gameEnded,
        grandPrizeDistributed,
        runnerUpsDistributed,
        earlyBirdsDistributed,
        simulationData: earlyBirdsSimData,
        contractState: state,
        contractBalance: balance?.toString()
      });

      if (earlyBirdsSimData && earlyBirdsSimData.request && earlyBirdsSimData.request.gas !== undefined) {
        console.log("Simulation succeeded, calling writeEarlyBirds");
        const gasLimit = BigInt(earlyBirdsSimData.request.gas) * 12n / 10n; // Add 20% buffer
        writeEarlyBirds({
          address: MEGA_CONTRACT_ADDRESS,
          abi: MEGA_ABI,
          functionName: 'distributeEarlyBirds',
          args: [],
          gas: gasLimit,
          maxFeePerGas: earlyBirdsSimData.request.maxFeePerGas,
          maxPriorityFeePerGas: earlyBirdsSimData.request.maxPriorityFeePerGas,
        });
        console.log('Distribution transaction sent');
      } else {
        console.warn('Falling back to manual gas limit for early birds distribution.');
        writeEarlyBirds({
          address: MEGA_CONTRACT_ADDRESS,
          abi: MEGA_ABI,
          functionName: 'distributeEarlyBirds',
          args: [],
          gas: fallbackGas,
        });
      }
    } catch (error) {
      console.error('Error distributing early birds:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  // Handle owner withdraw
  const handleOwnerWithdraw = async () => {
    setSuccessMsg(null);
    setError(null);
    console.log("Owner withdraw button clicked");

    if (!publicClient || !earlyBirdsDistributed || Boolean(ownerPaid)) {
      console.log("Early return: no public client, early birds not distributed, or owner already paid");
      return;
    }

    try {
      // Check contract state
      const state = await checkContractState();
      console.log("State checked:", state);

      // Log pre-withdraw state
      console.log('Pre-withdraw state:', {
        gameEnded,
        grandPrizeDistributed,
        runnerUpsDistributed,
        earlyBirdsDistributed,
        ownerPaid,
        contractState: state
      });

      if (state && state.isGrand && state.isRups && state.ended) {
        console.log("All conditions met, calling writeOwner");
        writeOwner({
          address: MEGA_CONTRACT_ADDRESS,
          abi: MEGA_ABI,
          functionName: 'distributeOwnerFunds',
          args: [],
        });
        console.log('Withdraw transaction sent');
      } else {
        setError('Cannot withdraw: contract state not met');
        console.warn('Withdrawal conditions not met');
      }
    } catch (error) {
      console.error('Error withdrawing owner:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  // Add useEffect to refetch contract state after withdraw tx is confirmed
  useEffect(() => {
    if (txHashOwner && !isTxLoadingOwner) {
      refetchAll();
    }
  }, [txHashOwner, isTxLoadingOwner]);

  const { address: userAddress } = useAccount();
  const { data: ownerAddress } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'owner',
  });
  const isOwner = typeof ownerAddress === 'string' && typeof userAddress === 'string' && ownerAddress.toLowerCase() === userAddress.toLowerCase();

  // Add contract write hook for failed pool distribution
  const { writeContract: writeFailedPool, data: txHashFailed, isPending: isPendingFailed, isError: isErrorFailed, error: errorFailed } = useWriteContract();
  const { isLoading: isTxLoadingFailed } = useWaitForTransactionReceipt({
    hash: txHashFailed,
    query: { enabled: !!txHashFailed },
  });

  // Handler for failed pool withdraw
  const handleFailedPoolWithdraw = async () => {
    setSuccessMsg(null);
    setError(null);
    try {
      writeFailedPool({
        address: MEGA_CONTRACT_ADDRESS,
        abi: MEGA_ABI,
        functionName: 'distributeFailedPool',
        args: [],
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  return (
    <>
      {showGone && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
          <div className="bg-bg-card-alt text-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 max-w-md w-full border-2 border-accent-orange">
            <div className="text-3xl font-extrabold text-accent-orange mb-2 text-center">
              ⏰ Game Over
            </div>
            <div className="text-lg font-semibold text-center">
              The timer has run out and this round is over.<br />
              <span className="text-accent-orange font-bold">Stay tuned for the next round!</span>
            </div>
            {isOwner && (
              <button
                className="mt-2 px-8 py-3 bg-accent-orange text-white rounded-full font-bold text-lg shadow-lg hover:bg-orange-500 transition"
                onClick={async () => {
                  try {
                    await writeForceEndGame({
                      address: MEGA_CONTRACT_ADDRESS,
                      abi: MEGA_ABI,
                      functionName: 'forceEndGame',
                      args: [],
                    });
                    alert('Game ended by owner!');
                  } catch (err) {
                    alert('Failed to end game: ' + (err instanceof Error ? err.message : 'Unknown error'));
                  }
                }}
              >
                Force End Game (Owner Only)
              </button>
            )}
            <button
              className="mt-2 px-8 py-3 bg-accent-orange text-white rounded-full font-bold text-lg shadow-lg hover:bg-orange-500 transition"
              onClick={() => setShowGone(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showFailurePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50">
          <div className="bg-bg-card-alt text-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 max-w-md w-full border-2 border-accent-orange">
            <div className="text-3xl font-extrabold text-accent-orange mb-2 text-center">
              Game Over
            </div>
            <div className="text-lg font-semibold text-center">
              Game has failed.<br />
              <span className="text-accent-orange font-bold">Stay tuned for the next Game.</span>
            </div>
            {isOwner && (
              <button
                className="mt-2 px-8 py-3 bg-accent-orange text-white rounded-full font-bold text-lg shadow-lg hover:bg-orange-500 transition"
                onClick={handleFailedPoolWithdraw}
                disabled={isPendingFailed || isTxLoadingFailed}
              >
                {isPendingFailed || isTxLoadingFailed ? <span className="flex items-center justify-center"><LoadingSpinner /> Withdrawing...</span> : 'Withdraw All ETH (Owner)'}
              </button>
            )}
            {isErrorFailed && errorFailed && <div className="text-red-500 text-sm mt-1">{errorFailed.message}</div>}
            {successMsg && <div className="text-green-500 text-sm mt-1">{successMsg}</div>}
          </div>
        </div>
      )}
      {showTimerPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
          <div className="bg-bg-card-alt text-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 max-w-md w-full border-2 border-accent-orange">
            <div className="text-3xl font-extrabold text-accent-orange mb-2 text-center">
              ⏰ Game Over
            </div>
            <div className="text-lg font-semibold text-center">
              The game has ended because the timer ran out.<br />
              <span className="text-accent-orange font-bold">Stay tuned for the next round!</span>
            </div>
            <button
              className="mt-2 px-8 py-3 bg-accent-orange text-white rounded-full font-bold text-lg shadow-lg hover:bg-orange-500 transition"
              onClick={() => setShowTimerPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      <section className="p-6 rounded-xl shadow-card w-full text-center flex flex-col items-center justify-center" style={{ minHeight: 160 }}>
        {!gameEnded && (
          <h3 className="text-4xl font-bold mb-4 neon-text-yellow font-press">Time Remaining</h3>
        )}
        {error && <p className="text-red-500">Error: {error}</p>}
        {successMsg && <p className="text-green-500">{successMsg}</p>}
        {gameEnded && (!earlyBirdsDistributed || (earlyBirdsDistributed && isOwner && !ownerPaid)) ? (
          <div className="flex flex-col items-center gap-4 mt-6 w-full max-w-md">
            {/* Contract State Info */}
            <div className="w-full bg-bg-card-alt rounded-lg p-4 text-left">
              <h4 className="text-sm font-bold text-white mb-2">Contract State</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-light">Contract Balance:</span>
                  <span className="font-mono text-white">
                    {contractBalance !== null && contractBalance !== undefined
                      ? `${(Number(contractBalance) / 1e18).toFixed(4)} ETH`
                      : 'Loading...'}
                  </span>
                </div>
              </div>
            </div>

            {/* Step 1: Grand Prize */}
            <div className="w-full">
              <button
                className="w-full px-6 py-3 rounded-lg bg-accent-orange text-white font-bold text-lg hover:bg-orange-500 transition disabled:opacity-60"
                disabled={isPendingGrand || isTxLoadingGrand || Boolean(grandPrizeDistributed) || isGrandPrizeSimLoading || !publicClient}
                onClick={handleGrandPrizeDistribution}
              >
                {isPendingGrand || isTxLoadingGrand ? (
                  <span className="flex items-center justify-center"><LoadingSpinner /> Distributing Grand Prize...</span>
                ) : Boolean(grandPrizeDistributed) ? (
                  '✅ Grand Prize Distributed'
                ) : (
                  '1. Distribute Grand Prize'
                )}
              </button>
              {Boolean(grandPrizeDistributed) && (
                null
              )}
              {isErrorGrand && errorGrand && <div className="text-red-500 text-sm mt-1">{errorGrand.message}</div>}
            </div>

            {/* Step 2: Runner Ups */}
            <div className="w-full">
              <button
                className="w-full px-6 py-3 rounded-lg bg-accent-orange text-white font-bold text-lg hover:bg-orange-500 transition disabled:opacity-60"
                disabled={!Boolean(grandPrizeDistributed) || isPendingRunner || isTxLoadingRunner || Boolean(runnerUpsDistributed)}
                onClick={handleRunnerUpsDistribution}
              >
                {isPendingRunner || isTxLoadingRunner ? (
                  <span className="flex items-center justify-center"><LoadingSpinner /> Distributing Runner-ups...</span>
                ) : Boolean(runnerUpsDistributed) ? (
                  '✅ Runner-ups Distributed'
                ) : (
                  '2. Distribute Runner-ups'
                )}
              </button>
              {isErrorRunner && errorRunner && <div className="text-red-500 text-sm mt-1">{errorRunner.message}</div>}
            </div>

            {/* Step 3: Early Birds */}
            <div className="w-full">
              <button
                className="w-full px-6 py-3 rounded-lg bg-accent-orange text-white font-bold text-lg hover:bg-orange-500 transition disabled:opacity-60"
                disabled={!Boolean(runnerUpsDistributed) || isPendingEarly || isTxLoadingEarly || Boolean(earlyBirdsDistributed) || isEarlyBirdsSimLoading || !publicClient}
                onClick={handleEarlyBirdsDistribution}
              >
                {isPendingEarly || isTxLoadingEarly || isEarlyBirdsSimLoading ? (
                  <span className="flex items-center justify-center">
                    <LoadingSpinner /> Distributing Early Birds...
                  </span>
                ) : Boolean(earlyBirdsDistributed) ? (
                  '✅ Early Birds Distributed'
                ) : (
                  '3. Distribute Early Birds'
                )}
              </button>
              {Boolean(earlyBirdsDistributed) && (
                null
              )}
              {isErrorEarly && errorEarly && (
                <div className="text-red-500 text-sm mt-1">{errorEarly.message}</div>
              )}
            </div>

            {/* Step 4: Owner Withdraw */}
            {Boolean(earlyBirdsDistributed) && !Boolean(ownerPaid) && isOwner && (
              <div className="w-full">
                <button
                  className="w-full px-6 py-3 rounded-lg bg-accent-orange text-white font-bold text-lg hover:bg-orange-500 transition disabled:opacity-60"
                  disabled={isPendingOwner || isTxLoadingOwner || Boolean(ownerPaid)}
                  onClick={handleOwnerWithdraw}
                >
                  {isPendingOwner || isTxLoadingOwner ? (
                    <span className="flex items-center justify-center"><LoadingSpinner /> Withdrawing Owner's Share...</span>
                  ) : (
                    "4. Withdraw Owner's Share"
                  )}
                </button>
              </div>
            )}
            {Boolean(ownerPaid) && (
              <div className="text-green-500 text-xl font-bold mt-4">All rewards distributed!</div>
            )}
          </div>
        ) : gameEnded && ownerPaid ? (
          <div className="text-green-500 text-xl font-bold mt-4">All rewards distributed!</div>
        ) : gameEnded ? (
          <div className="text-center text-2xl font-bold text-accent-orange mt-8">
            <div>GAME ENDED</div>
            <div>THANK YOU FOR PLAYING</div>
            <div>STAY TUNED FOR ROUND 2</div>
          </div>
        ) : timeLeft === undefined ? (
          <LoadingSpinner />
        ) : (
          <div
            className="font-mono font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-widest text-white"
            style={{ letterSpacing: '0.1em' }}
          >
            {timerString}
          </div>
        )}
        {/* Owner-only Force End Game Button */}
        {isOwner && !gameEnded && timeLeft === 0 && (
          <button
            className="mt-4 px-8 py-3 bg-accent-orange text-white rounded-full font-bold text-lg shadow-lg hover:bg-orange-500 transition"
            onClick={async () => {
              try {
                await writeForceEndGame({
                  address: MEGA_CONTRACT_ADDRESS,
                  abi: MEGA_ABI,
                  functionName: 'forceEndGame',
                  args: [],
                });
                alert('Game ended by owner!');
              } catch (err) {
                alert('Failed to end game: ' + (err instanceof Error ? err.message : 'Unknown error'));
              }
            }}
          >
            Force End Game (Owner Only)
          </button>
        )}
      </section>
    </>
  );
} 