'use client';
import { useGameData } from '@/contexts/GameDataContext';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function TimeRemainingCard() {
  // Get consolidated game data from context
  const { 
    gameStartTime, 
    gameDuration,
    gameEnded, 
    failed,
    grandPrizeDistributed,
    runnerUpsDistributed,
    earlyBirdsDistributed,
    ownerPaid,
    marketCapProgress,
    isLoading 
  } = useGameData();
  
  // Local timer state - prevent hydration mismatch
  const [now, setNow] = useState(0); // Start with 0 to prevent hydration mismatch
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    // Mark as client-side and set initial time
    setIsClient(true);
    setNow(Math.floor(Date.now() / 1000));
    
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate time remaining - handle SSR
  const gameStart = gameStartTime ? Number(gameStartTime) : 0;
  const gameEnd = gameStart + (gameDuration ? Number(gameDuration) : 3600);
  const timeRemaining = isClient ? Math.max(0, gameEnd - now) : 0;

  // Format time
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const grandDone = grandPrizeDistributed || false;
  const runnerDone = runnerUpsDistributed || false;
  const earlyDone = earlyBirdsDistributed || false;
  const ownerDone = ownerPaid || false;
  const allDistributed = grandDone && runnerDone && earlyDone && ownerDone;

  if (isLoading) {
    return (
      <section className="p-8 rounded-xl shadow-card w-full max-w-full mx-auto flex justify-center">
        <LoadingSpinner />
      </section>
    );
  }

  // Game ended states
  if (gameEnded || timeRemaining === 0) {
    if (failed) {
      return (
        <section className="p-8 rounded-xl shadow-card w-full max-w-full mx-auto flex flex-col gap-4 justify-center">
          <h3 className="text-xl font-extrabold neon-text-yellow">
            Time Remaining
          </h3>
          <div className="text-3xl font-bold text-red-400">
            Game Failed
          </div>
        </section>
      );
    }
    
    if (allDistributed) {
      return (
        <section className="p-8 rounded-xl shadow-card w-full max-w-full mx-auto flex flex-col gap-4 justify-center">
          <h3 className="text-xl font-extrabold neon-text-yellow">
            Game Complete
          </h3>
          <div className="text-2xl font-bold text-green-400">
            All Rewards Distributed!
          </div>
          <div className="text-sm text-gray-300">
            Stay tuned for the next round
          </div>
        </section>
      );
    }
    
    // Show distribution progress
    return (
      <section className="p-8 rounded-xl shadow-card w-full max-w-full mx-auto flex flex-col gap-4 justify-center">
        <h3 className="text-xl font-extrabold neon-text-yellow">
          Distribution Progress
        </h3>
        <div className="text-xl font-bold text-blue-400">
          Distributing Prizes...
        </div>
        <div className="text-sm space-y-1">
          <div className={grandDone ? 'text-green-400' : 'text-gray-400'}>
            {grandDone ? '✅ Grand Prize' : '⏳ Grand Prize'}
          </div>
          <div className={runnerDone ? 'text-green-400' : 'text-gray-400'}>
            {runnerDone ? '✅ Runner-ups' : '⏳ Runner-ups'}
          </div>
          <div className={earlyDone ? 'text-green-400' : 'text-gray-400'}>
            {earlyDone ? '✅ Early Birds' : '⏳ Early Birds'}
          </div>
          <div className={ownerDone ? 'text-green-400' : 'text-gray-400'}>
            {ownerDone ? '✅ Owner Fee' : '⏳ Owner Fee'}
          </div>
        </div>
      </section>
    );
  }

  // Active game display - original rich UI
  return (
    <section className="p-8 rounded-xl shadow-card w-full max-w-full mx-auto flex flex-col gap-4 justify-center">
      <h3 className="text-xl font-extrabold neon-text-yellow">
        Time Remaining
      </h3>
      
      {/* Timer */}
      <div className="text-4xl font-bold text-yellow-400 font-mono">
        {formatTime(timeRemaining)}
      </div>
      
      {/* Game Status */}
      <div className="text-lg font-bold text-green-400">
        Game Active
      </div>
      
      {/* Progress to goal */}
      <div className="text-sm text-gray-300">
        {marketCapProgress ? Math.round(marketCapProgress) : 0}% to go!
      </div>
    </section>
  );
} 
