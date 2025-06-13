'use client';

import GameProgressCard from './components/GameProgressCard';
import TimeRemainingCard from './components/TimeRemainingCard';
import GameStatsCard from './components/GameStatsCard';
import UserStatsCard from './components/UserStatsCard';
import ActionsPanel from './components/ActionsPanel';
import AdminDistributionPanel from './components/AdminDistributionPanel';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import VerificationScreen from '@/components/VerificationScreen';
import { useGameData } from '@/contexts/GameDataContext';
import { useState, useEffect } from 'react';

export default function DashboardContent() {
  const { gameStartTime, isLoading } = useGameData();
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  const start = gameStartTime ? Number(gameStartTime) : 0;
  const prepRemaining = Math.max(0, start - now);

  // Show verification/preparation screen if we're still in the pre-game window
  if (!isLoading && prepRemaining > 0) {
    return <VerificationScreen timeRemaining={prepRemaining} />;
  }

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        backgroundImage: "url('/ethbackground.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <main className="flex flex-col items-center flex-1 neon-bg py-8 md:py-32 px-2 md:px-16" style={{ background: 'rgba(0,0,0,0.7)' }}>
        <div className="w-full max-w-7xl flex flex-col flex-1">
          <header className="mb-8 md:mb-16 flex flex-col md:flex-row items-start md:items-start justify-between w-full gap-4">
          <div className="flex flex-col items-start">
              <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold leading-tight">
                <span className="block neon-text-yellow">Make Ethereum</span>
                <span className="block neon-text-yellow">Great Again</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ConnectButton showBalance={false} accountStatus="avatar" chainStatus="icon" />
          </div>
        </header>
          <div className="flex flex-col items-center gap-8 md:gap-16 lg:gap-32 mt-8 md:mt-16 flex-1">
          {/* Game Progress Card: larger and centered */}
            <div 
              className="w-full max-w-4xl min-h-[180px] md:min-h-[220px] rounded-xl"
              style={{ boxShadow: '0 0 8px #00fff7, 0 0 16px #00fff7' }}
            >
              <GameProgressCard />
            </div>
          {/* Time Remaining Card: centered below - Apply negative margin here */}
            <div
              className="w-full max-w-2xl -mt-4 md:-mt-8 rounded-xl"
              style={{ boxShadow: '0 0 8px #FFD600, 0 0 16px #FFD600' }}
            >
              <TimeRemainingCard />
            </div>
          {/* Bottom row: Game Stats, User Stats, Actions Panel */}
            <div className="flex flex-col md:flex-row flex-wrap gap-8 md:gap-16 lg:gap-32 justify-center items-stretch w-full mt-8 md:mt-16 flex-1">
              <div className="flex flex-col h-full w-full md:min-w-[280px] md:max-w-[400px] md:w-1/3 md:flex-1 justify-center items-center">
                <GameStatsCard />
              </div>
              <div className="flex flex-col h-full w-full md:min-w-[280px] md:max-w-[400px] md:w-1/3 md:flex-1 justify-center items-center">
                <UserStatsCard />
              </div>
              <div className="flex flex-col h-full w-full md:min-w-[280px] md:max-w-[400px] md:w-1/3 md:flex-1 justify-center items-center">
                <ActionsPanel />
              </div>
            </div>
            {/* Admin Distribution Panel - Only visible to owner after game ends */}
            <div 
              className="w-full max-w-4xl mt-8 md:mt-16 rounded-xl"
              style={{ boxShadow: '0 0 8px #FFD600, 0 0 16px #FFD600' }}
            >
              <AdminDistributionPanel />
            </div>
          </div>
        </div>
      </main>
      </div>
  );
} 