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
                <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/50 rounded-full px-10 py-5">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="neon-text-yellow font-semibold text-xl md:text-2xl">Game Launching Soon</span>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                {/* Social Links */}
                <div className="mt-8 flex items-center justify-center space-x-6">
                  {/* Twitter */}
                  <a
                    href="https://x.com/MEGAgain0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:scale-110 transition-transform"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-10 h-10 text-blue-400"
                    >
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.27 4.27 0 0 0 1.88-2.37 8.48 8.48 0 0 1-2.7 1.03 4.24 4.24 0 0 0-7.23 3.87A12 12 0 0 1 3.15 4.9a4.23 4.23 0 0 0 1.31 5.66 4.2 4.2 0 0 1-1.92-.53v.05a4.24 4.24 0 0 0 3.4 4.15 4.3 4.3 0 0 1-1.92.07 4.25 4.25 0 0 0 3.96 2.95A8.5 8.5 0 0 1 2 19.54 12 12 0 0 0 8.29 21c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.35 8.35 0 0 0 22.46 6z" />
                    </svg>
                  </a>
                  {/* Discord */}
                  <a
                    href="https://discord.gg/5spU5tbk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:scale-110 transition-transform"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-10 h-10 text-indigo-400"
                    >
                      <path d="M20.317 4.369A19.791 19.791 0 0 0 15.933 3a.074.074 0 0 0-.078.037c-.34.607-.719 1.399-.982 2.013a19.736 19.736 0 0 0-5.774 0 12.74 12.74 0 0 0-.995-2.013A.077.077 0 0 0 8 3.001a19.736 19.736 0 0 0-4.384 1.369.07.07 0 0 0-.032.027C.533 9.132-.32 13.694.099 18.208a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.044.08.08 0 0 0 .086-.027c.462-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.041-.105 12.533 12.533 0 0 1-1.793-.86.077.077 0 0 1-.008-.127c.12-.09.24-.18.353-.272a.074.074 0 0 1 .076-.01c3.751 1.713 7.807 1.713 11.536 0a.074.074 0 0 1 .078.009c.113.093.233.183.354.273a.077.077 0 0 1-.006.127c-.57.33-1.17.623-1.794.86a.076.076 0 0 0-.04.106c.36.698.772 1.363 1.225 1.993a.076.076 0 0 0 .086.028 19.876 19.876 0 0 0 6.002-3.044.077.077 0 0 0 .03-.055c.5-5.177-.838-9.708-3.549-13.812a.061.061 0 0 0-.03-.028zM9.54 15.568c-1.152 0-2.103-1.053-2.103-2.349 0-1.296.93-2.35 2.103-2.35 1.182 0 2.133 1.063 2.103 2.35 0 1.296-.93 2.349-2.103 2.349zm5.018 0c-1.152 0-2.104-1.053-2.104-2.349 0-1.296.93-2.35 2.104-2.35 1.181 0 2.132 1.063 2.103 2.35 0 1.296-.922 2.349-2.103 2.349z" />
                    </svg>
                  </a>
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