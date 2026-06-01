import sequelize from '../config/database.js';

const { models } = sequelize;

/* =====================
   Refresh Tokens
===================== */
models.User.hasMany(models.RefreshToken, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  as: 'refreshTokens',
});

models.RefreshToken.belongsTo(models.User, {
  foreignKey: 'user_id',
  as: 'user',
});

/* =====================
   User Roles
===================== */
models.Role.hasMany(models.User, {
  foreignKey: 'role_id',
  as: 'users',
});

models.User.belongsTo(models.Role, {
  foreignKey: 'role_id',
  as: 'roleInfo',
});

/* =====================
   Properties
===================== */
models.User.hasMany(models.Property, {
  foreignKey: 'owner_id',
  onDelete: 'CASCADE',
  as: 'properties',
});

models.Property.belongsTo(models.User, {
  foreignKey: 'owner_id',
  as: 'owner',
});

/* =====================
   Property Features
===================== */
models.Property.hasMany(models.PropertyFeature, {
  foreignKey: 'property_id',
  onDelete: 'CASCADE',
  as: 'features',
});

models.PropertyFeature.belongsTo(models.Property, {
  foreignKey: 'property_id',
  as: 'property',
});

/* =====================
   Documents
===================== */
models.User.hasMany(models.Document, {
  foreignKey: 'uploaded_by',
  onDelete: 'RESTRICT',
  as: 'uploadedDocuments',
});

models.Document.belongsTo(models.User, {
  foreignKey: 'uploaded_by',
  as: 'uploader',
});

models.Property.hasMany(models.Document, {
  foreignKey: 'property_id',
  onDelete: 'CASCADE',
  as: 'documents',
});

models.Document.belongsTo(models.Property, {
  foreignKey: 'property_id',
  as: 'property',
});

models.User.hasMany(models.Document, {
  foreignKey: 'verified_by',
  onDelete: 'SET NULL',
  as: 'verifiedDocuments',
});

models.Document.belongsTo(models.User, {
  foreignKey: 'verified_by',
  as: 'verifier',
});

/* =====================
   Property Verifications
===================== */
/* =====================
   Rental Agreements
===================== */
models.Property.hasMany(models.RentalAgreement, {
  foreignKey: 'property_id',
  onDelete: 'CASCADE',
  as: 'rentalAgreements',
});

models.RentalAgreement.belongsTo(models.Property, {
  foreignKey: 'property_id',
  as: 'property',
});

models.User.hasMany(models.RentalAgreement, {
  foreignKey: 'owner_id',
  onDelete: 'CASCADE',
  as: 'ownedRentalAgreements',
});

models.RentalAgreement.belongsTo(models.User, {
  foreignKey: 'owner_id',
  as: 'owner',
});

models.User.hasMany(models.RentalAgreement, {
  foreignKey: 'tenant_id',
  onDelete: 'CASCADE',
  as: 'tenantRentalAgreements',
});

models.RentalAgreement.belongsTo(models.User, {
  foreignKey: 'tenant_id',
  as: 'tenant',
});

models.User.hasMany(models.RentalAgreement, {
  foreignKey: 'agent_id',
  onDelete: 'SET NULL',
  as: 'agentRentalAgreements',
});

models.RentalAgreement.belongsTo(models.User, {
  foreignKey: 'agent_id',
  as: 'agent',
});

/* =====================
   Rental Payments
===================== */
models.RentalAgreement.hasMany(models.RentalPayment, {
  foreignKey: 'rental_agreement_id',
  onDelete: 'CASCADE',
  as: 'payments',
});

models.RentalPayment.belongsTo(models.RentalAgreement, {
  foreignKey: 'rental_agreement_id',
  as: 'rentalAgreement',
});

models.User.hasMany(models.RentalPayment, {
  foreignKey: 'payer_id',
  onDelete: 'CASCADE',
  as: 'rentalPayments',
});

models.RentalPayment.belongsTo(models.User, {
  foreignKey: 'payer_id',
  as: 'payer',
});

/* =====================
   Maintenance Requests
===================== */
models.RentalAgreement.hasMany(models.MaintenanceRequest, {
  foreignKey: 'rental_agreement_id',
  onDelete: 'CASCADE',
  as: 'maintenanceRequests',
});

