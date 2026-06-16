const hre = require('hardhat');

async function main() {
  const [landlord, tenant] = await hre.ethers.getSigners();

  // TO UPDATE: Paste the deployed Rental contract address here or use a deployment retrieval mechanism
  const RENTAL_ADDRESS = process.env.RENTAL_ADDRESS || 'PASTE_RENTAL_CONTRACT_ADDRESS_HERE';

  const rental = await hre.ethers.getContractAt('Rental', RENTAL_ADDRESS);
  console.log('Connected to Rental at:', RENTAL_ADDRESS);

  console.log('\n--- Step 1: Landlord creates agreement for property #1 ---');
  let tx = await rental.connect(landlord).createAgreement(1, tenant.address, hre.ethers.parseEther('1'), 12);
  let rcpt = await tx.wait();
  console.log('createAgreement tx mined:', rcpt.transactionHash);

  // extract agreementId from event logs if emitted, otherwise assume id = 1 for a fresh deployment
  const agreementId = 1;

  console.log('\n--- Step 2: Tenant funds agreement (first month + deposit) ---');
  const upfront = hre.ethers.parseEther('2'); // first month + deposit (1 + 1)
  tx = await rental.connect(tenant).acceptAndFund(agreementId, { value: upfront });
  rcpt = await tx.wait();
  console.log('acceptAndFund tx mined:', rcpt.transactionHash);

  console.log('\n--- Step 3: Tenant pays an additional 2 months in advance ---');
  const twoMonths = hre.ethers.parseEther('2');
  tx = await rental.connect(tenant).payRent(agreementId, 2, { value: twoMonths });
  rcpt = await tx.wait();
  console.log('payRent tx mined:', rcpt.transactionHash);

  console.log('\n--- Step 4: Tenant triggers early termination (to test deposit rules) ---');
  tx = await rental.connect(tenant).terminateByTenant(agreementId);
  rcpt = await tx.wait();
  console.log('terminateByTenant tx mined:', rcpt.transactionHash);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
