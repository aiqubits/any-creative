import {
    IAgentRuntime,
    ICacheManager,
    Memory,
    Provider,
    State,
    elizaLogger,
} from "@elizaos/core";
import { ethers } from 'ethers';

import BigNumber from "bignumber.js";
import NodeCache from "node-cache";
import * as path from "path";
import { getNetworkConfig, FETCH_A0GI_USDT_URL, DECIMALS } from "../environment";
import { verifyWalletParams } from "../utils/tools";

// interface A0GIAccount {
//     account: {
//         balance: UInt64;
//     };
// }

// Provider configuration
const PROVIDER_CONFIG = {
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000,
};

interface WalletPortfolio {
    totalUsd: string;
    totalA0GI: string;
}

interface Prices {
    a0gi: { usd: string };
}

export class WalletProvider {
    private a0giNetName: string;
    private privateKey: string;
    private evmRpc: string;
    private indexerRpc: string;
    private flowAddress: string;
    private DAEntranceAddress: string;
    private explorerAccount: string;
    private explorerTransaction: string;
    private explorerToken: string;
    private explorerIndexerSubmission: string; 
    private explorerIndexerAccount: string;
    private signer: ethers.Wallet;
    private cache: NodeCache;
    private cacheKey: string = "a0gi/wallet";

    constructor(
        a0giNetName: string,
        privatekey: string,
        evmRpc: string,
        indexerRpc: string,
        flowAddress: string,
        DAEntranceAddress: string,
        explorerAccount: string,
        explorerTransaction: string,
        explorerToken: string,
        explorerIndexerSubmission: string, 
        explorerIndexerAccount: string,
        signer: ethers.Wallet,
        private cacheManager: ICacheManager
    ) {
        this.a0giNetName = a0giNetName;
        this.privateKey = privatekey;
        this.evmRpc = evmRpc;
        this.indexerRpc = indexerRpc;
        this.flowAddress = flowAddress;
        this.DAEntranceAddress = DAEntranceAddress;
        this.explorerAccount = explorerAccount;
        this.explorerTransaction = explorerTransaction;
        this.explorerToken = explorerToken;
        this.explorerIndexerSubmission = explorerIndexerSubmission;
        this.explorerIndexerAccount = explorerIndexerAccount;
        this.signer = signer;

        // this.address = (new ethers.Wallet(privatekey)).address;

        this.cache = new NodeCache({ stdTTL: 300 }); // Cache TTL set to 5 minutes
    }

    private async readFromCache<T>(key: string): Promise<T | null> {
        const cached = await this.cacheManager.get<T>(
            path.join(this.cacheKey, key)
        );
        return cached;
    }

    private async writeToCache<T>(key: string, data: T): Promise<void> {
        await this.cacheManager.set(path.join(this.cacheKey, key), data, {
            expires: Date.now() + 5 * 60 * 1000,
        });
    }

    private async getCachedData<T>(key: string): Promise<T | null> {
        // Check in-memory cache first
        const cachedData = this.cache.get<T>(key);
        if (cachedData) {
            return cachedData;
        }

        // Check file-based cache
        const fileCachedData = await this.readFromCache<T>(key);
        if (fileCachedData) {
            // Populate in-memory cache
            this.cache.set(key, fileCachedData);
            return fileCachedData;
        }

        return null;
    }

    private async setCachedData<T>(cacheKey: string, data: T): Promise<void> {
        // Set in-memory cache
        this.cache.set(cacheKey, data);

        // Write to file-based cache
        await this.writeToCache(cacheKey, data);
    }

    // private async fetchPricesWithRetry() {
    //     let lastError: Error;

    //     for (let i = 0; i < PROVIDER_CONFIG.MAX_RETRIES; i++) {
    //         try {
    //             const response = await fetch(
    //                 FETCH_A0GI_USDT_URL
    //             );

    //             if (!response.ok) {
    //                 const errorText = await response.text();
    //                 throw new Error(
    //                     `HTTP error! status: ${response.status}, message: ${errorText}`
    //                 );
    //             }

    //             const data = await response.json();
    //             return data;
    //         } catch (error) {
    //             elizaLogger.error(`Attempt ${i + 1} failed:`, error);
    //             lastError = error;
    //             if (i < PROVIDER_CONFIG.MAX_RETRIES - 1) {
    //                 const delay = PROVIDER_CONFIG.RETRY_DELAY * Math.pow(2, i);
    //                 await new Promise((resolve) => setTimeout(resolve, delay));
    //                 continue;
    //             }
    //         }
    //     }

    //     elizaLogger.error(
    //         "All attempts failed. Throwing the last error:",
    //         lastError
    //     );
    //     throw lastError;
    // }

    // async fetchPortfolioValue(): Promise<WalletPortfolio> {
    //     try {
    //         const cacheKey = `portfolio-${this.address}`;
    //         const cachedValue =
    //             await this.getCachedData<WalletPortfolio>(cacheKey);

    //         if (cachedValue) {
    //             elizaLogger.log("Cache hit for fetchPortfolioValue", cachedValue);
    //             return cachedValue;
    //         }
    //         elizaLogger.log("Cache miss for fetchPortfolioValue");

