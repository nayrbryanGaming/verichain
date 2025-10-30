/* === VeriChain v0.1 ===
   Blockchain Verification Portal MVP
   By: VeriChain Team
*/

// Global web3 / contract state
let provider;
let signer;
let contract;

// Web3Modal instance
let web3Modal;

// Shared DOM element references
let connectWalletBtn, walletAddressP, verifyBtn, fileInput, resultP, verificationList;

// Supported networks and contract addresses (global so multiple functions can access)
const SUPPORTED_NETWORKS = {
  '0x2cf': { // Polygon AMOY (719)
    name: 'Polygon AMOY',
    contractAddress: '0xb52d8e7060a868ee4f98f3ca9eed420e7d1d1657',
    rpcUrl: 'https://rpc.amoy.dim.market',
    symbol: 'AMOY',
    explorer: 'https://www.oklink.com/amoy'
  },
  '0x13881': { // Mumbai (80001)
    name: 'Polygon Mumbai',
    contractAddress: '0xb52d8e7060a868ee4f98f3ca9eed420e7d1d1657',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    symbol: 'MATIC',
    explorer: 'https://mumbai.polygonscan.com'
  },
  '0x1': { // Ethereum Mainnet
    name: 'Ethereum Mainnet',
    contractAddress: '0xb52d8e7060a868ee4f98f3ca9eed420e7d1d1657',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
    symbol: 'ETH',
    explorer: 'https://etherscan.io'
  },
  '0x5': { // Goerli
    name: 'Goerli Testnet',
    contractAddress: '0xb52d8e7060a868ee4f98f3ca9eed420e7d1d1657',
    rpcUrl: 'https://eth-goerli.g.alchemy.com/v2/your-api-key',
    symbol: 'ETH',
    explorer: 'https://goerli.etherscan.io'
  },
  '0x38': { // BSC Mainnet
    name: 'BNB Smart Chain',
    contractAddress: '0xb52d8e7060a868ee4f98f3ca9eed420e7d1d1657',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    symbol: 'BNB',
    explorer: 'https://bscscan.com'
  },
  '0x61': { // BSC Testnet
    name: 'BSC Testnet',
    contractAddress: '0xb52d8e7060a868ee4f98f3ca9eed420e7d1d1657',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    symbol: 'tBNB',
    explorer: 'https://testnet.bscscan.com'
  },
  '0xa86a': { // Avalanche
    name: 'Avalanche',
    contractAddress: '0xb52d8e7060a868ee4f98f3ca9eed420e7d1d1657',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    symbol: 'AVAX',
    explorer: 'https://snowtrace.io'
  },
  '0xfa': { // Fantom
    name: 'Fantom Opera',
    contractAddress: '0xb52d8e7060a868ee4f98f3ca9eed420e7d1d1657',
    rpcUrl: 'https://rpc.ftm.tools',
    symbol: 'FTM',
    explorer: 'https://ftmscan.com'
  },
  '0x89': { // Polygon Mainnet (137)
    name: 'Polygon Mainnet',
    contractAddress: '0xb52d8e7060a868ee4f98f3ca9eed420e7d1d1657',
    rpcUrl: 'https://polygon-rpc.com',
    symbol: 'MATIC',
    explorer: 'https://polygonscan.com'
  }
};

// ABI for Verichain.sol contract (global)
const CONTRACT_ABI = [
  "function verifyContent(string calldata _contentHash, string calldata _note) external",
  "function isVerified(string calldata _contentHash) external view returns (bool)",
  "function getVerification(string calldata _contentHash) external view returns (address verifier, uint256 timestamp, string memory note)",
  "function getAllVerified() external view returns (string[] memory)",
  "event Verified(address indexed verifier, string contentHash, uint256 timestamp, string note)"
];

