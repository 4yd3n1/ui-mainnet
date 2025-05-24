'use client';
import { useState, useEffect } from 'react';
import { useAccount, useBalance, useContractRead, useContractWrite, useSimulateContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { MEGA_ABI, MEGA_CONTRACT_ADDRESS } from '@/contracts/mega';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import DashboardCard from '@/components/common/DashboardCard';
import { parseUnits, formatUnits, parseEther } from 'ethers';

const SLIPPAGE_OPTIONS = [2, 5, 10];

// Type assertion for contract address to satisfy wagmi
const CONTRACT_ADDRESS = MEGA_CONTRACT_ADDRESS! as `0x${string}`;

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
  const { data: megaBalance } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'balanceOf',
    args: [address! as `0x${string}`],
    account: address,
    query: { refetchInterval: 5000, enabled: !!address },
  });

  // Add game state check
  const { data: gameEnded } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'gameEnded',
    query: { refetchInterval: 5000 },
  });

  // Pool math: getPrice (ETH per MEGA)
  const { data: tokenPrice } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'getPrice',
    query: { refetchInterval: 5000 },
  });

  // Transaction state
  const [txState, setTxState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [txError, setTxError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Freeze-specific state
  const [freezeState, setFreezeState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [freezeMsg, setFreezeMsg] = useState<string | null>(null);

  // Add contract reads for freezeEndTime and lastFreeze
  const { data: freezeEndTime } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'freezeEndTime',
    query: { refetchInterval: 5000 },
  });

  const { data: lastFreeze, refetch: refetchLastFreeze } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'lastFreeze',
    args: [address! as `0x${string}`],
    query: { refetchInterval: 5000, enabled: !!address },
  });

  // Timer for live countdown
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  useEffect(() => {
    const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute isFrozen after freezeEndTime and now are defined
  const isFrozen = freezeEndTime && Number(freezeEndTime) > now;
  const onCooldown = lastFreeze && Number(lastFreeze) + 24 * 3600 > now;

  // --- Freeze Selling Logic ---
  const {
    data: freezeSimData,
    isLoading: isFreezeSimLoading,
    isError: isFreezeSimError,
    error: freezeSimError,
  } = useSimulateContract({
    address: CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'freezeSelling',
    value: parseEther('0.1'),
    query: { enabled: !isFrozen },
  });

  const {
    writeContract: freezeWriteContract,
    data: freezeWriteData,
    isPending: isFreezePending,
    isError: isFreezeError,
    error: freezeError,
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
  const expectedTokens = tokenPrice && ethAmount && !isNaN(Number(ethAmount)) && Number(ethAmount) > 0
    ? (parseUnits(ethAmount, 18) * BigInt(parseUnits('1', 18).toString())) / BigInt(tokenPrice.toString())
    : undefined;

  // --- Buy Math Logging ---
  console.log('[BUY SIM] tokenPrice:', tokenPrice, 'ethAmount:', ethAmount, 'slippage:', slippage);
  console.log('[BUY SIM] expectedTokens:', expectedTokens);
  const minTokensOut = expectedTokens
    ? (expectedTokens * BigInt(Math.round(100 - slippage))) / 100n
    : undefined;

  // --- Buy Simulation Logging ---
  console.log('[BUY SIM] minTokensOut:', minTokensOut, 'ethAmount:', ethAmount, 'enabled:', tab === 'buy' && !!minTokensOut);
  const {
    data: buySimData,
    isLoading: isBuySimLoading,
    isError: isBuySimError,
    error: buySimError,
  } = useSimulateContract({
    address: CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'buy',
    args: minTokensOut !== undefined ? [minTokensOut] : undefined,
    value: ethAmount ? parseEther(ethAmount) : undefined,
    query: { enabled: tab === 'buy' && !!minTokensOut },
  });
  console.log('[BUY SIM] buySimData:', buySimData, 'buySimError:', buySimError);
  const {
    writeContract: buyWriteContract,
    data: buyWriteData,
    isPending: isBuyPending,
    isError: isBuyError,
    error: buyError,
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

  // Debug logs for buy flow
  if (buySimError) console.error('Buy Sim Error:', buySimError);
  if (isBuySimError) console.error('Buy Sim Error State:', isBuySimError);
  if (buyTxError) console.error('Buy Tx Error:', buyTxError);
  if (isBuyTxSuccess) console.log('Buy Tx Success:', buyWriteData);

  useEffect(() => {
    if (isBuyTxSuccess) {
      setTxState('success');
    } else if (isBuyTxError && buyTxError) {
      setTxState('error');
      setTxError((buyTxError as Error).message);
    }
  }, [isBuyTxSuccess, isBuyTxError, buyTxError]);

  // --- Sell Logic ---
  let minEthOut = undefined;
  if (megaAmount && tokenPrice && !isNaN(Number(megaAmount))) {
    const price = Number(tokenPrice) / 1e18;
    const ethOut = Number(megaAmount) * price;
    minEthOut = parseEther((ethOut * (1 - slippage / 100)).toFixed(8));
  }
  const sellAmtWei = megaAmount && !isNaN(Number(megaAmount)) && Number(megaAmount) > 0
    ? parseUnits(toPlainString(megaAmount), 18)
    : undefined;
  const {
    data: sellSimData,
    isLoading: isSellSimLoading,
    isError: isSellSimError,
    error: sellSimError,
  } = useSimulateContract({
    address: CONTRACT_ADDRESS,
    abi: MEGA_ABI,
    functionName: 'sell',
    args: sellAmtWei !== undefined && minEthOut !== undefined ? [sellAmtWei, minEthOut] : undefined,
    query: { enabled: tab === 'sell' && !!sellAmtWei && minEthOut !== undefined },
  });

  const {
    writeContract: sellWriteContract,
    data: sellWriteData,
    isPending: isSellPending,
    isError: isSellError,
    error: sellError,
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

  // Debug logs for sell flow
  if (sellSimError) console.error('Sell Sim Error:', sellSimError);
  if (isSellSimError) console.error('Sell Sim Error State:', isSellSimError);
  if (sellTxError) console.error('Sell Tx Error:', sellTxError);
  if (isSellTxSuccess) console.log('Sell Tx Success:', sellWriteData);

  useEffect(() => {
    if (isSellTxSuccess) {
      setTxState('success');
    } else if (isSellTxError && sellTxError) {
      setTxState('error');
      setTxError((sellTxError as Error).message);
    }
  }, [isSellTxSuccess, isSellTxError, sellTxError]);

  // Place this after all relevant variables are declared, before the return statement:
  useEffect(() => {
    if (buySimError || buyTxError || txState !== 'idle') {
      console.group('[Buy Flow Debug]');
      console.log('txState:', txState);
      if (buySimError) console.error('buySimError:', buySimError);
      if (buyTxError) console.error('buyTxError:', buyTxError);
      console.groupEnd();
    }
  }, [txState, buySimError, buyTxError]);

  // --- Button click handlers ---
  const handleBuy = () => {
    setTxState('loading');
    setTxError(null);
    // Debug log for handleBuy
    console.log('handleBuy called');
    console.log('ETH value to send:', ethAmount);
    console.log('minTokensOut:', minTokensOut);
    console.log('buySimData:', buySimData);
    console.log('buySimError:', buySimError);
    if (!inputIsValid) {
      console.log('[BUY] inputIsValid is false:', { ethAmount, minTokensOut });
    }
    if (buySimData?.request) {
      buyWriteContract(buySimData.request);
    } else {
      console.log('handleBuy: No buySimData.request, cannot send transaction');
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
    setFreezeMsg(null);
    if (freezeSimData?.request) {
      freezeWriteContract({ ...freezeSimData.request, value: parseEther('0.1') });
    } else {
      setFreezeState('error');
      setFreezeMsg('Unable to prepare freeze transaction. Please try again or check your wallet connection.');
    }
  };

  useEffect(() => {
    if (isFreezeTxSuccess) {
      setFreezeState('success');
      refetchLastFreeze();
    } else if (isFreezeTxError && freezeTxError) {
      setFreezeState('error');
      setFreezeMsg((freezeTxError as Error).message);
    }
  }, [isFreezeTxSuccess, isFreezeTxError, freezeTxError]);

  return (
    <DashboardCard>
      <div className="space-y-3">
        <div className="bg-bg-card-alt rounded-lg p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[.,]?[0-9]*"
              min="0"
              step="any"
              value={tab === 'buy' ? ethAmount : megaAmount}
              onChange={e => tab === 'buy' ? handleEthInput(e.target.value) : handleMegaInput(e.target.value)}
              placeholder="0.0"
              className="bg-transparent outline-none w-1/2"
            />
            <div className="flex flex-col items-end">
              <button className="text-xs neon-text-yellow hover:underline" onClick={tab === 'buy' ? handleMaxEth : handleMaxMega}>Max</button>
              <span className="text-sm text-gray-400">{tab === 'buy' ? 'ETH to spend' : 'MEGA to sell'}</span>
            </div>
          </div>
          {/* Discrete Snap Slider for Buy/Sell Percentage */}
          <div className="flex items-center justify-between my-2">
            {[0, 25, 50, 75, 100].map(percent => (
              <button
                key={percent}
                className={`flex-1 mx-1 py-1 rounded-full border text-xs font-bold transition ${
                  (tab === 'buy'
                    ? ethAmount === '' && percent === 0
                    : megaAmount === '' && percent === 0
                  ) ||
                  (tab === 'buy' && ethBalance && Number(ethAmount) === Number((Number(ethBalance.value) / 1e18) * (percent / 100))) ||
                  (tab === 'sell' && megaBalance && Number(megaAmount) === Number((Number(megaBalance) / 1e18) * (percent / 100)))
                    ? 'bg-yellow-400 text-white border-yellow-400'
                    : 'bg-[#181E33] text-gray-300 border-[#232B45] hover:bg-yellow-300/60 hover:text-white'
                }`}
                onClick={() => {
                  if (percent === 0) {
                    tab === 'buy' ? handleEthInput('') : handleMegaInput('');
                  } else if (tab === 'buy' && ethBalance) {
                    if (percent === 100) {
                      handleMaxEth();
                    } else {
                      // Use 1.0 ETH as the cap for buy percentages
                      const maxBuy = 1.0;
                      const val = (maxBuy * (percent / 100)).toFixed(6);
                      handleEthInput(val);
                    }
                  } else if (tab === 'sell' && megaBalance) {
                    const val = ((Number(megaBalance) / 1e18) * (percent / 100)).toFixed(6);
                    handleMegaInput(val);
                  }
                }}
              >
                {percent}%
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center my-2">
            <span
              className={`arrow-anim ${tab === 'buy' ? 'arrow-buy' : 'arrow-sell'} bg-[#232B45] rounded-full p-2 neon-text-yellow cursor-pointer hover:bg-yellow-300/30 transition`}
              style={{ fontSize: '1.5rem' }}
              onClick={() => setTab(tab === 'buy' ? 'sell' : 'buy')}
              title={`Switch to ${tab === 'buy' ? 'Sell' : 'Buy'} mode`}
              role="button"
              tabIndex={0}
              onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') setTab(tab === 'buy' ? 'sell' : 'buy'); }}
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
              onChange={e => tab === 'buy' ? handleMegaInput(e.target.value) : handleEthInput(e.target.value)}
              placeholder="0.0"
              className="bg-transparent outline-none w-1/2"
            />
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-400">{tab === 'buy' ? 'MEGA to receive' : 'ETH to receive'}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2 w-full">
            {SLIPPAGE_OPTIONS.map(opt => (
              <button
                key={opt}
                className={`px-3 py-1 rounded-full border ${slippage === opt ? 'bg-yellow-400 text-white border-yellow-400' : 'bg-[#181E33] text-gray-300 border-[#232B45]'}`}
                onClick={() => { setSlippage(opt); setCustomSlippage(''); }}
              >{opt}%</button>
            ))}
            <input
              type="number"
              min={0}
              step={0.1}
              placeholder="Custom"
              className={`w-20 px-2 py-1 rounded-full border ${slippage === Number(customSlippage) && slippage > 0 ? 'bg-yellow-400 text-white border-yellow-400' : 'bg-[#181E33] text-gray-300 border-[#232B45]'}`}
              value={customSlippage}
              onChange={e => {
                const val = e.target.value;
                setCustomSlippage(val);
                const num = Number(val);
                if (!isNaN(num) && num > 0) setSlippage(num);
              }}
              onFocus={() => setCustomSlippage('')}
            />
            <span className="ml-2 text-xs text-gray-400 whitespace-nowrap">Slippage</span>
          </div>
        </div>
        <div className="bg-bg-card-alt rounded-lg p-4 flex flex-col gap-2">
          <span className="text-sm font-bold text-white mb-2">Estimates</span>
          <div className="flex justify-between items-center">
            <span className="text-gray-light">Est. tickets:</span>
            <span className="font-mono text-white">
              {tab === 'buy' && ethAmount && !isNaN(Number(ethAmount)) ? Math.floor(Number(ethAmount) * 10) : '0'}
            </span>
          </div>
        </div>
        <button
          className="w-full py-3 mt-2 rounded-lg bg-yellow-400 text-white font-bold text-lg hover:bg-yellow-300 transition disabled:opacity-60"
          disabled={
            !inputIsValid ||
            txState === 'loading' ||
            (tab === 'buy' && (isBuySimLoading || isBuyPending || isBuyTxLoading)) ||
            (tab === 'sell' && (isSellSimLoading || isSellPending || isSellTxLoading))
          }
          onClick={tab === 'buy' ? handleBuy : handleSell}
        >
          {txState === 'loading' ? (
            <span className="flex items-center justify-center"><LoadingSpinner />Processing...</span>
          ) : tab === 'buy' ? 'Buy MEGA Tokens' : 'Sell MEGA Tokens'}
        </button>
        {txState === 'error' && txError && (
          <div className="text-red-500 text-sm mt-1">{txError}</div>
        )}
        {txState === 'success' && (
          <div className="text-green-500 text-sm mt-1">Transaction successful!</div>
        )}
        {/* Freeze Button and Status */}
        <button
          className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition disabled:opacity-60"
          disabled={freezeDisabled}
          onClick={handleFreeze}
        >
          {freezeState === 'loading' || isFreezeTxLoading ? (
            <span className="flex items-center justify-center"><LoadingSpinner />Processing...</span>
          ) : freezeLabel}
        </button>
        {/* Do not show the generic freezeMsg error, only show contract revert reasons below */}
        {!isFrozen && isFreezeSimError && freezeSimError && (
          <div className="text-red-500 text-sm mt-1">
            {freezeSimError.message.includes('Game not active') 
              ? 'Game has ended - freezing is no longer available'
              : freezeSimError.message.includes('reverted with the following reason:')
                ? freezeSimError.message.split('reverted with the following reason:')[1]?.split('Contract Call:')[0]?.trim() || 'Transaction failed'
                : 'Transaction failed'
            }
          </div>
        )}
        {freezeState === 'success' && (
          <div className="text-green-500 text-sm mt-1">Freeze transaction successful!</div>
        )}
      </div>
    </DashboardCard>
  );
} 