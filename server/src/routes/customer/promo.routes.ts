import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import * as promoController from "../../controllers/customer/promo";

export const customerPromoRouter = Router();

customerPromoRouter.use(requireAuth);

customerPromoRouter.post("/promos/apply", promoController.applyPromo);