// Initialize Web3Modal with provider icons and options
window.addEventListener('DOMContentLoaded', async () => {
  try {
    if (typeof Web3Modal === 'undefined') {
      console.error('Web3Modal not found — make sure you include it in index.html');
      return;
    }

    web3Modal = new Web3Modal({
      cacheProvider: false,
      disableInjectedProvider: false,
      providerOptions: {
        injected: {
          package: null,
          display: {
            name: 'MetaMask / Injected',
            description: 'Connect using browser wallet (MetaMask, Brave, etc.)',
            // Local file placed in frontend/
            logo: './metamask-fox.svg'
          }
        },
        walletconnect: {
          package: WalletConnectProvider,
          display: {
            name: 'WalletConnect',
            description: 'Scan with WalletConnect-compatible mobile wallet',
            logo: './walletconnect.svg'
          },
          options: {
            rpc: {
              719: 'https://rpc.amoy.dim.market',
              80001: 'https://rpc-mumbai.maticvigil.com',
              137: 'https://polygon-rpc.com',
              56: 'https://bsc-dataseed.binance.org',
              97: 'https://data-seed-prebsc-1-s1.binance.org:8545',
              43114: 'https://api.avax.network/ext/bc/C/rpc',
              250: 'https://rpc.ftm.tools'
            }
          }
        }
      }
    });

    // Setup UI
    initializeEventListeners();
    console.log('Web3Modal initialized');
  } catch (err) {
    console.error('Failed to initialize Web3Modal', err);
  }
});

// Setup DOM references and attach basic listeners
function initializeEventListeners() {
  connectWalletBtn = document.getElementById('connectWallet');
  walletAddressP = document.getElementById('walletAddress');
  verifyBtn = document.getElementById('verifyBtn');
  fileInput = document.getElementById('fileInput');
  resultP = document.getElementById('result');
  verificationList = document.getElementById('verificationList');

  if (!connectWalletBtn) console.warn('connectWallet button not found');
  if (!verifyBtn) console.warn('verifyBtn not found');
  if (!fileInput) console.warn('fileInput not found');

  // Attach handlers
  if (connectWalletBtn) connectWalletBtn.addEventListener('click', handleConnectFlow);
  if (fileInput) fileInput.addEventListener('change', handleFileSelect);
  if (verifyBtn) verifyBtn.addEventListener('click', handleVerifyClick);

  // initial state
  if (verifyBtn) verifyBtn.disabled = true;
}

// Handle the connect flow (opens Web3Modal)
async function handleConnectFlow() {
  try {
    if (!web3Modal) throw new Error('Web3Modal not initialized');

    if (connectWalletBtn) {
      connectWalletBtn.textContent = '⌛ Connecting...';
      connectWalletBtn.disabled = true;
    }

    // open modal and connect
    provider = await web3Modal.connect();

    // Use ethers provider
    if (typeof ethers === 'undefined') throw new Error('Ethers not found');
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    const address = await signer.getAddress();

    if (walletAddressP) walletAddressP.textContent = `Connected: ${address}`;
    if (connectWalletBtn) {
      connectWalletBtn.textContent = '✅ Connected';
      connectWalletBtn.disabled = true;
    }

    // check network
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const network = SUPPORTED_NETWORKS[chainId];
    if (!network) {
      alert('Unsupported network — please switch to a supported chain');
      return;
    }

    // create contract instance
    contract = new ethers.Contract(network.contractAddress, CONTRACT_ABI, signer);

    // Wire up account & chain change handlers
    if (window.ethereum && window.ethereum.on) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts && accounts.length) {
          if (walletAddressP) walletAddressP.textContent = `Connected: ${accounts[0]}`;
        } else {
          if (walletAddressP) walletAddressP.textContent = 'No wallet connected';
          if (connectWalletBtn) {
            connectWalletBtn.textContent = '🦊 Connect Wallet';
            connectWalletBtn.disabled = false;
          }
          contract = null;
        }
      });

      window.ethereum.on('chainChanged', () => {
        // reload recommended by MetaMask
        window.location.reload();
      });
    }

  } catch (err) {
    console.error('Connect error', err);
    if (connectWalletBtn) {
      connectWalletBtn.textContent = '🦊 Connect Wallet';
      connectWalletBtn.disabled = false;
    }
    alert(err.message || 'Failed to connect');
  }
}

// File selection handler
function handleFileSelect(event) {
  const file = event.target && event.target.files && event.target.files[0];
  if (file && verifyBtn) verifyBtn.disabled = false;
}

