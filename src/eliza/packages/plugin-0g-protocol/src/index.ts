import type { Plugin } from "@elizaos/core";
// import { transferAction } from "./actions/transfer.ts";
// import { walletProvider } from "./providers/wallet.ts";
import { zgUpload } from "./actions/uploadMedia.ts"

// export * as actions from "./actions";
// export * as providers from "./providers";

export const zerogPlugin: Plugin = {
    name: "zerog",
    description: "Agent zeroG protocol with basic actions and evaluators",
    actions: [
        zgUpload
    ],
    evaluators: [],
    providers: [],
};
export default zerogPlugin;
