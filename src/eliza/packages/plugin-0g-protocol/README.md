# @elizaos/plugin-0g-protocol

A plugin for send transaction, multimodal inference, storing data, retrieving data using the 0G protocol within the ElizaOS ecosystem.

## Description

The plugin enables seamless integration with the Zero Gravity (0G) protocol for decentralized data storage. The plugin enables sending transactions using the 0G protocol. The plugin provides functionality to retrieve data from the 0G network. The plugin also provides text inference using the 0G protocol.

## Installation

```bash
pnpm install @elizaos/plugin-0g-protocol
```

## Configuration

The plugin requires the following environment variables to be set:

```typescript
ZEROG_EVM_RPC=https://evmrpc-testnet.0g.ai                         // 0G EVM RPC endpoint
ZEROG_INDEXER_RPC=https://indexer-storage-testnet-standard.0g.ai   // 0G indexer RPC endpoint
ZEROG_FLOW_ADDRESS=0x0460aA47b41a66694c0a73f667a1b795A5ED3556      // 0G Flow contract address
ZEROG_PRIVATE_KEY=1d24e6cb6280f0d3dc8dcd30e8ace4af97beae5381b82cd9d1cb232d93b11818       // Private key for transactions
```

## Usage
