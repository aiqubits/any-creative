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

import { z } from "zod";
import fs from "fs";
import { walletProvider } from "../providers/wallet";
import { createMediaTemplate } from "../utils/templates";
import axios from "axios";

export interface CreateMediaContent extends Content {
    filePath: string | null;
    fileDescription: string | null;
}

function isCreateMediaContent(content: Content): content is CreateMediaContent {
    elizaLogger.log("Content for CreateMedia", content);
    return (
        typeof content.filePath === "string" &&
        typeof content.fileDescription === "string"
    );
}

function retainDescriptions(input: string): string {
    // const match = input.split(/[,.、，。]/);
    // const descriptions = match.slice(1).join(",");
    return input.trim();
}

export default {
    name: "CREATE_MEDIA",
    similes: [
        "CREATE_VIDEO",
        "CREATE_MEDIA_VIDEO",
        "GENERATE_VIDEO",
        "GENERATE_MEDIA",
    ],

    description: "Create Media from the local Multimodal-Inference",

    validate: async (runtime: IAgentRuntime, message: Memory) => {
        elizaLogger.log("Validating Create Media:", message.userId);
        return true;
    },

    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ): Promise<boolean> => {
        elizaLogger.info("Starting CREATE_MEDIA handler...");

        const walletInfo = await walletProvider.get(runtime, message, state);
        state.walletInfo = walletInfo;

        // Initialize or update state
        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        // Define the schema for the expected output
        const createMediaSchema = z.object({
            filePath: z.string(),
            fileDescription: z.string(),
        });

        // Compose transfer context
        const createMediaContext = composeContext({
            state,
            template: createMediaTemplate,
        });

        // Generate transfer content with the schema
        const responseContent = await generateObject({
            runtime,
            context: createMediaContext,
            schema: createMediaSchema,
            modelClass: ModelClass.SMALL,
        });

        const createMediaContent = responseContent.object as CreateMediaContent;

        // Validate transfer content
        if (!isCreateMediaContent(createMediaContent)) {
            elizaLogger.error("Invalid content for CREATE_MEDIA action.");
            if (callback) {
                callback({
                    text: "Unable to process CREATE_MEDIA request. Invalid content provided.",
                    content: { error: "Invalid CREATE_MEDIA content" },
                });
            }
            return false;
        }

        try {
            const filePath: string = createMediaContent.filePath;
            const fileDescription = retainDescriptions(createMediaContent.fileDescription);

            const result = await axios.post('http://localhost:7860/i2v_generation', {
                img2vid_prompt: fileDescription,
                img2vid_image: filePath,
                resolution: "480P",
                duration: 3,
                index: -1, 		
                n_prompt: "non-photorealistic", 
              });

            if (callback) {
                callback({
                    text: `Successfully Create Media, Click to view: ${result.data.url}`,
                    content: {
                        success: true,
                        status: result.status,
                        config: result.config,
                        statusText: result.statusText,
                    },
                });
            }

            return true;
        } catch (error) {
            elizaLogger.error("Error during Media Create:", error);
            if (callback) {
                callback({
                    text: `Error creating video: ${error.message}`,
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
                    text: "Create a video for this image. This is a clever little German shepherd.",
                    action: "CREATE_MEDIA",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "I'll create a video for this image and the description you provided",
                    action: "CREATE_MEDIA",
                    content: {
                        filePath: "/opt/js/xxxxx",
                        fileDescription: "0g/aws/phala",
                    },
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Successfully Create a video, click to view the video.",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Create video",
                    action: "CREATE_MEDIA",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Create MEDIA",
                    action: "CREATE_MEDIA",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;