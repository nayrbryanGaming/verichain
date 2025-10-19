/* === VeriChain v0.1 ===
   Blockchain Verification Portal MVP
   By: VeriChain Team
*/

let provider;
let signer;
let contract;

// Ganti ini nanti dengan address smart contract kamu setelah deploy:
const CONTRACT_ADDRESS = "0xc4C935E68ccd354E4a708AF16FB24Bc0aD699759";

// ABI minimal untuk komunikasi smart contract (nanti dari Verichain.sol)
const CONTRACT_ABI = [
  "function verifyData(bytes32 hash) public returns (bool)",
  "function isVerified(bytes32 hash) public view returns (bool)"
];

const connectWalletBtn = document.getElementById("connectWallet");
const walletAddressP = document.getElementById("walletAddress");
const verifyBtn = document.getElementById("verifyBtn");
const fileInput = document.getElementById("fileInput");
const resultP = document.getElementById("result");
const verificationList = document.getElementById("verificationList");

// === 1️⃣ Connect Wallet ===
connectWalletBtn.addEventListener("click", async () => {
  try {
    if (!window.ethereum) {
      alert("MetaMask not detected! Please install it first.");
      return;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    const address = await signer.getAddress();

    walletAddressP.textContent = Connected: ${address};
    connectWalletBtn.textContent = "✅ Connected";
    connectWalletBtn.disabled = true;

    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  } catch (err) {
    console.error(err);
    alert("Failed to connect wallet!");
  }
});

// === 2️⃣ Verify File On-Chain ===
verifyBtn.addEventListener("click", async () => {
  if (!contract) {
    alert("Connect your wallet first!");
    return;
  }

  const file = fileInput.files[0];
  if (!file) {
    alert("Please choose a file first!");
    return;
  }

  // Hash file content (off-chain)
  const fileBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", fileBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = "0x" + hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  resultP.textContent = "Hash generated: " + hashHex;

  try {
    // Call smart contract to verify hash
    const tx = await contract.verifyData(hashHex);
    resultP.textContent = "⏳ Sending to blockchain...";
    await tx.wait();

    // Check verification status
    const verified = await contract.isVerified(hashHex);
    if (verified) {
      resultP.textContent = "✅ Verified successfully on-chain!";
      addRecord(hashHex);
    } else {
      resultP.textContent = "❌ Verification failed.";
    }
  } catch (err) {
    console.error(err);
    resultP.textContent = "⚠ Transaction failed.";
  }
});

// === 3️⃣ Display record on page ===
function addRecord(hash) {
  const li = document.createElement("li");
  li.textContent = hash;
  verificationList.prepend(li);
}
