'use client';

import GameProgressCard from './components/GameProgressCard';
import TimeRemainingCard from './components/TimeRemainingCard';
import GameStatsCard from './components/GameStatsCard';
import UserStatsCard from './components/UserStatsCard';
import ActionsPanel from './components/ActionsPanel';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function DashboardContent() {
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
      <main className="flex flex-col items-center flex-1 neon-bg py-32 px-2 md:px-16" style={{ background: 'rgba(0,0,0,0.7)' }}>
        <div className="w-full max-w-7xl flex flex-col flex-1">
          <header className="mb-16 flex items-start justify-between w-full">
          <div className="flex flex-col items-start">
              <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                <span className="block neon-text-yellow">Make Ethereum</span>
                <span className="block neon-text-yellow">Great Again</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ConnectButton showBalance={false} accountStatus="avatar" chainStatus="icon" />
          </div>
        </header>
          <div className="flex flex-col items-center gap-32 mt-16 flex-1">
          {/* Game Progress Card: larger and centered */}
            <div className="w-full max-w-4xl min-h-[220px] neon-border-cyan rounded-xl"><GameProgressCard /></div>
          {/* Time Remaining Card: centered below - Apply negative margin here */}
            <div
              className="w-full max-w-2xl -mt-8 border-2 rounded-xl"
              style={{ borderColor: '#FFD600', boxShadow: '0 0 8px #FFD600, 0 0 16px #FFD600' }}
            >
              <TimeRemainingCard />
            </div>
          {/* Bottom row: Game Stats, User Stats, Actions Panel */}
            <div className="flex flex-col md:flex-row flex-wrap gap-10 justify-center items-stretch w-full mt-16 flex-1">
              <div className="flex flex-col h-full min-w-0 min-w-[280px] max-w-[400px] w-full md:w-1/3 neon-border-cyan rounded-xl flex-1"><GameStatsCard /></div>
              <div className="flex flex-col h-full min-w-0 min-w-[280px] max-w-[400px] w-full md:w-1/3 neon-border-cyan rounded-xl flex-1"><UserStatsCard /></div>
              <div className="flex flex-col h-full min-w-0 min-w-[280px] max-w-[400px] w-full md:w-1/3 neon-border-cyan rounded-xl flex-1"><ActionsPanel /></div>
            </div>
          </div>
        </div>
      </main>
      </div>
  );
} 