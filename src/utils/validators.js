import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  phone: z.string().min(9, "Phone number required").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  password_hash: z.string().min(6, "Password must be at least 6 characters").optional(),
  first_name: z.string().min(2, "First name required"),
  last_name: z.string().min(2, "Last name required"),
  role: z.enum(["OWNER", "TENANT", "AGENT", "ADMIN"]),
}).refine(data => data.password || data.password_hash, {
  message: "Password is required",
  path: ["password"],
});

export const loginSchema = z.object({
  email: z.string().min(1, "Email required"),
  password: z.string().min(6, "Password required"),
}).or(
  z.object({
    email: z.string().min(1, "Email required"),
    password_hash: z.string().min(6, "Password required"),
  })
);
export const logoutSchema = z.object({
  token: z.string().min(1, "Refresh token required").optional(),
});

export const refreshTokenSchema = z.object({
  token: z.string().min(1, "Refresh token required"),
});
export const updateUserSchema = z.object({
  first_name: z.string().min(2, "First name required").optional(),
  last_name: z.string().min(2, "Last name required").optional(),
  phone: z.string().optional(),
  profile_image: z.string().url("Invalid profile image URL").optional(),
  national_id: z.string().optional(),
  date_of_birth: z.string().datetime().optional(),
  preferred_language: z.string().length(2).optional(),
  two_factor_enabled: z.boolean().optional(),
  agency_name: z.string().optional(),
  agent_license_number: z.string().optional(),
});

export const requestOTPSchema = z.object({
  email: z.string().email("Invalid email"),
  purpose: z.enum(["email_verification", "password_reset", "two_factor"]).default("email_verification"),
});

export const verifyOTPSchema = z.object({
  email: z.string().email("Invalid email"),
  code: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
  purpose: z.enum(["email_verification", "password_reset", "two_factor"]).default("email_verification"),
});

export const createPropertySchema = z.object({
  title: z.string().min(3, "Title required and minimum 3 characters"),
  description: z.string().min(10, "Description required and minimum 10 characters"),
  property_type: z.enum(["HOUSE", "APARTMENT", "CONDO", "LAND", "COMMERCIAL", "TOWNHOUSE", "FARM"]),
  listing_type: z.enum(["SALE", "RENT", "BOTH"]),
  status: z.enum(["PENDING_APPROVAL", "ACTIVE", "SOLD", "RENTED", "INACTIVE", "UNDER_CONTRACT"]).default("PENDING_APPROVAL"),
  price: z.number().positive("Price must be positive"),
  bedrooms: z.number().int().min(0, "Bedrooms must be non-negative").optional(),
  bathrooms: z.number().min(0, "Bathrooms must be non-negative").optional(),
  area_size: z.number().positive("Area size must be positive").optional(),
  lot_size: z.number().positive("Lot size must be positive").optional(),
  year_built: z.number().int().min(1800, "Year built must be valid").optional(),
  parking_spots: z.number().int().min(0, "Parking spots must be non-negative").optional(),
  property_tax: z.number().min(0, "Property tax must be non-negative").optional(),
  hoa_fees: z.number().min(0, "HOA fees must be non-negative").optional(),
  latitude: z.number().min(-90).max(90, "Latitude must be between -90 and 90").optional(),
  longitude: z.number().min(-180).max(180, "Longitude must be between -180 and 180").optional(),
  city: z.string().min(2, "City name required"),
  state: z.string().min(2, "State name required"),
  zip_code: z.string().optional(),
  address: z.string().min(5, "Address required"),
  virtual_tour_url: z.string().url("Invalid virtual tour URL").optional(),
  youtube_video_url: z.string().url("Invalid YouTube URL").optional(),
  energy_rating: z.enum(["A", "B", "C", "D", "E", "F", "G"]).optional(),
  pet_policy: z.string().optional(),
  is_furnished: z.boolean().optional(),
});

export const updatePropertySchema = createPropertySchema.partial();

export const createPropertyFeatureSchema = z.object({
  feature_name: z.string().min(1, "Feature name is required").max(100, "Feature name must be 100 characters or less"),
  feature_value: z.string().min(1, "Feature value is required").max(255, "Feature value must be 255 characters or less"),
});

