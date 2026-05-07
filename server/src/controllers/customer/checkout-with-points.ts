import { type Request, type Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/envelope";
import { getDbUserFromReq } from "../../middleware/auth";
import { requireText } from "../../utils/helpers";
import * as checkoutWithPointsService from "../../services/customer/checkout-with-points";

export const getPoints = asyncHandler(async (req: Request, res: Response) => {
  const dbUser = await getDbUserFromReq(req);
  const data = await checkoutWithPointsService.getPoints(String(dbUser._id));
  res.json(ok(data));
});

export const payWithPoints = asyncHandler(async (req: Request, res: Response) => {
  const dbUser = await getDbUserFromReq(req);
  const addressId = String(req.body.addressId || "").trim();
  const promoCode = String(req.body.promoCode || "").trim().toUpperCase();

  requireText(addressId, "Address is required");

  const data = await checkoutWithPointsService.payWithPoints(
    String(dbUser._id),
    addressId,
    promoCode
  );

  res.json(ok(data));
});
