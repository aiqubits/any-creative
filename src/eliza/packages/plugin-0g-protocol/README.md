# @elizaos/plugin-0g-protocol

A plugin for send transaction, text & multimodal inference, deploy token, check balance, batch transactions, storing file, retrieving file using the 0G protocol within the ElizaOS ecosystem. The plugin enables seamless integration with the Zero Gravity (0G) protocol for decentralized data storage.

## Overview

This plugin provides functionality to:

- Manage wallet interactions with the 0G network
- Execute secure token transfers and batch transfer to multiple addresses
- Query the balance of a certain address and wallet balances
- Track token prices and valuations
- Store and retrieve data on the 0G network
- Send text and multimodal inference for users
- Deploy and interact with smart contracts(FT, NFT...) on the 0G network

## Installation

```bash
pnpm install @elizaos/plugin-0g-protocol
```

## Configuration

The plugin requires the following environment variables to be set:

```bash
ZEROG_PRIVATE_KEY=                           # Required - Wallet private key for transactions
ZEROG_NETWORK=                               # Optional - The value is mainnet|testnet, Defaults to testnet
ZEROG_EVM_RPC=                               # Optional - 0G EVM RPC endpoint, Defaults is testnet endpoint
ZEROG_INDEXER_RPC=                           # Optional - 0G indexer RPC endpoint, Defaults is turbo indexer endpoint
ZEROG_MAX_FILE_SIZE=                         # Optional - Maximum file size for storage (in bytes), Defaults is 104857600
ZEROG_ALLOWED_EXTENSIONS=                    # Optional - Add allowed file extensions for storage, Defaults is ".pdf,.png,.jpg,.jpeg,.doc,.docx,.webp"
ZEROG_UPLOAD_DIR=                            # Optional - Directory to store uploaded files, Defaults is eliza upload directory, "agent/data/uploads/"
ZEROG_DOWNLOAD_DIR=                          # Optional - Directory to retrieve downloaded files, Defaults is eliza download directory, "agent/data/downloads/"
ZEROG_ENABLE_VIRUS_SCAN=                     # Optional - Enable virus scan for uploaded files, Defaults is true
ZEROG_COMPUTE_MODEL=                         # Optional - llama-3.3-70b-instruct or deepseek-r1-70b, character file moedel set "zerog_compute"
```

## Usage

### Registering the Plugin

Import and register the plugin in your Eliza configuration:

```typescript
import { zerogPlugin } from "@elizaos/plugin-0g-protocol";

export default {
    plugins: [zerogPlugin],
    // ... other configuration
};
```

### WalletProvider

The `WalletProvider` manages wallet interactions with the AOGI network, including balance queries and portfolio tracking

```typescript
import { WalletProvider } from "@elizaos/plugin-0g-protocol";

// Initialize the provider
const provider = await initWalletProvider(runtime);

// Get formatted portfolio
const portfolio = await provider.getFormattedPortfolio(runtime);

// Get wallet balance
const balance = await provider.getBalances(publicKey, tokenId);

// Get basic transaction URL
const txUrl = provider.getTransactionURL(runtime);

// Get basic account URL
const txUrl = provider.getBaseAccountUrl(runtime);

// Get network name
const netName = provider.getNetName(runtime);
```

### TransferAction

The `TransferAction` handles token transfers:

```typescript
import { TransferAction } from "@elizaos/plugin-0g-protocol";

// Initialize transfer action
const action = new TransferAction(walletProvider);

// Execute transfer
const hash = await action.transfer({
    recipient: "0x5C01dc5D3047dB6Ae4E9A9B0946e2092a1a3A788",
    amount: "5",
});
```

### Send AOGI Token

Transfer AOGI tokens to another address:

```typescript
// Example conversation
User: "Send 5 A0GI to 0x5C01dc5D3047dB6Ae4E9A9B0946e2092a1a3A788";
Assistant: "I'll send 1 A0GI token now...";
```

### Check Balances

Query wallet balance and portfolio value:

```typescript
// Example conversation
User: "Check A0GI balance of 0x5C01dc5D3047dB6Ae4E9A9B0946e2092a1a3A788";
Assistant: "The balance of 0x5C01dc5D3047dB6Ae4E9A9B0946e2092a1a3A788 is 123.00";
```

### Create Video for Image

Create a video from an image:

