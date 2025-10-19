// ===================== VeriChain Frontend dApp =====================
// No backend, no .env — all user-side via MetaMask
// ===================================================================

// Alamat smart contract (ganti dengan alamat hasil deploy-mu nanti)
const CONTRACT_ADDRESS = "0xc4C935E68ccd354E4a708AF16FB24Bc0aD699759";

// ABI contract kamu (hasil compile dari Verichain.sol)
const CONTRACT_ABI = [
  {
    "inputs": [{ "internalType": "string", "name": "_data", "type": "string" }],
    "name": "verifyData",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getVerificationCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

let provider, signer, contract;

// ============================================
// Connect Wallet
// ============================================
async function connectWallet() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const address = await signer.getAddress();
      document.getElementById("walletAddress").innerText =
        `Connected: ${address.substring(0, 6)}...${address.slice(-4)}`;

      document.getElementById("status").innerText = "✅ Wallet connected!";
    } catch (err) {
      document.getElementById("status").innerText = `❌ ${err.message}`;
    }
  } else {
    alert("MetaMask not found! Install it first.");
  }
}

// ============================================
// Send Verification Data
// ============================================
async function verifyData() {
  const input = document.getElementById("dataInput").value.trim();
  if (!input) {
    alert("Please enter some data to verify.");
    return;
  }

  try {
    const tx = await contract.verifyData(input);
    document.getElementById("status").innerText = "⏳ Waiting for confirmation...";
    await tx.wait();
    document.getElementById("status").innerText = `✅ Verified! Tx Hash: ${tx.hash}`;
  } catch (err) {
    document.getElementById("status").innerText = `❌ ${err.message}`;
  }
}

// ============================================
// Get Total Verification Count
// ============================================
async function getVerificationCount() {
  try {
    const count = await contract.getVerificationCount();
    document.getElementById("count").innerText = `🔢 Total verifications: ${count}`;
  } catch (err) {
    document.getElementById("status").innerText = `❌ ${err.message}`;
  }
}

// ============================================
// Event Listeners
// ============================================
document.getElementById("connectBtn").addEventListener("click", connectWallet);
document.getElementById("verifyBtn").addEventListener("click", verifyData);
document.getElementById("countBtn").addEventListener("click", getVerificationCount);
