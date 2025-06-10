const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// ===== CONFIGURATION =====
const CONFIG = {
    // RPC endpoint for Sepolia
    RPC_URL: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY', // Replace with your RPC
    
    // Contract details (will be loaded from mega-ui/contracts/)
    CONTRACT_ADDRESS: '', // Will be loaded automatically
    
    // Timing
    INTERVAL_MINUTES: 60, // Run every 60 minutes
    
    // Your 30 wallet addresses and private keys
    WALLETS: [
        // Replace these with your actual 30 wallet addresses and private keys
        { address: '0x...', privateKey: '0x...' },
        { address: '0x...', privateKey: '0x...' },
        { address: '0x...', privateKey: '0x...' },
        // ... add all 30 wallets here
        // Example format:
        // { address: '0x1234567890123456789012345678901234567890', privateKey: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890' },
    ]
};

// ===== GLOBAL VARIABLES =====
let provider;
let contract;
let currentWalletIndex = 0;
let contractABI;
let isRunning = false;

// ===== INITIALIZATION =====
async function initialize() {
    try {
        console.log('🚀 MEGA Freeze Automation Starting...');
        console.log(`📅 Will run every ${CONFIG.INTERVAL_MINUTES} minutes`);
        console.log(`👥 Using ${CONFIG.WALLETS.length} wallet addresses`);
        
        // Load contract address and ABI from mega-ui files
        const contractInfoPath = path.join(__dirname, 'contracts', 'mega.ts');
        const abiPath = path.join(__dirname, 'contracts', 'MEGA_ABI.json');
        
        // Read contract address from mega.ts
        const contractFile = fs.readFileSync(contractInfoPath, 'utf8');
        const addressMatch = contractFile.match(/MEGA_CONTRACT_ADDRESS = '(0x[a-fA-F0-9]+)'/);
        if (!addressMatch) {
            throw new Error('Could not find contract address in mega.ts');
        }
        CONFIG.CONTRACT_ADDRESS = addressMatch[1];
        
        // Read ABI
        contractABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
        
        console.log(`📄 Contract Address: ${CONFIG.CONTRACT_ADDRESS}`);
        
        // Setup provider
        provider = new ethers.providers.JsonRpcProvider(CONFIG.RPC_URL);
        
        // Test connection
        const network = await provider.getNetwork();
        console.log(`🌐 Connected to network: ${network.name} (chainId: ${network.chainId})`);
        
        // Validate wallets
        if (CONFIG.WALLETS.length === 0) {
            throw new Error('No wallets configured! Please add your 30 wallet addresses and private keys.');
        }
        
        console.log('✅ Initialization complete!\n');
        return true;
        
    } catch (error) {
        console.error('❌ Initialization failed:', error.message);
        return false;
    }
}

