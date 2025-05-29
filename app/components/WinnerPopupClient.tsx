'use client';

import { useWinnerCheck } from '../hooks/useWinnerCheck';
import WinnerPopup from './WinnerPopup';

export default function WinnerPopupClient() {
  const { showPopup, setShowPopup, winnerInfo } = useWinnerCheck();

  if (!winnerInfo) return null;

  return (
    <WinnerPopup
      isOpen={showPopup}
      onClose={() => setShowPopup(false)}
      category={winnerInfo.category}
      amount={winnerInfo.amount}
    />
  );
} 