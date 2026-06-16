import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const UPLOADS_DIR_PATH = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists (best-effort)
try {
  if (!fs.existsSync(UPLOADS_DIR_PATH)) fs.mkdirSync(UPLOADS_DIR_PATH, { recursive: true });
} catch (_) {
  // ignore; multer can still operate in-memory
}

// Store files as raw memory buffers to generate hashes before writing to disk/S3
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];

  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Invalid file type. Only JPEGs, PNGs, WebPs, and PDFs are allowed.'), false);
};

export const uploadEngine = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
  fileFilter,
});

// Backwards-compatible export name used across the codebase
export const upload = uploadEngine;