models.MaintenanceRequest.belongsTo(models.RentalAgreement, {
  foreignKey: 'rental_agreement_id',
  as: 'rentalAgreement',
});

models.User.hasMany(models.MaintenanceRequest, {
  foreignKey: 'tenant_id',
  onDelete: 'CASCADE',
  as: 'tenantMaintenanceRequests',
});

models.MaintenanceRequest.belongsTo(models.User, {
  foreignKey: 'tenant_id',
  as: 'tenant',
});

models.Property.hasMany(models.MaintenanceRequest, {
  foreignKey: 'property_id',
  onDelete: 'CASCADE',
  as: 'maintenanceRequests',
});

models.MaintenanceRequest.belongsTo(models.Property, {
  foreignKey: 'property_id',
  as: 'property',
});

/* =====================
   Sale Transactions
===================== */
models.Property.hasMany(models.SaleTransaction, {
  foreignKey: 'property_id',
  onDelete: 'CASCADE',
  as: 'saleTransactions',
});

models.SaleTransaction.belongsTo(models.Property, {
  foreignKey: 'property_id',
  as: 'property',
});

models.User.hasMany(models.SaleTransaction, {
  foreignKey: 'seller_id',
  onDelete: 'CASCADE',
  as: 'soldTransactions',
});

models.SaleTransaction.belongsTo(models.User, {
  foreignKey: 'seller_id',
  as: 'seller',
});

models.User.hasMany(models.SaleTransaction, {
  foreignKey: 'buyer_id',
  onDelete: 'CASCADE',
  as: 'boughtTransactions',
});

models.SaleTransaction.belongsTo(models.User, {
  foreignKey: 'buyer_id',
  as: 'buyer',
});

models.User.hasMany(models.SaleTransaction, {
  foreignKey: 'agent_id',
  onDelete: 'SET NULL',
  as: 'agentSaleTransactions',
});

models.SaleTransaction.belongsTo(models.User, {
  foreignKey: 'agent_id',
  as: 'agent',
});

/* =====================
   Property Availability
===================== */
models.Property.hasMany(models.Availability, {
  foreignKey: 'property_id',
  onDelete: 'CASCADE',
  as: 'availabilityRecords',
});

models.Availability.belongsTo(models.Property, {
  foreignKey: 'property_id',
  as: 'property',
});

/* =====================
   Showings / Appointments
===================== */
models.Property.hasMany(models.Showing, {
  foreignKey: 'property_id',
  onDelete: 'CASCADE',
  as: 'showings',
});

models.Showing.belongsTo(models.Property, {
  foreignKey: 'property_id',
  as: 'property',
});

models.User.hasMany(models.Showing, {
  foreignKey: 'requester_id',
  onDelete: 'CASCADE',
  as: 'requestedShowings',
});

models.Showing.belongsTo(models.User, {
  foreignKey: 'requester_id',
  as: 'requester',
});

models.User.hasMany(models.Showing, {
  foreignKey: 'agent_id',
  onDelete: 'SET NULL',
  as: 'agentShowings',
});

models.Showing.belongsTo(models.User, {
  foreignKey: 'agent_id',
  as: 'agent',
});

/* =====================
   Escrow Transactions
===================== */
models.SaleTransaction.hasMany(models.EscrowTransaction, {
  foreignKey: 'sale_transaction_id',
  onDelete: 'CASCADE',
  as: 'escrowTransactions',
});

models.EscrowTransaction.belongsTo(models.SaleTransaction, {
  foreignKey: 'sale_transaction_id',
  as: 'saleTransaction',
});

models.User.hasMany(models.EscrowTransaction, {
  foreignKey: 'deposited_by',
  onDelete: 'CASCADE',
  as: 'escrowDeposits',
});

models.EscrowTransaction.belongsTo(models.User, {
  foreignKey: 'deposited_by',
  as: 'depositor',
});

models.User.hasMany(models.EscrowTransaction, {
  foreignKey: 'released_to',
  onDelete: 'SET NULL',
  as: 'escrowReleases',
});

models.EscrowTransaction.belongsTo(models.User, {
  foreignKey: 'released_to',
  as: 'recipient',
});

