import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import * as checkoutController from "../../controllers/customer/checkout";

export const customerCheckoutRouter = Router();

customerCheckoutRouter.use(requireAuth);

customerCheckoutRouter.post("/checkout/create-session", checkoutController.createSession);
customerCheckoutRouter.post("/checkout/confirm", checkoutController.confirmCheckout);