export const updatePropertyFeatureSchema = z.object({
  feature_name: z.string().min(1, "Feature name is required").max(100, "Feature name must be 100 characters or less").optional(),
  feature_value: z.string().min(1, "Feature value is required").max(255, "Feature value must be 255 characters or less").optional(),
});
export const createPropertyVerificationSchema = z.object({
  verification_status: z.enum(["PENDING", "APPROVED", "REJECTED", "FLAGGED"]),
  verification_notes: z.string().optional(),
  verified_at: z.string().datetime().optional(),
});

export const updatePropertyVerificationSchema = z.object({
  verification_status: z.enum(["PENDING", "APPROVED", "REJECTED", "FLAGGED"]).optional(),
  verification_notes: z.string().optional(),
  verified_at: z.string().datetime().optional(),
});
export const createPropertyDocumentSchema = z.object({
  document_type: z.enum(["DEED", "TITLE", "SURVEY", "INSPECTION", "TAX_RECORD", "INSURANCE", "CONTRACT", "LEASE"]),
  file_url: z.string().url("Invalid document URL").min(5, "Document URL required"),
  document_number: z.string().max(100, "Document number must be 100 characters or less").optional(),
  issued_date: z.string().datetime().optional(),
  expiry_date: z.string().datetime().optional(),
});

export const updatePropertyDocumentSchema = z.object({
  document_type: z.enum(["DEED", "TITLE", "SURVEY", "INSPECTION", "TAX_RECORD", "INSURANCE", "CONTRACT", "LEASE"]).optional(),
  file_url: z.string().url("Invalid document URL").min(5, "Document URL required").optional(),
  document_number: z.string().max(100, "Document number must be 100 characters or less").optional(),
  issued_date: z.string().datetime().optional(),
  expiry_date: z.string().datetime().optional(),
});

export const uploadPropertyImageSchema = z.object({
  image_url: z.string().url("Invalid image URL").min(5, "Image URL required"),
  caption: z.string().max(255, "Caption must be 255 characters or less").optional(),
  is_primary: z.boolean().optional(),
  sort_order: z.number().int().min(0, "Sort order must be non-negative").optional(),
});

export const updatePropertyImageSchema = z.object({
  caption: z.string().max(255, "Caption must be 255 characters or less").optional(),
  sort_order: z.number().int().min(0, "Sort order must be non-negative").optional(),
  is_primary: z.boolean().optional(),
});

export const createPropertyOwnershipSchema = z.object({
  owner_id: z.string().uuid("Invalid owner ID"),
  ownership_percentage: z.number().min(0, "Ownership percentage must be at least 0").max(100, "Ownership percentage cannot exceed 100").optional(),
  deed_number: z.string().max(100, "Deed number must be 100 characters or less").optional(),
  start_date: z.string().datetime("Invalid start date"),
  end_date: z.string().datetime("Invalid end date").optional(),
  is_current: z.boolean().optional(),
});

export const updatePropertyOwnershipSchema = z.object({
  owner_id: z.string().uuid("Invalid owner ID").optional(),
  ownership_percentage: z.number().min(0, "Ownership percentage must be at least 0").max(100, "Ownership percentage cannot exceed 100").optional(),
  deed_number: z.string().max(100, "Deed number must be 100 characters or less").optional(),
  start_date: z.string().datetime("Invalid start date").optional(),
  end_date: z.string().datetime("Invalid end date").optional(),
  is_current: z.boolean().optional(),
});

export const createRentalAgreementSchema = z.object({
  owner_id: z.string().uuid("Invalid owner ID"),
  tenant_id: z.string().uuid("Invalid tenant ID"),
  agent_id: z.string().uuid("Invalid agent ID").optional(),
  monthly_rent: z.number().positive("Monthly rent must be positive"),
  security_deposit: z.number().min(0, "Security deposit must be at least 0"),
  late_fee_percentage: z.number().min(0, "Late fee percentage must be at least 0").max(100, "Late fee percentage cannot exceed 100").optional(),
  late_fee_fixed: z.number().min(0, "Late fee fixed must be at least 0").optional(),
  grace_period_days: z.number().int().min(0, "Grace period must be non-negative").optional(),
  start_date: z.string().datetime("Invalid start date"),
  end_date: z.string().datetime("Invalid end date"),
  renewal_option: z.boolean().optional(),
  termination_fee: z.number().min(0, "Termination fee must be at least 0").optional(),
  utilities_included: z.string().optional(),
  is_active: z.boolean().optional(),
  signed_by_owner: z.boolean().optional(),
  signed_by_tenant: z.boolean().optional(),
  agreement_file_url: z.string().url("Invalid agreement file URL").optional(),
});

