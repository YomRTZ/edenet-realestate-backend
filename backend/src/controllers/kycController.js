// src/controllers/kycController.js
// Thin HTTP layer — delegates all logic to kycService.

const kycService = require('../services/kycService');

async function upload(req, res, next) {
  try {
    const result = await kycService.uploadDocuments(req.user.id, req.user.status, req.files, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function getStatus(req, res, next) {
  try {
    const result = await kycService.getStatus(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { upload, getStatus };
