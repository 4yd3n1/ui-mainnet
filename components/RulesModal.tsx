import { useState } from 'react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RulesModal({ isOpen, onClose }: RulesModalProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-[#10182A] border border-yellow-500/30 rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-[#10182A] border-b border-yellow-500/30 p-6 relative">
            <h2 className="text-2xl font-bold text-yellow-400 text-center">
              MEGA Token Game - Rules & Disclaimer
            </h2>
            <button
              onClick={onClose}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 text-white">
            {/* Welcome Section */}
            <section className="text-center">
              <p className="text-lg text-gray-300 mb-4">
                Enter the ultimate high-stakes crypto race! Every ETH you spend buying MEGA tokens earns you lottery tickets for a shot at life-changing prizes. Buy to compete, sell to cash out, or freeze the market to disrupt your rivals and gain the upper hand.
              </p>
              <p className="text-xl text-yellow-400 font-semibold">
                👉 Spend just 0.1 ETH to qualify for the prize pool!
              </p>
            </section>

            {/* How to Play */}
            <section className="bg-[#1a2333] rounded-lg p-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">🕹 How to Play</h3>
              <ul className="space-y-2 text-gray-300">
                <li><strong>BUY</strong> MEGA tokens with ETH to gain entry into the lottery</li>
                <li><strong>SELL</strong> anytime to exit the game — but selling disqualifies you from winning</li>
                <li><strong>FREEZE</strong> the market to block all sales for 1 hour while you buy more at better prices</li>
              </ul>
            </section>

            {/* Game Rules */}
            <section className="bg-[#1a2333] rounded-lg p-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">📜 Game Rules</h3>
              <div className="space-y-3 text-gray-300">
                <p><strong>Duration:</strong> 7 days OR until the market cap hits $1 million USD — whichever comes first</p>
                <p><strong>Trading:</strong> MEGA tokens are bought and sold AMM-style (automated market maker) exclusively on megaa.dev — no exchanges, no listings, no bullshit</p>
                <p><strong>Buy Limit:</strong> Maximum 1 ETH per wallet</p>
                <div>
                  <p><strong>Lottery Tickets:</strong></p>
                  <ul className="ml-4 space-y-1">
                    <li>• Earn 10 tickets per 1 ETH spent</li>
                    <li>• Minimum entry: 0.1 ETH</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Bonuses & Rewards */}
            <section className="bg-[#1a2333] rounded-lg p-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">🎁 Bonuses & Rewards</h3>
              <ul className="space-y-2 text-gray-300">
                <li><strong>Early Bonus:</strong> First 70 players to deposit exactly 1 ETH get 50 tickets (5x bonus)</li>
                <li><strong>Late Bonus:</strong> Players 51–70 (by deposit order) get 20 tickets (2x bonus)</li>
              </ul>
            </section>

            {/* Anti-Jeet Mechanism */}
            <section className="bg-[#1a2333] rounded-lg p-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">🔒 Anti-Jeet Mechanism</h3>
              <p className="text-gray-300 mb-3">
                Worried about sudden dumps? Qualified players can pay 0.1 ETH to freeze all sales for 1 hour — giving you time to stack more tokens at stable prices.
              </p>
              <p className="text-red-400 font-semibold">
                ⚠️ You can only use this once every 24 hours — use it strategically!
              </p>
            </section>

            {/* Prize Pool Breakdown */}
            <section className="bg-[#1a2333] rounded-lg p-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">🏆 Prize Pool Breakdown</h3>
              
              {/* Chart Image - Clickable */}
              <div className="flex justify-center mb-6">
                <img 
                  src="/chart.png" 
                  alt="Prize Pool Distribution Chart" 
                  className="max-w-sm w-full h-auto rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setImageModalOpen(true)}
                  title="Click to view full size"
                />
              </div>
              <p className="text-center text-gray-400 text-sm mb-4">
                👆 Click chart to view full size
              </p>
              
              <div className="grid md:grid-cols-2 gap-3 text-gray-300">
                <div>25% — 🥇 Grand Prize Winner (1 lucky player)</div>
                <div>20% — 🥈 Runner-Up Pool (split among several players)</div>
                <div>15% — 🐦 Early Bird Bonus (for early qualifiers)</div>
                <div>20% — ♻️ Platform Treasury (used to fund the next game round)</div>
                <div>10% — 📣 Marketing Fund</div>
                <div>10% — 👨‍💻 Team Support</div>
              </div>
            </section>

            {/* Winner Selection */}
            <section className="bg-[#1a2333] rounded-lg p-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">🎲 Winner Selection</h3>
              <ul className="space-y-2 text-gray-300">
                <li><strong>Provably Fair:</strong> Winners chosen using Chainlink VRF</li>
                <li><strong>Weighted Odds:</strong> More tickets = better chances</li>
                <li><strong>Automatic Payouts:</strong> All rewards are distributed by smart contract</li>
              </ul>
            </section>

            {/* Game Failure Condition */}
            <section className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-red-400 mb-4 text-center">❌ Game Failure Condition</h3>
              <p className="text-gray-300 mb-2">
                If the 7-day timer expires and the $1M market cap is not reached…
              </p>
              <p className="text-red-400 font-bold text-lg">
                💥 Everyone loses. No refunds. No prizes.
              </p>
            </section>

            {/* Disclaimer */}
            <section className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">⚠️ Disclaimer</h3>
              <p className="text-gray-300">
                This is a gamified social experiment with real financial risk.
                <br />
                <strong className="text-yellow-400">You will probably lose your ETH — play responsibly and only risk what you can afford to lose.</strong>
              </p>
            </section>

            {/* Close Button */}
            <div className="text-center pt-4">
              <button
                onClick={onClose}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Size Image Modal */}
      {imageModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4"
          onClick={() => setImageModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img 
              src="/chart.png" 
              alt="Prize Pool Distribution Chart - Full Size" 
              className="w-full h-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setImageModalOpen(false)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold transition-colors"
            >
              ×
            </button>
            <p className="text-center text-gray-300 text-sm mt-4">
              Click outside or the × button to close
            </p>
          </div>
        </div>
      )}
    </>
  );
} 