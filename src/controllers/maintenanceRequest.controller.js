import * as service from '../services/maintenanceRequest.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createMaintenanceRequest = catchAsync(async (req, res) => {
  const maintenanceRequest = await service.createMaintenanceRequest(req.params.propertyId, req.params.agreementId, req.body);
  res.status(201).json({
    success: true,
    message: 'Maintenance request created successfully',
    data: maintenanceRequest,
  });
});

export const getMaintenanceRequests = catchAsync(async (req, res) => {
  const maintenanceRequests = await service.getMaintenanceRequests(req.params.propertyId, req.params.agreementId);
  res.json({ success: true, data: maintenanceRequests });
});

export const getMaintenanceRequestById = catchAsync(async (req, res) => {
  const maintenanceRequest = await service.getMaintenanceRequestById(req.params.requestId);
  res.json({ success: true, data: maintenanceRequest });
});

export const updateMaintenanceRequest = catchAsync(async (req, res) => {
  const maintenanceRequest = await service.updateMaintenanceRequest(req.params.requestId, req.body);
  res.json({
    success: true,
    message: 'Maintenance request updated successfully',
    data: maintenanceRequest,
  });
});

export const deleteMaintenanceRequest = catchAsync(async (req, res) => {
  await service.deleteMaintenanceRequest(req.params.requestId);
  res.json({ success: true, message: 'Maintenance request deleted successfully' });
});
