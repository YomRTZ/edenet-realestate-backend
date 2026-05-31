

import sequelize from '../config/database.js';
import { Role } from './role.model.js';
import { User } from './user.model.js';
import RefreshToken from './refreshToken.model.js';
import { OTP } from './otp.model.js';
import { Property } from './property.model.js';
import { PropertyImage } from './propertyImage.model.js';
import { PropertyFeature } from './propertyFeature.model.js';
import { PropertyDocument } from './propertyDocument.model.js';
import { PropertyVerification } from './propertyVerification.model.js';
import { PropertyOwnership } from './propertyOwnership.model.js';
import { RentalAgreement } from './rentalAgreement.model.js';
import { RentalPayment } from './rentalPayment.model.js';
import { MaintenanceRequest } from './maintenanceRequest.model.js';
import { Availability } from './availability.model.js';
import { SaleTransaction } from './saleTransaction.model.js';
import { EscrowTransaction } from './escrowTransaction.model.js';
import { Mortgage } from './mortgage.model.js';
import { PropertyTax } from './propertyTax.model.js';
import { PropertyInquiry } from './propertyInquiry.model.js';
import { PropertyReview } from './propertyReview.model.js';
import { Showing } from './showing.model.js';
import { UserReview } from './userReview.model.js';
import { Favorite } from './favorite.model.js';
import { SavedSearch } from './savedSearch.model.js';
import { PropertyComparison } from './propertyComparison.model.js';
import { PropertyView } from './propertyView.model.js';
import { UserDocument } from './userDocument.model.js';
import './associations.js';
import { Notification } from './notification.model.js';
import { AdminAuditLog } from './adminAuditLog.model.js';
export { sequelize, Role, User, RefreshToken, OTP, Property, PropertyImage, PropertyFeature, PropertyDocument, PropertyVerification, PropertyOwnership, RentalAgreement, RentalPayment, MaintenanceRequest, Availability, SaleTransaction, EscrowTransaction, Mortgage, PropertyTax, PropertyInquiry, PropertyReview, Showing, UserReview, Favorite, SavedSearch, PropertyComparison, PropertyView, UserDocument, Notification, AdminAuditLog };

export const models = sequelize.models;
