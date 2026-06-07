import { network } from "hardhat";

async function main() {
    const { viem } = await network.create();
    const [walletClient] = await viem.getWalletClients();

    console.log("Initializing production deployment with account:", walletClient.account.address);

    // Official Somnia Shannon Testnet Agent Platform Contract Registry Address
    const SOMNIA_PLATFORM_REGISTRY = "0x037Bb9C718F3f7fe5eCBDB0b600D607b52706776";

    // 1️⃣ RWA Vault
    console.log("Deploying RWA_IndexVault...");
    const vault = await viem.deployContract("RWA_IndexVault");
    console.log("➡️ RWA_VAULT_ADDRESS =", vault.address);

    // 2️⃣ ActionTaker (Needs Vault)
    console.log("Deploying ActionTaker...");
    const actionTaker = await viem.deployContract("ActionTaker", [vault.address]);
    console.log("➡️ ACTION_TAKER_ADDRESS =", actionTaker.address);

    // 3️⃣ RiskStrategist (Needs ActionTaker)
    console.log("Deploying RiskStrategist...");
    const riskStrategist = await viem.deployContract("RiskStrategist", [actionTaker.address]);
    console.log("➡️ RISK_STRATEGIST_ADDRESS =", riskStrategist.address);

    // 4️⃣ DataWatcher (Needs RiskStrategist and Somnia Registry Address)
    console.log("Deploying DataWatcherAgent...");
    const dataWatcher = await viem.deployContract("DataWatcherAgent", [
        riskStrategist.address,
        SOMNIA_PLATFORM_REGISTRY
    ]);
    console.log("➡️ DATA_WATCHER_ADDRESS =", dataWatcher.address);

    // 5️⃣ Bind Network Security Handshakes
    console.log("Configuring secure operational pathways...");
    await actionTaker.write.setRiskStrategist([riskStrategist.address]);
    await riskStrategist.write.setDataWatcher([dataWatcher.address]);

    console.log("✅ Production Multi-Agent Architecture successfully established on Somnia L1!");
}

main().catch(console.error);