// Verify click — hashes file and sends transaction
async function handleVerifyClick() {
  try {
    if (!contract) {
      alert('Please connect your wallet first!');
      return;
    }

    if (!fileInput || !fileInput.files || !fileInput.files.length) {
      alert('Please choose a file first!');
      return;
    }

    const file = fileInput.files[0];
    if (verifyBtn) {
      verifyBtn.disabled = true;
      verifyBtn.textContent = '⌛ Processing...';
    }
    if (resultP) resultP.textContent = '⌛ Generating hash...';

    const fileBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (resultP) resultP.textContent = '📝 Hash generated: ' + hashHex;

    const isAlreadyVerified = await contract.isVerified(hashHex);
    if (isAlreadyVerified) {
      if (resultP) resultP.textContent = 'ℹ️ This file was already verified on-chain!';
      const verification = await contract.getVerification(hashHex);
      const verifiedDate = new Date(verification.timestamp * 1000).toLocaleString();
      addRecord(hashHex, verification.verifier, verifiedDate, verification.note);
      return;
    }

    const note = `File: ${file.name} | Size: ${file.size} bytes | Type: ${file.type || 'unknown'}`;
    if (resultP) resultP.textContent = '⏳ Sending to blockchain...';

    const tx = await contract.verifyContent(hashHex, note);
    if (resultP) resultP.textContent = '⏳ Waiting for confirmation...';
    const receipt = await tx.wait();
    console.log('Receipt', receipt);

    const verifiedEvent = receipt.events && receipt.events.find(e => e.event === 'Verified');
    if (verifiedEvent) {
      if (resultP) resultP.textContent = '✅ Verified successfully on-chain!';
      const [verifier, contentHash, timestamp, noteFromEvent] = verifiedEvent.args;
      const verifiedDate = new Date(timestamp * 1000).toLocaleString();
      addRecord(contentHash, verifier, verifiedDate, noteFromEvent);
    } else {
      if (resultP) resultP.textContent = '❌ Verification failed - no event emitted';
    }

  } catch (err) {
    console.error('Verification error', err);
    if (resultP) resultP.textContent = `⚠️ Error: ${err.message || 'Transaction failed'}`;
  } finally {
    if (verifyBtn) {
      verifyBtn.disabled = false;
      verifyBtn.textContent = 'Verify On-Chain';
    }
  }
}

// Add a verification record to the list
function addRecord(hash, verifier, timestamp, note) {
  if (!verificationList) return;
  const li = document.createElement('li');
  li.className = 'verification-record';

  const truncatedHash = (hash || '').substring(0, 10) + '...' + (hash || '').slice(-8);
  const truncatedAddress = (verifier || '').substring(0, 6) + '...' + (verifier || '').slice(-4);

  li.innerHTML = `
    <div class="record-header">
      <span class="hash" title="Full hash: ${hash}">🔐 ${truncatedHash}</span>
      <span class="verifier" title="Verified by: ${verifier}">👤 ${truncatedAddress}</span>
    </div>
    <div class="record-details">
      <span class="timestamp">🕒 ${timestamp}</span>
      <span class="note">📝 ${note}</span>
    </div>
  `;

  li.title = 'Click to view on block explorer';
  li.style.cursor = 'pointer';

  const chainId = (window.ethereum && window.ethereum.chainId) || null;
  const network = chainId ? SUPPORTED_NETWORKS[chainId] : null;
  if (network && network.explorer) {
    li.onclick = () => window.open(`${network.explorer}/tx/${hash}`, '_blank');
  }

  verificationList.prepend(li);
}

// End of file
/* === VeriChain v0.1 ===
   Blockchain Verification Portal MVP
   By: VeriChain Team
*/

let provider;
let signer;
let contract;

// Initialize Web3Modal
let web3Modal;

// Shared DOM element references (declared once to avoid redeclaration errors)
let connectWalletBtn, walletAddressP, verifyBtn, fileInput, resultP, verificationList;

