const propertyService = require('../services/property.service');

class PropertyController {
  async createProperty(req, res, next) {
    try {
      if (!req.files) {
        return res.status(400).json({ success: false, error: 'Multipart file arrays missing.' });
      }

      const result = await propertyService.processAndRegisterProperty(req.body, req.files);
      
      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error); 
    }
  }
}

module.exports = new PropertyController();
