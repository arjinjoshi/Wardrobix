import { type Request, type Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/envelope";
import { getDbUserFromReq } from "../../middleware/auth";
import { requireText } from "../../utils/helpers";
import * as ordersService from "../../services/customer/orders";

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const dbUser = await getDbUserFromReq(req);
  const items = await ordersService.getOrders(String(dbUser._id));
  res.json(ok({ items }));
});

export const returnOrder = asyncHandler(async (req: Request, res: Response) => {
  const dbUser = await getDbUserFromReq(req);
  const orderId = String(req.params.orderId || "").trim();

  requireText(orderId, "Order Id is required");

  const data = await ordersService.returnOrder(String(dbUser._id), orderId);

  res.json(ok(data));
});