// Supported networks and contract addresses (global so multiple functions can access)
const SUPPORTED_NETWORKS = {
  '0x2cf': { // Polygon AMOY (719)
    name: 'Polygon AMOY',
    contractAddress: '0xb52d8e7060a868ee4f98f3ca9eed420e7d1d1657',
    rpcUrl: 'https://rpc.amoy.dim.market',
    symbol: 'AMOY',
    explorer: 'https://www.oklink.com/amoy'
  },
  '0x13881': { // Mumbai (80001)
    name: 'Polygon Mumbai',
    contractAddress: '0xb52d8e7060a868ee4f98f3ca9eed420e7d1d1657',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    symbol: 'MATIC',
    explorer: 'https://mumbai.polygonscan.com'
  },
  '0x1': { // Ethereum Mainnet
    name: 'Ethereum Mainnet',
    contractAddress: '0xb52d8e7060a868ee4f98f3ca9eed420e7d1d1657',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
    symbol: 'ETH',
    explorer: 'https://etherscan.io'
  },
  '0x5': { // Goerli
    name: 'Goerli Testnet',
    contractAddress: '0xb52d8e7060a868ee4f98f3ca9eed420e7d1d1657',
    rpcUrl: 'https://eth-goerli.g.alchemy.com/v2/your-api-key',
    symbol: 'ETH',
    explorer: 'https://goerli.etherscan.io'
  },
  '0x38': { // BSC Mainnet
    name: 'BNB Smart Chain',
    contractAddress: '0xb52d8e7060a868ee4f98f3ca9eed420e7d1d1657',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    symbol: 'BNB',
    explorer: 'https://bscscan.com'
  },
  '0x61': { // BSC Testnet
    name: 'BSC Testnet',
    contractAddress: '0xb52d8e7060a868ee4f98f3ca9eed420e7d1d1657',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    symbol: 'tBNB',
    explorer: 'https://testnet.bscscan.com'
  },
  '0xa86a': { // Avalanche
    name: 'Avalanche',
    contractAddress: '0xb52d8e7060a868ee4f98f3ca9eed420e7d1d1657',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    symbol: 'AVAX',
    explorer: 'https://snowtrace.io'
  },
  '0xfa': { // Fantom
    name: 'Fantom Opera',
    contractAddress: '0xb52d8e7060a868ee4f98f3ca9eed420e7d1d1657',
    rpcUrl: 'https://rpc.ftm.tools',
    symbol: 'FTM',
    explorer: 'https://ftmscan.com'
  },
  '0x89': { // Polygon Mainnet (137)
    name: 'Polygon Mainnet',
    contractAddress: '0xb52d8e7060a868ee4f98f3ca9eed420e7d1d1657',
    rpcUrl: 'https://polygon-rpc.com',
    symbol: 'MATIC',
    explorer: 'https://polygonscan.com'
  }
};

// ABI for Verichain.sol contract (global)
const CONTRACT_ABI = [
    "function verifyContent(string calldata _contentHash, string calldata _note) external",
    "function isVerified(string calldata _contentHash) external view returns (bool)",
    "function getVerification(string calldata _contentHash) external view returns (address verifier, uint256 timestamp, string memory note)",
    "function getAllVerified() external view returns (string[] memory)",
    "event Verified(address indexed verifier, string contentHash, uint256 timestamp, string note)"
];

// Initialize Web3Modal with required providers
window.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log("Initializing Web3Modal...");
    
    // Check if Web3Modal is available
    if (typeof Web3Modal === 'undefined') {
      throw new Error("Web3Modal is not loaded. Check your internet connection.");
    }

    // Initialize Web3Modal
    web3Modal = new Web3Modal({
      cacheProvider: false, // Changed to false to prevent auto-connect issues
      disableInjectedProvider: false,
      // Add providerOptions with display logos so the modal shows icons for wallets
      providerOptions: {
        injected: {
          package: null,
          display: {
            name: 'MetaMask / Injected',
            description: 'Connect using browser wallet (MetaMask, Brave, etc.)',
            // Using local logo files from the frontend folder
            logo: './metamask-fox.svg'
          }
        },
        walletconnect: {
          package: WalletConnectProvider,
          display: {
            name: 'WalletConnect',
            description: 'Scan with WalletConnect-compatible mobile wallet',
            logo: './walletconnect.svg'
          },
          options: {
            rpc: {
              719: 'https://rpc.amoy.dim.market',
              80001: 'https://rpc-mumbai.maticvigil.com',
              137: 'https://polygon-rpc.com',
              56: 'https://bsc-dataseed.binance.org',
              97: 'https://data-seed-prebsc-1-s1.binance.org:8545',
              43114: 'https://api.avax.network/ext/bc/C/rpc',
              250: 'https://rpc.ftm.tools'
            }
          }
        }
      }
    });
    
    // Initialize UI event listeners
    initializeEventListeners();
    
    console.log("Web3Modal initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Web3Modal:", error);
    alert("Failed to initialize Web3Modal. Please check console for details.");
  }
});