    //         const prices = await this.fetchPrices().catch((error) => {
    //             elizaLogger.error("Error fetching A0GI price:", error);
    //             throw error;
    //         });
    //         const a0giAmount =  await this.getBalances(this.publicKey);
    //         const totalUsd = (new BigNumber(a0giAmount)).times(prices.a0gi.usd);

    //         const portfolio = {
    //             totalUsd: totalUsd.toString(),
    //             totalA0GI: a0giAmount.toString(),
    //         };
    //         this.setCachedData(cacheKey, portfolio);
    //         return portfolio;
    //     } catch (error) {
    //         elizaLogger.error("Error fetching portfolio:", error);
    //         throw error;
    //     }
    // }

    // async fetchPrices(): Promise<Prices> {
    //     try {
    //         const cacheKey = "prices";
    //         const cachedValue = await this.getCachedData<Prices>(cacheKey);

    //         if (cachedValue) {
    //             elizaLogger.log("Cache hit for fetchPrices");
    //             return cachedValue;
    //         }
    //         elizaLogger.log("Cache miss for fetchPrices");
    //         const a0giPriceData = await this.fetchPricesWithRetry().catch(
    //             (error) => {
    //                 elizaLogger.error("Error fetching A0GI price:", error);
    //                 throw error;
    //             }
    //         );
    //         const a0giPrice = a0giPriceData.data[0].last;
    //         const prices: Prices = {
    //             a0gi: { usd: a0giPrice.toString() },
    //         };
    //         this.setCachedData(cacheKey, prices);
    //         return prices;
    //     } catch (error) {
    //         elizaLogger.error("Error fetching prices:", error);
    //         throw error;
    //     }
    // }

    // formatPortfolio(runtime, portfolio: WalletPortfolio): string {
    //     let output = `${runtime.character.name}\n`;
    //     output += `Wallet Address: ${this.address}\n`;

    //     const totalUsdFormatted = new BigNumber(portfolio.totalUsd).toFixed(4);
    //     const totalA0GIFormatted = new BigNumber(portfolio.totalA0GI).toFixed(4);

    //     output += `Total Value: $${totalUsdFormatted} (${totalA0GIFormatted} A0GI)\n`;

    //     return output;
    // }

    // async getFormattedPortfolio(runtime): Promise<string> {
    //     try {
    //         const portfolio = await this.fetchPortfolioValue();
    //         return this.formatPortfolio(runtime, portfolio);
    //     } catch (error) {
    //         elizaLogger.error("Error generating portfolio report:", error);
    //         return "Unable to fetch wallet information. Please try again later.";
    //     }
    // }

    async getNetName(): Promise<string> {
        return this.a0giNetName;
    }

    async getPrivateKey(): Promise<string> {
        return this.privateKey;
    }

    async getEvmRpc(): Promise<string> {
        return this.evmRpc;
    }

    async getIndexerRpc(): Promise<string> {
        return this.indexerRpc;
    }

    async getAccountAddress(): Promise<string> {
        return this.signer.address;
    }

    async getFlowAddress(): Promise<string> {
        return this.flowAddress;
    }

    async getDAEntranceAddress(): Promise<string> {
        return this.DAEntranceAddress;
    }

    async getExplorerAccount(): Promise<string> {
        return this.explorerAccount;
    }

    async getExplorerTransaction(): Promise<string> {
        return this.explorerTransaction;
    }

    async getExplorerToken(): Promise<string> {
        return this.explorerToken;
    }

    async getExplorerIndexerSubmission(): Promise<string> {
        return this.explorerIndexerSubmission;
    }

    async getExplorerIndexerAccount(): Promise<string> {
        return this.explorerIndexerAccount;
    }

    async getSigner(): Promise<ethers.Wallet> {
        return this.signer;
    }

    async getBalances(): Promise<string> {

        const totalA0GI = await this.signer.provider.getBalance(this.signer.address);

    // signer.sendTransaction({
    //     to: address,
    //     value: ethers.parseEther("0.1"),
    // });

        const a0giAmount = ethers.formatEther(totalA0GI);

        return a0giAmount;
    }
}

export function initWalletProvider(runtime: IAgentRuntime) {
    const [a0giNetName, privateKey, evmRpc, indexerRpc, flowAddress, DAEntranceAddress, explorerAccount, explorerTransaction, explorerToken, explorerIndexerSubmission, explorerIndexerAccount, signer ] =  verifyWalletParams(runtime);

    const provider = new WalletProvider(
        a0giNetName,
        privateKey,
        evmRpc, 
        indexerRpc, 
        flowAddress, 
        DAEntranceAddress, 
        explorerAccount, 
        explorerTransaction, 
        explorerToken, 
        explorerIndexerSubmission, 
        explorerIndexerAccount, 
        signer,
        runtime.cacheManager
    );
    
    return provider;
}

const walletProvider: Provider = {
    get: async (
        runtime: IAgentRuntime,
        _message: Memory,
        _state?: State
    ): Promise<string | null> => {
        try {
            const provider = initWalletProvider(runtime);
            return await provider.getBalances();
            // return await provider.getFormattedPortfolio(runtime);
        } catch (error) {
            elizaLogger.error("Error in wallet provider:", error);
            return null;
        }
    },
};

// Module exports
export { walletProvider };