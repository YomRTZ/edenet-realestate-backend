// src/validation/adminSchemas.js
const { z } = require('zod');

const approveRequestSchema = z.object({
  // Required for MINT requests — the on-chain request ID emitted by submitRequest()
  onChainRequestId: z.coerce.number().int().min(0).optional(),
  // Required for UPDATE requests — the index in the on-chain updateRequests array
  onChainUpdateIndex: z.coerce.number().int().min(0).optional(),
});

const declineRequestSchema = z.object({
  reason:      z.string().trim().min(5, 'Decline reason must be at least 5 characters'),
  updateIndex: z.coerce.number().int().min(0).optional(),
});

const rejectKycSchema = z.object({
  reason: z.string().trim().min(5, 'Rejection reason must be at least 5 characters'),
});

const listRequestsQuerySchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'DECLINED']).optional().default('PENDING'),
  type:   z.enum(['MINT', 'UPDATE']).optional(),
});

module.exports = {
  approveRequestSchema,
  declineRequestSchema,
  rejectKycSchema,
  listRequestsQuerySchema,
};
