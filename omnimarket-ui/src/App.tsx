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
  "event ScanTriggered(uint256 scanId, uint256 platformRequestId)",
  "event AnomalyDetected(uint256 scanId, uint256 riskScore)",
  "event DebugFee(uint256 reserve, uint256 reward, uint256 total)",
  "event DebugCaller(address caller, address owner)"
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

    watcher.on("ScanTriggered", (_, id) => {
      setAgent1(`🟡 Scan dispatched. Somnia task: ${id}`);
    });

    watcher.on("AnomalyDetected", (_, score) => {
      setAgent1(`🔴 AI confirmed anomaly: ${score}%`);
    });

    strategist.on("ShockReceived", (_, severity, confidence) => {
      setAgent2(`🧠 Risk evaluated: ${severity}% (confidence ${confidence}%)`);
    });

    strategist.on("HedgeTriggered", (_, hedgeBps) => {
      setAgent2(`🟢 Hedge strategy: ${Number(hedgeBps) / 100}%`);
      setAgent3("Executing capital rotation…");
    });

    vault.on("CapitalHedged", (_, amount) => {
      setAgent3(`✅ Secured ${ethers.formatEther(amount)} STT`);
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
      setAgent1("🧠 Preparing AI request…");

      const signer = await provider.getSigner();
      const watcher = new ethers.Contract(DATA_WATCHER_ADDRESS, DATA_WATCHER_ABI, signer);

      const fee = await watcher.getRequiredFee();
      const tx = await watcher.triggerMarketScan({ value: fee });

      await tx.wait();
    } catch (e) {
      console.error(e);
      setAgent1("❌ Scan failed");
      setBusy(false);
    }
  };

  return (
    <div className="dashboard">
      <h1>OmniMarket Agent</h1>

      {!wallet ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <button onClick={startScan} disabled={busy}>
          {busy ? "Processing…" : "Trigger Market Scan"}
        </button>
      )}

      <div className="agent-grid">
        <div className="card"><h2>Data Watcher</h2><p>{agent1}</p></div>
        <div className="card"><h2>Risk Strategist</h2><p>{agent2}</p></div>
        <div className="card"><h2>Action Taker</h2><p>{agent3}</p></div>
      </div>
    </div>
  );
}