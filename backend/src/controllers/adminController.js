// src/controllers/adminController.js
// Thin HTTP layer — delegates all logic to adminService.

const adminService = require('../services/adminService');

async function listRequests(req, res, next) {
  try {
    const { status, type } = req.query;
    const result = await adminService.listRequests(status, type);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function approveRequest(req, res, next) {
  try {
    const govWallet = req.user.walletAddress.toLowerCase();
    const result = await adminService.approveRequest(req.params.requestId, govWallet, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function declineRequest(req, res, next) {
  try {
    const govWallet = req.user.walletAddress.toLowerCase();
    const { reason, updateIndex } = req.body;
    const result = await adminService.declineRequest(req.params.requestId, govWallet, reason, updateIndex);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const result = await adminService.listUsers();
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function listPendingKyc(req, res, next) {
  try {
    const result = await adminService.listPendingKyc();
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getKycDocument(req, res, next) {
  try {
    const { userId, docId } = req.params;
    const doc = await adminService.getKycDocument(userId, docId);
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Length', doc.fileData.length);
    res.send(doc.fileData);
  } catch (err) {
    next(err);
  }
}

async function approveKyc(req, res, next) {
  try {
    const result = await adminService.approveKyc(req.params.userId, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function rejectKyc(req, res, next) {
  try {
    const result = await adminService.rejectKyc(req.params.userId, req.user.id, req.body.reason);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getAnalytics(req, res, next) {
  try {
    const result = await adminService.getAnalytics();
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listRequests, approveRequest, declineRequest,
  listUsers, listPendingKyc, getKycDocument, approveKyc, rejectKyc,
  getAnalytics,
};