export const updateRentalAgreementSchema = z.object({
  owner_id: z.string().uuid("Invalid owner ID").optional(),
  tenant_id: z.string().uuid("Invalid tenant ID").optional(),
  agent_id: z.string().uuid("Invalid agent ID").optional(),
  monthly_rent: z.number().positive("Monthly rent must be positive").optional(),
  security_deposit: z.number().min(0, "Security deposit must be at least 0").optional(),
  late_fee_percentage: z.number().min(0, "Late fee percentage must be at least 0").max(100, "Late fee percentage cannot exceed 100").optional(),
  late_fee_fixed: z.number().min(0, "Late fee fixed must be at least 0").optional(),
  grace_period_days: z.number().int().min(0, "Grace period must be non-negative").optional(),
  start_date: z.string().datetime("Invalid start date").optional(),
  end_date: z.string().datetime("Invalid end date").optional(),
  renewal_option: z.boolean().optional(),
  termination_fee: z.number().min(0, "Termination fee must be at least 0").optional(),
  utilities_included: z.string().optional(),
  is_active: z.boolean().optional(),
  signed_by_owner: z.boolean().optional(),
  signed_by_tenant: z.boolean().optional(),
  agreement_file_url: z.string().url("Invalid agreement file URL").optional(),
});

export const createRentalPaymentSchema = z.object({
  payer_id: z.string().uuid("Invalid payer ID"),
  amount: z.number().positive("Payment amount must be positive"),
  payment_date: z.string().datetime("Invalid payment date").optional(),
  due_date: z.string().datetime("Invalid due date"),
  payment_method: z.string().max(50, "Payment method must be 50 characters or less").optional(),
  payment_status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'FAILED', 'REFUNDED']),
  transaction_reference: z.string().max(255, "Transaction reference must be 255 characters or less").optional(),
  receipt_url: z.string().url("Invalid receipt URL").optional(),
});

export const updateRentalPaymentSchema = z.object({
  payer_id: z.string().uuid("Invalid payer ID").optional(),
  amount: z.number().positive("Payment amount must be positive").optional(),
  payment_date: z.string().datetime("Invalid payment date").optional(),
  due_date: z.string().datetime("Invalid due date").optional(),
  payment_method: z.string().max(50, "Payment method must be 50 characters or less").optional(),
  payment_status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'FAILED', 'REFUNDED']).optional(),
  transaction_reference: z.string().max(255, "Transaction reference must be 255 characters or less").optional(),
  receipt_url: z.string().url("Invalid receipt URL").optional(),
});

export const createMaintenanceRequestSchema = z.object({
  tenant_id: z.string().uuid("Invalid tenant ID"),
  issue_type: z.string().min(1, "Issue type required").max(50, "Issue type must be 50 characters or less"),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  description: z.string().min(1, "Description is required"),
  photos_url: z.array(z.string().url("Invalid photo URL")).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'COMPLETED', 'CANCELLED']).optional(),
  assigned_to: z.string().max(255, "Assigned contractor must be 255 characters or less").optional(),
  estimated_cost: z.number().min(0, "Estimated cost must be at least 0").optional(),
  actual_cost: z.number().min(0, "Actual cost must be at least 0").optional(),
  completed_at: z.string().datetime("Invalid completion date").optional(),
});

export const updateMaintenanceRequestSchema = z.object({
  tenant_id: z.string().uuid("Invalid tenant ID").optional(),
  issue_type: z.string().min(1, "Issue type required").max(50, "Issue type must be 50 characters or less").optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  description: z.string().min(1, "Description is required").optional(),
  photos_url: z.array(z.string().url("Invalid photo URL")).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'COMPLETED', 'CANCELLED']).optional(),
  assigned_to: z.string().max(255, "Assigned contractor must be 255 characters or less").optional(),
  estimated_cost: z.number().min(0, "Estimated cost must be at least 0").optional(),
  actual_cost: z.number().min(0, "Actual cost must be at least 0").optional(),
  completed_at: z.string().datetime("Invalid completion date").optional(),
});

export const createUserReviewSchema = z.object({
  reviewer_id: z.string().uuid("Invalid reviewer ID"),
  transaction_type: z.enum(['SALE', 'RENTAL']),
  transaction_id: z.string().uuid("Invalid transaction ID"),
  rating: z.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
  review_text: z.string().min(3, "Review text must be at least 3 characters"),
});

