// Thin HTTP layer — delegates all logic to propertyService.

const propertyService = require('../services/propertyService');

async function prepareRequest(req, res, next) {
  try {
    const result = await propertyService.prepareRequest(req.body, req.files);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function confirmRequest(req, res, next) {
  try {
    const { tempId, txHash } = req.body;
    const result = await propertyService.confirmRequest(tempId, txHash);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function submitUpdateRequest(req, res, next) {
  try {
    const result = await propertyService.submitUpdateRequest(req.params.id, req.body, req.files);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function listProperties(req, res, next) {
  try {
    const result = await propertyService.listProperties(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getPropertyById(req, res, next) {
  try {
    const result = await propertyService.getPropertyById(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getImages(req, res, next) {
  try {
    const result = await propertyService.getImages(req.params.id, req.query.versionNo);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getDocuments(req, res, next) {
  try {
    const result = await propertyService.getDocuments(req.params.id, req.query.versionNo);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  prepareRequest, confirmRequest, submitUpdateRequest,
  listProperties, getPropertyById, getImages, getDocuments,
};
