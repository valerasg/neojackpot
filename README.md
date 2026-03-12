# NeoJackpot - Educational Slot Machine Simulator

Welcome to the NeoJackpot project.

## 🎯 Primary Goal

The main objective of this project is strictly **educational**. We aim to demonstrate the mathematical and programmatic mechanisms behind slot machines—specifically, how systems can be designed and controlled to inevitably favor the house, ensuring a 100% win rate for the operator over the long term.

By shedding light on these underlying systems, this project helps users make more informed decisions and better understand the reality of programmed probability in electronic gaming systems.

*Please note: This repository is intended solely for learning, research, and awareness. It is not intended to encourage gambling.*

## 📚 Educational Value

Through this demonstration, you can learn about:
- **Pseudo-Random Number Generation (PRNG):** How "randomness" is produced and managed in software.
- **Return to Player (RTP) & House Edge:** The mathematical principles that guarantee long-term casino profit.
- **Outcome Weighting:** How payout frequencies and symbols are programmatically weighted and controlled.

## ⚖️ Disclaimer

This software is provided for educational and demonstrative purposes only. It does not replicate any specific real-world proprietary platform, but rather explores the general concepts discussed in software probability and game development. Please stay informed about the programmed nature of such machines.

## 📋 Backlog

Features planned or previously prototyped for future development:

- [ ] **AI-Generated Win Messages** — Integrate Gemini API (via a secure backend proxy) to generate unique, contextual system breach logs on big wins. *(Previously prototyped with an Express server)*
- [ ] **User Accounts & Authentication** — Allow players to create accounts, log in, and persist their session across devices.
- [ ] **Persistent Leaderboards** — Global and session-based leaderboards stored server-side to track top hackers.
- [ ] **Server-Side Game State & RNG Validation** — Move game logic and random number generation to the server to prevent client-side tampering and ensure provably fair outcomes.
- [ ] **Player Stats & Session History Persistence** — Save spin history, win/loss stats, and RTP data to a database so players can review past sessions.
