// src/core/types/property.ts

export type PropertyType =
  | 'HOUSE' | 'APARTMENT' | 'CONDO' | 'VILLA'
  | 'COMMERCIAL' | 'LAND' | 'TOWNHOUSE';

export type PropertyStatus =
  | 'ACTIVE' | 'PENDING' | 'SOLD' | 'RENTED' | 'DRAFT' | 'SUSPENDED';

export type ListingType = 'SALE' | 'RENT' | 'BOTH';

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  priceCurrency?: 'USD' | 'ETH';
  propertyType: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
  bedrooms: number;
  bathrooms: number;
  area: number;
  yearBuilt?: number;
  floors?: number;
  parkingSpaces?: number;
  location: PropertyLocation;
  media: PropertyMedia;
  amenities: PropertyAmenities;
  blockchain: BlockchainData;
  isFeatured: boolean;
  documents: PropertyDocument[];
  views: number;
  saves: number;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  lat: number;
  lng: number;
  neighborhood?: string;
}

export interface PropertyMedia {
  images: string[];
  videos?: string[];
  virtualTourUrl?: string;
}

export interface PropertyAmenities {
  parking: boolean;
  pool: boolean;
  gym: boolean;
  security: boolean;
  elevator: boolean;
  garden: boolean;
  balcony: boolean;
  airConditioning: boolean;
  heating: boolean;
  internet: boolean;
  furnished: boolean;
  petFriendly: boolean;
}

export interface BlockchainData {
  tokenId?: string;
  contractAddress?: string;
  ownerWallet?: string;
  metadataHash?: string;
  imagesRootHash?: string;
  documentsRootHash?: string;
  isVerified: boolean;
  verificationTxHash?: string;
  transferHistory: TransferRecord[];
  /** Registry DB id — for fetching images/documents from backend */
  dbId?: string;
}

export interface TransferRecord {
  from: string;
  to: string;
  txHash: string;
  timestamp: string;
  price: number;
}

export interface PropertyDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface PropertyFilters {
  query?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: PropertyType[];
  listingType?: ListingType;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'area';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  properties: Property[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}
