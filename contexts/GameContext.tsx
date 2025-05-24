import { createContext, useContext } from 'react';
import { MEGA_CONTRACT_ADDRESS } from '@/contracts/mega';

interface GameContextType {
  contractAddress: string;
}

export const GameContext = createContext<GameContextType>({
  contractAddress: MEGA_CONTRACT_ADDRESS
});

export const useGameContext = () => useContext(GameContext);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <GameContext.Provider value={{ contractAddress: MEGA_CONTRACT_ADDRESS }}>
      {children}
    </GameContext.Provider>
  );
};

export default GameContext;
