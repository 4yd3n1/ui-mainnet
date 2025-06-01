'use client';
import { useGameData } from '@/contexts/GameDataContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function GameProgressCard() {
  // Get consolidated game data from context
  const { marketCapDisplay, marketCapProgress, marketCapTarget, isLoading } = useGameData();

  const progressDisplay = marketCapProgress?.toLocaleString(undefined, { maximumFractionDigits: 1 }) || '0';
  
  // Format the target display
  const targetDisplay = marketCapTarget ? 
    `$${(Number(marketCapTarget) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 
    '$100,000'; // Fallback in case contract read fails

  return (
    // Reduced padding, gap, and removed min-h
    <section className="p-8 rounded-xl shadow-card w-full max-w-full mx-auto flex flex-col gap-4 justify-center">
      {/* Reduced font size and gap */}
      <h3 className="text-xl font-extrabold flex items-center gap-2 neon-text-yellow">
        Game Progress
      </h3>
      {/* Reduced font sizes and gap */}
      <div className="flex items-baseline gap-4">
        <span className="text-4xl font-extrabold text-white font-press">
          {isLoading ? <LoadingSpinner /> : marketCapDisplay}
        </span>
        <span className="text-4xl font-extrabold text-white font-press"> / {targetDisplay}</span>
      </div>
      <div className="relative w-full mt-2">
        {/* Rocket emoji above the progress bar */}
        <div
          className="absolute"
          style={{
            left: `calc(${marketCapProgress || 0}% - 16px)`,
            top: '50%',
            transform: 'translateY(-50%)',
            transition: 'left 0.5s cubic-bezier(0.4,0,0.2,1)',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          <img
            src="/logo 1.png"
            alt="Progress Logo"
            width={64}
            height={64}
            className="animate-bounce"
            style={{ filter: 'drop-shadow(0 0 6px #FFD700)' }}
          />
        </div>
        <div className="w-full h-8 bg-bg-card-alt rounded-full overflow-hidden shadow-lg relative">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${marketCapProgress || 0}%`,
              background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
              boxShadow: '0 0 12px 3px #FFD70088',
            }}
          />
          {/* Percentage on the right */}
          <span
            className="absolute right-4 top-1/2 -translate-y-1/2 text-3xl font-extrabold animate-pulse"
            style={{ color: '#FFD700', textShadow: '0 0 8px #FFD700, 0 0 16px #FFA500' }}
          >
            {progressDisplay}%
          </span>
        </div>
      </div>
    </section>
  );
}