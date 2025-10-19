/* === VeriChain Backend Gateway v0.1 ===
   Server API untuk Verichain MVP
   Menghubungkan frontend dengan blockchain
*/

import express from "express";
import cors from "cors";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Load environment variables
const PORT = process.env.PORT || 5000;
const PRIVATE_KEY = process.env.PRIVATE_KEY; // wallet backend
const RPC_URL = process.env.RPC_URL; // RPC testnet (misal Sepolia)
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// ABI minimal dari Verichain.sol
const CONTRACT_ABI = [
  "function verifyData(bytes32 hash) public returns (bool)",
  "function isVerified(bytes32 hash) public view returns (bool)"
];

// Setup provider + wallet
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

// === ROUTES ===

// Root check
app.get("/", (req, res) => {
  res.send("✅ VeriChain Backend API is live");
});

// Verify data hash on-chain
app.post("/verify", async (req, res) => {
  try {
    const { hash } = req.body;
    if (!hash) return res.status(400).json({ error: "Missing hash" });

    const tx = await contract.verifyData(hash);
    await tx.wait();

    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Check verification status
app.get("/status/:hash", async (req, res) => {
  try {
    const { hash } = req.params;
    const verified = await contract.isVerified(hash);
    res.json({ hash, verified });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(🚀 VeriChain API running at http://localhost:${PORT});
});