// Initialize all event listeners
function initializeEventListeners() {
  console.log("Setting up event listeners...");

  // Connect wallet button
  connectWalletBtn = document.getElementById("connectWallet");
  if (connectWalletBtn) {
    // click handler for connect is set later where the main connection flow is implemented
    console.log("Connect wallet button found");
  } else {
    console.error("Connect wallet button not found!");
  }

  // Verify button
    // Get references to DOM elements
    resultP = document.getElementById("result");
    verificationList = document.getElementById("verificationList");
  
    if (!resultP) {
      console.error("Result paragraph not found");
    }
    if (!verificationList) {
      console.error("Verification list not found");
    }
  
    // Setup button states
    verifyBtn = document.getElementById("verifyBtn");
    if (verifyBtn) {
      verifyBtn.disabled = true;
    }

    // Setup file input validation
    fileInput = document.getElementById("fileInput");
    if (fileInput) {
      fileInput.onchange = function() {
        if (verifyBtn) {
          verifyBtn.disabled = !this.files.length;
        }
      };
    }

  // File input
  fileInput = fileInput || document.getElementById("fileInput");
  if (fileInput) {
    fileInput.addEventListener("change", handleFileSelect);
    console.log("File input listener added");
  } else {
    console.error("File input not found!");
  }
}

// Handle wallet connection
async function handleConnect() {
  try {
    console.log("Attempting to connect wallet...");
    const connectWalletBtn = document.getElementById("connectWallet");
    const walletAddressP = document.getElementById("walletAddress");

    if (!web3Modal) {
      throw new Error("Web3Modal not initialized!");
    }

    connectWalletBtn.textContent = "⌛ Connecting...";
    connectWalletBtn.disabled = true;
    

connectWalletBtn = connectWalletBtn || document.getElementById("connectWallet");
walletAddressP = walletAddressP || document.getElementById("walletAddress");
verifyBtn = verifyBtn || document.getElementById("verifyBtn");
if (!verifyBtn) console.error("Verify button not found!");

fileInput = fileInput || document.getElementById("fileInput");
if (!fileInput) console.error("File input not found!");

resultP = resultP || document.getElementById("result");
if (!resultP) console.error("Result paragraph not found!");

verificationList = verificationList || document.getElementById("verificationList");
if (!verificationList) console.error("Verification list not found!");

// Add event listeners
if (verifyBtn) verifyBtn.addEventListener("click", handleVerifyClick);
if (fileInput) fileInput.addEventListener("change", handleFileSelect);

// === 1️⃣ Connect Wallet ===
// Function to switch network
async function switchNetwork(chainId) {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainId }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      const network = SUPPORTED_NETWORKS[chainId];
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: chainId,
              chainName: network.name,
              nativeCurrency: {
                name: network.symbol,
                symbol: network.symbol,
                decimals: 18
              },
                // (connection handled by the connect button listener further down)

connectWalletBtn.addEventListener("click", async () => {
  try {
    connectWalletBtn.textContent = "⌛ Connecting...";
    
    try {
      provider = await web3Modal.connect();
    } catch (e) {
      throw new Error("Please select a wallet to connect");
    }

    // Check if network is supported
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log("Current chain ID:", chainId);
    
    const network = SUPPORTED_NETWORKS[chainId];
    if (!network) {
      const networkNames = Object.values(SUPPORTED_NETWORKS).map(n => n.name).join(', ');
      throw new Error(`Unsupported network. Please switch to one of: ${networkNames}`);
    }
    
    if (!network.contractAddress) {
      throw new Error(`Contract not yet deployed on ${network.name}. Please switch to another network.`);
    }

    // Check if ethers is loaded
    if (typeof ethers === 'undefined') {
      throw new Error("Ethers library not loaded. Please check your internet connection.");
    }

    provider = new ethers.providers.Web3Provider(window.ethereum);
    console.log("Requesting accounts...");
    const accounts = await provider.send("eth_requestAccounts", []);
    console.log("Got accounts:", accounts);
    
    signer = provider.getSigner();
    const address = await signer.getAddress();
    console.log("Connected address:", address);

  walletAddressP.textContent = `Connected: ${address}`;
  connectWalletBtn.textContent = "✅ Connected";
  connectWalletBtn.disabled = true;

    // Use the existing network object to create contract
    contract = new ethers.Contract(network.contractAddress, CONTRACT_ABI, signer);
    // Listen for account / chain changes and update UI
    if (window.ethereum && window.ethereum.on) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length) {
          walletAddressP.textContent = `Connected: ${accounts[0]}`;
        } else {
          walletAddressP.textContent = 'No wallet connected';
          connectWalletBtn.textContent = '🦊 Connect Wallet';
          connectWalletBtn.disabled = false;
          contract = null;
        }
      });

      window.ethereum.on('chainChanged', (_chainId) => {
        // Recommended by MetaMask: reload the page on chain change
        window.location.reload();
      });
    }
  } catch (err) {
    console.error("Connection error:", err);
    connectWalletBtn.textContent = "🦊 Connect Wallet";
    connectWalletBtn.disabled = false;
    
    // Show specific error message
    if (err.code === 4001) {
      alert("Connection rejected. Please approve the connection in MetaMask.");
    } else if (err.message) {
      alert(err.message);
    } else {
      alert("Failed to connect wallet. Check console for details.");
    }
  }
});