export const updateUserReviewSchema = z.object({
  reviewer_id: z.string().uuid("Invalid reviewer ID").optional(),
  transaction_type: z.enum(['SALE', 'RENTAL']).optional(),
  transaction_id: z.string().uuid("Invalid transaction ID").optional(),
  rating: z.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5").optional(),
  review_text: z.string().min(3, "Review text must be at least 3 characters").optional(),
});

export const addFavoriteSchema = z.object({
  user_id: z.string().uuid("Invalid user ID"),
});

export const createSavedSearchSchema = z.object({
  search_name: z.string().min(1, "Search name is required").max(100, "Search name must be 100 characters or less"),
  filters: z.record(z.any()).refine(
    (filters) => Object.keys(filters).length > 0,
    "Filters must contain at least one filter criteria"
  ),
  alert_frequency: z.enum(['IMMEDIATE', 'DAILY', 'WEEKLY', 'MONTHLY']).optional(),
  is_active: z.boolean().optional(),
});

export const updateSavedSearchSchema = z.object({
  search_name: z.string().min(1, "Search name is required").max(100, "Search name must be 100 characters or less").optional(),
  filters: z.record(z.any()).refine(
    (filters) => Object.keys(filters).length > 0,
    "Filters must contain at least one filter criteria"
  ).optional(),
  alert_frequency: z.enum(['IMMEDIATE', 'DAILY', 'WEEKLY', 'MONTHLY']).optional(),
  is_active: z.boolean().optional(),
});

export const createAvailabilitySchema = z.object({
  start_date: z.string().datetime("Invalid start date"),
  end_date: z.string().datetime("Invalid end date"),
  is_available: z.boolean().optional(),
  blocked_reason: z.string().max(100, "Blocked reason must be 100 characters or less").optional(),
});

export const updateAvailabilitySchema = z.object({
  start_date: z.string().datetime("Invalid start date").optional(),
  end_date: z.string().datetime("Invalid end date").optional(),
  is_available: z.boolean().optional(),
  blocked_reason: z.string().max(100, "Blocked reason must be 100 characters or less").optional(),
});

export const createSaleTransactionSchema = z.object({
  seller_id: z.string().uuid("Invalid seller ID"),
  buyer_id: z.string().uuid("Invalid buyer ID"),
  agent_id: z.string().uuid("Invalid agent ID").optional(),
  sale_price: z.number().positive("Sale price must be positive"),
  earnest_money_amount: z.number().min(0, "Earnest money must be at least 0").optional(),
  closing_costs_seller: z.number().min(0, "Closing costs for seller must be at least 0").optional(),
  closing_costs_buyer: z.number().min(0, "Closing costs for buyer must be at least 0").optional(),
  contract_date: z.string().datetime("Invalid contract date").optional(),
  closing_date: z.string().datetime("Invalid closing date").optional(),
  inspection_contingency_date: z.string().datetime("Invalid inspection contingency date").optional(),
  financing_contingency_date: z.string().datetime("Invalid financing contingency date").optional(),
  deed_number: z.string().max(100, "Deed number must be 100 characters or less").optional(),
  escrow_company: z.string().max(255, "Escrow company must be 255 characters or less").optional(),
  title_company: z.string().max(255, "Title company must be 255 characters or less").optional(),
  commission_amount: z.number().min(0, "Commission amount must be at least 0").optional(),
  transaction_status: z.enum(['PENDING', 'UNDER_CONTRACT', 'CLOSED', 'CANCELLED']),
});

export const updateSaleTransactionSchema = z.object({
  seller_id: z.string().uuid("Invalid seller ID").optional(),
  buyer_id: z.string().uuid("Invalid buyer ID").optional(),
  agent_id: z.string().uuid("Invalid agent ID").optional(),
  sale_price: z.number().positive("Sale price must be positive").optional(),
  earnest_money_amount: z.number().min(0, "Earnest money must be at least 0").optional(),
  closing_costs_seller: z.number().min(0, "Closing costs for seller must be at least 0").optional(),
  closing_costs_buyer: z.number().min(0, "Closing costs for buyer must be at least 0").optional(),
  contract_date: z.string().datetime("Invalid contract date").optional(),
  closing_date: z.string().datetime("Invalid closing date").optional(),
  inspection_contingency_date: z.string().datetime("Invalid inspection contingency date").optional(),
  financing_contingency_date: z.string().datetime("Invalid financing contingency date").optional(),
  deed_number: z.string().max(100, "Deed number must be 100 characters or less").optional(),
  escrow_company: z.string().max(255, "Escrow company must be 255 characters or less").optional(),
  title_company: z.string().max(255, "Title company must be 255 characters or less").optional(),
  commission_amount: z.number().min(0, "Commission amount must be at least 0").optional(),
  transaction_status: z.enum(['PENDING', 'UNDER_CONTRACT', 'CLOSED', 'CANCELLED']).optional(),
});

