'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useAccount, useBalance, useSimulateContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useGameData } from '@/contexts/GameDataContext';
import { MEGA_CONTRACT_ADDRESS } from '@/contracts/mega';
import MEGA_ABI from '@/contracts/MEGA_ABI.json';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import DashboardCard from '@/components/common/DashboardCard';
import { parseUnits, formatUnits, parseEther } from 'viem';

const SLIPPAGE_OPTIONS = [2, 5, 10];

// Type assertion for contract address to satisfy wagmi
const CONTRACT_ADDRESS = MEGA_CONTRACT_ADDRESS as `0x${string}`;

// Utility to convert scientific notation to plain string
function toPlainString(num: string | number) {
  return String(num).includes('e')
    ? Number(num).toFixed(18).replace(/\.?0+$/, '')
    : String(num);
}

export default function ActionsPanel() {
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [slippage, setSlippage] = useState(5);
  const [customSlippage, setCustomSlippage] = useState('');
  const [ethAmount, setEthAmount] = useState('');
  const [megaAmount, setMegaAmount] = useState('');
  const { address } = useAccount();
  const { data: ethBalance } = useBalance({ address });
  
  // Get consolidated game data from context
  const {
    userTokenBalance: megaBalance,
    gameEnded,
    tokenPrice,
    freezeEndTime,
    userLastFreeze: lastFreeze,
    isLoading
  } = useGameData();

  // Transaction state
  const [txState, setTxState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [txError, setTxError] = useState<string | null>(null);

  // Freeze-specific state
  const [freezeState, setFreezeState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Timer for live countdown - prevent hydration mismatch
  const [now, setNow] = useState(0); // Start with 0 to prevent hydration mismatch
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    // Mark as client-side and set initial time
    setIsClient(true);
    setNow(Math.floor(Date.now() / 1000));
    
    const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute isFrozen after freezeEndTime and now are defined - handle SSR
  const isFrozen = isClient && freezeEndTime && Number(freezeEndTime) > now;
  const onCooldown = isClient && lastFreeze && Number(lastFreeze) + 24 * 3600 > now;

  // --- Memoized calculations ---
  
  // Memoize buy calculations to prevent unnecessary re-renders
  const buyCalculations = useMemo(() => {
    if (!tokenPrice || !ethAmount || isNaN(Number(ethAmount)) || Number(ethAmount) <= 0) {
      return { expectedTokens: undefined, minTokensOut: undefined };
    }
    
    try {
      const ethWei = parseUnits(ethAmount, 18);
      const price = BigInt(tokenPrice.toString());
      const expectedTokens = (ethWei * BigInt(parseUnits('1', 18).toString())) / price;
      const minTokensOut = (expectedTokens * BigInt(Math.round(100 - slippage))) / 100n;
      
      return { expectedTokens, minTokensOut };
    } catch {
      return { expectedTokens: undefined, minTokensOut: undefined };
    }
  }, [tokenPrice, ethAmount, slippage]);

  // Memoize sell calculations
  const sellCalculations = useMemo(() => {
    if (!megaAmount || !tokenPrice || isNaN(Number(megaAmount)) || Number(megaAmount) <= 0) {
      return { sellAmtWei: undefined, minEthOut: undefined };
    }
    
    try {
      const sellAmtWei = parseUnits(toPlainString(megaAmount), 18);
      const price = Number(tokenPrice) / 1e18;
      const ethOut = Number(megaAmount) * price;
      const minEthOut = parseEther((ethOut * (1 - slippage / 100)).toFixed(8));
      
      return { sellAmtWei, minEthOut };
    } catch {
      return { sellAmtWei: undefined, minEthOut: undefined };
    }
  }, [megaAmount, tokenPrice, slippage]);

  // --- Freeze Selling Logic ---
  const {
    data: freezeSimData,
    isLoading: isFreezeSimLoading,
    isError: isFreezeSimError,
    error: freezeSimError,
  } = useSimulateContract({
    address: CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'freeze',
    value: parseEther('0.1'),
    query: { enabled: !isFrozen && !gameEnded },
  });

  const {
    writeContract: freezeWriteContract,
    data: freezeWriteData,
    isPending: isFreezePending,
  } = useWriteContract();

  const {
    isLoading: isFreezeTxLoading,
    isSuccess: isFreezeTxSuccess,
    isError: isFreezeTxError,
    error: freezeTxError,
  } = useWaitForTransactionReceipt({
    hash: freezeWriteData,
    query: { enabled: !!freezeWriteData },
  });

  // Freeze button state - after all freeze-related hooks
  const freezeDisabled = Boolean(
    isFrozen || 
    onCooldown || 
    isFreezeSimLoading || 
    isFreezePending || 
    isFreezeTxLoading || 
    freezeState === 'loading' ||
    gameEnded
  );

  let freezeLabel = 'No More Jeeting';
  if (isFrozen) freezeLabel = 'Jeeting is disabled';
  else if (onCooldown) freezeLabel = `Cooldown: ${formatDuration(Number(lastFreeze) + 24 * 3600 - now)} left`;
  else if (gameEnded) freezeLabel = 'Game has ended';

  // Format duration helper
  function formatDuration(secs: number) {
    if (!secs || secs <= 0) return '0s';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`;
  }

  // Input handlers (auto-calc MEGA ↔ ETH)
  const sanitizeDecimalInput = (val: string) => {
    // Remove all characters except digits and a single dot
    let sanitized = val.replace(/[^0-9.]/g, '');
    // Only allow one dot
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      sanitized = parts[0] + '.' + parts.slice(1).join('');
    }
    return sanitized;
  };

  const handleEthInput = (val: string) => {
    const sanitized = sanitizeDecimalInput(val);
    setEthAmount(sanitized);
    if (tokenPrice && sanitized && !isNaN(Number(sanitized)) && Number(sanitized) > 0) {
      const ethWei = parseUnits(sanitized, 18);
      const price = BigInt(tokenPrice.toString());
      const out = (ethWei * BigInt(parseUnits('1', 18).toString())) / price;
      setMegaAmount(out > 0n ? formatUnits(out, 18) : '');
    } else {
      setMegaAmount('');
    }
  };
  const handleMegaInput = (val: string) => {
    const plainVal = toPlainString(val);
    const sanitized = sanitizeDecimalInput(plainVal);
    setMegaAmount(sanitized);
    if (tokenPrice && sanitized && !isNaN(Number(sanitized)) && Number(sanitized) > 0) {
      const megaWei = parseUnits(sanitized, 18);
      const price = BigInt(tokenPrice.toString());
      const ethOut = (megaWei * price) / BigInt(parseUnits('1', 18).toString());
      setEthAmount(ethOut > 0n ? formatUnits(ethOut, 18) : '');
    } else {
      setEthAmount('');
    }
  };

  // Input validity check
  const inputIsValid = tab === 'buy'
    ? ethAmount !== '' && !isNaN(Number(ethAmount)) && Number(ethAmount) > 0
    : megaAmount !== '' && !isNaN(Number(megaAmount)) && Number(megaAmount) > 0;

  // Max buttons
  const handleMaxEth = () => {
    if (ethBalance) {
      const max = Math.min(Number(ethBalance.value) / 1e18, 1.0);
      handleEthInput(max.toString());
    }
  };
  const handleMaxMega = () => {
    if (megaBalance) handleMegaInput((Number(megaBalance) / 1e18).toString());
  };

  // --- Buy Logic ---
  const { minTokensOut } = buyCalculations;

  const {
    data: buySimData,
    isLoading: isBuySimLoading,
  } = useSimulateContract({
    address: CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'buy',
    args: minTokensOut !== undefined ? [minTokensOut] : undefined,
    value: ethAmount ? parseEther(ethAmount) : undefined,
    query: { 
      enabled: Boolean(
        tab === 'buy' && 
        minTokensOut !== undefined && 
        ethAmount && 
        !gameEnded
      )
    },
  });

  const {
    writeContract: buyWriteContract,
    data: buyWriteData,
    isPending: isBuyPending,
  } = useWriteContract();
  const {
    isLoading: isBuyTxLoading,
    isSuccess: isBuyTxSuccess,
    isError: isBuyTxError,
    error: buyTxError,
  } = useWaitForTransactionReceipt({
    hash: buyWriteData,
    query: { enabled: !!buyWriteData },
  });

  useEffect(() => {
    if (isBuyTxSuccess) {
      setTxState('success');
    } else if (isBuyTxError && buyTxError) {
      setTxState('error');
      setTxError((buyTxError as Error).message);
    }
  }, [isBuyTxSuccess, isBuyTxError, buyTxError]);

  // --- Sell Logic ---
  const { sellAmtWei, minEthOut } = sellCalculations;

  const {
    data: sellSimData,
    isLoading: isSellSimLoading,
  } = useSimulateContract({
    address: CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'sell',
    args: sellAmtWei !== undefined && minEthOut !== undefined ? [sellAmtWei, minEthOut] : undefined,
    query: { 
      enabled: Boolean(
        tab === 'sell' && 
        sellAmtWei !== undefined && 
        minEthOut !== undefined && 
        !gameEnded
      )
    },
  });

  const {
    writeContract: sellWriteContract,
    data: sellWriteData,
    isPending: isSellPending,
  } = useWriteContract();
  const {
    isLoading: isSellTxLoading,
    isSuccess: isSellTxSuccess,
    isError: isSellTxError,
    error: sellTxError,
  } = useWaitForTransactionReceipt({
    hash: sellWriteData,
    query: { enabled: !!sellWriteData },
  });

  useEffect(() => {
    if (isSellTxSuccess) {
      setTxState('success');
    } else if (isSellTxError && sellTxError) {
      setTxState('error');
      setTxError((sellTxError as Error).message);
    }
  }, [isSellTxSuccess, isSellTxError, sellTxError]);

  // --- Button click handlers ---
  const handleBuy = () => {
    setTxState('loading');
    setTxError(null);
    
    if (buySimData?.request) {
      buyWriteContract(buySimData.request);
    }
  };
  const handleSell = () => {
    setTxState('loading');
    setTxError(null);
    if (sellSimData?.request) {
      sellWriteContract(sellSimData.request);
    }
  };

  // Clear inputs on success
  useEffect(() => {
    if (isBuyTxSuccess || isSellTxSuccess) {
      setEthAmount('');
      setMegaAmount('');
    }
  }, [isBuyTxSuccess, isSellTxSuccess]);

  const handleFreeze = () => {
    if (isFrozen || gameEnded) return;
    setFreezeState('loading');
    if (freezeSimData?.request) {
      freezeWriteContract({ ...freezeSimData.request, value: parseEther('0.1') });
    } else {
      setFreezeState('error');
    }
  };

  useEffect(() => {
    if (isFreezeTxSuccess) {
      setFreezeState('success');
    } else if (isFreezeTxError && freezeTxError) {
      setFreezeState('error');
    }
  }, [isFreezeTxSuccess, isFreezeTxError, freezeTxError]);

  // Handle loading state to prevent hydration issues
  if (isLoading) {
    return (
      <DashboardCard>
        <div className="flex items-center justify-center py-4 md:py-8">
          <LoadingSpinner />
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard>
      <div className="space-y-3 md:space-y-4 flex-1">
        <div className={`bg-bg-card-alt rounded-lg p-4 md:p-4 flex flex-col gap-3 md:gap-4 ${gameEnded ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between">
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[.,]?[0-9]*"
              min="0"
              step="any"
              value={tab === 'buy' ? ethAmount : megaAmount}
              onChange={e => !gameEnded && (tab === 'buy' ? handleEthInput(e.target.value) : handleMegaInput(e.target.value))}
              placeholder="0.0"
              disabled={gameEnded}
              className="bg-transparent outline-none w-1/2 disabled:cursor-not-allowed text-base md:text-lg"
            />
            <div className="flex flex-col items-end">
              <button 
                className="text-xs md:text-sm neon-text-yellow hover:underline disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={!gameEnded ? (tab === 'buy' ? handleMaxEth : handleMaxMega) : undefined}
                disabled={gameEnded}
              >
                Max
              </button>
              <span className="text-sm md:text-sm text-gray-400 text-right">{tab === 'buy' ? 'ETH to spend' : 'MEGA to sell'}</span>
            </div>
          </div>
          {/* Discrete Snap Slider for Buy/Sell Percentage */}
          <div className="flex items-center justify-between my-2">
            {[0, 25, 50, 75, 100].map(percent => (
              <button
                key={percent}
                onClick={() => {
                  if (gameEnded) return;
                  if (tab === 'buy') {
                    if (ethBalance) {
                      const max = Math.min(Number(ethBalance.value) / 1e18, 1.0);
                      handleEthInput((max * percent / 100).toString());
                    }
                  } else {
                    if (megaBalance) {
                      const max = Number(megaBalance) / 1e18;
                      handleMegaInput((max * percent / 100).toString());
                    }
                  }
                }}
                disabled={gameEnded}
                className="px-2 md:px-3 py-1 text-xs md:text-sm bg-bg-secondary hover:bg-bg-hover text-neon-green disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {percent}%
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center my-2">
            <span
              className={`arrow-anim ${tab === 'buy' ? 'arrow-buy' : 'arrow-sell'} bg-[#232B45] rounded-full p-2 neon-text-yellow cursor-pointer hover:bg-yellow-300/30 transition ${gameEnded ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ fontSize: '1.2rem' }}
              onClick={() => !gameEnded && setTab(tab === 'buy' ? 'sell' : 'buy')}
              title={`Switch to ${tab === 'buy' ? 'Sell' : 'Buy'} mode`}
              role="button"
              tabIndex={0}
              onKeyPress={e => { if (!gameEnded && (e.key === 'Enter' || e.key === ' ')) setTab(tab === 'buy' ? 'sell' : 'buy'); }}
            >
              ⇅
            </span>
          </div>
          <div className="flex items-center justify-between">
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[.,]?[0-9]*"
              min="0"
              step="any"
              value={tab === 'buy' ? megaAmount : ethAmount}
              onChange={e => !gameEnded && (tab === 'buy' ? handleMegaInput(e.target.value) : handleEthInput(e.target.value))}
              placeholder="0.0"
              disabled={gameEnded}
              className="bg-transparent outline-none w-1/2 disabled:cursor-not-allowed text-base md:text-lg"
            />
            <div className="flex flex-col items-end">
              <span className="text-sm md:text-sm text-gray-400 text-right">{tab === 'buy' ? 'MEGA to receive' : 'ETH to receive'}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-2 mt-2 w-full">
            {SLIPPAGE_OPTIONS.map(opt => (
              <button
                key={opt}
                disabled={gameEnded}
                className={`px-2 md:px-3 py-1 rounded-full border text-xs md:text-sm ${!gameEnded && slippage === opt ? 'bg-yellow-400 text-white border-yellow-400' : 'bg-[#181E33] text-gray-300 border-[#232B45] disabled:opacity-50 disabled:cursor-not-allowed'}`}
                onClick={() => { if (!gameEnded) { setSlippage(opt); setCustomSlippage(''); }}}
              >{opt}%</button>
            ))}
            <input
              type="number"
              min={0}
              step={0.1}
              placeholder="Custom"
              disabled={gameEnded}
              className={`w-20 md:w-24 px-2 md:px-2 py-1 rounded-full border text-xs md:text-sm ${!gameEnded && slippage === Number(customSlippage) && slippage > 0 ? 'bg-yellow-400 text-white border-yellow-400' : 'bg-[#181E33] text-gray-300 border-[#232B45] disabled:opacity-50 disabled:cursor-not-allowed'}`}
              value={customSlippage}
              onChange={e => {
                if (gameEnded) return;
                const val = e.target.value;
                setCustomSlippage(val);
                const num = Number(val);
                if (!isNaN(num) && num > 0) setSlippage(num);
              }}
              onFocus={() => !gameEnded && setCustomSlippage('')}
            />
            <span className="ml-2 md:ml-2 text-xs md:text-sm text-gray-400 whitespace-nowrap">Slippage</span>
          </div>
        </div>
        <div className={`bg-bg-card-alt rounded-lg p-4 md:p-4 flex flex-col gap-2 md:gap-2 ${gameEnded ? 'opacity-50' : ''}`}>
          <span className="text-sm md:text-sm font-bold text-white mb-2">Estimates</span>
          <div className="flex justify-between items-center">
            <span className="text-gray-light text-xs md:text-xs">Tickets:</span>
            <span className="font-mono text-white text-xs md:text-xs">
              {tab === 'buy' && ethAmount && !isNaN(Number(ethAmount)) ? Math.floor(Number(ethAmount) * 10) : '0'}
            </span>
          </div>
        </div>
        <button
          className="w-full py-3 md:py-3 mt-2 rounded-lg bg-yellow-400 text-white font-bold text-base md:text-lg hover:bg-yellow-300 transition disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-600"
          disabled={
            !inputIsValid ||
            txState === 'loading' ||
            (tab === 'buy' && (isBuySimLoading || isBuyPending || isBuyTxLoading)) ||
            (tab === 'sell' && (isSellSimLoading || isSellPending || isSellTxLoading)) ||
            gameEnded
          }
          onClick={!gameEnded ? (tab === 'buy' ? handleBuy : handleSell) : undefined}
        >
          {gameEnded ? 'Game Ended' : 
            txState === 'loading' ? (
              <span className="flex items-center justify-center"><LoadingSpinner />Processing...</span>
            ) : tab === 'buy' ? 'Buy MEGA Tokens' : 'Sell MEGA Tokens'}
        </button>
        {txState === 'error' && txError && !gameEnded && (
          <div className="text-red-500 text-sm md:text-sm mt-1">{txError}</div>
        )}
        {txState === 'success' && !gameEnded && (
          <div className="text-green-500 text-sm md:text-sm mt-1">Transaction successful!</div>
        )}
        {/* Freeze Button and Status */}
        <button
          className="w-full py-3 md:py-3 rounded-lg bg-blue-600 text-white font-bold text-base md:text-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-600"
          disabled={freezeDisabled}
          onClick={!gameEnded ? handleFreeze : undefined}
        >
          {freezeState === 'loading' || isFreezeTxLoading ? (
            <span className="flex items-center justify-center"><LoadingSpinner />Processing...</span>
          ) : freezeLabel}
        </button>
        {/* Do not show the generic freezeMsg error, only show contract revert reasons below */}
        {!isFrozen && isFreezeSimError && !gameEnded && (
          <div className="text-red-500 text-sm md:text-sm mt-1">
            {freezeSimError.message.includes('Game not active') 
              ? 'Game has ended - freezing is no longer available'
              : freezeSimError.message.includes('reverted with the following reason:')
                ? freezeSimError.message.split('reverted with the following reason:')[1]?.split('Contract Call:')[0]?.trim() || 'Transaction failed'
                : 'Transaction failed'
            }
          </div>
        )}
        {freezeState === 'success' && !gameEnded && (
          <div className="text-green-500 text-sm md:text-sm mt-1">Freeze transaction successful!</div>
        )}
      </div>
    </DashboardCard>
  );
} 