// === 2️⃣ Verify File On-Chain ===
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file && verifyBtn) {
    verifyBtn.disabled = false;
  }
}

async function handleVerifyClick() {
  try {
    if (!contract) {
      alert("Please connect your wallet first!");
      return;
    }

    if (!fileInput || !fileInput.files || !fileInput.files.length) {
      alert("Please choose a file first!");
      return;
    }

    const file = fileInput.files[0];
    verifyBtn.disabled = true;
    verifyBtn.textContent = "⌛ Processing...";
    resultP.textContent = "⌛ Generating hash...";

    // Hash file content (off-chain)
    const fileBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", fileBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    resultP.textContent = "📝 Hash generated: " + hashHex;

    // First check if already verified
    const isAlreadyVerified = await contract.isVerified(hashHex);
    if (isAlreadyVerified) {
      resultP.textContent = "ℹ️ This file was already verified on-chain!";
      const verification = await contract.getVerification(hashHex);
      const verifiedDate = new Date(verification.timestamp * 1000).toLocaleString();
      addRecord(hashHex, verification.verifier, verifiedDate, verification.note);
      return;
    }

    // Prepare verification note
    const note = `File: ${file.name} | Size: ${file.size} bytes | Type: ${file.type || 'unknown'}`;
    
    resultP.textContent = "⏳ Sending to blockchain...";
    
    // Call smart contract to verify content
    const tx = await contract.verifyContent(hashHex, note);
    resultP.textContent = "⏳ Waiting for confirmation...";
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log("Transaction receipt:", receipt);

    // Find the Verified event from the receipt
    const verifiedEvent = receipt.events.find(e => e.event === "Verified");
    if (verifiedEvent) {
      resultP.textContent = "✅ Verified successfully on-chain!";
      const [verifier, contentHash, timestamp, noteFromEvent] = verifiedEvent.args;
      const verifiedDate = new Date(timestamp * 1000).toLocaleString();
      addRecord(contentHash, verifier, verifiedDate, noteFromEvent);
    } else {
      resultP.textContent = "❌ Verification failed - no event emitted";
    }
  } catch (err) {
    console.error("Verification error:", err);
    resultP.textContent = `⚠️ Error: ${err.message || "Transaction failed"}`;
  } finally {
    if (verifyBtn) {
      verifyBtn.disabled = false;
      verifyBtn.textContent = "Verify On-Chain";
    }
  }
}

// === 3️⃣ Display record on page ===
function addRecord(hash, verifier, timestamp, note) {
  const li = document.createElement("li");
  li.className = "verification-record";
  
  const truncatedHash = hash.substring(0, 10) + "..." + hash.substring(hash.length - 8);
  const truncatedAddress = verifier.substring(0, 6) + "..." + verifier.substring(verifier.length - 4);
  
  li.innerHTML = `
    <div class="record-header">
      <span class="hash" title="Full hash: ${hash}">🔐 ${truncatedHash}</span>
      <span class="verifier" title="Verified by: ${verifier}">👤 ${truncatedAddress}</span>
    </div>
    <div class="record-details">
      <span class="timestamp">🕒 ${timestamp}</span>
      <span class="note">📝 ${note}</span>
    </div>
  `;
  
  li.title = `Click to view on block explorer`;
  li.style.cursor = "pointer";
  
  // Get current network to determine block explorer
  const chainId = window.ethereum.chainId;
  const network = SUPPORTED_NETWORKS[chainId];
  if (network && network.explorer) {
    li.onclick = () => {
      window.open(`${network.explorer}/tx/${hash}`, '_blank');
    };
  }
  
  verificationList.prepend(li);
}
