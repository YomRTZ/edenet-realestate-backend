import fs from 'fs';
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // recommended for GCM
const AUTH_TAG_LENGTH = 16;

const getKey = () => {
  const key = process.env.DOCUMENT_ENCRYPTION_KEY;
  if (!key) throw new Error('DOCUMENT_ENCRYPTION_KEY not set');
  // expect base64 or hex; normalize to Buffer
  return Buffer.from(key, 'base64');
};

export const encryptFile = async (inputPath, outputPath) => {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const data = await fs.promises.readFile(inputPath);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // write: iv (12) + authTag (16) + encrypted
  const out = Buffer.concat([iv, authTag, encrypted]);
  await fs.promises.mkdir(require('path').dirname(outputPath), { recursive: true });
  await fs.promises.writeFile(outputPath, out);
  return outputPath;
};

export const decryptFile = async (inputPath, outputPath) => {
  const key = getKey();
  const file = await fs.promises.readFile(inputPath);
  const iv = file.slice(0, IV_LENGTH);
  const authTag = file.slice(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = file.slice(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  await fs.promises.mkdir(require('path').dirname(outputPath), { recursive: true });
  await fs.promises.writeFile(outputPath, decrypted);
  return outputPath;
};

export default { encryptFile, decryptFile };
