/**
 * Utility functions for wallet and contract interactions
 */

/**
 * Format wallet address for display
 * @param address - Full address
 * @param chars - Number of characters to show on each side
 */
export function formatAddress(address: string, chars: number = 4): string {
  if (!address) return "";
  const prefix = address.startsWith("0x") ? 2 : 0;
  return `${address.substring(0, chars + prefix)}...${address.substring(
    address.length - chars
  )}`;
}

/**
 * Convert human-readable amount to motes (Casper) or wei (EVM)
 * @param amount - Human readable amount
 * @param decimals - Token decimals (default: 9 for Casper, 18 for EVM)
 */
export function toSmallestUnit(amount: string, decimals: number = 9): string {
  const value = parseFloat(amount);
  if (isNaN(value)) throw new Error("Invalid amount");
  return (value * Math.pow(10, decimals)).toFixed(0);
}

/**
 * Convert motes/wei to human-readable amount
 * @param smallAmount - Amount in smallest unit
 * @param decimals - Token decimals
 */
export function fromSmallestUnit(
  smallAmount: string,
  decimals: number = 9
): string {
  const value = parseInt(smallAmount);
  if (isNaN(value)) throw new Error("Invalid amount");
  return (value / Math.pow(10, decimals)).toFixed(decimals);
}

/**
 * Format token amount with decimals
 * @param amount - Amount to format
 * @param decimals - Number of decimal places to show
 */
export function formatTokenAmount(
  amount: string | number,
  decimals: number = 4
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0";

  // Handle large numbers
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + "K";
  }

  return num.toFixed(decimals);
}

/**
 * Validate Ethereum address
 */
export function isValidEVMAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate Casper public key
 */
export function isValidCasperPublicKey(publicKey: string): boolean {
  return /^[0-9a-fA-F]{64,66}$/.test(publicKey.replace("0x", ""));
}

/**
 * Validate Casper contract hash
 */
export function isValidCasperHash(hash: string): boolean {
  return /^hash-[0-9a-fA-F]{64}$/.test(hash);
}

/**
 * Convert EVM address to lowercase checksum format
 */
export function normalizeEVMAddress(address: string): `0x${string}` {
  return address.toLowerCase() as `0x${string}`;
}

/**
 * Convert Casper public key to contract hash format
 */
export function publicKeyToHash(publicKey: string): string {
  // Remove 0x prefix if present
  const cleanKey = publicKey.replace("0x", "");
  return `hash-${cleanKey}`;
}

/**
 * Extract hash from Casper contract hash format
 */
export function hashToHex(hash: string): string {
  return hash.replace("hash-", "");
}

/**
 * Calculate slippage amount
 * @param amount - Original amount
 * @param slippagePercent - Slippage percentage (e.g., 1 for 1%)
 */
export function calculateSlippage(
  amount: string,
  slippagePercent: number
): string {
  const value = parseFloat(amount);
  const slippageAmount = value * (slippagePercent / 100);
  return (value - slippageAmount).toFixed(0);
}

/**
 * Wait for a specified time
 * @param ms - Milliseconds to wait
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries
 * @param initialDelay - Initial delay in ms
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await sleep(delay);
      }
    }
  }

  throw lastError!;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Open block explorer for address
 */
export function openExplorer(
  address: string,
  chain: "ethereum" | "casper" = "ethereum",
  network: "testnet" | "mainnet" = "testnet"
): void {
  const explorers = {
    ethereum: {
      testnet: `https://amoy.polygonscan.com/address/${address}`,
      mainnet: `https://polygonscan.com/address/${address}`,
    },
    casper: {
      testnet: `https://testnet.cspr.live/account/${address}`,
      mainnet: `https://cspr.live/account/${address}`,
    },
  };

  window.open(explorers[chain][network], "_blank");
}

/**
 * Open block explorer for transaction
 */
export function openTransaction(
  hash: string,
  chain: "ethereum" | "casper" = "ethereum",
  network: "testnet" | "mainnet" = "testnet"
): void {
  const explorers = {
    ethereum: {
      testnet: `https://amoy.polygonscan.com/tx/${hash}`,
      mainnet: `https://polygonscan.com/tx/${hash}`,
    },
    casper: {
      testnet: `https://testnet.cspr.live/deploy/${hash}`,
      mainnet: `https://cspr.live/deploy/${hash}`,
    },
  };

  window.open(explorers[chain][network], "_blank");
}

/**
 * Check if code is running in browser
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Get error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unknown error occurred";
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
