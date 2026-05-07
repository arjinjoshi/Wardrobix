import { Category } from "../../models/Category";
import { Order } from "../../models/Order";
import { Product } from "../../models/Product";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/envelope";
import * as adminController from "../../services/admin/dashboard"



  export const getDashboardStats = asyncHandler(async (_req, res) => {

    const stats = await adminController.getDashboardStats()
  

    res.json(ok(stats));
  });