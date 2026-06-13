// Multer configured with memory storage — files arrive as Buffers in req.files.
// Files are NEVER written to disk.

const multer = require('multer');

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE_MB = 10;

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type not allowed: ${file.mimetype}. Allowed: JPEG, PNG, WEBP, GIF, PDF, DOC, DOCX`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 20,
  },
});

/**
 * Property file upload — matches FormData fields:
 *   images[]    → up to 15 property photos
 *   documents[] → up to 5 deeds / surveys / IDs
 */
const uploadPropertyFiles = upload.fields([
  { name: 'images', maxCount: 15 },
  { name: 'documents', maxCount: 5 },
]);

/**
 * KYC document upload — matches FormData fields:
 *   idFront, idBack, selfie (1 each, images only)
 */
const kycUpload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for KYC documents'));
    }
  },
});

const uploadKycFiles = kycUpload.fields([
  { name: 'idFront', maxCount: 1 },
  { name: 'idBack', maxCount: 1 },
  { name: 'selfie', maxCount: 1 },
]);

module.exports = { uploadPropertyFiles, uploadKycFiles };
