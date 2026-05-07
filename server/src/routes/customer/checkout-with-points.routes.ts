import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import * as checkoutWithPointsController from "../../controllers/customer/checkout-with-points";

export const customerCheckoutWithPointsRouter = Router();

customerCheckoutWithPointsRouter.use(requireAuth);

customerCheckoutWithPointsRouter.get("/checkout/points", checkoutWithPointsController.getPoints);
customerCheckoutWithPointsRouter.post("/checkout/pay-with-points", checkoutWithPointsController.payWithPoints);
