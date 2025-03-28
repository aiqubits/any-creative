import {
    Action,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
    ModelClass,
    Content,
    ActionExample,
    generateObject,
    elizaLogger,
} from "@elizaos/core";
import { Indexer, ZgFile } from "@0glabs/0g-ts-sdk";
import { composeContext } from "@elizaos/core";
import { promises as fs } from "fs";
import { logSecurityEvent, monitorDownload } from '../utils/monitoring';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { downloadTemplate } from "../utils/templates";
import { initWalletProvider } from "../providers/wallet"
import { z } from "zod";

export interface DownloadContent extends Content {
    rootHash: string;
}

function isDownloadContent(
    _runtime: IAgentRuntime,
    content: any
): content is DownloadContent {
    elizaLogger.debug("Validating download content", { content });
    return typeof content.rootHash === "string" &&
        content.rootHash.length === 66 &&
        content.rootHash.startsWith("0x");
}

export const zgDownload: Action = {
    name: "ZEROG_DOWNLOAD",
    similes: [
        "DOWNLOAD_FILE_FROM_ZEROG",
        "DOWNLOAD_FROM_ZERO_GRAVITY",
        "FROM_ZEROG_DOWNLOAD_FILE",
        "FROM_ZERO_GRAVITY_DOWNLOAD_FILE",
    ],
    description: "Download data from 0G protocol",

    validate: async (runtime: IAgentRuntime, message: Memory) => {
        elizaLogger.debug("Starting ZEROG_DOWNLOAD validation", { messageId: message.id });

        try {
            const __dirname = dirname(fileURLToPath(import.meta.url));
            const defaultDownloadDir = path.join(__dirname, "agent", "data", "downloads");

            const config = {
                downloadDirectory: runtime.getSetting("ZEROG_DOWNLOAD_DIR") || defaultDownloadDir,
            };

            // Validate config values
            const stats = await fs.promise.stat(config.downloadDirectory);

            if (!stats.isDirectory()) {
                elizaLogger.error("Invalid ZEROG_DOWNLOAD_DIR setting", {
                    value: runtime.getSetting("ZEROG_DOWNLOAD_DIR"),
                    messageId: message.id
                });
                return false;
            }

            elizaLogger.info("ZEROG_DOWNLOAD action settings validated", {
                config,
                messageId: message.id
            });
            return true;
        } catch (error) {
            elizaLogger.error("Error validating ZEROG_DOWNLOAD settings", {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                messageId: message.id
            });
            return false;
        }
    },

    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: any,
        callback: HandlerCallback
    ) => {
        elizaLogger.info("ZEROG_DOWNLOAD action started", {
            messageId: message.id,
            hasState: Boolean(state),
            hasCallback: Boolean(callback)
        });
        
        let file: ZgFile | undefined;
        try {
            // Update state if needed
            if (!state) {
                elizaLogger.debug("No state provided, composing new state");
                state = (await runtime.composeState(message)) as State;
            } else {
                elizaLogger.debug("Updating existing state");
                state = await runtime.updateRecentMessageState(state);
            }

            // Define the schema for the expected output
            const downloadSchema = z.object({
                rootHash: z.string(),
            });

            // Compose download context
            elizaLogger.debug("Composing download context");
            const downloadContext = composeContext({
                state,
                template: downloadTemplate,
            });

            // Generate download content
            elizaLogger.debug("Generating download content");
            const response = await generateObject({
                runtime,
                context: downloadContext,
                schema: downloadSchema,
                modelClass: ModelClass.MEDIUM,
            });

            const downloadContent = response.object as DownloadContent;

            // Validate download content
            if (!isDownloadContent(runtime, downloadContent)) {
                const error = "Invalid content for DOWNLOAD action";
                elizaLogger.error(error, {
                    downloadContent,
                    messageId: message.id
                });
                if (callback) {
                    callback({
                        text: "Unable to process 0G download request. Invalid content provided.",
                        content: { error }
                    });
                }
                return false;
            }
            
            // Initialize security validator
            const __dirname = dirname(fileURLToPath(import.meta.url));
            const defaultDownloadDir = path.join(__dirname, "agent", "data", "downloads");

            const downloadDirectory = runtime.getSetting("ZEROG_DOWNLOAD_DIR") || defaultDownloadDir;

            const rootHash = downloadContent.rootHash;

                // Initialize wallet connection
                elizaLogger.info("Initializing wallet connection");
                const provider = initWalletProvider(runtime);

                const evmRpc = await provider.getEvmRpc();
                const signer = await provider.getSigner();
                const indexerRpc = await provider.getIndexerRpc();
                const indexer = new Indexer(indexerRpc);

                // Download file to ZeroG
                elizaLogger.info("Starting file download to ZeroG", {
                    outputPath: downloadDirectory,
                    messageId: message.id,
                });

                const startTime = Date.now();

                const downloadError = await indexer.download(
                    rootHash, 
                    downloadDirectory,
                    true
                );

                elizaLogger.info("File download to ZeroG completed")
                if (downloadError !== null) {
                    const error = `Error downloading file: ${downloadError instanceof Error ? downloadError.message : String(downloadError)}`;
                    elizaLogger.error(error, { messageId: message.id });

                    if (callback) {
                        callback({
                            text: "Download failed: Error during file download.",
                            content: { error }
                        });
                    }
                    return false;
                }

                // Log successful download
                monitorDownload({
                    outputPath: downloadDirectory,
                    duration: Date.now() - startTime,
                    success: true
                });

                elizaLogger.info("File downloaded successfully", {
                    rootHash: rootHash,
                    outputPath: downloadDirectory,
                    duration: Date.now() - startTime,
                    messageId: message.id
                });

                if (callback) {
                    callback({
                        text: "File downloaded successfully to ZeroG.",
                        content: {
                            success: true,
                            rootHash: rootHash,
                            outputPath: downloadDirectory,
                        }
                    });
                }

                return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logSecurityEvent("Unexpected error in download action", "high", {
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
                messageId: message.id
            });

            elizaLogger.error("Unexpected error during file download", {
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
                messageId: message.id
            });

            if (callback) {
                callback({
                    text: "Download failed due to an unexpected error.",
                    content: { error: errorMessage }
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
                    text: "download 0xcca86685b5bbd328d6d44b5c4024dc918903596f1137a99d237b3b35e75fb24c file",
                    action: "ZEROG_DOWNLOAD",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Sure, I will help you download the file 0xcca86685b5bbd328d6d44b5c4024dc918903596f1137a99d237b3b35e75fb24c from storage.",
                    action: "ZEROG_DOWNLOAD",
                    content: {
                        outputPath: "/tmp/xxxxxxxx",
                    },
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "can you help me download 0xcca86685b5bbd328d6d44b5c4024dc918903596f1137a99d237b3b35e75fb24c file?",
                    action: "ZEROG_DOWNLOAD",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Sure, I will help you download the file 0xcca86685b5bbd328d6d44b5c4024dc918903596f1137a99d237b3b35e75fb24c from storage.",
                    action: "ZEROG_DOWNLOAD",
                    content: {
                        outputPath: "/tmp/xxxxxxxx",
                    },
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I need to download 0xcca86685b5bbd328d6d44b5c4024dc918903596f1137a99d237b3b35e75fb24c file",
                    action: "ZEROG_DOWNLOAD",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Sure, I will help you download the file 0xcca86685b5bbd328d6d44b5c4024dc918903596f1137a99d237b3b35e75fb24c from storage.",
                    action: "ZEROG_DOWNLOAD",
                    content: {
                        outputPath: "/tmp/xxxxxxxx",
                    },
                },
            },
        ],
    ] as ActionExample[][],
} as Action;