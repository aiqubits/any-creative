export const DECIMALS = 9;
export const TRANSACTION_FEE = 0.1 * 1e9; // 0.01 A0GI fee
export const FETCH_A0GI_USDT_URL = "https://www.okx.com/api/v5/market/ticker?instId=A0GI-USDT"
export type Network = "mainnet" | "testnet" | "locahost" |"";
                                
export const factoryAddressToken = "0x3AbfF19518A028Df07A6EE0539d288F28eEF474B";
export const factoryAddressNFT = "0x75baF100beEc535C8CA0A2938084Fa1f1037D6e0";

export function getNetworkConfig(
    netName: string
) {
    switch (netName) {
        case 'testnet':
        case '':
            return {
                evmRpcUrl: 'https://evmrpc-testnet.0g.ai',
                indexerRpcUrl: 'https://indexer-storage-testnet-turbo.0g.ai',
                flowContractAddress: '0xbD2C3F0E65eDF5582141C35969d66e34629cC768',
                DAEntranceContractAdress: '0x857C0A28A8634614BB2C96039Cf4a20AFF709Aa9',
                explorerAccountUrl: "https://chainscan-newton.0g.ai/address/",
                explorerTransactionUrl: "https://chainscan-newton.0g.ai/tx/",
                explorerTokenUrl: "https://chainscan-newton.0g.ai/token",
                explorerIndexerSubmissionUrl: "https://storagescan-newton.0g.ai/submission/",
                // https://storagescan-newton.0g.ai/submission/5912623?network=turbo
                explorerIndexerAccountUrl: "https://storagescan-newton.0g.ai/address/"
                // https://storagescan-newton.0g.ai/address/0x67e2c2e6186ae9Cc17798b5bD0c3c36Ef0209aC9?network=turbo
                };
        case 'mainnet':
            return {
                evmRpcUrl: 'https://evmrpc-testnet.0g.ai',
                indexerRpcUrl: 'https://indexer-storage-testnet-turbo.0g.ai',
                flowContractAddress: '0xbD2C3F0E65eDF5582141C35969d66e34629cC768',
                DAEntranceContractAdress: '0x857C0A28A8634614BB2C96039Cf4a20AFF709Aa9',
                explorerAccountUrl: "https://chainscan-newton.0g.ai/address/",
                explorerTransactionUrl: "https://chainscan-newton.0g.ai/tx/",
                explorerTokenUrl: "https://chainscan-newton.0g.ai/token",
                explorerIndexerSubmissionUrl: "https://storagescan-newton.0g.ai/submission/",
                // https://storagescan-newton.0g.ai/submission/5912623?network=turbo
                explorerIndexerAccountUrl: "https://storagescan-newton.0g.ai/address/"
                // https://storagescan-newton.0g.ai/address/0x67e2c2e6186ae9Cc17798b5bD0c3c36Ef0209aC9?network=turbo
                };
        default:
            throw new Error('Invalid A0GI_Network');
    }
};
export const DEFAULT_NETWORK = 'testnet';
