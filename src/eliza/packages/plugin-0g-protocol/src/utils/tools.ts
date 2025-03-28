import {
    IAgentRuntime,
} from "@elizaos/core";
import { ethers } from "ethers";
import { Network, DEFAULT_NETWORK, getNetworkConfig } from "../environment";

export function verifyWalletParams(runtime: IAgentRuntime): [string, string, string, string, string, string, string, string, string, string, string, ethers.Wallet] {
    const privateKey = runtime.getSetting("ZEROG_PRIVATE_KEY");
    if (!privateKey) {
        throw new Error("ZEROG_PRIMATE_KEY is not configured");
    }

    if (privateKey.length !== 64) {
        throw new Error("Invalid ZEROG_PRIMATE_KEY format");
    }

    const address = (new ethers.Wallet(privateKey)).address;
    if (!ethers.isAddress(address)) {
        throw new Error("Invalid ZEROG_PRIMATE_KEY format");
    }

    let a0giNetName: string;
    
    if (!runtime.getSetting("ZEROG_NETWORK")) {
        a0giNetName = DEFAULT_NETWORK;
    } else {
        a0giNetName = runtime.getSetting("ZEROG_NETWORK") as Network;
    }

    const evmRpc = getNetworkConfig(a0giNetName).evmRpcUrl;
    const provider = new ethers.JsonRpcProvider(evmRpc);

    const signer = new ethers.Wallet(privateKey, provider);

    const indexerRpc = getNetworkConfig(a0giNetName).indexerRpcUrl;

    const flowAddress = getNetworkConfig(a0giNetName).flowContractAddress;
    const DAEntranceAddress = getNetworkConfig(a0giNetName).DAEntranceContractAdress;

    const explorerAccount = getNetworkConfig(a0giNetName).explorerAccountUrl;
    const explorerTransaction = getNetworkConfig(a0giNetName).explorerTransactionUrl;
    const explorerToken = getNetworkConfig(a0giNetName).explorerTokenUrl;
    const explorerIndexerSubmission = getNetworkConfig(a0giNetName).explorerIndexerSubmissionUrl;
    const explorerIndexerAccount = getNetworkConfig(a0giNetName).explorerIndexerAccountUrl;

    return [a0giNetName, privateKey, evmRpc, indexerRpc, flowAddress, DAEntranceAddress, explorerAccount, explorerTransaction, explorerToken, explorerIndexerSubmission, explorerIndexerAccount, signer];
}
