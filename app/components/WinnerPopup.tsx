'use client';
import { useEffect } from 'react';
import { formatEther } from 'viem';
import confetti from 'canvas-confetti';

interface WinnerPopupProps {
  isOpen: boolean;
  onClose: () => void;
  category: 'grand' | 'runnerUp' | 'earlyBird';
  amount: bigint;
}

export default function WinnerPopup({ isOpen, onClose, category, amount }: WinnerPopupProps) {
  useEffect(() => {
    if (isOpen) {
      // Trigger confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          zIndex: 0,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          zIndex: 0,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getCategoryTitle = () => {
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
          
          <div className="break-words truncate whitespace-normal text-xl sm:text-2xl md:text-3xl text-white my-6">
            {formatEther(amount)} ETH
          </div>
          
          <p className="text-sm text-gray-400">
            This is the exact prize you received, automatically distributed to your wallet.
          </p>
        </div>
      </div>
    </div>
  );
} 