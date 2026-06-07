import { network } from "hardhat";

async function main() {
    // 🚀 Hardhat v3: Viem is now scoped to the network connection!
    const { viem } = await network.create();
    const [walletClient] = await viem.getWalletClients();

    console.log("Deploying with:", walletClient.account.address);

    // 1️⃣ RWA Vault (No dependencies)
    console.log("Deploying RWA_IndexVault...");
    const vault = await viem.deployContract("RWA_IndexVault");
    console.log("RWA_VAULT =", vault.address);

    // 2️⃣ ActionTaker (Needs Vault)
    console.log("Deploying ActionTaker...");
    const actionTaker = await viem.deployContract("ActionTaker", [vault.address]);
    console.log("ACTION_TAKER =", actionTaker.address);

    // 3️⃣ RiskStrategist (Needs ActionTaker)
    console.log("Deploying RiskStrategist...");
    const riskStrategist = await viem.deployContract("RiskStrategist", [actionTaker.address]);
    console.log("RISK_STRATEGIST =", riskStrategist.address);

    // 4️⃣ DataWatcher (Needs RiskStrategist)
    console.log("Deploying DataWatcherAgent...");
    const dataWatcher = await viem.deployContract("DataWatcherAgent", [riskStrategist.address]);
    console.log("DATA_WATCHER =", dataWatcher.address);

    // 5️⃣ Link the Agents Together securely
    console.log("Linking Agent Architecture together...");

    await actionTaker.write.setRiskStrategist([riskStrategist.address]);
    await riskStrategist.write.setDataWatcher([dataWatcher.address]);

    console.log("✅ All agents deployed and securely linked!");
}

main().catch(console.error);