'use client';
import { useEffect } from 'react';
import { formatEther } from 'viem';
import confetti from 'canvas-confetti';

interface WinnerPopupProps {
  isOpen: boolean;
  onClose: () => void;
  category: 'grand' | 'runnerUp' | 'earlyBird';
  amount: bigint;
  details?: {
    isGrandWinner: boolean;
    isRunnerUp: boolean;
    isEarlyBird: boolean;
    grandPrizeAmount: bigint;
    runnerUpAmount: bigint;
    earlyBirdAmount: bigint;
    totalWinnings: bigint;
  };
}

export default function WinnerPopup({ isOpen, onClose, category, amount, details }: WinnerPopupProps) {
  useEffect(() => {
    if (isOpen) {
      // Trigger confetti with comprehensive error suppression
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      // Suppress all confetti errors including CSP worker errors
      const originalError = console.error;
      const originalWarn = console.warn;
      
      const suppressConfettiErrors = (method: (...args: unknown[]) => void) => (...args: unknown[]) => {
        const message = args[0]?.toString() || '';
        if (message.includes('worker') || message.includes('Worker') || message.includes('CSP') || message.includes('confetti')) {
          return; // Suppress confetti-related errors
        }
        method.apply(console, args);
      };

      console.error = suppressConfettiErrors(originalError);
      console.warn = suppressConfettiErrors(originalWarn);

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          // Restore original console methods
          console.error = originalError;
          console.warn = originalWarn;
          return;
        }

        const particleCount = 50 * (timeLeft / duration);
        
        try {
          confetti({
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            zIndex: 0,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            disableForReducedMotion: true
          });
          confetti({
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            zIndex: 0,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            disableForReducedMotion: true
          });
        } catch {
          // Silently handle any confetti errors
          clearInterval(interval);
          // Restore original console methods
          console.error = originalError;
          console.warn = originalWarn;
        }
      }, 250);

      // Cleanup interval and restore console on unmount
      return () => {
        clearInterval(interval);
        console.error = originalError;
        console.warn = originalWarn;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getCategoryTitle = () => {
    const winCount = (details?.isGrandWinner ? 1 : 0) + 
                     (details?.isRunnerUp ? 1 : 0) + 
                     (details?.isEarlyBird ? 1 : 0);
    
    if (winCount > 1) {
      return `Multiple Prize Winner!`;
    }
    
    switch (category) {
      case 'grand':
        return 'Grand Prize Winner!';
      case 'runnerUp':
        return 'Runner-up Winner!';
      case 'earlyBird':
        return 'Early Bird Winner!';
      default:
        return 'Winner!';
    }
  };

  const getCategoryDescription = () => {
    if (!details) return 'Congratulations!';
    
    const winCount = (details.isGrandWinner ? 1 : 0) + 
                     (details.isRunnerUp ? 1 : 0) + 
                     (details.isEarlyBird ? 1 : 0);
    
    if (winCount > 1) {
      const categories = [];
      if (details.isGrandWinner) categories.push('Grand Prize');
      if (details.isRunnerUp) categories.push('Runner-up');
      if (details.isEarlyBird) categories.push('Early Bird');
      return `You won ${categories.join(' + ')} prizes!`;
    }
    
    switch (category) {
      case 'grand':
        return 'You won the Grand Prize!';
      case 'runnerUp':
        return 'You won a Runner-up Prize!';
      case 'earlyBird':
        return 'You won an Early Bird Prize!';
      default:
        return 'Congratulations!';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-[#10182A] p-8 rounded-lg shadow-xl max-w-md w-full mx-4 border-2 border-[#FFD600] neon-border-yellow overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
        
        <div className="text-center space-y-4 flex flex-col min-w-0">
          <h2 className="text-2xl font-bold text-[#FFD600] neon-text-yellow">
            {getCategoryTitle()}
          </h2>
          
          <p className="text-lg text-gray-300">
            {getCategoryDescription()}
          </p>
          
          {/* Prize Breakdown */}
          {details && (
            <div className="space-y-2 text-sm text-gray-300">
              {details.isGrandWinner && (
                <div className="flex justify-between">
                  <span>🏆 Grand Prize:</span>
                  <span className="text-yellow-400">{Number(formatEther(details.grandPrizeAmount)).toFixed(4)} ETH</span>
                </div>
              )}
              {details.isRunnerUp && (
                <div className="flex justify-between">
                  <span>🥈 Runner-up:</span>
                  <span className="text-blue-400">{Number(formatEther(details.runnerUpAmount)).toFixed(4)} ETH</span>
                </div>
              )}
              {details.isEarlyBird && (
                <div className="flex justify-between">
                  <span>🐦 Early Bird:</span>
                  <span className="text-green-400">{Number(formatEther(details.earlyBirdAmount)).toFixed(4)} ETH</span>
                </div>
              )}
              {(details.isGrandWinner ? 1 : 0) + (details.isRunnerUp ? 1 : 0) + (details.isEarlyBird ? 1 : 0) > 1 && (
                <div className="border-t border-gray-600 pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span className="text-[#FFD600]">{Number(formatEther(details.totalWinnings)).toFixed(4)} ETH</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="break-words truncate whitespace-normal text-xl sm:text-2xl md:text-3xl text-white my-6">
            {Number(formatEther(amount)).toFixed(4)} ETH
          </div>
          
          <p className="text-sm text-gray-400">
            {details && ((details.isGrandWinner ? 1 : 0) + (details.isRunnerUp ? 1 : 0) + (details.isEarlyBird ? 1 : 0) > 1) 
              ? 'This is your total combined winnings from all prize categories, automatically distributed to your wallet.'
              : 'This prize has been automatically distributed to your wallet.'
            }
          </p>
        </div>
      </div>
    </div>
  );
} 