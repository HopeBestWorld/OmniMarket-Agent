import './App.css'

function App() {
  return (
    <div className="dashboard">
      <h1>OmniMarket Agent (OMA)</h1>
      <p>Status: 🟢 Connected to Somnia Testnet</p>
      <div className="agent-grid">
        <div className="card">
          <h2>Agent 1: Data Watcher</h2>
          <p>Status: Scanning USDA market APIs & Weather Oracles...</p>
        </div>
        <div className="card">
          <h2>Agent 2: Risk Strategist</h2>
          <p>Status: Standby. Awaiting anomaly detection.</p>
        </div>
        <div className="card">
          <h2>Agent 3: Action Taker</h2>
          <p>Status: Standby. Ready to execute on-chain hedges.</p>
        </div>
      </div>
    </div>
  )
}

export default App