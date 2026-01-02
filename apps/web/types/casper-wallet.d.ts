/**
 * Type declarations for Casper Wallet Provider
 * Add to global Window interface
 */

interface CasperWalletProvider {
  /**
   * Request connection to Casper Wallet
   * @returns Promise<boolean> - true if connection approved
   */
  requestConnection(): Promise<boolean>;

  /**
   * Check if wallet is connected to current site
   * @returns Promise<boolean> - true if connected
   */
  isConnected(): Promise<boolean>;

  /**
   * Disconnect from current site
   * @returns Promise<boolean> - true if disconnected successfully
   */
  disconnectFromSite(): Promise<boolean>;

  /**
   * Get active public key
   * @returns Promise<string> - Hex-encoded public key
   * @throws 1 if wallet is locked
   * @throws 2 if not approved to connect
   */
  getActivePublicKey(): Promise<string>;

  /**
   * Sign a deploy
   * @param deployJson - JSON-stringified deploy
   * @param signingPublicKeyHex - Public key to sign with
   * @returns Promise<{ signature: string, cancelled: boolean }>
   */
  sign(
    deployJson: string,
    signingPublicKeyHex: string
  ): Promise<{
    signature: string;
    cancelled: boolean;
  }>;

  /**
   * Sign a message
   * @param message - Message to sign
   * @param signingPublicKeyHex - Public key to sign with
   * @returns Promise<string> - Signature
   */
  signMessage(message: string, signingPublicKeyHex: string): Promise<string>;
}

declare global {
  interface Window {
    /**
     * Casper Wallet Provider
     * Available when Casper Wallet extension is installed
     */
    CasperWalletProvider?: () => CasperWalletProvider;
  }
}

export {};