// ===== FREEZE FUNCTION =====
async function executeFreeze() {
    if (isRunning) {
        console.log('⏳ Previous freeze still running, skipping...');
        return;
    }
    
    isRunning = true;
    const startTime = new Date();
    
    try {
        // Get current wallet
        const wallet = CONFIG.WALLETS[currentWalletIndex];
        if (!wallet) {
            throw new Error(`Wallet at index ${currentWalletIndex} not found`);
        }
        
        console.log(`\n🎯 [${startTime.toISOString()}] Executing freeze...`);
        console.log(`👤 Using wallet ${currentWalletIndex + 1}/30: ${wallet.address}`);
        
        // Create signer
        const signer = new ethers.Wallet(wallet.privateKey, provider);
        
        // Create contract instance
        const megaContract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, contractABI, signer);
        
        // Check wallet balance
        const balance = await provider.getBalance(wallet.address);
        const balanceEth = ethers.utils.formatEther(balance);
        console.log(`💰 Wallet balance: ${balanceEth} ETH`);
        
        if (balance.lt(ethers.utils.parseEther('0.001'))) {
            console.log('⚠️ Warning: Low balance, transaction may fail');
        }
        
        // Execute freeze with gas estimation
        console.log('🧊 Calling freeze function...');
        const gasEstimate = await megaContract.estimateGas.freeze();
        const gasLimit = gasEstimate.mul(120).div(100); // Add 20% buffer
        
        const tx = await megaContract.freeze({
            gasLimit: gasLimit,
            // Add gas price for faster execution
            gasPrice: ethers.utils.parseUnits('20', 'gwei')
        });
        
        console.log(`📡 Transaction submitted: ${tx.hash}`);
        console.log('⏳ Waiting for confirmation...');
        
        const receipt = await tx.wait();
        
        console.log('✅ Freeze executed successfully!');
        console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
        console.log(`🎯 Block: ${receipt.blockNumber}`);
        
        // Move to next wallet
        currentWalletIndex = (currentWalletIndex + 1) % CONFIG.WALLETS.length;
        if (currentWalletIndex === 0) {
            console.log('🔄 Completed full cycle, starting over...');
        }
        
    } catch (error) {
        console.error('❌ Freeze execution failed:', error.message);
        
        // Still move to next wallet even on failure
        currentWalletIndex = (currentWalletIndex + 1) % CONFIG.WALLETS.length;
        
        // Log additional error details
        if (error.code) {
            console.error(`   Error code: ${error.code}`);
        }
        if (error.reason) {
            console.error(`   Reason: ${error.reason}`);
        }
    } finally {
        isRunning = false;
        const endTime = new Date();
        const duration = (endTime - startTime) / 1000;
        console.log(`⏱️ Execution completed in ${duration.toFixed(2)}s`);
        console.log(`⏰ Next execution at: ${new Date(Date.now() + CONFIG.INTERVAL_MINUTES * 60 * 1000).toISOString()}`);
    }
}

// ===== MANUAL TRIGGER SYSTEM =====
let automationInterval = null;
let isAutomationStarted = false;

async function startAutomation() {
    if (isAutomationStarted) {
        console.log('⚠️ Automation already started!');
        return;
    }
    
    console.log('🚀 Starting freeze automation from manual trigger...');
    
    // Execute the first freeze immediately
    await executeFreeze();
    
    // Set up interval for every 60 minutes from this point
    const intervalMs = CONFIG.INTERVAL_MINUTES * 60 * 1000;
    automationInterval = setInterval(executeFreeze, intervalMs);
    isAutomationStarted = true;
    
    console.log('✅ Automation is now running every 60 minutes!');
    console.log('🛑 Delete "trigger-freeze.txt" file to trigger manually again\n');
}

function watchForTrigger() {
    const triggerFile = path.join(__dirname, 'trigger-freeze.txt');
    
    // Check for trigger file every 5 seconds
    setInterval(() => {
        if (fs.existsSync(triggerFile)) {
            console.log('🎯 Manual trigger detected!');
            
            // Delete the trigger file
            fs.unlinkSync(triggerFile);
            
            // Reset automation if it was already running
            if (automationInterval) {
                clearInterval(automationInterval);
                automationInterval = null;
                isAutomationStarted = false;
                console.log('🔄 Resetting existing automation...');
            }
            
            // Start the automation
            startAutomation();
        }
    }, 5000);
    
    console.log('👀 Watching for manual trigger...');
    console.log('📝 To start automation: echo "START" > trigger-freeze.txt');
    console.log('🛑 Press Ctrl+C to stop the bot\n');
}

// ===== MAIN EXECUTION =====
async function main() {
    console.log('🎮 MEGA Freeze Automation Bot');
    console.log('==============================\n');
    
    // Initialize
    const initialized = await initialize();
    if (!initialized) {
        process.exit(1);
    }
    
    // Validate configuration
    if (CONFIG.WALLETS.length !== 30) {
        console.log(`⚠️ Warning: Expected 30 wallets, but found ${CONFIG.WALLETS.length}`);
    }
    
    if (CONFIG.RPC_URL.includes('YOUR_INFURA_KEY')) {
        console.error('❌ Please update CONFIG.RPC_URL with your actual RPC endpoint');
        process.exit(1);
    }
    
    // Start watching for manual trigger instead of running immediately
    console.log('⏳ Bot is ready and waiting for your manual trigger...');
    watchForTrigger();
}

// ===== ERROR HANDLING =====
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error);
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

// Start the bot
if (require.main === module) {
    main().catch((error) => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
} 