import multer from 'multer';
import path from 'path';
import { AppError } from '../utils/AppError.js';
import { ensureUploadsDir, UPLOADS_DIR } from '../utils/fileHelper.js';

ensureUploadsDir();

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension)
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${baseName}-${uniqueSuffix}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new AppError('Only JPEG, PNG, WEBP, and GIF image files are allowed', 400), false);
  }
  cb(null, true);
};

const propertyImageUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadPropertyImageFile = (req, res, next) => {
  if (!req.is('multipart/form-data')) {
    return next();
  }
  propertyImageUpload.single('image')(req, res, next);
};

// Document upload (accept pdfs and common document types)
const documentFileFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new AppError('Only PDF and image files are allowed for documents', 400), false);
  }
  cb(null, true);
};

const documentUpload = multer({
  storage,
  fileFilter: documentFileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

export const uploadDocumentFile = (req, res, next) => {
  if (!req.is('multipart/form-data')) return next();
  documentUpload.single('document')(req, res, next);
};
