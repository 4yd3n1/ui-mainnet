# MEGA Game - Mainnet Deployment Guide

## 🚨 Pre-Deployment Checklist

### 1. **Audit & Security**
- [ ] Get smart contract audited by a reputable firm
- [ ] Run Slither/Mythril security analysis
- [ ] Test all edge cases on testnet
- [ ] Verify refund mechanism works correctly
- [ ] Test with multiple wallets and scenarios

### 2. **Financial Preparation**
- [ ] Ensure deployer wallet has sufficient ETH:
  - Contract deployment: ~0.5 ETH (gas)
  - Seed amount: 0.1 ETH (current contract amount)
  - Buffer for high gas prices: ~0.5 ETH
  - **Total needed: ~1.1+ ETH**
- [ ] Have backup wallet ready for emergencies

### 3. **Legal & Compliance**
- [ ] Review gambling/lottery laws in your jurisdiction
- [ ] Add proper disclaimers to UI
- [ ] Consider geo-blocking if needed
- [ ] Have Terms of Service ready

## 📝 Smart Contract Updates

### 1. **Update Game Parameters** (contracts/MEGA.sol)
```solidity
// Current Live Contract (matches deployed version):
uint256 public constant SEED_ETH = 0.1 ether;
uint256 public constant MARKETCAP_USD_CAP = 20_000 * 1e18;  // $20k
uint256 public constant GAME_DURATION = 1 hours;
uint256 public constant INITIAL_TOKENS = 1_000 * 1e18;  // 1K tokens
uint256 public constant QUALIFY_THRESHOLD = 0.1 ether;

// Production (Alternative - higher stakes):
// uint256 public constant SEED_ETH = 6 ether;  // Optional higher amount
// uint256 public constant MARKETCAP_USD_CAP = 500_000 * 1e18;  // Optional higher target
```

### 2. **Update Chainlink VRF Configuration**
```javascript
// hardhat.config.js - Add mainnet configuration
mainnet: {
  url: process.env.MAINNET_RPC_URL,
  accounts: [process.env.MAINNET_PRIVATE_KEY],
  gasPrice: 30000000000, // 30 gwei, adjust based on network
}
```

### 3. **Update Price Feed Address**
```solidity
// In constructor, change from Sepolia to Mainnet price feed:
// Sepolia: 0x694AA1769357215DE4FAC081bf1f309aDC325306
// Mainnet: 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
priceFeed = AggregatorV3Interface(0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419);
```

## 🔧 Deployment Script Updates

### 1. **Create Mainnet Deployment Script**
```bash
cp scripts/deploysepolia.js scripts/deployMainnet.js
```

### 2. **Update deployMainnet.js**
```javascript
// Update Chainlink VRF parameters for mainnet
const VRF_COORDINATOR = "0x271682DEB8C4E0901D1a1550aD2e64D568E69909"; // Mainnet V2
const GAS_LANE = "0x9fe0eebf5e446e3c998ec9bb19951541aee00bb90ea201ae456421a2ded86805"; // 1000 gwei
const SUBSCRIPTION_ID = process.env.MAINNET_SUBSCRIPTION_ID;
const CALLBACK_GAS_LIMIT = 2500000; // Higher for mainnet

// Update seed amount
const SEED_ETH = ethers.parseEther("0.1"); // Current contract amount
```

## 🌐 Frontend Updates

### 1. **Update wagmiConfig.ts**
```typescript
import { mainnet, sepolia } from 'wagmi/chains';

// Add mainnet configuration
export const config = createConfig({
  chains: process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? [mainnet] : [sepolia],
  transports: {
    [mainnet.id]: fallback([
      http(`https://mainnet.infura.io/v3/${INFURA_KEY}`, {
        batch: true,
      }),
      http('https://eth.llamarpc.com'), // Free high-performance RPC
      http('https://rpc.ankr.com/eth'), // Ankr public RPC
      http(), // Default fallbacks
    ]),
    [sepolia.id]: fallback([
      // ... existing sepolia config
    ]),
  },
  // ... rest of config
});
```

### 2. **Environment Variables**
Create `.env.production`:
```env
NEXT_PUBLIC_NETWORK=mainnet
NEXT_PUBLIC_MEGA_CONTRACT_ADDRESS=0x... # Your mainnet contract
NEXT_PUBLIC_INFURA_KEY=your_infura_key
```

### 3. **Update Contract Address Management**
```typescript
// contracts/mega.ts
const ADDRESSES = {
  mainnet: '0x...', // Will be set after deployment
  sepolia: '0x3dd00005a48E50326Ddd20935d7F4901cc7A32d8',
};

