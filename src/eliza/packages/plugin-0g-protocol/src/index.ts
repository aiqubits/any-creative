import type { Plugin } from "@elizaos/core";
import transferAction from "./actions/transfer.ts";
import checkBalancesAction from "./actions/checkBalances.ts";
import createMedia from "./actions/createMedia.ts"

import { walletProvider } from "./providers/wallet.ts";
import { zgUpload } from "./actions/uploadFile.ts"
import issueToken from "./actions/issueToken.ts"
import issueNonFungibleToken  from "./actions/issueNonFungibleToken.ts"

export const zerogPlugin: Plugin = {
    name: "zerog",
    description: "Agent zeroG protocol with basic actions and evaluators",
    actions: [
        zgUpload,
        createMedia,
        transferAction,
        checkBalancesAction,
        issueToken,
        issueNonFungibleToken,
    ],
    evaluators: [],
    providers: [walletProvider],
};
export default zerogPlugin;
