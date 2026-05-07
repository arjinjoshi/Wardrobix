import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import * as ordersController from "../../controllers/customer/orders";

export const customerOrderRouter = Router();

customerOrderRouter.use(requireAuth);

customerOrderRouter.get("/orders", ordersController.getOrders);
customerOrderRouter.patch("/orders/:orderId/return", ordersController.returnOrder);
