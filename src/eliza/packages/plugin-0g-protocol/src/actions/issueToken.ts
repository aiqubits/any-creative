import {
    type Action,
    type ActionExample,
    composeContext,
    Content,
    elizaLogger,
    generateObject,
    type HandlerCallback,
    type IAgentRuntime,
    type Memory,
    ModelClass,
    type State,
} from "@elizaos/core";
import { z } from "zod";
import { ethers } from "ethers";
import * as path from "path";
import { initWalletProvider } from "../providers/wallet";
import { TRANSACTION_FEE, factoryAddressToken } from "../environment";
import { issueTokenTemplate } from "../utils/templates";
import ERC20Factory from "../utils/ERC20Factory.json";

export { issueTokenTemplate };

interface DeployTokenContent extends Content {
    name: string;
    symbol: string;
    decimals: string;
    initialSupply: string;
    initialHolder: string;
}

export function isDeployTokenContent(content: DeployTokenContent) {
    // Validate types
elizaLogger.info(`validTypes: ${typeof content.symbol}--${typeof content.decimals}--${typeof content.name}--${typeof content.initialHolder}--${typeof content.initialSupply}`)

    const validTypes =
        typeof content.symbol === "string" &&
        typeof content.decimals === "string" &&
        typeof content.name === "string" &&
        typeof content.initialHolder === "string" &&
        typeof content.initialSupply === "string";
    if (!validTypes) {
        elizaLogger.error("isDeployTokenContent validTypes failed!");
        return false;
    }

    // Validate addresses (must be 32-bytes long with 0x prefix)
    const validAddresses =
        content.symbol.length > 2 &&
        Number.parseInt(content.decimals) > 0 &&
        Number.parseInt(content.initialSupply) > 0 &&
        content.initialHolder.startsWith("0x") &&
        content.initialHolder.length === 42;
    if (!validAddresses) {
        elizaLogger.error("isDeployTokenContent validAddresses failed!");
        return false;
    }

    return validAddresses;
}

export default {
    name: "DEPLOY_0G_TOKEN",
    similes: [
        "DEPLOY_0G_MEME_TOKEN",
        "DEPLOY_0G_COIN",
        "CREATE_0G_COIN",
        "DEPLOY_MEME_COIN",
        "CREATE_MEME_COIN",
        "DEPLOY_FUNGIBLE_TOKEN",
        "CREATE_FUNGIBLE_TOKEN",
        "CREATE_TOKEN",
        "DEPLOY_TOKEN",
        "DEPLOY_COIN",
        "CREATE_COIN",
    ],

    validate: async (runtime: IAgentRuntime, message: Memory) => {
        elizaLogger.info("Starting DEPLOY_0G_TOKEN validation", { messageId: message.id });
        return true;
    },

    description:
        "Deploy a Meme Coin on 0G. Use this action when a user asks you to deploy a new token on 0G.",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ): Promise<boolean> => {
        elizaLogger.info(
            "Starting DEPLOY_0G_TOKEN handler..."
        );
        // Fix: Create new variable instead of reassigning parameter
        let currentState = state;
        if (!currentState) {
            currentState = (await runtime.composeState(message)) as State;
        } else {
            currentState = await runtime.updateRecentMessageState(currentState);
        }

        // Define the schema for the expected output
        const transferSchema = z.object({
            name: z.string(),
            symbol: z.string(),
            decimals: z.string(),
            initialHolder: z.string(),
            initialSupply: z.string()
        });

        const deployContext = composeContext({
            state: currentState,
            template: issueTokenTemplate,
        });

        // Generate transfer content with the schema
        const response = await generateObject({
            runtime,
            context: deployContext,
            schema: transferSchema,
            modelClass: ModelClass.SMALL,
        });

        const deployTokenContent = response.object as DeployTokenContent;

        elizaLogger.info(`init supply: ${deployTokenContent.initialSupply}`);
        elizaLogger.info(`initialHolder: ${deployTokenContent.initialHolder}`);
        elizaLogger.info(`decimals: ${deployTokenContent.decimals}`);
        elizaLogger.info(`symbol: ${deployTokenContent.symbol}`);
        elizaLogger.info(`name: ${deployTokenContent.name}`);

        if (!isDeployTokenContent(deployTokenContent)) {
            callback?.({
                text: "Invalid deployment content, please try again.",
            });
            return false;
        }

        try {
            const provider = initWalletProvider(runtime);
            const singer = await provider.getSigner();
            
            const factory = new ethers.Contract(
                factoryAddressToken,
                ERC20Factory.abi,
                singer
              );

            const tokenName = deployTokenContent.name;
            const tokenSymbol = deployTokenContent.symbol;
            const tokenDecimals = deployTokenContent.decimals;
            const tokenInitialSupply = deployTokenContent.initialSupply;
            const tokenInitialHolder = deployTokenContent.initialHolder;
            const decimals = parseInt(tokenDecimals);
            elizaLogger.info("Deploying token contract...")
            
            const txCreateERC20 = await factory.createERC20(
                tokenName,
                tokenSymbol,
                decimals,
                ethers.parseUnits(tokenInitialSupply, decimals),
                tokenInitialHolder
            );

            const receiptCreateERC20 = await txCreateERC20.wait();

            const txUrl = path.join(await provider.getExplorerTransaction(), receiptCreateERC20.hash);

            elizaLogger.info(
                `Token deployment initiated for: ${deployTokenContent.name} at Hash TX: ${txUrl}`
            );

            callback?.({
                text: `Token Deployment completed successfully! ${deployTokenContent.name} at Hash TX: ${txUrl}`,
                content: {
                    success: true,
                    name: tokenName,
                    recipient: tokenInitialHolder,
                },
            });

            return true;
        } catch (error) {
            elizaLogger.error("Error during token deployment:", error);
            callback?.({
                text: `Error during deployment: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Deploy a new token called TokenFounder, symbol called TFT, decimals is 9, with the initial holder being 0x67e2c2e6186ae9Cc17798b5bD0c3c36Ef0209aC9, with an initial supply of 100000000 on 0G Network.",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Ok, I'll deploy the Lords token to 0G Network...",
                    action: "DEPLOY_0G_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Deploy the MEME coin to 0G Network",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Ok, I'll deploy your coin on 0G Network...",
                    action: "DEPLOY_0G_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Create a new coin on 0G",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Ok, I'll create a new coin for you on 0G Network...",
                    action: "DEPLOY_0G_TOKEN",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;