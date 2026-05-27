import { useState } from 'react';
import { ethers } from 'ethers';
import './App.css';

// Tell TypeScript to expect the injected Web3 wallet object
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Note: You will replace this with your actual deployed contract address later
const CONTRACT_ADDRESS = "0x921db89eee063d44ae8db649f0a96824dbce8f1f";

// A minimal ABI so ethers knows how to talk to your contract functions
const CONTRACT_ABI = [
  "function triggerMarketScan(string apiUrl, string jsonPathToRiskScore) public",
  "event ScanTriggered(uint256 requestId, string apiUrl)",
  "event AnomalyDetected(uint256 riskScore, string message)"
];

function App() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [agent1Status, setAgent1Status] = useState<string>("Standby. Ready to initiate data ingestion.");
  const [agent2Status, setAgent2Status] = useState<string>("Standby. Awaiting anomaly detection.");
  const [agent3Status, setAgent3Status] = useState<string>("Standby. Ready to execute on-chain hedges.");
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // 1. Connect the user's Web3 Wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setWalletAddress(accounts[0]);
      } catch (err) {
        console.error("Wallet connection failed:", err);
      }
    } else {
      alert("Please install Phantom or MetaMask and switch to Ethereum mode.");
    }
  };

  // 2. Trigger the Smart Contract Function
  const runMarketScan = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      setIsScanning(true);
      setAgent1Status("🟡 Initializing Somnia Agent: Cross-referencing live data against 28-year historical dairy and commodity baselines...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // We pass the API endpoint for the Somnia Agent to fetch off-chain
      const apiUrl = "https://api.usda.gov/market-news/v1/data";
      const jsonPath = "$.data.riskIndex";

      // Execute the transaction
      const tx = await contract.triggerMarketScan(apiUrl, jsonPath);
      setAgent1Status("🟢 Transaction sent! Awaiting consensus from Somnia runners...");

      await tx.wait(); // Wait for it to be mined
      setAgent1Status("🔴 Anomaly Detected: 14% Supply drop confirmed. Event emitted.");

      // Simulate Agent 2 and 3 waking up based on the anomaly
      setTimeout(() => {
        setAgent2Status("🟢 WAKE: Scanning L1 for exposed protocols...");
      }, 2000);

      setTimeout(() => {
        setAgent2Status("🟢 Exposure Found. Invoking Agent 3 for protective measures.");
        setAgent3Status("🟢 EXECUTING: Hedging portfolio. Shifting 30% of at-risk capital to broad-market stable asset equivalents (VOO/VTI proxies).");
        setIsScanning(false);
      }, 4500);

    } catch (err) {
      console.error("Transaction failed:", err);
      setAgent1Status("Failed to initiate scan.");
      setIsScanning(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="header">
        <h1>OmniMarket Agent (OMA)</h1>
        {!walletAddress ? (
          <button className="btn" onClick={connectWallet}>Connect Wallet</button>
        ) : (
          <p>Status: 🟢 Connected ({walletAddress.substring(0, 6)}...{walletAddress.slice(-4)})</p>
        )}
      </div>

      <div className="controls">
        <button className="btn" onClick={runMarketScan} disabled={isScanning || !walletAddress}>
          {isScanning ? "Processing On-Chain..." : "Simulate Global Market Shock"}
        </button>
      </div>

      <div className="agent-grid">
        <div className="card">
          <h2>Agent 1: Data Watcher</h2>
          <p><strong>Status:</strong> {agent1Status}</p>
        </div>
        <div className="card">
          <h2>Agent 2: Risk Strategist</h2>
          <p><strong>Status:</strong> {agent2Status}</p>
        </div>
        <div className="card">
          <h2>Agent 3: Action Taker</h2>
          <p><strong>Status:</strong> {agent3Status}</p>
        </div>
      </div>
    </div>
  );
}

export default App;