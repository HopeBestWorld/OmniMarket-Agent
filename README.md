# OmniMarket Agent (OMA)

**OmniMarket Agent (OMA)** is a fully autonomous, on-chain agent system built on **Somnia Agentic L1**. It protects Web3 portfolios from real-world supply-chain and macro-market shocks by continuously monitoring off-chain data, evaluating on-chain exposure, and executing defensive actions — **without ongoing user intervention**.

OMA bridges physical-world volatility and on-chain assets, enabling protocols and users to respond to real-world risks **trustlessly, autonomously, and in real time**.

---

## 🧠 System Architecture

OMA is composed of three independent but composable on-chain agents that communicate via events and direct contract calls.

### **Agent 1 — Data Watcher**

* Ingests live off-chain market and supply-chain data using Somnia’s native agent request primitives.
* Compares incoming data against historical baselines.
* Emits on-chain anomaly events when abnormal market conditions are detected.

### **Agent 2 — Risk Strategist**

* Activated automatically when Agent 1 detects an anomaly.
* Evaluates severity and confidence of the detected shock.
* Computes an appropriate hedge size based on predefined risk logic.
* Triggers defensive action when thresholds are met.

### **Agent 3 — Action Taker**

* Executes the hedge autonomously on-chain.
* Moves at-risk capital into a broad-market, diversified on-chain index vault.
* Finalizes protection without requiring user approval or manual execution.

Once initiated, the system runs **continuously and autonomously**. User interaction is only required to trigger the initial scan or observe system status — not to manage risk responses.

---

## 🔁 Autonomous Execution Flow

1. Agent 1 ingests real-world data and detects an anomaly
2. An on-chain event activates Agent 2
3. Agent 2 computes hedge parameters
4. Agent 3 executes the hedge on-chain
5. Capital is secured automatically

This pipeline operates entirely on-chain using Somnia’s agent-native execution model.

---

## 🛠 Tech Stack

* **Blockchain:** Somnia Shannon Testnet
* **Smart Contracts:** Solidity
* **Frontend:** React, TypeScript, Vite
* **Web3 Interaction:** Ethers.js
* **Execution Model:** Event-driven autonomous agents

---

## ⛓️ Deployed Contracts

| Contract           | Address                                      |
| ------------------ | -------------------------------------------- |
| **RWA_IndexVault** | `0x921db89eee063d44ae8db649f0a96824dbce8f1f` |

---

## 🚀 Why Somnia Agentic L1

OmniMarket Agent is built specifically for Somnia because it requires:

* Native agent execution on Layer 1
* Trustless off-chain data ingestion
* Event-driven agent-to-agent coordination
* Autonomous execution without centralized keepers or bots

Somnia’s Agentic L1 enables OMA to function as a **persistent on-chain risk management system**, rather than a user-triggered automation script.

---

## 🔗 Project Links

* **Live Demo:** [OmniMarket Agent App](https://omnimarket-agent.vercel.app/?utm_source=chatgpt.com)
* **Demo Video:** [YouTube Demo](https://youtu.be/xH_XugmQd0c?utm_source=chatgpt.com)
* **Presentation Slides:** [Google Slides](https://docs.google.com/presentation/d/1c54ZrLiqrtDfUCKxthH5oOQXz5ITDRxQd9hJr7zX10U/edit?usp=sharing&utm_source=chatgpt.com)

---

## 💻 Local Development

### Prerequisites

* Node.js
* MetaMask configured for Somnia Shannon Testnet
* Testnet STT (via Somnia faucet)

### Installation

```bash
git clone https://github.com/HopeBestWorld/OmniMarket-Agent.git
cd OmniMarket-Agent
npm install
npm run dev
```

---

## 📈 Demo Notes

The live demo visualizes **real on-chain agent execution**.
Agent state changes are driven by **contract events**, not frontend simulation logic.

---

## 📜 License

MIT