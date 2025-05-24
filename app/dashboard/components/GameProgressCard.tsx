'use client';
import { useContractRead } from 'wagmi';
import { MEGA_CONTRACT_ADDRESS } from '@/contracts/mega';
import MEGA_ABI from '@/contracts/MEGA_ABI.json';
import LoadingSpinner from '@/components/common/LoadingSpinner';
// import { usePlayerCap } from '@/hooks/usePlayerCap';

const MARKETCAP_TARGET = 10_000_000; // $10M

// const { playerCap, refetch } = usePlayerCap();
// Placeholder values for playerCap and refetch
const playerCap = 0;
const refetch = () => {};

export default function GameProgressCard() {
  // Read the total market cap from the contract
  const { data: marketCapRaw, isLoading } = useContractRead({
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'getMarketCapUSD',
  });

  // Convert from wei to USD (1e18)
  const marketCapUSD = marketCapRaw ? Number(marketCapRaw) / 1e18 : 0;
  const marketCapMillions = marketCapUSD / 1_000_000;
  const progress = Math.min((marketCapUSD / MARKETCAP_TARGET) * 100, 100);
  const progressDisplay = progress.toLocaleString(undefined, { maximumFractionDigits: 1 });

  // Debug log for raw value
  if (marketCapRaw !== undefined && marketCapRaw !== null) {
    console.log("Raw market cap from contract:", marketCapRaw.toString());
  }

  // Display in dollars if less than $1M, otherwise in millions
  let marketCapDisplay;
  if (marketCapUSD < 1_000_000) {
    marketCapDisplay = `$${marketCapUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  } else {
    marketCapDisplay = `$${marketCapMillions.toLocaleString(undefined, { maximumFractionDigits: 2 })}M`;
  }

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
        <span className="text-4xl font-extrabold text-white font-press"> / $10M</span>
      </div>
      <div className="relative w-full mt-2">
        {/* Rocket emoji above the progress bar */}
        <div
          className="absolute"
          style={{
            left: `calc(${progress}% - 16px)`,
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
              width: `${progress}%`,
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