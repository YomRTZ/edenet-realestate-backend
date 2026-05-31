import * as service from '../services/otp.service.js';
import { catchAsync } from '../utils/catchAsync.js';

/* Request OTP */
export const requestOTP = catchAsync(async (req, res) => {
  const { email, purpose } = req.body;
  const result = await service.requestOTP(email, purpose);
  res.status(200).json(result);
});

/* Check OTP status */
export const checkOTP = catchAsync(async (req, res) => {
  const { email, purpose } = req.body;
  const result = await service.checkOTP(email, purpose);
  res.status(200).json(result);
});

/* Decline OTP */
export const declineOTP = catchAsync(async (req, res) => {
  const { email, purpose } = req.body;
  const result = await service.declineOTP(email, purpose);
  res.status(200).json(result);
});

/* Verify OTP */
export const verifyOTP = catchAsync(async (req, res) => {
  const { email, code, purpose } = req.body;
  const result = await service.verifyOTP(email, code, purpose);
  res.status(200).json(result);
});