```typescript
// Example conversation
User: "Create a video from this image.png";
Assistant: "Sure, I can do that for you...";
```

### Upload File

```typescript
// The plugin automatically handles file uploads when triggered
// through natural language commands like:

"Upload my video.mp4";
"Store this image.png on 0G";
"Save my resume.docx to Zero Gravity";
```

### Download File

```typescript
// The plugin automatically handles file downloads when triggered
// through natural language commands like:

"Download my video.mp4 from 0G";
"Get this image.png from 0G";
"Retrieve my resume.docx from Zero Gravity";
```

### Batch Transactions

Transfer tokens from the agent's wallet to multiple recipients:

```typescript
// Example conversation
User: "Send 1 AOGI tokens to [0x5C01dc5D3047dB6Ae4E9A9B0946e2092a1a3A788,0x5C01dc5D3047dB6Ae4E9A9B0946e2092a1a3A788]";
Assistant: "Sure, I can do that for you...";
```

### Deploy Token

Deploy a new Token on the AOGI network:

```typescript
// Example conversation
User: "Deploy a new token called TokenFounder, symbol called TFT, decimals is 9, with the initial holder being 0x67e2c2e6186ae9Cc17798b5bD0c3c36Ef0209aC9, with an initial supply of 100000000 on 0G Network.";
Assistant: "I'll deploy the Token now...";
```

### Deploy NFT

Deploy a new NFT on the AOGI network:

```typescript
// Example conversation
User: "Deploy a new NFT, name is called NonFungibleTokenFounder, symbol is called NFTF, base uri is ipfs://QmXJ7.../, with the initial owner being 0x67e2c2e6186ae9Cc17798b5bD0c3c36Ef0209aC9 on 0G Network.";
Assistant: "I'll deploy the NFT now...";
```

## Features

### `SEND_AOGI_TOKEN`

Transfers AOGI native tokens to another account.

```typescript
{
  action: 'SEND_AOGI_TOKEN',
  content: {
    recipient: string,    // Required - recipient's AOGI account (e.g., "0x5C01dc5D3047dB6Ae4E9A9B0946e2092a1a3A788")
    amount: string,       // Required - to send (in Token)
    tokenAddress?: string // Optional - default to AOGI native token if not provided
  }
}
```

### `CHECK_BALANCES`

Queries the balance of a wallet address.

```typescript
{
  action: 'CHECK_BALANCES',
  content: {
    address: string, // Optional - wallet address, defaults to agent's wallet
    token: string    // Optional - token contract address, defaults to AOGI native token
  }
}
```

### `DEPLOY_0G_TOKEN`

Deploys a new token on the AOGI network.

```typescript
{
  action: 'DEPLOY_0G_TOKEN',
  content: {
    name: string,         // Required - token name
    symbol: string,       // Required - token symbol
    decimals: number,     // Required - token decimal places
    initialSupply: string // Required - token initial supply
    initialHolder: string // Required - token initial holder
  }
}
```

### `DEPLOY_0G_NFT`

Deploys a new NFT on the A0GI network.

```typescript
{
  action: 'DEPLOY_0G_NFT',
  content: {
    name: string,         // Required - NFT name
    symbol: string        // Required - NFT symbol
    baseURI: string       // Required - NFT base URI
    initialOwner: string  // Required - NFT initial owner
  }
}
```

## API Reference

### Actions

