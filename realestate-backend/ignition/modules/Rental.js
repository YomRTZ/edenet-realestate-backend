import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("RentalModule", (m) => {
  // Deploy the Rental contract and allow wiring to RealEstateMarket if needed
  const rental = m.contract("Rental");

  return { rental };
});
