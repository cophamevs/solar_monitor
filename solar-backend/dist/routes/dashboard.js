"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_service_js_1 = require("../services/dashboard.service.js");
const router = (0, express_1.Router)();
// Get dashboard summary
router.get('/summary', async (_req, res, next) => {
    try {
        const result = await dashboard_service_js_1.DashboardService.getSummary();
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
// Get plant status distribution
router.get('/plant-status', async (_req, res, next) => {
    try {
        const result = await dashboard_service_js_1.DashboardService.getPlantStatus();
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
// Get alarm summary
router.get('/alarm-summary', async (_req, res, next) => {
    try {
        const result = await dashboard_service_js_1.DashboardService.getAlarmSummary();
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
// Get energy flow data for a site (for EnergyFlowDiagram)
router.get('/energy-flow/:siteId', async (req, res, next) => {
    try {
        const { siteId } = req.params;
        const result = await dashboard_service_js_1.DashboardService.getEnergyFlow(siteId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map