export const createMortgageSchema = z.object({
  lender_name: z.string().min(1, "Lender name is required").max(255, "Lender name must be 255 characters or less"),
  loan_amount: z.number().positive("Loan amount must be positive"),
  remaining_balance: z.number().min(0, "Remaining balance must be at least 0"),
  interest_rate: z.number().min(0, "Interest rate must be at least 0").max(100, "Interest rate cannot exceed 100"),
  loan_start_date: z.string().datetime("Invalid loan start date"),
  loan_end_date: z.string().datetime("Invalid loan end date"),
  is_assumable: z.boolean().optional(),
});

export const updateMortgageSchema = z.object({
  lender_name: z.string().min(1, "Lender name is required").max(255, "Lender name must be 255 characters or less").optional(),
  loan_amount: z.number().positive("Loan amount must be positive").optional(),
  remaining_balance: z.number().min(0, "Remaining balance must be at least 0").optional(),
  interest_rate: z.number().min(0, "Interest rate must be at least 0").max(100, "Interest rate cannot exceed 100").optional(),
  loan_start_date: z.string().datetime("Invalid loan start date").optional(),
  loan_end_date: z.string().datetime("Invalid loan end date").optional(),
  is_assumable: z.boolean().optional(),
});

export const createEscrowTransactionSchema = z.object({
  amount: z.number().positive("Escrow amount must be positive"),
  escrow_status: z.enum(['PENDING', 'DEPOSITED', 'RELEASED', 'DISPUTED', 'REFUNDED']).optional(),
  deposited_by: z.string().uuid("Invalid depositor ID"),
  released_at: z.string().datetime("Invalid release date").optional(),
  released_to: z.string().uuid("Invalid recipient ID").optional(),
  dispute_reason: z.string().optional(),
});

export const updateEscrowTransactionSchema = z.object({
  amount: z.number().positive("Escrow amount must be positive").optional(),
  escrow_status: z.enum(['PENDING', 'DEPOSITED', 'RELEASED', 'DISPUTED', 'REFUNDED']).optional(),
  deposited_by: z.string().uuid("Invalid depositor ID").optional(),
  released_at: z.string().datetime("Invalid release date").optional(),
  released_to: z.string().uuid("Invalid recipient ID").optional(),
  dispute_reason: z.string().optional(),
});

export const createPropertyTaxSchema = z.object({
  tax_year: z.number().int("Tax year must be an integer").min(1900, "Tax year must be valid"),
  assessed_value: z.number().positive("Assessed value must be positive"),
  annual_tax: z.number().positive("Annual tax must be positive"),
  tax_paid: z.boolean().optional(),
  payment_date: z.string().datetime("Invalid payment date").optional(),
  tax_lien: z.boolean().optional(),
});

export const updatePropertyTaxSchema = z.object({
  tax_year: z.number().int("Tax year must be an integer").min(1900, "Tax year must be valid").optional(),
  assessed_value: z.number().positive("Assessed value must be positive").optional(),
  annual_tax: z.number().positive("Annual tax must be positive").optional(),
  tax_paid: z.boolean().optional(),
  payment_date: z.string().datetime("Invalid payment date").optional(),
  tax_lien: z.boolean().optional(),
});

export const createPropertyInquirySchema = z.object({
  sender_id: z.string().uuid("Invalid sender ID"),
  receiver_id: z.string().uuid("Invalid receiver ID"),
  message: z.string().min(1, "Message is required"),
  is_replied: z.boolean().optional(),
  replied_at: z.string().datetime("Invalid replied date").optional(),
});

export const updatePropertyInquirySchema = z.object({
  sender_id: z.string().uuid("Invalid sender ID").optional(),
  receiver_id: z.string().uuid("Invalid receiver ID").optional(),
  message: z.string().min(1, "Message is required").optional(),
  is_replied: z.boolean().optional(),
  replied_at: z.string().datetime("Invalid replied date").optional(),
});

