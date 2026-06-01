

import sequelize from '../config/database.js';
import { Role } from './role.model.js';
import { User } from './user.model.js';
import RefreshToken from './refreshToken.model.js';
import { OTP } from './otp.model.js';
import { Property } from './property.model.js';
import { PropertyFeature } from './propertyFeature.model.js';
import { Document } from './document.model.js';
import { PropertyOwnership } from './propertyOwnership.model.js';
import { RentalAgreement } from './rentalAgreement.model.js';
import { RentalPayment } from './rentalPayment.model.js';
import { MaintenanceRequest } from './maintenanceRequest.model.js';
import { Availability } from './availability.model.js';
import { SaleTransaction } from './saleTransaction.model.js';
import { EscrowTransaction } from './escrowTransaction.model.js';
import { PropertyTax } from './propertyTax.model.js';
import { PropertyInquiry } from './propertyInquiry.model.js';
import { Showing } from './showing.model.js';
import { Review } from './review.model.js';
import { Favorite } from './favorite.model.js';
import { SavedSearch } from './savedSearch.model.js';
import { Notification } from './notification.model.js';
import { AdminAuditLog } from './adminAuditLog.model.js';
// PropertyComparison and PropertyView removed — placeholders handled via routes/controllers
import './associations.js';

export { sequelize, Role, User, RefreshToken, OTP, Property, Document, PropertyFeature, PropertyOwnership, RentalAgreement, RentalPayment, MaintenanceRequest, Availability, SaleTransaction, EscrowTransaction, PropertyTax, PropertyInquiry, Review, Showing, Favorite, SavedSearch, Notification, AdminAuditLog };

export const models = sequelize.models;
