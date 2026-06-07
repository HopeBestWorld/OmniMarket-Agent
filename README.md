OmniMarket Agent (OMA) is an autonomous, on-chain AI system built on Somnia L1. It protects Web3 portfolios from real-world supply-chain and market shocks by leveraging a decentralized multi-agent architecture. 

OMA bridges the gap between off-chain data and on-chain assets, enabling platforms to react to physical-world volatility in real-time, trustlessly, and autonomously.

## The System Architecture
OMA utilizes a three-agent hierarchy to manage risk:

1. **Agent 1: Data Watcher**
   - Ingests live, off-chain market data (e.g., USDA supply chain indices) using Somnia's native `IAgentRequester` and `requestJsonApi` primitives.
   - Cross-references data against historical baselines to detect market shocks.
   
2. **Agent 2: Risk Strategist**
   - Automatically monitors the system for anomaly events emitted by the Data Watcher.
   - Evaluates portfolio exposure levels and calculates the necessary safety buffer.

3. **Agent 3: Action Taker**
   - Executes the final protective hedge by shifting at-risk capital to the `RWA_IndexVault`.
   - Ensures funds are secured in stable, broad-market equity proxies (VOO/VTI equivalents).

Once initialized, agents operate autonomously: anomalies detected by Agent 1 emit on-chain events that wake Agent 2 and Agent 3 without further user input.

## 🛠 Tech Stack
- **Blockchain:** Somnia Shannon Testnet
- **Smart Contracts:** Solidity
- **Frontend:** React, TypeScript, Vite
- **Web3 Interaction:** Ethers.js
- **Network:** Deployed to Somnia Shannon Testnet

## ⛓️ Deployed Contracts
| Contract | Address |
| :--- | :--- |
| **RWA_IndexVault** | `0x921db89eee063d44ae8db649f0a96824dbce8f1f` |

## Why Somnia Agentic L1

OmniMarket Agent is built specifically for Somnia because it requires:

- Native agent execution and scheduling
- Trustless off-chain data ingestion via agent request primitives
- Event-driven agent-to-agent communication on L1
- Autonomous execution without centralized bots or keepers

Somnia’s Agentic L1 enables OMA to operate continuously and autonomously, rather than as a user-triggered automation script.

## 🔗 Links
- Live Demo: https://omnimarket-agent.vercel.app/
- Demo Video: https://youtu.be/xH_XugmQd0c
- Slides: [\[Google Slides link\]](https://docs.google.com/presentation/d/1c54ZrLiqrtDfUCKxthH5oOQXz5ITDRxQd9hJr7zX10U/edit?usp=sharing)

## 💻 Setup Instructions

### Prerequisites
- Node.js installed
- MetaMask browser extension configured for Somnia Shannon Testnet
- Testnet STT tokens (available via the official Somnia Faucet)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/HopeBestWorld/OmniMarket-Agent.git
   cd OmniMarket-Agent

```

2. Install dependencies:
npm install

```


3. Run the development environment:
```bash
npm run dev

```

## 📈 Demo

You can view the live demo and simulate a market shock at our [Vercel Deployment](https://omnimarket-agent.vercel.app/).

## 📜 License

MIT
