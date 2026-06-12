import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import pkg from '@prisma/client';
import { authorizeSession } from '../middleware/authSession.middleware.js';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const authRouter = express.Router();

authRouter.post('/nonce', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) return res.status(400).json({ error: 'Wallet allocation target required.' });
    const cleanAddress = walletAddress.toLowerCase();

    let user = await prisma.user.findUnique({ where: { walletAddress: cleanAddress } });
    if (!user) {
      const isGov = cleanAddress === '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
      user = await prisma.user.create({ data: { walletAddress: cleanAddress, role: isGov ? 'Government' : 'Citizen' } });
    }

    const generatedNonce = crypto.randomBytes(16).toString('hex');
    const expiryTimestamp = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.walletNonce.create({ data: { walletAddress: cleanAddress, nonce: generatedNonce, expiresAt: expiryTimestamp } });

    return res.json({ nonce: generatedNonce });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to allocate cryptographic verification token.' });
  }
});

authRouter.post('/login', async (req, res) => {
export default authRouter;
    const { signature, walletAddress } = req.body;
    if (!signature || !walletAddress) return res.status(400).json({ error: 'Verification signatures missing.' });
    const cleanAddress = walletAddress.toLowerCase();

    const activeNonceRecord = await prisma.walletNonce.findFirst({
      where: { walletAddress: cleanAddress, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' }
    });

    if (!activeNonceRecord) return res.status(400).json({ error: 'No active unexpired authorization challenges found.' });

    const expectedMessage = `Sign to authorize access:\nNonce: ${activeNonceRecord.nonce}`;
    const recoveredSigner = ethers.verifyMessage(expectedMessage, signature);

    if (recoveredSigner.toLowerCase() !== cleanAddress) {
      return res.status(401).json({ error: 'Signature mapping verification failed.' });
    }

    await prisma.walletNonce.update({ where: { id: activeNonceRecord.id }, data: { usedAt: new Date() } });

    const user = await prisma.user.findUnique({ where: { walletAddress: cleanAddress } });
    const sessionToken = jwt.sign({ id: user.id, wallet: user.walletAddress }, process.env.JWT_SECRET, { expiresIn: '2h' });
    const sessionExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000);

    await prisma.userSession.create({ data: { userId: user.id, sessionToken, expiresAt: sessionExpiry } });

    res.cookie('sessionToken', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000
    });

    return res.json({ account: user.walletAddress, role: user.role, isOwner: user.isOwner, isTenant: user.isTenant });
  } catch (error) {
    return res.status(500).json({ error: 'Authentication system failure.' });
  }
});

authRouter.post('/citizen/update-status', authorizeSession, async (req, res) => {
  try {
    const { action } = req.body;
    if (!action) return res.status(400).json({ error: 'Missing state update operational payload key.' });

    const targetModifications = action === 'list' ? { isOwner: true } : { isTenant: true };

    const updatedUser = await prisma.user.update({ where: { id: req.user.id }, data: targetModifications });

    return res.json({ isOwner: updatedUser.isOwner, isTenant: updatedUser.isTenant });
  } catch (error) {
    return res.status(500).json({ error: 'Could not apply profile structural flags changes.' });
  }
});

authRouter.post('/logout', async (req, res) => {
  try {
    const token = req.cookies && req.cookies.sessionToken;
    if (token) {
      await prisma.userSession.deleteMany({ where: { sessionToken: token } });
    }
    res.clearCookie('sessionToken');
    return res.json({ success: true, message: 'Session closed successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Logout execution processing broken.' });
  }
});
