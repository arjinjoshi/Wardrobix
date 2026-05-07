import { Router, type Request, type Response } from "express";
import { requireAdmin } from "../../middleware/auth";
import * as dashboardController from "../../controllers/admin/dashboard"

type TotalSaleRow = {
  _id: null;
  totalSales: number;
};

export const adminDashboardRouter = Router();

adminDashboardRouter.use(requireAdmin);

adminDashboardRouter.get(
  "/dashboard/lite",
  dashboardController.getDashboardStats
);
