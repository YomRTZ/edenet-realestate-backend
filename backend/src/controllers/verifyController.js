// Thin HTTP layer — delegates all logic to verifyService.

const verifyService = require('../services/verifyService');

async function verifyProperty(req, res, next) {
  try {
    const result = await verifyService.verifyProperty(req.params.tokenId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { verifyProperty };