- `CREATE_VIDEO_FOR_IMAGE`: Create a video from an image
- `UPLOAD_FILE_TO_ZEROG_`: Upload a file to the 0G network
- `STORE_FILE_ON_ZEROG_`: Alias for UPLOAD_FILE_TO_ZEROG_
- `SAVE_FILE_TO_ZEROG_`: Alias for UPLOAD_FILE_TO_ZEROG_
- `UPLOAD_TO_ZERO_GRAVITY`: Alias for UPLOAD_FILE_TO_ZEROG_
- `STORE_ON_ZERO_GRAVITY`: Alias for UPLOAD_FILE_TO_ZEROG_
- `SHARE_FILE_ON_ZEROG_`: Alias for UPLOAD_FILE_TO_ZEROG_
- `PUBLISH_FILE_TO_ZEROG_`: Alias for UPLOAD_FILE_TO_ZEROG_
- `DOWNLOAD_FILE_FROM_ZEROG_`: Download a file from the 0G network
- `GET_FILE_FROM_ZEROG_`: Alias for DOWNLOAD_FILE_FROM_ZEROG_
- `GET_FROM_ZERO_GRAVITY`: Alias for DOWNLOAD_FILE_FROM_ZEROG_
- `DOWNLOAD_FROM_ZERO_GRAVITY`: Alias for DOWNLOAD_FILE_FROM_ZEROG_
- `SEND_AOGI_TOKEN`: Transfer A0GI tokens to another address
- `SEND_TOKEN`: Alias for SEND_A0GI_TOKEN
- `TRANSFER_TOKEN`: Alias for SEND_A0GI_TOKEN
- `SEND_AOGI`: Alias for SEND_A0GI_TOKEN
- `PAY`: Alias for SEND_A0GI_TOKEN
- `CHECK_BALANCES`: Query wallet balance and portfolio value
- `SEND_BATCH_A0GI_TOKEN`: Transfer tokens from the agent's wallet to multiple recipients
- `DEPLOY_0G_TOKEN`: Deploy a new Token on the A0GI network
- `DEPLOY_TOKEN`: Alias for DEPLOY_TOKEN
- `DEPLOY_ERC20`: Alias for DEPLOY_TOKEN
- `DEPLOY_0G_NFT`: Deploy a new NFT on the A0GI network
- `DEPLOY_ERC721`: Alias for DEPLOY_0G_NFT
- `DEPLOY_NFT`: Alias for DEPLOY_0G_NFT

## Development

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Build the plugin:

```bash
pnpm run build
```

4. Run linting:

```bash
pnpm run lint
```

5. Run tests:

```bash
pnpm run test
```

6. Run the plugin:

```bash
pnpm run dev
```

## Troubleshooting

### Balance Fetching Failure

- **Cause**: Incorrect RPC endpoint or network connectivity issues
- **Solution**: Verify `A0GI_RPC_URL` and network connection

### Transfer Fails

- **Cause**: Insufficient balance or invalid recipient address
- **Solution**: Ensure sufficient funds and valid recipient address format

### Network connectivity issues

- **Cause**: Network connectivity issues
- **Solution**: Verify network connectivity and retry

### Token Deployment Fails

- **Cause**: Invalid token parameters
- **Solution**: Verify token parameters and retry

### NFT Deployment Fails

- **Cause**: Invalid NFT parameters
- **Solution**: Verify NFT parameters and retry

### Swap Fails

- **Cause**: Insufficient balance or invalid token pairs
- **Solution**: Ensure sufficient funds, verify token pairs exist and check liquidity pools

## Security Best Practices

- Store private keys securely using environment variables
- Use secure RPC endpoints
- Validate all input addresses and amounts
- Use proper error handling for blockchain operations
- Keep dependencies updated for security patches
- Log all transaction attempts and errors

## Future Enhancements

1. **Wallet Management**

    - Multi-wallet support
    - Hardware wallet integration
    - Recovery options

2. **Transaction Management**

    - Batch transaction processing
    - Transaction simulation
    - Advanced error handling

3. **Token Operations**

    - Token metadata handling

4. **Smart Contract**

    - Customized contract deployment tool
    - Smart contract interaction tools
    - Smart contract event handling

5. **DeFi Features**

    - DEX integration
    - Liquidity management
    - Swap optimization
    - Portfolio tracking

6. **Developer Tools**

    - Enhanced debugging capabilities
    - Testing framework improvements
    - Plugin development templates
    - Documentation generator
    - Performance profiling tools

We welcome community feedback and contributions to help prioritize these enhancements.

## Contributing

Contributions are welcome! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for more information.

## Credits

This plugin integrates with and builds upon several key technologies:

- [Zero Gravity (0G)](https://0g.xyz/): Decentralized file storage protocol
- [IPFS](https://ipfs.tech/): InterPlanetary File System
- [Filecoin](https://filecoin.io/): Decentralized storage network
- [Content Addressable Storage](https://en.wikipedia.org/wiki/Content-addressable_storage): Storage architecture
- [bignumber.js](https://github.com/MikeMcl/bignumber.js/): Precise number handling
- [node-cache](https://www.npmjs.com/package/node-cache): Caching implementation

Special thanks to:

- The 0G Protocol development team
- The Protocol Labs team for IPFS
- The Filecoin Foundation
- The decentralized storage community
- The Eliza community for their contributions and feedback

## License

This plugin is part of the Eliza project. See the main project repository for license information.
