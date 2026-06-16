import express from 'express';
import fs from 'fs';
import path from 'path';
import { upload, UPLOADS_DIR_PATH } from '../multer/upload.js';

export const uploadsRouter = express.Router();

// POST /api/uploads
// Accepts multipart/form-data with field name: "files" (multiple)
// Optional field: "folder" (subdirectory name)
uploadsRouter.post('/', upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    // Note: we store directly in UPLOADS_DIR_PATH (no per-folder subdir in this minimal version)
    // If you want subfolders, adjust multer destination.

    const files = req.files.map((f) => ({
      originalName: f.originalname,
      storedName: f.filename,
      mimeType: f.mimetype,
      size: f.size,
      url: `/uploads/${encodeURIComponent(f.filename)}`,
    }));

    return res.status(201).json({ files });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Upload failed' });
  }
});

// GET /api/uploads
// Returns a basic list of stored files.
uploadsRouter.get('/', async (req, res) => {
  try {
    ensureDir(UPLOADS_DIR_PATH);

    const entries = fs.readdirSync(UPLOADS_DIR_PATH, { withFileTypes: true });
    const files = entries
      .filter((e) => e.isFile())
      .map((e) => ({
        storedName: e.name,
        url: `/uploads/${encodeURIComponent(e.name)}`,
      }));

    return res.json({ files });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Failed to list uploads' });
  }
});

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

