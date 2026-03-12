/**
 * winMessages.ts
 * Client-side cyberpunk-themed win messages that replace the server-dependent Gemini AI proxy.
 * Messages are randomly selected and interpolated with the win amount and symbol name.
 */

type MessageTemplate = (amount: number, symbol: string) => string;

const WIN_MESSAGES: MessageTemplate[] = [
  (amount, symbol) =>
    `BREACH_CONFIRMED: ${symbol} payload executed. ${amount} credits siphoned from mainframe.`,
  (amount, symbol) =>
    `SYSTEM ALERT: Unauthorized ${symbol} extraction detected. ${amount} credits transferred to rogue terminal.`,
  (amount, symbol) =>
    `FIREWALL BYPASSED. ${symbol} exploit chain successful — ${amount} credits diverted.`,
  (amount, symbol) =>
    `NEURAL_LINK OVERRIDE: ${symbol} sequence decoded. Extracting ${amount} credits... complete.`,
  (amount, symbol) =>
    `KERNEL PANIC: ${symbol} injection compromised sector 7G. ${amount} credits re-routed.`,
  (amount, symbol) =>
    `INTRUSION_LOG: ${symbol} vulnerability exploited. Credit dump: +${amount}. Trace: UNRESOLVED.`,
  (amount, symbol) =>
    `ROOT ACCESS GRANTED via ${symbol} overflow. Siphoning ${amount} credits from reserve pool.`,
  (amount, symbol) =>
    `CIPHER CRACKED: ${symbol} encryption key exposed. ${amount} credits liberated from cold storage.`,
  (amount, symbol) =>
    `DARKNET RELAY: ${symbol} signal intercepted. Redirecting ${amount} credits to shadow wallet.`,
  (amount, symbol) =>
    `QUANTUM DECRYPTION of ${symbol} lattice complete. ${amount} credits materialized.`,
  (amount, symbol) =>
    `BACKDOOR ACTIVATED: ${symbol} protocol hijacked. ${amount} credit payload injected into buffer.`,
  (amount, symbol) =>
    `MEMORY DUMP: ${symbol} registers overwritten. ${amount} credits extracted before core reset.`,
  (amount, symbol) =>
    `ZERO-DAY EXPLOIT: ${symbol} subsystem compromised. ${amount} credits secured. No trace left.`,
  (amount, symbol) =>
    `ICE BREAKER deployed against ${symbol} node. ${amount} credits flowing through proxy chain.`,
  (amount, symbol) =>
    `GHOST PROTOCOL: ${symbol} handshake forged. ${amount} credits ghosted into local cache.`,
];

/**
 * Returns a random cyberpunk-themed win message.
 * Drop-in replacement for the old server-based generateWinLog.
 */
export const getWinMessage = (amount: number, symbolName: string): string => {
  const index = Math.floor(Math.random() * WIN_MESSAGES.length);
  return WIN_MESSAGES[index](amount, symbolName);
};
