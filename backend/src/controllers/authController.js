// Thin HTTP layer — delegates all logic to authService.

const authService = require('../services/authService');

async function register(req, res, next) {
  try {
    const { email, password, confirmPassword } = req.body;
    const result = await authService.register(email, password, confirmPassword);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function googleAuth(req, res, next) {
  try {
    const result = await authService.googleAuth(req.body.credential);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const { email, code } = req.body;
    const result = await authService.verifyOtp(email, code);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function resendOtp(req, res, next) {
  try {
    const result = await authService.resendOtp(req.body.email);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function connectWallet(req, res, next) {
  try {
    const { walletAddress, signature, message } = req.body;
    const result = await authService.connectWallet(req.user.id, walletAddress, signature, message);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function disconnectWallet(req, res, next) {
  try {
    const result = await authService.disconnectWallet(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const result = await authService.getMe(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, googleAuth, verifyOtp, resendOtp, login, connectWallet, disconnectWallet, getMe };
