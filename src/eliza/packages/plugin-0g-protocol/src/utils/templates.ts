export const createMediaTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example response:
\`\`\`json
{
    "filePath": "/opt/js/project/xxxxx",
    "fileDescription": "This is an activity photo."
}
\`\`\`

{{recentMessages}}

Extract the user's intention to create one video from the conversation. Users might express this in various ways, such as:

- "Path of the image"
- "Description of the image"

If the user provides any specific description of the image, include that as well.

Respond with a JSON markdown block containing only the extracted values.
`;

export const uploadTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example response:
\`\`\`json
{
    "filePath": "/opt/js/project/xxx"
}
\`\`\`

{{recentMessages}}

Extract the user's intention to upload a file from the conversation. Users might express this in various ways, such as:

- "Path of the file"

Respond with a JSON markdown block containing only the extracted values.
`;

export const downloadTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example response:
\`\`\`json
{
    "filePath": null,
    "description": "I want to download a file"
}
\`\`\`

{{recentMessages}}

Extract the user's intention to download a file from the conversation. Users might express this in various ways, such as:

- "I want to download a file"
- "send a photo"

If the user provides any specific description of the file, include that as well.

Respond with a JSON markdown block containing only the extracted values.
`;

export const checkBalancesTemplate = `Given the recent messages and wallet information below.

Example response:
\`\`\`json
{
    "recipient": string | null
}
\`\`\`

{{recentMessages}}

{{walletInfo}}

Extract the following information about the requested check balance:

- Address to check balance for. Optional, must be a valid Ethereum A0GI address starting with "0x". If not provided, use the default Wallet Address.

Respond with a JSON markdown block containing only the extracted values. If no default value is specified, use null.
`;

export const getfaucetTemplate = `Given the recent messages and wallet information below.

Example response:
\`\`\`json
{
    "toAddress": string | null
}
\`\`\`

{{recentMessages}}

{{walletInfo}}

Extract the following information about the requested faucet request:

- Recipient address. Optional, must be a valid Ethereum A0GI address starting with "0x". If any field is not provided,  use the default Wallet Address.

Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined:
`;

export const transferTemplate = `Given the recent messages, extract the following information about the requested token transfer.

Example response:
\`\`\`json
{
    "recipient": "0x67e2c2e6186ae9Cc17798b5bD0c3c36Ef0209aC9",
    "amount": "1"
}
\`\`\`

{{recentMessages}}

- Recipient wallet address
- Amount to transfer

Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.
`;

export const batchTransferTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example response:
\`\`\`json
{
    "recipient": "[0x67e2c2e6186ae9Cc17798b5bD0c3c36Ef0209aC9, 0x67e2c2e6186ae9Cc17798b5bD0c3c36Ef0209aC9]",
    "amount": "1"
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the requested token transfer:

- Recipient wallet array address
- Amount to transfer

Respond with a JSON markdown block containing only the extracted values.
`;

export const issueTokenTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example response:
\`\`\`json
{
    "name:" "TokenFounder",
    "symbol": "TFT",
    "decimals": 9,
    "initialHolder": "0x67e2c2e6186ae9Cc17798b5bD0c3c36Ef0209aC9",
    "initialSupply": "100000000",
}
\`\`\`

{{recentMessages}}

Extract the following information about the requested token deployment:

- Token Name
- Token Symbol
- Token Decimals
- Token Initial Holder
- Token Initial Supply

Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.
`;

export const issueNonFungibleTokenTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example response:
\`\`\`json
{
    "name:" "NonFungibleTokenFounder",
    "symbol": "NFTF",
    "baseURI": "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    "initialOwner": "0x67e2c2e6186ae9Cc17798b5bD0c3c36Ef0209aC9",
}
\`\`\`

{{recentMessages}}

Extract the following information about the requested token deployment:

- NFT Name
- NFT Symbol
- NFT BaseURI
- NFT Initial Owner

Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.
`;