export const createPropertyReviewSchema = z.object({
  user_id: z.string().uuid("Invalid user ID"),
  rating: z.number().int("Rating must be an integer").min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  review_text: z.string().min(1, "Review text is required"),
  is_verified_purchase: z.boolean().optional(),
  helpful_count: z.number().int("Helpful count must be an integer").min(0, "Helpful count cannot be negative").optional(),
});

export const updatePropertyReviewSchema = z.object({
  user_id: z.string().uuid("Invalid user ID").optional(),
  rating: z.number().int("Rating must be an integer").min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5").optional(),
  review_text: z.string().min(1, "Review text is required").optional(),
  is_verified_purchase: z.boolean().optional(),
  helpful_count: z.number().int("Helpful count must be an integer").min(0, "Helpful count cannot be negative").optional(),
});

export const createShowingSchema = z.object({
  requester_id: z.string().uuid("Invalid requester ID"),
  agent_id: z.string().uuid("Invalid agent ID").optional(),
  scheduled_at: z.string().datetime("Invalid scheduled date").optional(),
  duration_minutes: z.number().int("Duration must be an integer").min(1, "Duration must be at least 1 minute").optional(),
  status: z.enum(['REQUESTED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']).optional(),
  notes: z.string().optional(),
  feedback: z.string().optional(),
});

export const updateShowingSchema = z.object({
  requester_id: z.string().uuid("Invalid requester ID").optional(),
  agent_id: z.string().uuid("Invalid agent ID").optional(),
  scheduled_at: z.string().datetime("Invalid scheduled date").optional(),
  duration_minutes: z.number().int("Duration must be an integer").min(1, "Duration must be at least 1 minute").optional(),
  status: z.enum(['REQUESTED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']).optional(),
  notes: z.string().optional(),
  feedback: z.string().optional(),
});

export const createPropertyComparisonSchema = z.object({
  user_id: z.string().uuid("Invalid user ID"),
  name: z.string().min(1, "Name must be at least 1 character").max(100, "Name must be 100 characters or less").optional(),
  property_ids: z.array(z.string().uuid("Invalid property ID")).min(1, "At least one property ID is required"),
});

export const updatePropertyComparisonSchema = z.object({
  user_id: z.string().uuid("Invalid user ID").optional(),
  name: z.string().min(1, "Name must be at least 1 character").max(100, "Name must be 100 characters or less").optional(),
  property_ids: z.array(z.string().uuid("Invalid property ID")).optional(),
});

export const addPropertyToComparisonSchema = z.object({
  property_id: z.string().uuid("Invalid property ID"),
});

export const createPropertyViewSchema = z.object({
  user_id: z.string().uuid("Invalid user ID").optional(),
  ip_address: z.string().optional(),
});

export const createUserDocumentSchema = z.object({
  document_type: z.string().min(1, "Document type is required").max(50, "Document type must be 50 characters or less"),
  file_url: z.string().min(5, "File URL is required"),
  expiry_date: z.string().datetime().optional(),
});

export const updateUserDocumentSchema = z.object({
  document_type: z.string().min(1, "Document type is required").max(50, "Document type must be 50 characters or less").optional(),
  file_url: z.string().min(5, "File URL is required").optional(),
  expiry_date: z.string().datetime().optional(),
  verification_status: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).optional(),
  verified_by: z.string().uuid("Invalid verifier ID").optional(),
});

export const verifyUserDocumentSchema = z.object({
  verification_status: z.enum(['PENDING', 'VERIFIED', 'REJECTED']),
  verified_by: z.string().uuid("Invalid verifier ID"),
});

export const createNotificationSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be 255 characters or less"),
  message: z.string().min(1, "Message is required"),
  notification_type: z.string().max(50, "Notification type must be 50 characters or less").optional(),
});

export const updateNotificationSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be 255 characters or less").optional(),
  message: z.string().min(1, "Message is required").optional(),
  notification_type: z.string().max(50, "Notification type must be 50 characters or less").optional(),
  is_read: z.boolean().optional(),
  read_at: z.string().datetime().optional(),
});

export const createAdminAuditLogSchema = z.object({
  action_type: z.string().min(1).max(100),
  entity_type: z.string().min(1).max(50),
  entity_id: z.string().uuid(),
  old_value: z.any().optional(),
  new_value: z.any().optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
});

export const listAdminAuditLogsSchema = z.object({
  admin_id: z.string().uuid().optional(),
  entity_type: z.string().optional(),
  entity_id: z.string().uuid().optional(),
  action_type: z.string().optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

