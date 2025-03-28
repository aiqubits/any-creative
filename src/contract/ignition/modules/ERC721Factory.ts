import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ERC721FactoryModule = buildModule("ERC721FactoryModule", (m) => {
  const ERC721Factory = m.contract("ERC721Factory");

  return { ERC721Factory };
});

module.exports = ERC721FactoryModule;