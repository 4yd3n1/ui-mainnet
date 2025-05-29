"use client";
import { FC } from "react";

interface TermsModalProps {
  onAccept: () => void;
}

const TermsModal: FC<TermsModalProps> = ({ onAccept }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="p-6 md:p-10 rounded-2xl max-w-4xl w-full text-white shadow-2xl my-8" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
        <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center">Welcome!</h2>
        <p className="mb-4 md:mb-6 text-center font-bold uppercase neon-text-yellow text-sm md:text-base">
          MAKE ETHEREUM GREAT AGAIN
        </p>
        <div className="mb-6 md:mb-8 text-center overflow-y-auto max-h-[80vh] md:max-h-[90vh]">
          <p className="text-xs md:text-sm">
            <br /><br />
            Tired of getting rugged on Soylana and waiting for random restarts here and there? You're in luck—gas is cheap and so is ETH. LFG!!!
            <br /><br />
            You've just landed on the ultimate on-chain rally. Here's what's at stake:
            <br /><br />
            📈 Pump to $10M Market Cap: Help MEGA hit a $10 million market cap before the clock runs out, and get a chance to win big!
            <br /><br />
            🏆 Win Big: 60% of the ETH pot is shared among lucky winners. The bigger you play, the better your odds. (20% goes to fund the next game, 10% is allocated to marketing, and 10% goes to the team—because fuck you.)
            <br /><br />
            Prize Pool Breakdown
            <br /><br />
            🏆 Grand Prize: 25% of the pool to one lucky winner
            <br />
            🎖️ Runner-Ups: 20% split evenly among the next 10 winners
            <br />
            🌟 Early-Bird Bonus: 15% split evenly among the first 70 contributors
            <br /><br />
            Rules:
            <br />
            You get 1 lottery ticket for every 0.1 ETH contributed. Max contribution is 1 ETH.
            <br />
            The first 50 1ETH buys get you 5x multiplier tickets; the following 20 1ETH buys get you 2x multiplier tickets.
            <br />
            Buy low, sell high. Selling gets you disqualified, though.
            <br />
            You can disable the sell function for 1 hour. You can only do it once every 24 hours, so choose your moment wisely.
            <br /><br />
            ⏳ Race the Clock: Time is ticking. Once the game ends—or the target is reached—the party's over!
            <br /><br />
            By clicking "I Accept," you agree to our Terms & Conditions, which are the following: You can and probably will lose your ETH—deal with it and don't invest your life savings in this. There will be other rounds in the future.
           <br /><br />
          </p>
        </div>
        <button
          onClick={onAccept}
          className="w-full py-3 bg-transparent neon-border-cyan border-2 rounded font-bold text-cyan-300 hover:bg-[#10182A] transition text-base md:text-lg sticky bottom-0"
        >
          I Accept
        </button>
      </div>
    </div>
  );
};

export default TermsModal; 