/* =====================
   Property Taxes
===================== */
models.Property.hasMany(models.PropertyTax, {
  foreignKey: 'property_id',
  onDelete: 'CASCADE',
  as: 'taxRecords',
});

models.PropertyTax.belongsTo(models.Property, {
  foreignKey: 'property_id',
  as: 'property',
});

/* =====================
   Property Inquiries
===================== */
models.Property.hasMany(models.PropertyInquiry, {
  foreignKey: 'property_id',
  onDelete: 'CASCADE',
  as: 'inquiries',
});

models.PropertyInquiry.belongsTo(models.Property, {
  foreignKey: 'property_id',
  as: 'property',
});

models.User.hasMany(models.PropertyInquiry, {
  foreignKey: 'sender_id',
  onDelete: 'CASCADE',
  as: 'sentInquiries',
});

models.PropertyInquiry.belongsTo(models.User, {
  foreignKey: 'sender_id',
  as: 'sender',
});

models.User.hasMany(models.PropertyInquiry, {
  foreignKey: 'receiver_id',
  onDelete: 'CASCADE',
  as: 'receivedInquiries',
});

models.PropertyInquiry.belongsTo(models.User, {
  foreignKey: 'receiver_id',
  as: 'receiver',
});
/* =====================
   Favorites / Saved Properties
===================== */
models.Property.hasMany(models.Review, {
  foreignKey: 'property_id',
  onDelete: 'CASCADE',
  as: 'propertyReviews',
});

models.Review.belongsTo(models.Property, {
  foreignKey: 'property_id',
  as: 'property',
});

models.User.hasMany(models.Review, {
  foreignKey: 'reviewer_id',
  onDelete: 'CASCADE',
  as: 'writtenReviews',
});

models.Review.belongsTo(models.User, {
  foreignKey: 'reviewer_id',
  as: 'reviewer',
});

models.User.hasMany(models.Review, {
  foreignKey: 'reviewee_id',
  onDelete: 'CASCADE',
  as: 'receivedReviews',
});

models.Review.belongsTo(models.User, {
  foreignKey: 'reviewee_id',
  as: 'reviewee',
});
models.User.hasMany(models.Favorite, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  as: 'favorites',
});

models.Favorite.belongsTo(models.User, {
  foreignKey: 'user_id',
  as: 'user',
});

models.Property.hasMany(models.Favorite, {
  foreignKey: 'property_id',
  onDelete: 'CASCADE',
  as: 'favoritedBy',
});

models.Favorite.belongsTo(models.Property, {
  foreignKey: 'property_id',
  as: 'property',
});

/* =====================
   Property Ownership
===================== */
models.Property.hasMany(models.PropertyOwnership, {
  foreignKey: 'property_id',
  onDelete: 'CASCADE',
  as: 'ownershipRecords',
});

models.PropertyOwnership.belongsTo(models.Property, {
  foreignKey: 'property_id',
  as: 'property',
});

models.User.hasMany(models.PropertyOwnership, {
  foreignKey: 'owner_id',
  onDelete: 'CASCADE',
  as: 'ownershipRecords',
});

models.PropertyOwnership.belongsTo(models.User, {
  foreignKey: 'owner_id',
  as: 'owner',
});

/* =====================
   Saved Searches / Alerts
===================== */
models.User.hasMany(models.SavedSearch, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  as: 'savedSearches',
});

models.SavedSearch.belongsTo(models.User, {
  foreignKey: 'user_id',
  as: 'user',
});

/* =====================
   Property Comparisons
===================== */
/* PropertyComparison and PropertyView tables removed; related associations deleted. */

/* =====================
   Notifications
===================== */
models.User.hasMany(models.Notification, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  as: 'notifications',
});

models.Notification.belongsTo(models.User, {
  foreignKey: 'user_id',
  as: 'user',
});

/* =====================
   Admin Audit Logs
===================== */
models.User.hasMany(models.AdminAuditLog, {
  foreignKey: 'admin_id',
  onDelete: 'CASCADE',
  as: 'auditLogs',
});

models.AdminAuditLog.belongsTo(models.User, {
  foreignKey: 'admin_id',
  as: 'admin',
});
