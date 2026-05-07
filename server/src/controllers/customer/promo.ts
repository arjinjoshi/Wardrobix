import { type Request, type Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireText } from "../../utils/helpers";
import { AppError } from "../../utils/AppError";
import { ok } from "../../utils/envelope";
import * as promoService from "../../services/customer/promo";

export const applyPromo = asyncHandler(async (req: Request, res: Response) => {
  const code = String(req.body.code || "")
    .trim()
    .toUpperCase();

  const orderValue = Number(req.body.orderValue || 0);

  requireText(code, "Promo code is required");

  if (Number.isNaN(orderValue) || orderValue < 0) {
    throw new AppError(400, "Valid order value is required!");
  }

  const data = await promoService.applyPromo(code, orderValue);

  res.json(ok(data));
});
