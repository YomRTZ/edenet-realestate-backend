import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("RealEstateModule", (m) => {
  // Deploy the real estate marketplace contract
  const realEstateMarket = m.contract("RealEstateMarket");

  return { realEstateMarket };
});
