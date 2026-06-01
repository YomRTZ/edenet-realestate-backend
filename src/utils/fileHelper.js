import fs from 'fs';
import path from 'path';

export const UPLOADS_DIR = path.resolve('uploads');

export const ensureUploadsDir = () => {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
};

export const getUploadDbPath = (filename) => {
  // accept nested paths like 'documents_encrypted/filename.ext'
  if (!filename) return null;
  return path.posix.join('uploads', filename.replace(/\\\\/g, '/'));
};

export const getUploadFsPath = (dbPath) => {
  if (!dbPath) return null;
  if (path.isAbsolute(dbPath)) return dbPath;
  // dbPath can be 'uploads/...' or just a relative path under uploads
  let relative = dbPath;
  if (dbPath.startsWith('uploads/')) {
    relative = dbPath.replace(/^uploads\//, '');
  }
  return path.join(UPLOADS_DIR, relative);
};

export const removeFile = async (dbPath) => {
  const absolutePath = getUploadFsPath(dbPath);
  if (!absolutePath) return;

  try {
    if (fs.existsSync(absolutePath)) {
      await fs.promises.unlink(absolutePath);
    }
  } catch (error) {
    console.error('[removeFile] Could not delete file:', absolutePath, error.message);
  }
};

export const removeFileByFsPath = async (filePath) => {
  if (!filePath) return;

  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    console.error('[removeFileByFsPath] Could not delete file:', filePath, error.message);
  }
};
