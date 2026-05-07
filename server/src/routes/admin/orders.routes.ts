import { Router, type Request, type Response } from "express";
import { Types } from "mongoose";
import { Order, OrderStatus, PaymentStatus } from "../../models/Order";
import { requireAdmin } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/envelope";
import { requireFound, requireText } from "../../utils/helpers";
import { AppError } from "../../utils/AppError";
import { Product } from "../../models/Product";
import * as orderController from "../../controllers/admin/order"

const ALLOWED_ORDER_STATUSES = [
  "placed",
  "shipped",
  "delivered",
  "returned",
] as const;

type AdminOrderStatus = (typeof ALLOWED_ORDER_STATUSES)[number];

type AdminOrderRow = {
  _id: Types.ObjectId;
  customerName: string;
  customerEmail: string;
  totalItems: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paidAt?: Date | null;
  deliveredAt?: Date | null;
  returnedAt?: Date | null;
  createdAt: Date;
};

export const adminOrderRouter = Router();

adminOrderRouter.use(requireAdmin);

adminOrderRouter.get(
  "/orders",
 orderController.createOrder
);

adminOrderRouter.patch(
  "/orders/:orderId/status",
 orderController.updateOrder
);
