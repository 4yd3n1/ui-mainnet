'use client';
import { useGameData } from '@/contexts/GameDataContext';
import { useState, useEffect } from 'react';
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
    isLoading 
  } = useGameData();
  
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const start = gameStartTime ? Number(gameStartTime) : 0;
  const duration = gameDuration ? Number(gameDuration) : 3600; // Default 1 hour
  const gameEnd = start + duration;
  const timeRemaining = Math.max(0, gameEnd - now);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const grandDone = grandPrizeDistributed || false;
  const runnerDone = runnerUpsDistributed || false;
  const earlyDone = earlyBirdsDistributed || false;
  const ownerDone = ownerPaid || false;

  const getPrizeStatus = () => {
    if (failed) return "🛑 Game Failed";
    if (!gameEnded) return timeRemaining > 0 ? formatTime(timeRemaining) : "⏳ Ending soon...";
    
    // After game ends, show distribution status
    const allDistributed = grandDone && runnerDone && earlyDone && ownerDone;
    if (allDistributed) return "✅ All prizes distributed!";
    
    const pendingItems = [];
    if (!grandDone) pendingItems.push("Grand Prize");
    if (!runnerDone) pendingItems.push("Runner-ups");
    if (!earlyDone) pendingItems.push("Early Birds");
    if (!ownerDone) pendingItems.push("Owner Fee");
    
    return `🎯 Distributing: ${pendingItems.join(", ")}`;
  };

  if (isLoading) {
    return (
      <section className="p-8 rounded-xl shadow-card w-full max-w-full mx-auto flex justify-center">
        <LoadingSpinner />
      </section>
    );
  }

  return (
    <section className="p-8 rounded-xl shadow-card w-full max-w-full mx-auto flex flex-col gap-4 justify-center">
      <h3 className="text-xl font-extrabold flex items-center gap-2 neon-text-yellow">
        <span style={{ fontSize: '32px' }}>⏰</span> Time Remaining
      </h3>
      <div className="text-4xl font-mono text-yellow-400">
        {getPrizeStatus()}
      </div>
      
      {/* Show distribution details after game ends */}
      {gameEnded && !failed && (
        <div className="text-sm space-y-1 mt-2">
          <div className={grandDone ? 'text-green-400' : 'text-gray-400'}>
            {grandDone ? '✅' : '⏳'} Grand Prize
          </div>
          <div className={runnerDone ? 'text-green-400' : 'text-gray-400'}>
            {runnerDone ? '✅' : '⏳'} Runner-ups
          </div>
          <div className={earlyDone ? 'text-green-400' : 'text-gray-400'}>
            {earlyDone ? '✅' : '⏳'} Early Birds
          </div>
          <div className={ownerDone ? 'text-green-400' : 'text-gray-400'}>
            {ownerDone ? '✅' : '⏳'} Owner Fee
          </div>
        </div>
      )}
    </section>
  );
} 