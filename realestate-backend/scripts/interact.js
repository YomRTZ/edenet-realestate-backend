const hre = require("hardhat");

async function main() {
  const [seller, buyer, tenant] = await hre.ethers.getSigners();
  
  // TO UPDATE: Paste the exact address from your ignition command output here
  const CONTRACT_ADDRESS = "PASTE_YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE"; 
  
  const market = await hre.ethers.getContractAt("RealEstateMarket", CONTRACT_ADDRESS);
  console.log("Connected to RealEstateMarket at:", CONTRACT_ADDRESS);

  console.log("\n--- Step 1: Seller listing house ---");
  const buyPrice = hre.ethers.parseEther("100");     
  const rentRate = hre.ethers.parseEther("0.5");     
  
  let tx = await market.connect(seller).listProperty(buyPrice, rentRate, true, true);
  await tx.wait();
  console.log("House #1 successfully listed by seller!");

  console.log("\n--- Step 2: Tenant renting house for 5 days ---");
  const rentDurationDays = 5;
  // Convert explicitly to avoid type mismatches
  const totalRentCost = rentRate * BigInt(rentDurationDays);

  tx = await market.connect(tenant).rentProperty(1, rentDurationDays, { value: totalRentCost });
  await tx.wait();
  console.log(`Tenant rented House #1 for ${rentDurationDays} days paying ${hre.ethers.formatEther(totalRentCost)} ETH!`);

  const isRented = await market.isCurrentlyRented(1);
  console.log(`Is House #1 actively leased? ${isRented}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
