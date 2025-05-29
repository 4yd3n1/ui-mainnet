'use client';
import { useAccount, useContractRead, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import MEGA_ABI from '@/contracts/MEGA_ABI.json';
import { MEGA_CONTRACT_ADDRESS } from '@/contracts/mega';
// const MEGA_CONTRACT_ADDRESS = '0xC174216989D6fe845d19a0872C2A0310dD5899D6';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useEffect, useState } from 'react';

export default function TimeRemainingCard() {
  // Read contract state
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
  const { data: failed } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'failed',
    query: { refetchInterval: 5000 },
  });
  const { data: grandDone } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'grandPrizeDistributed',
    query: { refetchInterval: 5000 },
  });
  const { data: runnerDone } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'runnerUpsDistributed',
    query: { refetchInterval: 5000 },
  });
  const { data: earlyDone } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'earlyBirdsDistributed',
    query: { refetchInterval: 5000 },
  });
  const { data: ownerDone } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'ownerPaid',
    query: { refetchInterval: 5000 },
  });

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>();
  useEffect(() => {
    if (start && duration) {
      const update = () => {
        const now = Math.floor(Date.now() / 1000);
        setTimeLeft(Math.max(Number(start) + Number(duration) - now, 0));
      };
      update();
      const id = setInterval(update, 1000);
      return () => clearInterval(id);
    }
  }, [start, duration]);

  const pad = (n: number | string) => n.toString().padStart(2, '0');
  const days = timeLeft !== undefined ? Math.floor(timeLeft / 86400) : '--';
  const hours = timeLeft !== undefined ? Math.floor((timeLeft % 86400) / 3600) : '--';
  const minutes = timeLeft !== undefined ? Math.floor((timeLeft % 3600) / 60) : '--';
  const seconds = timeLeft !== undefined ? timeLeft % 60 : '--';
  const timerString = `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  // Write hooks for each distribution
  const {
    writeContract: grandTx,
    data: grandHash,
    isError: grandError,
    isPending: grandPending
  } = useWriteContract();
  const { isSuccess: grandSuccess } = useWaitForTransactionReceipt({ hash: grandHash });

  const {
    writeContract: runnerTx,
    data: runnerHash,
    isError: runnerError,
    isPending: runnerPending
  } = useWriteContract();
  const { isSuccess: runnerSuccess } = useWaitForTransactionReceipt({ hash: runnerHash });

  const {
    writeContract: earlyTx,
    data: earlyHash,
    isError: earlyError,
    isPending: earlyPending
  } = useWriteContract();
  const { isSuccess: earlySuccess } = useWaitForTransactionReceipt({ hash: earlyHash });

  const {
    writeContract: ownerTx,
    data: ownerHash,
    isError: ownerError,
    isPending: ownerPending
  } = useWriteContract();
  const { isSuccess: ownerSuccess } = useWaitForTransactionReceipt({ hash: ownerHash });

  // Coerce contract read values to boolean for safe JSX usage
  const isGameEnded = Boolean(gameEnded);
  const isFailed = Boolean(failed);
  const isGrandDone = Boolean(grandDone);
  const isRunnerDone = Boolean(runnerDone);
  const isEarlyDone = Boolean(earlyDone);
  const isOwnerDone = Boolean(ownerDone);

  const { address: userAddress } = useAccount();
  const { data: ownerAddress } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'owner',
  });

  // Defensive: Only enable owner actions if both addresses are loaded and match
  const ownerLoaded = typeof ownerAddress === 'string' && ownerAddress.length > 0;
  const userLoaded = typeof userAddress === 'string' && userAddress.length > 0;
  const isOwner = ownerLoaded && userLoaded && userAddress.toLowerCase() === ownerAddress.toLowerCase();

  // Debug: Log all relevant booleans for owner withdraw button
  console.log({
    isOwner,
    isGameEnded,
    isFailed,
    isGrandDone,
    isRunnerDone,
    isEarlyDone,
    isOwnerDone
  });

  return (
    <section className="p-6 rounded-xl shadow-card w-full text-center flex flex-col items-center justify-center" style={{ minHeight: 160 }}>
      <h3 className="text-lg font-bold mb-4 text-white font-press">⏰ Time Remaining</h3>

      {!isGameEnded && timeLeft !== undefined && (
        <div className="text-4xl font-press text-red-600">{timerString}</div>
      )}

      {isGameEnded && isFailed && (
        <div className="text-red-500 font-bold text-2xl">Time's up, you failed</div>
      )}

      {isGameEnded && !isFailed && (
        ownerLoaded && userLoaded && isOwner ? (
          <div className="space-y-4">
            {!isGrandDone && (
              <button
                onClick={() => grandTx({
                  address: MEGA_CONTRACT_ADDRESS,
                  abi: MEGA_ABI,
                  functionName: 'distributeGrandPrize',
                })}
                disabled={grandPending}
                className="btn"
              >
                {grandPending ? <LoadingSpinner /> : 'Distribute Grand Prize'}
              </button>
            )}
            {isGrandDone && !isRunnerDone && (
              <button
                onClick={() => runnerTx({
                  address: MEGA_CONTRACT_ADDRESS,
                  abi: MEGA_ABI,
                  functionName: 'distributeRunnerUps',
                })}
                disabled={runnerPending}
                className="btn"
              >
                {runnerPending ? <LoadingSpinner /> : 'Distribute Runner-Ups'}
              </button>
            )}
            {isRunnerDone && !isEarlyDone && (
              <button
                onClick={() => earlyTx({
                  address: MEGA_CONTRACT_ADDRESS,
                  abi: MEGA_ABI,
                  functionName: 'distributeEarlyBirds',
                })}
                disabled={earlyPending}
                className="btn"
              >
                {earlyPending ? <LoadingSpinner /> : 'Distribute Early-Bird Rewards'}
              </button>
            )}
            {isEarlyDone && !isOwnerDone && (
              <button
                onClick={() => ownerTx({
                  address: MEGA_CONTRACT_ADDRESS,
                  abi: MEGA_ABI,
                  functionName: 'distributeOwnerFunds',
                })}
                disabled={ownerPending}
                className="btn"
              >
                {ownerPending ? <LoadingSpinner /> : "Withdraw Owner's Share"}
              </button>
            )}
            {isOwnerDone && (
              <div className="text-green-500 font-bold text-xl">All rewards distributed!</div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400 font-bold">Waiting for owner to distribute rewards…</div>
        )
      )}

      {!isGameEnded && timeLeft === undefined && <LoadingSpinner />}
    </section>
  );
} 