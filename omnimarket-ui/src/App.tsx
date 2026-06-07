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
const DATA_WATCHER_ADDRESS = "0xYOUR_DATA_WATCHER";
const RISK_STRATEGIST_ADDRESS = "0xYOUR_RISK_STRATEGIST";
const RWA_VAULT_ADDRESS = "0xYOUR_RWA_VAULT";

/* ============================
   MINIMAL ABIs (EVENT-DRIVEN)
   ============================ */
const DATA_WATCHER_ABI = [
  "function triggerMarketScan(string apiUrl, string jsonPath)",
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

    let active = true;

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

    watcher.on("ScanTriggered", () => {
      setAgent1("🟡 Scan initiated. Ingesting off-chain market data…");
    });

    watcher.on("AnomalyDetected", (riskScore: bigint) => {
      setAgent1(`🔴 Anomaly detected (Risk Score: ${riskScore}).`);
      setAgent2("🟢 Activated. Assessing exposure and severity.");
    });

    strategist.on("ShockReceived", () => {
      setAgent2("🟡 Shock received. Computing hedge parameters.");
    });

    strategist.on("HedgeTriggered", (_, hedgeBps: bigint) => {
      setAgent2(`🟢 Hedge computed: ${Number(hedgeBps) / 100}%`);
      setAgent3("🟡 Executing autonomous hedge on-chain.");
    });

    vault.on("CapitalHedged", (_, amount: bigint) => {
      setAgent3(
        `🟢 Capital secured: ${ethers.formatEther(amount)} ETH moved to safety.`
      );
      setBusy(false);
    });

    return () => {
      active = false;
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

    await watcher.triggerMarketScan(
      "https://api.example.com/commodity-risk",
      "$.risk_score"
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