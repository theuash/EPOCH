import { ethers } from 'ethers';

/**
 * Service to monitor and manage flagged transactions
 * Polls for "Flagged" events from FlagEngine contract within 1 hour
 */
export class FlagService {
  constructor(flagEngineContract, provider) {
    this.contract = flagEngineContract;
    this.provider = provider;
    this.flaggedTransactions = new Map();
    this.pollInterval = 5 * 60 * 1000; // 5 minute polling interval
    this.maxAge = 60 * 60 * 1000; // 1 hour max age for display
  }

  /**
   * Start listening for flagged events
   * @param {Function} callback - Called with updated flags array
   * @returns {string} Listener ID for cleanup
   */
  startMonitoring(callback) {
    // Setup event listener for real-time events
    this.contract.on('Flagged', (txId, reason, spend, budgetLimit) => {
      const flag = {
        txId: txId.toString(),
        reason,
        spend: spend.toString(),
        budgetLimit: budgetLimit.toString(),
        timestamp: Date.now(),
        severity: 'critical',
        badge: 'overspend'
      };
      this.flaggedTransactions.set(txId.toString(), flag);
      this._cleanupOldFlags();
      callback(this.getActiveFlags());
    });

    // Setup polling fallback for <1hr window
    this.pollInterval = setInterval(() => {
      this._pollRecentEvents(callback);
    }, this.pollInterval);

    return 'flag-monitor';
  }

  /**
   * Poll for recent flagged events (past 1 hour)
   */
  async _pollRecentEvents(callback) {
    try {
      const currentBlock = await this.provider.getBlockNumber();
      const blocksIn1Hour = Math.ceil(3600 / 12); // Assuming 12s per block
      const fromBlock = Math.max(0, currentBlock - blocksIn1Hour);

      const events = await this.contract.queryFilter(
        this.contract.filters.Flagged(),
        fromBlock,
        currentBlock
      );

      events.forEach(event => {
        const [txId, reason, spend, budgetLimit] = event.args;
        const flag = {
          txId: txId.toString(),
          reason,
          spend: spend.toString(),
          budgetLimit: budgetLimit.toString(),
          timestamp: Date.now(),
          blockNumber: event.blockNumber,
          severity: 'critical',
          badge: 'overspend'
        };
        this.flaggedTransactions.set(txId.toString(), flag);
      });

      this._cleanupOldFlags();
      callback(this.getActiveFlags());
    } catch (err) {
      console.error('Error polling flag events:', err);
    }
  }

  /**
   * Remove flags older than 1 hour
   */
  _cleanupOldFlags() {
    const now = Date.now();
    for (const [txId, flag] of this.flaggedTransactions) {
      if (now - flag.timestamp > this.maxAge) {
        this.flaggedTransactions.delete(txId);
      }
    }
  }

  /**
   * Get all currently active (non-expired) flags
   */
  getActiveFlags() {
    this._cleanupOldFlags();
    return Array.from(this.flaggedTransactions.values());
  }

  /**
   * Get flag by transaction ID
   */
  getFlag(txId) {
    return this.flaggedTransactions.get(txId.toString());
  }

  /**
   * Check if transaction is flagged
   */
  isFlagged(txId) {
    return this.flaggedTransactions.has(txId.toString());
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
    this.contract.removeAllListeners('Flagged');
  }

  /**
   * Get summary of flagged transactions by severity
   */
  getSummary() {
    const flags = this.getActiveFlags();
    return {
      total: flags.length,
      critical: flags.filter(f => f.severity === 'critical').length,
      overSpends: flags.filter(f => f.badge === 'overspend').length
    };
  }
}

export default FlagService;
