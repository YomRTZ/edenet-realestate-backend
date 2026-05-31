/* Generate a random 6-digit OTP */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/* Generate OTP expiration time (5 minutes from now) */
export const getOTPExpiration = (minutes = 5) => {
  const now = new Date();
  return new Date(now.getTime() + minutes * 60000);
};
