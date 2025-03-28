// It should get the balance of the the wallet address or specify address.
import {
    type Action,
    ActionExample,
    composeContext,
    Content,
    elizaLogger,
    generateObject,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    ModelClass,
    State,
} from "@elizaos/core";

import { z } from "zod";

import { ethers } from "ethers";
import { checkBalancesTemplate } from "../utils/templates";
import { walletProvider, initWalletProvider } from "../providers/wallet";

// export { checkBalancesTemplate };

export interface BalanceContent extends Content {
    address: string | null;
    token: string | null;
}

function isBalanceContent(content: Content): content is BalanceContent {
    elizaLogger.log("Content for Balance", content);
    return typeof content.address === "string" && content.address.startsWith("0x");
}

export default {
    name: "CHECK_BALANCES",
    similes: ["BALANCE", "GET_BALANCE", "CHECK_BALANCE", "CHECK_BALANCES_AMOUNT"],
    
    validate: async (_runtime: IAgentRuntime, message: Memory) => {
        elizaLogger.log("Validating A0GI Balance from user:", message.userId);
        return true;
    },

    description: "Check the balance of the wallet or specify address",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback,
    ): Promise<boolean> => {
        elizaLogger.log("Starting Check Balance handler...");

        const walletInfo = await walletProvider.get(runtime, message, state);
        state.walletInfo = walletInfo;

        // Initialize or update state
        let currentState: State;
        if (!state) {
            currentState = (await runtime.composeState(message)) as State;
        } else {
            currentState = await runtime.updateRecentMessageState(state);
        }

        // Define the schema for the expected output
        const BalanceSchema = z.object({
            address: z.string(),
            token: z.union([z.string(), z.null()]),
        });

        // Compose Balance context
        const BalanceContext = composeContext({
            state: currentState,
            template: checkBalancesTemplate,
        });

        // Generate Balance content with the schema
        const content = await generateObject({
            runtime,
            context: BalanceContext,
            schema: BalanceSchema,
            modelClass: ModelClass.SMALL,
        });

        const BalanceContent = content.object as BalanceContent;

        try {
            const walletProvider = initWalletProvider(runtime);
            let address: string;
            // Validate Balance content
            if (BalanceContent.address == null || BalanceContent.address == "" || BalanceContent.address == "0x") {
                address = await walletProvider.getAccountAddress();
                elizaLogger.error("Check Balance address unset");
            } else {
                if (!isBalanceContent(BalanceContent)) {
                    elizaLogger.error("Invalid content for CHECK_BALANCES action.");
                    if (callback) {
                        callback({
                            text: "Unable to process Balance request. Invalid content provided.",
                            content: { error: "Invalid Balance content" },
                        });
                    }
                    return false;
                }
                address = BalanceContent.address;
            }

            const evmRpc = await walletProvider.getEvmRpc();
            const provider = new ethers.JsonRpcProvider(evmRpc);
            const totalA0GI = await provider.getBalance(address)
            const balances = ethers.formatEther(totalA0GI);

            if (callback) {
                if ( BalanceContent.token == null || BalanceContent.token == "" ) {
                    BalanceContent.token = "A0GI";
                }

                callback({
                    text: `Balance of ${address} token: ${BalanceContent.token} is ${balances}`,
                    content: {
                        success: true,
                        address: address,
                        balances: balances,
                    },
                });
            }

            return true;
        } catch (error) {
            elizaLogger.error("Error during token Balance:", error);
            if (callback) {
                callback({
                    text: `Error Balance tokens: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Check A0GI balance of 0x5C01dc5D3047dB6Ae4E9A9B0946e2092a1a3A788",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "I'll help you check A0GI balance of 0x5C01dc5D3047dB6Ae4E9A9B0946e2092a1a3A788",
                    action: "CHECK_BALANCES",
                    content: {
                        address: "0x5C01dc5D3047dB6Ae4E9A9B0946e2092a1a3A788",
                        token: "A0GI",
                    },
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Check my wallet balance on A0GI",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "I'll help you check your wallet balance on A0GI",
                    action: "CHECK_BALANCES",
                    content: {
                        address: "{{walletAddress}}",
                        token: "A0GI",
                    },
                },
            },
        ],
    ] as ActionExample[][],
} as Action;