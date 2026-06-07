import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const DATA_WATCHER_ADDRESS = import.meta.env.VITE_DATA_WATCHER!;
const RISK_STRATEGIST_ADDRESS = import.meta.env.VITE_RISK_STRATEGIST!;
const RWA_VAULT_ADDRESS = import.meta.env.VITE_RWA_VAULT!;

const DATA_WATCHER_ABI = [
  "function triggerMarketScan(string apiUrl, string jsonPathToRiskScore) public", // Ensure this matches your Solidity
  "event ScanTriggered(uint256 requestId, string apiUrl)",
  "event AnomalyDetected(uint256 riskScore, string message)"
];

const RISK_STRATEGIST_ABI = [
  "event ShockReceived(uint256 shockId, uint256 severity, uint256 confidence)",
  "event HedgeTriggered(uint256 shockId, uint256 hedgeBps)"
];

const RWA_VAULT_ABI = [
  "event CapitalHedged(address indexed source, uint256 amount)"
];

export default function App() {
  const [wallet, setWallet] = useState("");
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  const [agent1, setAgent1] = useState("Standby. Awaiting scan trigger.");
  const [agent2, setAgent2] = useState("Standby. Listening for anomalies.");
  const [agent3, setAgent3] = useState("Standby. Awaiting hedge execution.");
  const [busy, setBusy] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected");
      return;
    }
    const prov = new ethers.BrowserProvider(window.ethereum);
    const accounts = await prov.send("eth_requestAccounts", []);
    setProvider(prov);
    setWallet(accounts[0]);
  };

  useEffect(() => {
    if (!provider) return;

    const watcher = new ethers.Contract(DATA_WATCHER_ADDRESS, DATA_WATCHER_ABI, provider);
    const strategist = new ethers.Contract(RISK_STRATEGIST_ADDRESS, RISK_STRATEGIST_ABI, provider);
    const vault = new ethers.Contract(RWA_VAULT_ADDRESS, RWA_VAULT_ABI, provider);

    watcher.on("ScanTriggered", (_scanId, platformRequestId) => {
      setAgent1(`🟡 Live Scrape Executed! Somnia Task ID: ${platformRequestId.toString()}. Checking Barchart indices...`);
    });

    watcher.on("AnomalyDetected", (_scanId, riskScore: bigint) => {
      setAgent1(`🔴 AI Extraction Complete! Confirmed true supply-chain drop value: ${riskScore.toString()}%`);
    });

    strategist.on("ShockReceived", (_id, severity: bigint, confidence: bigint) => {
      setAgent2(`🟡 Evaluating exposure risk context (True Severity: ${severity.toString()}%, Confidence Weighting: ${confidence.toString()}%)`);
    });

    strategist.on("HedgeTriggered", (_id, hedgeBps: bigint) => {
      setAgent2(`🟢 Calculated Risk Frontier Mitigator Strategy. Shifting ${Number(hedgeBps) / 100}% asset balance.`);
      setAgent3("自行 Action Taker: Securing capital into asset proxies...");
    });

    vault.on("CapitalHedged", (_source, amount: bigint) => {
      setAgent3(`🟢 Success! Locked ${ethers.formatEther(amount)} STT safely inside the index proxy contract.`);
      setBusy(false);
    });

    return () => {
      watcher.removeAllListeners();
      strategist.removeAllListeners();
      vault.removeAllListeners();
    };
  }, [provider]);

  const startScan = async () => {
    if (!provider || !wallet) return;

    try {
      setBusy(true);
      setAgent1("📡 Packaging secure payload parameters...");

      const signer = await provider.getSigner();
      const watcher = new ethers.Contract(
        DATA_WATCHER_ADDRESS,
        DATA_WATCHER_ABI,
        signer
      );

      // Define your scan parameters here
      const apiUrl = "https://api.usda.gov/market-news/v1/data";
      const jsonPath = "$.data.riskIndex";

      // Pass the arguments that your Solidity contract expects
      const tx = await watcher.triggerMarketScan(apiUrl, jsonPath);

      setAgent1("⏳ Broadcasting transaction...");
      await tx.wait();

    } catch (err) {
      console.error("Pipeline failure:", err);
      setAgent1("Failed to initiate scan.");
      setBusy(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="header">
        <h1>OmniMarket Agent (OMA)</h1>
        {!wallet ? (
          <button className="btn" onClick={connectWallet}>Connect Wallet</button>
        ) : (
          <p>🟢 Connected ({wallet.slice(0, 6)}…{wallet.slice(-4)})</p>
        )}
      </div>

      <div className="controls">
        <button className="btn" onClick={startScan} disabled={busy || !wallet}>
          {busy ? "Decentralized AI Query Processing…" : "Trigger Autonomous Market Scan"}
        </button>
      </div>

      <div className="agent-grid">
        <div className="card">
          <h2>Agent 1: Data Watcher</h2>
          <p><strong>Status:</strong> {agent1}</p>
        </div>
        <div className="card">
          <h2>Agent 2: Risk Strategist</h2>
          <p><strong>Status:</strong> {agent2}</p>
        </div>
        <div className="card">
          <h2>Agent 3: Action Taker</h2>
          <p><strong>Status:</strong> {agent3}</p>
        </div>
      </div>
    </div>
  );
}