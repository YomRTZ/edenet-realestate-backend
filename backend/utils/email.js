const nodemailer = require('nodemailer');

// Create Gmail transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

/**
 * Send OTP code to user's email
 * @param {string} toEmail - Recipient email address
 * @param {string} code - 6-digit OTP code
 */
async function sendOtp(toEmail, code) {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: toEmail,
    subject: 'Property Chain - Verify Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Verify Your Email</h2>
        <p>Your verification code is:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
          ${code}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">Property Chain - Government Land Registry System</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send verification email');
  }
}

/**
 * Send approval notification to user
 * @param {string} toEmail - Recipient email address
 */
async function sendApprovalNotification(toEmail) {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: toEmail,
    subject: 'Property Chain - KYC Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">KYC Verification Approved! ✓</h2>
        <p>Congratulations! Your KYC documents have been reviewed and approved.</p>
        <p>You can now:</p>
        <ul>
          <li>Connect your wallet</li>
          <li>Submit property registration requests</li>
          <li>Buy and sell properties</li>
        </ul>
        <p>Please log in to your account to get started.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">Property Chain - Government Land Registry System</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Approval notification sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending approval email:', error);
    throw new Error('Failed to send approval notification');
  }
}

/**
 * Send rejection notification to user
 * @param {string} toEmail - Recipient email address
 * @param {string} reason - Reason for rejection
 */
async function sendRejectionNotification(toEmail, reason) {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: toEmail,
    subject: 'Property Chain - KYC Application Status',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">KYC Application Update</h2>
        <p>Thank you for submitting your KYC documents. Unfortunately, we are unable to approve your application at this time.</p>
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Reason:</strong></p>
          <p style="margin: 5px 0 0 0;">${reason}</p>
        </div>
        <p>If you believe this is an error or would like to appeal, please contact our support team.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">Property Chain - Government Land Registry System</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Rejection notification sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending rejection email:', error);
    throw new Error('Failed to send rejection notification');
  }
}

module.exports = {
  sendOtp,
  sendApprovalNotification,
  sendRejectionNotification
};
