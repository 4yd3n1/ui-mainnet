import { useContractRead, useContractWrite } from 'wagmi';
import { MEGA_ABI, MEGA_CONTRACT_ADDRESS } from '@/contracts/mega';
import type { MegaContract } from '@/types/contracts';

export const useMegaContract = () => {
  return {
    read: useContractRead,
    write: useContractWrite,
    address: MEGA_CONTRACT_ADDRESS,
    abi: MEGA_ABI,
  };
}; 