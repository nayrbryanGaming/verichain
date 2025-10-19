// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment of Verichain contract...");

  // Compile contract
  await hre.run("compile");

  // Get contract factory
  const Verichain = await hre.ethers.getContractFactory("Verichain");

  // Deploy contract
  const verichain = await Verichain.deploy();
  await verichain.waitForDeployment();

  console.log("✅ Verichain deployed successfully!");
  console.log(`📍 Contract Address: ${verichain.target}`);
  console.log(`🌐 Network: ${hre.network.name}`);
  console.log("💾 Save this address in your frontend config!");
}

// Run the deploy script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
