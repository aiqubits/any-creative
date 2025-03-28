// It should transfer tokens from the agent's wallet to the recipient.
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

import * as path from "path";
import { z } from "zod";
import { ethers } from "ethers";

import { walletProvider, initWalletProvider } from "../providers/wallet";

import { transferTemplate } from "../utils/templates";

// export { transferTemplate };

export interface TransferContent extends Content {
    recipient: string;
    amount: string | number;
}

function isTransferContent(content: Content): content is TransferContent {
    elizaLogger.log("Content for transfer", content);
    return (
        typeof content.recipient === "string" &&
        content.recipient.startsWith("0x") &&
        (typeof content.amount === "string" ||
            typeof content.amount === "number")
    );
}

function retainFirstConsecutiveNumbers(input: string): string {
    const match = input.match(/^(?:\d+\.\d+|\.\d+|\d+)/);

    return match ? match[0] : "";
}

export default {
    name: "SEND_A0GI_TOKEN",
    similes: [
        "TRANSFER_TOKEN",
        "TRANSFER_TOKENS",
        "SEND_TOKEN",
        "SEND_TOKENS",
        "SEND_A0GI",
        "PAY",
    ],

    validate: async (runtime: IAgentRuntime, message: Memory) => {
        elizaLogger.log("Validating A0GI token transfer from user:", message.userId);
        return true;
    },
    
    description: "Transfer tokens from the agent's wallet to another address",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ): Promise<boolean> => {
        elizaLogger.log("Starting SEND_A0GI_TOKEN handler...");

        const walletInfo = await walletProvider.get(runtime, message, state);
        state.walletInfo = walletInfo;

        // Initialize or update state
        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        // Define the schema for the expected output
        const transferSchema = z.object({
            recipient: z.string(),
            amount: z.string() || z.number(),
        });

        // Compose transfer context
        const transferContext = composeContext({
            state,
            template: transferTemplate,
        });

        // Generate transfer content with the schema
        const content = await generateObject({
            runtime,
            context: transferContext,
            schema: transferSchema,
            modelClass: ModelClass.SMALL,
        });

        const transferContent = content.object as TransferContent;

        // Validate transfer content
        if (!isTransferContent(transferContent)) {
            elizaLogger.error("Invalid content for TRANSFER_A0GI_TOKEN action.");
            if (callback) {
                callback({
                    text: "Unable to process transfer request. Invalid content provided.",
                    content: { error: "Invalid transfer content" },
                });
            }
            return false;
        }

        try {
            const recipientAddress: string = transferContent.recipient.trim();
            const amountNumber = retainFirstConsecutiveNumbers(transferContent.amount.toString()).trim();

            const provider = initWalletProvider(runtime);
            const singer = await provider.getSigner();

            const tx = {
                to: recipientAddress,
                value: ethers.parseEther(amountNumber)
            }

            const txRes = await singer.sendTransaction(tx);
            const txReceipt = await txRes.wait();

            elizaLogger.log("Transfer successful txHash:", txReceipt.hash);

            const txUrl = path.join(await provider.getExplorerTransaction(), txReceipt.hash);
            if (callback) {
                callback({
                    text: `Successfully transferred ${transferContent.amount} to ${recipientAddress}, Click to view Transactions: ${txUrl}`,
                    content: {
                        success: true,
                        hash: txReceipt.hash,
                        amount: transferContent.amount,
                        recipient: recipientAddress,
                    },
                });
            }

            return true;
        } catch (error) {
            elizaLogger.error("Error during token transfer:", error);
            if (callback) {
                callback({
                    text: `Error transferring tokens: ${error.message}`,
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
                    text: "Send 1 A0GI tokens to 0x5C01dc5D3047dB6Ae4E9A9B0946e2092a1a3A788",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "I'll send 1 A0GI tokens now...",
                    action: "SEND_A0GI_TOKEN",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Successfully sent 1 A0GI tokens to 0x5C01dc5D3047dB6Ae4E9A9B0946e2092a1a3A788, Transaction: 0x39a8c432d9bdad993a33cc1faf2e9b58fb7dd940c0425f1d6db3997e4b4b05c0",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;