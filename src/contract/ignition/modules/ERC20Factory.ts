import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ERC20FactoryModule = buildModule("ERC20FactoryModule", (m) => {
  const ERC20Factory = m.contract("ERC20Factory");

  return { ERC20Factory };
});

module.exports = ERC20FactoryModule;