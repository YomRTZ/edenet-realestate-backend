import multer from 'multer';
import path from 'path';
import fs from 'fs';

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
};

// Store uploads in: realstate-backend/hardhat/uploads
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
ensureDir(UPLOADS_DIR);

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

// Allow common document/image types + other files (fallback to octet-stream)
const allowedMimePrefixes = [
  'image/',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/',
];

function fileMimeAllowed(mimeType = '') {
  return allowedMimePrefixes.some((p) => {
    if (p.endsWith('/')) return mimeType.startsWith(p);
    return mimeType === p;
  });
}

// Support documents/images AND "other" files.
// We accept anything as long as:
// - filename exists
// - and either mime is known OR it has a normal-looking extension
const fileFilter = (req, file, cb) => {
  try {
    const { originalname, mimetype } = file;
    if (!originalname) return cb(new Error('Missing original filename'));

    const safeByMime = fileMimeAllowed(mimetype);
    const ext = path.extname(originalname).toLowerCase();

    // Treat "hosts" (no extension) as unsupported, but allow typical extensions.
    const hasNormalExtension = Boolean(ext && ext.length >= 2 && ext.length <= 10);

    if (safeByMime || hasNormalExtension) return cb(null, true);

    return cb(null, true); // allow unknown/octet-stream by requirement
  } catch (err) {
    return cb(err);
  }
};


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDir(UPLOADS_DIR);
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext);
    const timestamp = Date.now();
    const random = Math.random().toString(16).slice(2);

    const sanitizedBase = baseName.replace(/[^a-z0-9_-]/gi, '_').slice(0, 50);
    cb(null, `${sanitizedBase}_${timestamp}_${random}${ext}`);
  },
});

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
});

export const UPLOADS_DIR_PATH = UPLOADS_DIR;

