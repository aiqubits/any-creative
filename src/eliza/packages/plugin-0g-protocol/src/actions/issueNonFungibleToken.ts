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
import { factoryAddressNFT } from "../environment";
import { issueNonFungibleTokenTemplate } from "../utils/templates";
import ERC721Factory from "../utils/ERC721Factory.json";

export { issueNonFungibleTokenTemplate };

interface DeployNonFungibleTokenContent extends Content {
    name: string;
    symbol: string;
    baseURI: string;
    initialOwner: string;
}

export function isDeployNonFungibleTokenContent(content: DeployNonFungibleTokenContent) {
    // Validate types
    const validTypes =
        typeof content.symbol === "string" &&
        typeof content.name === "string" &&
        typeof content.baseURI === "string";
    if (!validTypes) {
        elizaLogger.error("isDeployNonFungibleTokenContent validTypes failed!");
        return false;
    }

    // Validate addresses (must be 32-bytes long with 0x prefix)
    const validAddresses =
        content.symbol.length > 2 &&
        content.initialOwner.startsWith("0x") &&
        content.initialOwner.length === 42;
    if (!validAddresses) {
        elizaLogger.error("isDeployNonFungibleTokenContent validAddresses failed!");
        return false;
    }

    return validAddresses;
}

export default {
    name: "DEPLOY_0G_NFT",
    similes: [
        "DEPLOY_0G_NFT",
        "CREATE_0G_NFT",
        "DEPLOY_NON_FUNGIBLE_TOKEN",
        "CREATE_NON_FUNGIBLE_TOKEN",
        "CREATE_NFT",
        "DEPLOY_NFT",
    ],

    validate: async (runtime: IAgentRuntime, message: Memory) => {
        elizaLogger.info("Starting DEPLOY_0G_NFT validation", { messageId: message.id });
        return true;
    },    

    description:
        "Deploy a NFT on 0G. Use this action when a user asks you to deploy a new NFT on 0G.",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ): Promise<boolean> => {
        elizaLogger.info(
            "Starting DEPLOY_0G_NFT handler..."
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
            baseURI: z.string(),
            initialOwner: z.string()
        });

        const deployContext = composeContext({
            state: currentState,
            template: issueNonFungibleTokenTemplate,
        });

        // Generate transfer content with the schema
        const response = await generateObject({
            runtime,
            context: deployContext,
            schema: transferSchema,
            modelClass: ModelClass.SMALL,
        });

        const deployNonFungibleTokenContent = response.object as DeployNonFungibleTokenContent;

        if (!isDeployNonFungibleTokenContent(deployNonFungibleTokenContent)) {
            callback?.({
                text: "Invalid deployment content, please try again.",
            });
            return false;
        }

        try {
            const provider = initWalletProvider(runtime);
            const singer = await provider.getSigner();
            
            const factory = new ethers.Contract(
                factoryAddressNFT,
                ERC721Factory.abi,
                singer
              );

            const tokenName = deployNonFungibleTokenContent.name;
            const tokenSymbol = deployNonFungibleTokenContent.symbol;
            const tokenBaseURI = deployNonFungibleTokenContent.baseURI;
            const tokenInitialOwner = deployNonFungibleTokenContent.initialOwner;
            
            elizaLogger.info("Deploying nft contract...")

            const txCreateERC721 = await factory.createCollection(
                tokenName,
                tokenSymbol,
                tokenBaseURI
            );
            
            const receiptCreateERC721 = await txCreateERC721.wait();

            const txMintERC721 = await factory.mint(tokenInitialOwner);

            const receiptMintERC721 = await txMintERC721.wait();

            const txCreateUrl = path.join(await provider.getExplorerTransaction(), receiptCreateERC721.hash);

            const txMintUrl = path.join(await provider.getExplorerTransaction(), receiptMintERC721.hash);

            elizaLogger.info(
                `Token deployment initiated for: ${deployNonFungibleTokenContent.symbol} at Hash TX: ${txCreateUrl}, Mint Hash TX: ${txMintUrl}.`
            );

            callback?.({
                text: `NFT Deployment completed successfully! ${deployNonFungibleTokenContent.symbol} at Hash TX: ${txCreateUrl}, Mint Hash TX: ${txMintUrl}.`,
                content: {
                    success: true,
                    name: tokenName,
                    recipient: tokenInitialOwner,
                },
            });

            return true;
        } catch (error) {
            elizaLogger.error("Error during nft deployment:", error);
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
                    text: "Deploy a new NFT, name is called NonFungibleTokenFounder, symbol is called NFTF, base uri is ipfs://QmXJ7.../, with the initial owner being 0x67e2c2e6186ae9Cc17798b5bD0c3c36Ef0209aC9 on 0G Network.",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Ok, I'll deploy the NonFungibleTokenFounder NFT to 0G Network...",
                    action: "DEPLOY_0G_NFT",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Deploy the NFT to 0G Network",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Ok, I'll deploy your NFT on 0G Network...",
                    action: "DEPLOY_0G_NFT",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Create a new coin on 0g",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Ok, I'll create a new coin for you on 0G Network...",
                    action: "DEPLOY_0G_NFT",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;