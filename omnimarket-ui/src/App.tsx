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
  "function triggerMarketScan() payable returns (uint256)",
  "function getRequiredFee() view returns (uint256)",
  "event ScanTriggered(uint256 indexed scanId, uint256 platformRequestId)",
  "event AnomalyDetected(uint256 indexed scanId, uint256 riskScore)"
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
      alert("MetaMask extension not found");
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

    watcher.on("ScanTriggered", (_scanId, id) => {
      setAgent1(`📡 API Request Dispatched! Somnia Thread ID: ${id.toString()}. Querying BLS macro dataset indices...`);
    });

    watcher.on("AnomalyDetected", (_scanId, score) => {
      setAgent1(`🔴 Consensus Finalized! Verified market raw index shock computed: ${score.toString()}%`);
    });

    strategist.on("ShockReceived", (_id, severity, confidence) => {
      setAgent2(`🧠 Risk Strategist Active: Processing volatility vector (${severity.toString()}% severity, ${confidence.toString()}% confidence weight)`);
    });

    strategist.on("HedgeTriggered", (_id, hedgeBps) => {
      setAgent2(`🟢 Calculated Risk Frontier Strategy. Allocating ${Number(hedgeBps) / 100}% of funds.`);
      setAgent3("Action Taker: Initiating asset transfer pathways...");
    });

    vault.on("CapitalHedged", (_, amount) => {
      setAgent3(`✅ Protection Protocol Complete: Locked ${ethers.formatEther(amount)} STT safely into index proxies.`);
      setBusy(false);
    });

    return () => {
      watcher.removeAllListeners();
      strategist.removeAllListeners();
      vault.removeAllListeners();
    };
  }, [provider]);

  const startScan = async () => {
    if (!provider) return;

    try {
      setBusy(true);
      setAgent1("📡 packaging secure on-chain API parameters...");
      setAgent2("Standby...");
      setAgent3("Standby...");

      const signer = await provider.getSigner();
      const watcher = new ethers.Contract(DATA_WATCHER_ADDRESS, DATA_WATCHER_ABI, signer);

      const fee = await watcher.getRequiredFee();
      const tx = await watcher.triggerMarketScan({ value: fee });
      setAgent1("⏳ Ingestion transaction broadcasted. Awaiting decentralized consensus callback...");
      await tx.wait();
    } catch (e) {
      console.error(e);
      setAgent1("❌ Pipeline transaction processing failed");
      setBusy(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="header">
        <h1>OmniMarket Agent</h1>
        {!wallet ? (
          <button className="btn" onClick={connectWallet}>Connect Wallet</button>
        ) : (
          <p>🟢 Connected Wallet: ({wallet.slice(0, 6)}…{wallet.slice(-4)})</p>
        )}
      </div>

      <div className="controls">
        <button className="btn" onClick={startScan} disabled={busy || !wallet}>
          {busy ? "Processing Active Pipeline…" : "Trigger Autonomous Market Scan"}
        </button>
      </div>

      <div className="agent-grid">
        <div className="card"><h2>Data Watcher</h2><p>{agent1}</p></div>
        <div className="card"><h2>Risk Strategist</h2><p>{agent2}</p></div>
        <div className="card"><h2>Action Taker</h2><p>{agent3}</p></div>
      </div>
    </div>
  );
}