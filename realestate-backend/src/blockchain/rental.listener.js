// import { ethers } from 'ethers';
// import { rentalService } from '../services/rental.service.js';

// // Example listener scaffold — provide provider, contractAddress and ABI when wiring up
// export function subscribeToRentalEvents(providerUrl, contractAddress, contractAbi) {
//   const provider = new ethers.JsonRpcProvider(providerUrl);
//   const contract = new ethers.Contract(contractAddress, contractAbi, provider);

//   contract.on('RentalCreated', async (agreementId, propertyId, landlord, tenant, monthlyRent, deposit) => {
//     try {
//       console.log('rental.listener: RentalCreated', { agreementId: agreementId.toString(), propertyId: propertyId.toString() });
//       await rentalService.createRentalFromEvent({
//         propertyId: Number(propertyId.toString()),
//         landlordAddress: landlord,
//         tenantAddress: tenant,
//         monthlyRent: Number(monthlyRent.toString()),
//         depositAmount: Number(deposit.toString()),
//         durationMonths: 0,
//         startTimestamp: Math.floor(Date.now() / 1000)
//       });
//     } catch (err) {
//       console.error('rental.listener RentalCreated handler error', err && err.message);
//     }
//   });

//   contract.on('RentPaid', async (agreementId, payer, months, amount) => {
//     try {
//       console.log('rental.listener: RentPaid', { agreementId: agreementId.toString(), payer });
//       await rentalService.recordPayment(Number(agreementId.toString()), Number(amount.toString()));
//     } catch (err) {
//       console.error('rental.listener RentPaid handler error', err && err.message);
//     }
//   });

//   contract.on('RentalTerminated', async (agreementId, by, reason) => {
//     try {
//       console.log('rental.listener: RentalTerminated', { agreementId: agreementId.toString(), by });
//       await rentalService.terminateAgreement(Number(agreementId.toString()), reason);
//     } catch (err) {
//       console.error('rental.listener RentalTerminated handler error', err && err.message);
//     }
//   });

//   console.log('rental.listener: subscribed to rental contract events for', contractAddress);
//   return contract;
// }
