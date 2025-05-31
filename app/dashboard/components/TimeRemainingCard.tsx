'use client';
import { useGameData } from '@/contexts/GameDataContext';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function TimeRemainingCard() {
  // Get consolidated game data from context
  const { 
    gameStartTime, 
    gameEnded, 
    failed,
    marketCapProgress,
    isLoading 
  } = useGameData();
  
  // Local timer state
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate time remaining
  const gameStart = gameStartTime ? Number(gameStartTime) : 0;
  const gameEndTime = gameStart + 3600; // 1 hour game duration
  const timeRemaining = Math.max(0, gameEndTime - now);
  
  // Format time display
  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;
  
  const formatTime = (value: number) => String(value).padStart(2, '0');

  // Determine game status
  let statusMessage = '';
  let statusColor = '';
  
  if (failed) {
    statusMessage = 'Game Failed - Target Not Reached';
    statusColor = 'text-red-500';
  } else if (gameEnded) {
    statusMessage = 'Game Ended Successfully!';
    statusColor = 'text-green-400';
  } else if (timeRemaining === 0) {
    statusMessage = 'Time Expired - Checking Status...';
    statusColor = 'text-yellow-400';
  } else {
    statusMessage = 'Game Active';
    statusColor = 'text-green-400';
  }

  return (
    <div className="p-6 rounded-xl text-center">
      <h3 className="text-xl font-bold mb-4 neon-text-yellow">Time Remaining</h3>
      
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="text-4xl font-bold font-mono mb-4 neon-text-yellow">
            {formatTime(hours)}:{formatTime(minutes)}:{formatTime(seconds)}
          </div>
          
          <p className={`text-lg font-semibold ${statusColor}`}>
            {statusMessage}
          </p>
          
          {!gameEnded && timeRemaining > 0 && (
            <p className="text-sm text-gray-400 mt-2">
              {marketCapProgress && marketCapProgress >= 100 
                ? 'Target reached! Game ending soon...' 
                : `${Math.ceil(100 - (marketCapProgress || 0))}% to go!`}
            </p>
          )}
        </>
      )}
    </div>
  );
} 
