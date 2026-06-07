import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";

declare global {
  interface Window {
    ethereum?: any;
  }
}

/* ============================
   DEPLOYED CONTRACT ADDRESSES
   ============================ */
const DATA_WATCHER_ADDRESS = import.meta.env.VITE_DATA_WATCHER!;
const RISK_STRATEGIST_ADDRESS = import.meta.env.VITE_RISK_STRATEGIST!;
const RWA_VAULT_ADDRESS = import.meta.env.VITE_RWA_VAULT!;

/* ============================
   ABIs (MATCH CONTRACTS)
   ============================ */
const DATA_WATCHER_ABI = [
  "function triggerMarketScan(string source, uint256 riskScore, uint256 confidence)",
  "event ScanTriggered(uint256 indexed scanId, string source)",
  "event AnomalyDetected(uint256 indexed scanId, uint256 riskScore, uint256 confidence, string message)"
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

  /* ============================
     WALLET CONNECTION
     ============================ */
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

  /* ============================
     EVENT SUBSCRIPTIONS
     ============================ */
  useEffect(() => {
    if (!provider) return;

    const watcher = new ethers.Contract(
      DATA_WATCHER_ADDRESS,
      DATA_WATCHER_ABI,
      provider
    );

    const strategist = new ethers.Contract(
      RISK_STRATEGIST_ADDRESS,
      RISK_STRATEGIST_ABI,
      provider
    );

    const vault = new ethers.Contract(
      RWA_VAULT_ADDRESS,
      RWA_VAULT_ABI,
      provider
    );

    watcher.on("ScanTriggered", (_scanId, source) => {
      setAgent1(`🟡 Scan triggered from ${source}`);
    });

    watcher.on(
      "AnomalyDetected",
      (_scanId, riskScore: bigint, confidence: bigint) => {
        setAgent1(`🔴 Anomaly detected (Risk: ${riskScore})`);
        setAgent2(`🟢 Confidence ${confidence}%. Assessing hedge.`);
      }
    );

    strategist.on("ShockReceived", (_id, severity: bigint, confidence: bigint) => {
      setAgent2(`🟡 Shock received (Severity ${severity}, Confidence ${confidence}%)`);
    });

    strategist.on("HedgeTriggered", (_id, hedgeBps: bigint) => {
      setAgent2(`🟢 Hedge computed: ${Number(hedgeBps) / 100}%`);
      setAgent3("🟡 Executing autonomous hedge.");
    });

    vault.on("CapitalHedged", (_source, amount: bigint) => {
      setAgent3(`🟢 ${ethers.formatEther(amount)} ETH secured in vault`);
      setBusy(false);
    });

    return () => {
      watcher.removeAllListeners();
      strategist.removeAllListeners();
      vault.removeAllListeners();
    };
  }, [provider]);

  /* ============================
     TRIGGER AGENT 1
     ============================ */
  const startScan = async () => {
    if (!provider || !wallet) return;

    setBusy(true);
    setAgent1("🟡 Initializing market scan…");

    const signer = await provider.getSigner();
    const watcher = new ethers.Contract(
      DATA_WATCHER_ADDRESS,
      DATA_WATCHER_ABI,
      signer
    );

    // Demo values (replace with real oracle output later)
    await watcher.triggerMarketScan(
      "USDA Supply Index",
      45, // riskScore
      82  // confidence
    );
  };

  /* ============================
     UI
     ============================ */
  return (
    <div className="dashboard">
      <div className="header">
        <h1>OmniMarket Agent (OMA)</h1>
        {!wallet ? (
          <button className="btn" onClick={connectWallet}>
            Connect Wallet
          </button>
        ) : (
          <p>🟢 Connected ({wallet.slice(0, 6)}…{wallet.slice(-4)})</p>
        )}
      </div>

      <div className="controls">
        <button className="btn" onClick={startScan} disabled={busy || !wallet}>
          {busy ? "Agents Running…" : "Trigger Market Scan"}
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