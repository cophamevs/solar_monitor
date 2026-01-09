import { Router } from 'express';
import { DashboardService } from '../services/dashboard.service.js';

const router = Router();

// Get dashboard summary
router.get('/summary', async (_req, res, next) => {
    try {
        const result = await DashboardService.getSummary();
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Get plant status distribution
router.get('/plant-status', async (_req, res, next) => {
    try {
        const result = await DashboardService.getPlantStatus();
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Get alarm summary
router.get('/alarm-summary', async (_req, res, next) => {
    try {
        const result = await DashboardService.getAlarmSummary();
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Get energy flow data for a site (for EnergyFlowDiagram)
router.get('/energy-flow/:siteId', async (req, res, next) => {
    try {
        const { siteId } = req.params;
        const result = await DashboardService.getEnergyFlow(siteId);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
