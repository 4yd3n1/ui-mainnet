'use client';
import { useState } from 'react';
import RulesModal from '@/components/RulesModal';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function HomePage() {
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <div className="landing-bg">
      <main
        className="min-h-screen flex flex-col text-white"
        style={{
          backgroundImage: "url('/ethbackground.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div
          className="min-h-screen flex flex-col w-full relative"
          style={{ background: 'rgba(0,0,0,0.7)' }}
        >
          {/* Mobile Header - visible only on mobile */}
          <div className="flex md:hidden justify-between items-center p-4 border-b border-gray-800/50">
            <h2 className="text-lg font-bold neon-text-yellow">MEGA</h2>
            <ConnectButton showBalance={false} accountStatus="avatar" chainStatus="icon" />
          </div>

          {/* Desktop Connect Button - hidden on mobile */}
          <div className="hidden md:block absolute top-8 right-8 z-10">
            <ConnectButton showBalance={false} accountStatus="avatar" chainStatus="icon" />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="text-center max-w-4xl mx-auto">
              {/* Logo */}
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="neon-text-yellow block">Make Ethereum</span>
                <span className="neon-text-yellow block">Great Again</span>
              </h1>

              {/* Tagline */}
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                The ultimate high-stakes crypto lottery race
              </p>

              <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
                Enter the race where every ETH spent buying MEGA tokens earns lottery tickets for life-changing prizes. The clock is ticking!
              </p>

              {/* Rules Button */}
              <div className="space-y-4">
                <button
                  onClick={() => setRulesOpen(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Rules and Disclaimer
                </button>

                <p className="text-sm text-gray-500">
                  Click above to read the complete game rules and risk disclaimers
                </p>
              </div>

              {/* Coming Soon Badge */}
              <div className="mt-12 inline-block">
                <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/50 rounded-full px-6 py-3">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="neon-text-yellow font-semibold">Game Launching Soon</span>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Rules Modal */}
      <RulesModal
        isOpen={rulesOpen}
        onClose={() => setRulesOpen(false)}
      />
    </div>
  );
} 