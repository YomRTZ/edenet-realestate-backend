import { rentalService } from '../services/rental.service.js';

export const rentalController = {
  async create(req, res) {
    try {
      const payload = req.body;
      const created = await rentalService.createRentalFromEvent(payload);
      return res.json(created);
    } catch (err) {
      console.error('rental.controller.create error', err && err.message);
      return res.status(500).json({ error: 'Could not create rental' });
    }
  },

  async pay(req, res) {
    try {
      const { agreementId, amount } = req.body;
      await rentalService.recordPayment(agreementId, amount);
      return res.json({ success: true });
    } catch (err) {
      console.error('rental.controller.pay error', err && err.message);
      return res.status(500).json({ error: 'Could not record payment' });
    }
  },

  async terminate(req, res) {
    try {
      const { agreementId, reason } = req.body;
      const updated = await rentalService.terminateAgreement(agreementId, reason || 'manual');
      return res.json(updated);
    } catch (err) {
      console.error('rental.controller.terminate error', err && err.message);
      return res.status(500).json({ error: 'Could not terminate rental' });
    }
  }
};
