import { Router } from "express";
import { requireAdmin } from "../../middleware/auth";
import * as promoController from "../../controllers/admin/promo";

export const adminPromoRouter = Router();

adminPromoRouter.use(requireAdmin);

adminPromoRouter.get("/promos", promoController.getAllPromos);
adminPromoRouter.post("/promos", promoController.createPromo);
adminPromoRouter.patch("/promos/:promoId", promoController.updatePromo);
adminPromoRouter.delete("/promos/:promoId", promoController.deletePromo);
