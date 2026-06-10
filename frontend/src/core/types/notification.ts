// src/core/types/notification.ts

export type NotificationType =
  | 'OFFER_RECEIVED' | 'OFFER_ACCEPTED' | 'OFFER_REJECTED'
  | 'TRANSACTION_COMPLETE' | 'PROPERTY_VERIFIED' | 'DAO_VOTE'
  | 'RENTAL_DUE' | 'PRICE_CHANGE' | 'NEW_MESSAGE' | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}
