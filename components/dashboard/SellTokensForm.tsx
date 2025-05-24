import React, { useState } from 'react';
import toast from 'react-hot-toast';
// import { useWriteContract } from 'wagmi' // Uncomment and configure for your contract

const SellTokensForm = () => {
  const [amount, setAmount] = useState('');
  // const { writeAsync, isLoading } = useWriteContract({ ... }) // Setup your contract write

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await writeAsync({ args: [amount] })
      toast.success('Transaction successful!');
    } catch (err: any) {
      if (err?.code === 'ACTION_REJECTED') {
        toast.error('Transaction was rejected by the user.');
      } else if (err?.reason) {
        toast.error(`Transaction failed: ${err.reason}`);
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-lg flex flex-col gap-2">
      <label className="text-gray-300">Amount (MEGA):</label>
      <input
        type="number"
        min="0"
        step="0.01"
        className="p-2 rounded bg-gray-700 text-white"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />
      <button type="submit" className="bg-red-600 text-white rounded p-2 mt-2 hover:bg-red-700">
        Sell MEGA
      </button>
    </form>
  );
};

export default SellTokensForm; 