export const MEGA_CONTRACT_ADDRESS = 
  ADDRESSES[process.env.NEXT_PUBLIC_NETWORK as keyof typeof ADDRESSES] || 
  ADDRESSES.sepolia;
```

## 🚀 Deployment Process

### 1. **Set Up Mainnet Environment**
```bash
# .env (backend)
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
MAINNET_PRIVATE_KEY=your_mainnet_deployer_private_key
MAINNET_SUBSCRIPTION_ID=your_chainlink_mainnet_sub_id
```

### 2. **Deploy Contract**
```bash
# Deploy to mainnet
npx hardhat run scripts/deployMainnet.js --network mainnet

# Verify contract on Etherscan
npx hardhat verify --network mainnet CONTRACT_ADDRESS \
  VRF_COORDINATOR SUBSCRIPTION_ID GAS_LANE CALLBACK_GAS_LIMIT
```

### 3. **Update Frontend**
```bash
# Update contract address in frontend
cd ../mega-ui
# Update ADDRESSES object in contracts/mega.ts with new mainnet address

# Build for production
npm run build

# Deploy to your hosting service
```

## 🔒 Security Measures

### 1. **Multi-Signature Wallet**
Consider using a multi-sig for the owner address:
- Gnosis Safe: https://safe.global
- Deploy with multi-sig as owner

### 2. **Monitoring & Alerts**
- Set up Tenderly alerts for large transactions
- Monitor contract balance
- Track gas prices for distributions
- Set up Discord/Telegram alerts

### 3. **Emergency Plans**
- Have refund mechanism tested and ready
- Keep emergency contacts for Chainlink VRF
- Document all procedures for team

## 💰 Cost Estimates

### Mainnet Deployment Costs:
- Contract deployment: ~$200-500 (depending on gas)
- Chainlink VRF subscription: ~$100 initial funding
- Each VRF request: ~$2-5
- Distribution transactions: ~$50-200 each

### Ongoing Costs:
- RPC provider (Infura/Alchemy): $0-50/month
- Hosting: $20-100/month
- Monitoring services: $0-50/month

## 📋 Launch Checklist

### Pre-Launch (1 week before):
- [ ] Final testnet run with mainnet parameters
- [ ] Security audit completed
- [ ] Legal review completed
- [ ] Marketing materials ready
- [ ] Support channels set up

### Launch Day:
- [ ] Deploy contract during low gas period
- [ ] Verify on Etherscan
- [ ] Update all frontend references
- [ ] Test with small amounts first
- [ ] Monitor first few transactions closely
- [ ] Have team on standby

### Post-Launch:
- [ ] Monitor contract activity
- [ ] Respond to user issues quickly
- [ ] Be ready to enable refunds if needed
- [ ] Document any issues for future improvements

## 🆘 Emergency Contacts

- Chainlink VRF Support: https://discord.gg/chainlink
- Infura Status: https://status.infura.io
- Your audit firm contact: [Add here]
- Legal counsel: [Add here]

## 📝 Final Notes

1. **Test Everything**: Run through the entire game flow on mainnet with small amounts before marketing
2. **Gas Optimization**: Consider deploying during weekend/low activity periods
3. **Communication**: Have clear channels for user support
4. **Transparency**: Make contract verified and documentation public
5. **Gradual Launch**: Consider a soft launch with limited marketing first

---

Remember: Mainnet is permanent. Double-check everything, and when in doubt, test again on testnet! 