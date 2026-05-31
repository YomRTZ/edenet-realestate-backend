import sequelize from '../config/database.js'
import { seedRoles } from './seed-roles.js'
import { seedPropertyTypes } from './seed-propertyTypes.js'
import { seedListingTypes } from './seed-listingTypes.js'
import { seedPropertyStatus } from './seed-propertyStatus.js'
import { seedVerificationStatus } from './seed-verificationStatus.js'
import { seedPaymentStatus } from './seed-paymentStatus.js'
import { seedTransactionStatus } from './seed-transactionStatus.js'
import { seedDocumentTypes } from './seed-documentTypes.js'
import { seedNotificationTypes } from './seed-notificationTypes.js'
import { seedShowingStatus } from './seed-showingStatus.js'
import { seedMaintenancePriority } from './seed-maintenancePriority.js'
import { seedMaintenanceStatus } from './seed-maintenanceStatus.js'
import { seedEscrowStatus } from './seed-escrowStatus.js'
import { seedEnergyRating } from './seed-energyRating.js'
import { seedAlertFrequency } from './seed-alertFrequency.js'

const runSeeds = async () => {
  try {
    await sequelize.authenticate()
    console.log('🔗 Database connected\n')

    console.log('📋 Seeding Reference Data...')
    await seedRoles()
    await seedPropertyTypes()
    await seedListingTypes()
    await seedPropertyStatus()
    await seedVerificationStatus()
    await seedPaymentStatus()
    await seedTransactionStatus()
    await seedDocumentTypes()
    await seedNotificationTypes()
    await seedShowingStatus()
    await seedMaintenancePriority()
    await seedMaintenanceStatus()
    await seedEscrowStatus()
    await seedEnergyRating()
    await seedAlertFrequency()

    console.log('\n✅ All seeds completed successfully')
    process.exit(0)
  } catch (err) {
    console.error('❌ Seeding failed')
    console.error(err)
    process.exit(1)
  }
}

runSeeds()
